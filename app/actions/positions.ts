"use server"

import { authenticated, handleActionError, ActionError, type ActionState } from "@/lib/action-utils"
import { prisma } from "@/lib/prisma"
import { jobPostingSchema, type JobPostingInput } from "@/lib/validations"
import { revalidatePath } from "next/cache"

// Alternative: Accept JSON-like object directly since we are calling from a client component that manages state
export async function createPositionAction(data: JobPostingInput): Promise<ActionState> {
  try {
    const user = await authenticated('canPostPositions')

    const validatedFields = jobPostingSchema.safeParse(data)

    if (!validatedFields.success) {
      return {
        error: "Validation Error",
        validationErrors: validatedFields.error.flatten().fieldErrors as Record<string, string[]>
      }
    }

    const validatedData = validatedFields.data

    // Determine initial status based on user role
    const isAdmin = user.role === "ADMIN" || user.role === "SUPER_ADMIN"
    
    let initialStatus = validatedData.status || (isAdmin ? "ACTIVE" : "DRAFT")

    if (!isAdmin) {
      // Non-admins can strictly only create DRAFT or PENDING_APPROVAL
      if (initialStatus !== "DRAFT" && initialStatus !== "PENDING_APPROVAL") {
        initialStatus = "DRAFT"
      }
    }

    // Generate Reference ID if not provided
    let reference = validatedData.reference
    if (!reference) {
      const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "")
      const randomSuffix = Math.floor(Math.random() * 1000).toString().padStart(3, "0")
      reference = `POS-${dateStr}-${randomSuffix}`
    }

    await prisma.jobPosting.create({
      data: {
        // New Core Fields
        reference: reference,
        location: validatedData.location,
        country: validatedData.country,
        durationMonths: validatedData.durationMonths,
        industrySector: validatedData.industrySector,
        
        // Flattened Work Arrangement
        remoteAllowed: validatedData.remoteAllowed ?? false,
        onSiteDays: validatedData.onSiteDays,

        // Flattened Salary
        minSalary: validatedData.minSalary,
        maxSalary: validatedData.maxSalary,
        currency: validatedData.currency,

        // Flattened Contact
        contactName: validatedData.contactName,
        contactEmail: validatedData.contactEmail,
        contactPhone: validatedData.contactPhone,

        // Creator
        creatorId: user.id,

        // Existing Fields
        jobTitle: validatedData.jobTitle,
        companyName: validatedData.companyName,
        seniorityLevel: validatedData.seniorityLevel,
        employmentType: validatedData.employmentType || "CONTRACT",
        startDate: validatedData.startDate,
        endDate: validatedData.endDate,
        extensionPossible: validatedData.extensionPossible || false,
        description: validatedData.description || "",
        responsibilities: validatedData.responsibilities || [],
        objectives: validatedData.objectives || [],
        education: validatedData.education || [],
        experience: validatedData.experience || [],
        skills: validatedData.skills || [],
        status: initialStatus,

        // Relations
        languageRequirements: {
          create: validatedData.languageRequirements?.map(req => ({
            language: req.language,
            level: req.level,
            mandatory: req.mandatory
          })) || []
        }
      }
    })

    revalidatePath("/dashboard/positions")
    return { success: true }
  } catch (error) {
    return handleActionError(error)
  }
}

