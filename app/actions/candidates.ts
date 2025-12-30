"use server"

import { authenticated, handleActionError, ActionError, type ActionState } from "@/lib/action-utils"
import { prisma } from "@/lib/prisma"
import { candidateSchema, type CandidateInput } from "@/lib/validations"
import { revalidatePath } from "next/cache"

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

    const isAdmin = user.role === "ADMIN" || user.role === "SUPER_ADMIN"
    
    // Determine initial status
    let initialStatus = validatedData.status || (isAdmin ? "ACTIVE" : "DRAFT")

    if (!isAdmin) {
      // Non-admins can strictly only create DRAFT or PENDING_APPROVAL
      if (initialStatus !== "DRAFT" && initialStatus !== "PENDING_APPROVAL") {
        initialStatus = "DRAFT"
      }
    }

    await prisma.candidate.create({
      data: {
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
        email: validatedData.email,
        phoneNumber: validatedData.phoneNumber,
        location: validatedData.location,
        education: validatedData.education || [],
        educationLevel: validatedData.educationLevel,
        previousRoles: validatedData.previousRoles || [],
        seniorityLevel: validatedData.seniorityLevel,
        desiredRoles: validatedData.desiredRoles,
        softSkills: validatedData.softSkills,
        hardSkills: validatedData.hardSkills,
        certifications: validatedData.certifications || [],
        industries: validatedData.industries || [],
        languages: validatedData.languages,
        status: initialStatus,
        creatorId: user.id,
      }
    })

    revalidatePath("/dashboard/candidates")
    return { success: true }
  } catch (error) {
    return handleActionError(error)
  }
}

export async function updateCandidateAction(id: string, data: Partial<CandidateInput>): Promise<ActionState> {
  try {
    const user = await authenticated()

    const validatedFields = candidateSchema.partial().safeParse(data)

    if (!validatedFields.success) {
      return {
        error: "Validation Error",
        validationErrors: validatedFields.error.flatten().fieldErrors as Record<string, string[]>
      }
    }

    const validatedData = validatedFields.data

    // Fetch existing candidate
    const existingCandidate = await prisma.candidate.findUnique({
      where: { id }
    })

    if (!existingCandidate) {
      throw new ActionError("Candidate not found")
    }

    const isAdmin = user.role === "ADMIN" || user.role === "SUPER_ADMIN"
    const isGatekeeper = user.isGatekeeper
    const isCreator = existingCandidate.creatorId === user.id

    // Permission check
    if (!isAdmin && !isCreator && !isGatekeeper) {
      throw new ActionError("Unauthorized")
    }

    // Workflow logic
    if (!isAdmin) {
       // Deactivation restricted to Admins
       if (validatedData.status === "INACTIVE") {
         throw new ActionError("Only Administrators can deactivate candidates")
       }

       if (!isGatekeeper) {
          // Standard user (Creator)
          if (existingCandidate.status !== "DRAFT") {
            throw new ActionError("Cannot edit candidate after submission")
          }
          if (validatedData.status && validatedData.status !== "DRAFT" && validatedData.status !== "PENDING_APPROVAL") {
            throw new ActionError("Invalid status transition")
          }
       }
    }

    await prisma.candidate.update({
      where: { id },
      data: {
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
        email: validatedData.email,
        phoneNumber: validatedData.phoneNumber,
        location: validatedData.location,
        education: validatedData.education,
        educationLevel: validatedData.educationLevel,
        previousRoles: validatedData.previousRoles,
        seniorityLevel: validatedData.seniorityLevel,
        desiredRoles: validatedData.desiredRoles,
        softSkills: validatedData.softSkills,
        hardSkills: validatedData.hardSkills,
        certifications: validatedData.certifications,
        industries: validatedData.industries,
        languages: validatedData.languages,
        status: validatedData.status,
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
    // Only Admin and Super Admin can delete
    const canDelete = userRole === "ADMIN" || userRole === "SUPER_ADMIN"

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
