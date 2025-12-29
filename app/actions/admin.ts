"use server"

import { authenticated, handleActionError, ActionError, type ActionState } from "@/lib/action-utils"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const updateUserSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  role: z.enum(["USER", "ADMIN", "SUPER_ADMIN"]),
  isGatekeeper: z.boolean(),
})

export async function updateUserAction(data: z.input<typeof updateUserSchema>): Promise<ActionState> {
  try {
    const sessionUser = await authenticated('canManageUsers')
    
    // Extra safety check for SUPER_ADMIN role specifically if not covered by permission alone
    if (sessionUser.role !== "SUPER_ADMIN") {
      throw new ActionError("Unauthorized")
    }

    const validatedFields = updateUserSchema.safeParse(data)

    if (!validatedFields.success) {
      return {
        validationErrors: validatedFields.error.flatten().fieldErrors,
        error: "Validation failed"
      }
    }

    const { userId, role, isGatekeeper } = validatedFields.data

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
    return handleActionError(error)
  }
}
