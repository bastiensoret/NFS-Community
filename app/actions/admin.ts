"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { z } from "zod"

export type ActionState = {
  success?: boolean
  error?: string
  validationErrors?: Record<string, string[]>
}

const updateUserSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  role: z.enum(["BASIC_USER", "USER", "ADMIN", "SUPER_ADMIN"]),
  isGatekeeper: z.boolean(),
})

export async function updateUserAction(data: z.input<typeof updateUserSchema>): Promise<ActionState> {
  const session = await auth()
  
  if (!session || session.user?.role !== "SUPER_ADMIN") {
    return { error: "Unauthorized" }
  }

  const validatedFields = updateUserSchema.safeParse(data)

  if (!validatedFields.success) {
    return {
      validationErrors: validatedFields.error.flatten().fieldErrors,
      error: "Validation failed"
    }
  }

  const { userId, role, isGatekeeper } = validatedFields.data

  try {
    await prisma.user.update({
      where: { id: userId },
      data: {
        role,
        isGatekeeper,
      },
    })

    revalidatePath("/dashboard/admin")
    return { success: true }
  } catch (error) {
    console.error("Failed to update user:", error)
    return { error: "Failed to update user" }
  }
}
