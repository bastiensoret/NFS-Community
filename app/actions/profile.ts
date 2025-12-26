"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { passwordSchema, profileSchema } from "@/lib/validations"
import { revalidatePath } from "next/cache"
import bcrypt from "bcryptjs"
import { z } from "zod"

import { writeFile } from "fs/promises"
import { join } from "path"
import { randomUUID } from "crypto"

export type ActionState = {
  success?: boolean
  error?: string
  fieldErrors?: Record<string, string[]>
}

export async function updateProfile(prevState: ActionState, formData: FormData): Promise<ActionState> {
  const session = await auth()
  
  if (!session?.user?.id) {
    return { error: "Unauthorized" }
  }

  const rawData = {
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
  }

  // Validate fields
  const validatedFields = profileSchema.safeParse(rawData)

  if (!validatedFields.success) {
    return {
      error: "Validation failed",
      fieldErrors: validatedFields.error.flatten().fieldErrors,
    }
  }

  try {
    const { firstName, lastName } = validatedFields.data
    let imageUrl: string | undefined

    const imageFile = formData.get("image") as File | null
    
    if (imageFile && imageFile.size > 0 && imageFile.name !== "undefined") {
      // Validate file type
      if (!imageFile.type.startsWith("image/")) {
        return {
          error: "Invalid file type. Please upload an image.",
          fieldErrors: { image: ["File must be an image"] }
        }
      }

      // Validate file size (e.g., 5MB)
      if (imageFile.size > 5 * 1024 * 1024) {
        return {
          error: "File too large. Maximum size is 5MB.",
          fieldErrors: { image: ["File size must be less than 5MB"] }
        }
      }

      const bytes = await imageFile.arrayBuffer()
      const buffer = Buffer.from(bytes)
      
      // Create unique filename
      const extension = imageFile.name.split('.').pop()
      const fileName = `${randomUUID()}.${extension}`
      
      // Ensure public/uploads exists
      const uploadDir = join(process.cwd(), "public", "uploads")
      const filePath = join(uploadDir, fileName)
      
      await writeFile(filePath, buffer)
      imageUrl = `/uploads/${fileName}`
    }
    
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        firstName,
        lastName,
        name: `${firstName} ${lastName}`.trim(),
        ...(imageUrl && { image: imageUrl }),
      },
    })

    revalidatePath("/dashboard")
    revalidatePath("/dashboard/profile")
    
    return { success: true }
  } catch (error) {
    console.error("Profile update error:", error)
    return { error: "Failed to update profile" }
  }
}

export async function changePassword(prevState: ActionState, formData: FormData): Promise<ActionState> {
  const session = await auth()
  
  if (!session?.user?.id) {
    return { error: "Unauthorized" }
  }

  const rawData = {
    currentPassword: formData.get("currentPassword"),
    newPassword: formData.get("newPassword"),
    confirmPassword: formData.get("confirmPassword"),
  }

  const validatedFields = passwordSchema.safeParse(rawData)

  if (!validatedFields.success) {
    return {
      error: "Validation failed",
      fieldErrors: validatedFields.error.flatten().fieldErrors,
    }
  }

  try {
    const { currentPassword, newPassword } = validatedFields.data

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    })

    if (!user || !user.password) {
      return { error: "User not found" }
    }

    const isPasswordValid = await bcrypt.compare(currentPassword, user.password)

    if (!isPasswordValid) {
      return {
        error: "Validation failed",
        fieldErrors: {
          currentPassword: ["Incorrect current password"],
        },
      }
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10)

    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        password: hashedPassword,
      },
    })

    return { success: true }
  } catch (error) {
    console.error("Password change error:", error)
    return { error: "Failed to update password" }
  }
}