export async function updatePositionAction(id: string, data: Partial<JobPostingInput>): Promise<ActionState> {
  try {
    const sessionUser = await authenticated()

    const validatedFields = jobPostingSchema.partial().safeParse(data)

    if (!validatedFields.success) {
      return {
        error: "Validation Error",
        validationErrors: validatedFields.error.flatten().fieldErrors as Record<string, string[]>
      }
    }

    const validatedBody = validatedFields.data

    // Fetch existing position
    const existingPosition = await prisma.jobPosting.findUnique({
      where: { id }
    })

    if (!existingPosition) {
      throw new ActionError("Position not found")
    }

    // Fetch user details for granular permissions (refreshing from DB to be safe)
    const user = await prisma.user.findUnique({ 
      where: { id: sessionUser.id } 
    })

    const isAdmin = user?.role === "ADMIN" || user?.role === "SUPER_ADMIN"
    const isGatekeeper = user?.isGatekeeper || false
    const isCreator = existingPosition.creatorId === sessionUser.id

    // 1. Permission Check
    if (!isAdmin && !isCreator && !isGatekeeper) {
      throw new ActionError("Unauthorized")
    }

    // Block editing if finalized
    const isFinalized = existingPosition.status === "CAMPAIGN_SENT" || existingPosition.status === "ARCHIVED"
    if (isFinalized && user?.role !== "SUPER_ADMIN") {
      throw new ActionError("Position is finalized and cannot be edited.")
    }

    // 2. Workflow Rules for standard Users
    if (!isAdmin) {
      const isApproving = isGatekeeper && existingPosition.status === "PENDING_APPROVAL"

      if (existingPosition.status !== "DRAFT" && !isApproving) {
        throw new ActionError("Position cannot be edited after submission. Please contact an administrator.")
      }

      if (validatedBody.status && validatedBody.status !== "DRAFT" && validatedBody.status !== "PENDING_APPROVAL" && !isApproving) {
        throw new ActionError("Invalid status transition.")
      }
    }

    // 3. Status Transition Logic
    let newStatus = validatedBody.status
    
    if (newStatus && newStatus !== existingPosition.status) {
      if (newStatus === "CAMPAIGN_SENT" || newStatus === "ARCHIVED") {
          const canApprove = isGatekeeper || user?.role === "SUPER_ADMIN"
          if (!canApprove) {
              throw new ActionError("Only Gatekeepers can approve positions and launch campaigns")
          }
      }
    }

    await prisma.jobPosting.update({
      where: { id },
      data: {
        // New Fields
        reference: validatedBody.reference,
        location: validatedBody.location,
        country: validatedBody.country,
        durationMonths: validatedBody.durationMonths,
        industrySector: validatedBody.industrySector,
        
        // Flattened Fields
        remoteAllowed: validatedBody.remoteAllowed,
        onSiteDays: validatedBody.onSiteDays,
        minSalary: validatedBody.minSalary,
        maxSalary: validatedBody.maxSalary,
        currency: validatedBody.currency,
        contactName: validatedBody.contactName,
        contactEmail: validatedBody.contactEmail,
        contactPhone: validatedBody.contactPhone,

        // Existing Fields
        jobTitle: validatedBody.jobTitle,
        companyName: validatedBody.companyName,
        seniorityLevel: validatedBody.seniorityLevel,
        employmentType: validatedBody.employmentType,
        startDate: validatedBody.startDate,
        endDate: validatedBody.endDate,
        extensionPossible: validatedBody.extensionPossible,
        description: validatedBody.description,
        responsibilities: validatedBody.responsibilities,
        languageRequirements: validatedBody.languageRequirements ? {
          deleteMany: {},
          create: validatedBody.languageRequirements.map(req => ({
            language: req.language,
            level: req.level,
            mandatory: req.mandatory
          }))
        } : undefined
      }
    })

    // 4. Trigger Side Effects
    if (newStatus === "CAMPAIGN_SENT" && existingPosition.status !== "CAMPAIGN_SENT") {
      console.log(`[CAMPAIGN_TRIGGER] Initiating email campaign for Position ID: ${id}`)
    }

    revalidatePath(`/dashboard/positions/${id}`)
    revalidatePath("/dashboard/positions")
    return { success: true }
  } catch (error) {
    return handleActionError(error)
  }
}

export async function deletePositionAction(id: string): Promise<ActionState> {
  try {
    const user = await authenticated()

    const position = await prisma.jobPosting.findUnique({
      where: { id },
      select: { creatorId: true, status: true }
    })

    if (!position) {
      throw new ActionError("Position not found")
    }

    const isAdmin = user.role === "ADMIN" || user.role === "SUPER_ADMIN"
    const isCreator = position.creatorId === user.id

    // Permission check
    if (!isAdmin && !isCreator) {
      throw new ActionError("Unauthorized")
    }

    // Status check: users can only delete their own positions until PENDING_APPROVAL status
    // Admins can delete any position
    if (!isAdmin && isCreator) {
      const deletableStatuses = ["DRAFT", "PENDING_APPROVAL"]
      if (!deletableStatuses.includes(position.status)) {
        throw new ActionError("Position can only be deleted while in Draft or Pending Approval status")
      }
    }

    await prisma.jobPosting.delete({
      where: { id }
    })
    
    revalidatePath("/dashboard/positions")
    return { success: true }
  } catch (error) {
    return handleActionError(error)
  }
}
