"use server"

import { authenticated, handleActionError, ActionError, type ActionState } from "@/lib/action-utils"
import { prisma } from "@/lib/prisma"
import { candidateSchema, type CandidateInput } from "@/lib/validations"
import { revalidatePath } from "next/cache"
import { Prisma } from "@prisma/client"

export { type ActionState }

export async function createCandidateAction(data: CandidateInput): Promise<ActionState> {
  try {
    // Requires canProposeCandidates permission
    const user = await authenticated('canProposeCandidates')

    const validatedFields = candidateSchema.safeParse(data)

    if (!validatedFields.success) {
      return {
        error: "Validation Error",
        validationErrors: validatedFields.error.flatten().fieldErrors as Record<string, string[]>
      }
    }

    const validatedData = validatedFields.data

    await prisma.candidate.create({
      data: {
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
        email: validatedData.email,
        phoneNumber: validatedData.phoneNumber,
        desiredRoles: validatedData.desiredRoles,
        skills: validatedData.skills,
        industries: validatedData.industries,
        seniorityLevel: validatedData.seniorityLevel,
        certifications: validatedData.certifications,
        location: validatedData.location,
        profileDataJson: validatedData.profileDataJson ?? Prisma.JsonNull,
      }
    })

    revalidatePath("/dashboard/candidates")
    return { success: true }
  } catch (error) {
    return handleActionError(error)
  }
}

export async function deleteCandidateAction(id: string): Promise<ActionState> {
  try {
    const user = await authenticated()

    const userRole = user.role
    const canDelete = userRole === "ADMIN" || userRole === "SUPER_ADMIN" || userRole === "RECRUITER"

    if (!canDelete) {
      throw new ActionError("Forbidden: Insufficient permissions")
    }

    await prisma.candidate.delete({
      where: { id }
    })

    revalidatePath("/dashboard/candidates")
    return { success: true }
  } catch (error) {
    return handleActionError(error)
  }
}
