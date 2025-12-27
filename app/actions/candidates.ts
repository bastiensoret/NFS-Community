"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { candidateSchema, type CandidateInput } from "@/lib/validations"
import { revalidatePath } from "next/cache"
import { checkRateLimit } from "@/lib/rate-limit"
import { hasPermission } from "@/lib/roles"
import { Prisma } from "@prisma/client"

export type ActionState = {
  error?: string
  success?: boolean
  validationErrors?: Record<string, string[]>
}

export async function createCandidateAction(data: CandidateInput): Promise<ActionState> {
  const session = await auth()

  if (!session || !session.user) {
    return { error: "Unauthorized" }
  }

  // Rate Limiting
  const isAllowed = await checkRateLimit(session.user.id || "unknown", 60)
  if (!isAllowed) {
    return { error: "Too Many Requests" }
  }

  // Permission Check
  if (!hasPermission(session.user.role, 'canProposeCandidates')) {
    return { error: "Forbidden: Insufficient permissions" }
  }

  const validatedFields = candidateSchema.safeParse(data)

  if (!validatedFields.success) {
    return {
      error: "Validation Error",
      validationErrors: validatedFields.error.flatten().fieldErrors as Record<string, string[]>
    }
  }

  const validatedData = validatedFields.data

  try {
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
    console.error("Database Error:", error)
    return { error: "Failed to create candidate" }
  }
}

export async function deleteCandidateAction(id: string): Promise<ActionState> {
  const session = await auth()

  if (!session || !session.user) {
    return { error: "Unauthorized" }
  }

  const isAllowed = await checkRateLimit(session.user.id || "unknown", 60)
  if (!isAllowed) {
    return { error: "Too Many Requests" }
  }

  const userRole = session.user.role
  const canDelete = userRole === "ADMIN" || userRole === "SUPER_ADMIN" || userRole === "RECRUITER"

  if (!canDelete) {
    return { error: "Forbidden: Insufficient permissions" }
  }

  try {
    await prisma.candidate.delete({
      where: { id }
    })

    revalidatePath("/dashboard/candidates")
    return { success: true }
  } catch (error) {
    console.error("Database Error:", error)
    return { error: "Failed to delete candidate" }
  }
}
