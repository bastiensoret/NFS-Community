"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { jobPostingSchema, type JobPostingInput } from "@/lib/validations"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { Prisma } from "@prisma/client"
import { checkRateLimit } from "@/lib/rate-limit"
import { hasPermission } from "@/lib/roles"

export type ActionState = {
  error?: string
  success?: boolean
  validationErrors?: Record<string, string[]>
}

// Alternative: Accept JSON-like object directly since we are calling from a client component that manages state
export async function createPositionAction(data: JobPostingInput): Promise<ActionState> {
  const session = await auth()

  if (!session || !session.user) {
    return { error: "Unauthorized" }
  }

  const isAllowed = await checkRateLimit(session.user.id || "unknown", 60)
  if (!isAllowed) {
    return { error: "Too Many Requests" }
  }

  if (!hasPermission(session.user.role, 'canPostPositions')) {
    return { error: "Forbidden: Insufficient permissions" }
  }

  const validatedFields = jobPostingSchema.safeParse(data)

  if (!validatedFields.success) {
    return {
      error: "Validation Error",
      validationErrors: validatedFields.error.flatten().fieldErrors as Record<string, string[]>
    }
  }

  const validatedData = validatedFields.data

  // Determine initial status based on user role
  const isAdmin = session.user.role === "ADMIN" || session.user.role === "SUPER_ADMIN"
  
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

  try {
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
        creatorId: session.user.id,

        // Existing Fields
        externalReference: validatedData.externalReference,
        source: validatedData.source,
        sourceUrl: validatedData.sourceUrl,
        jobTitle: validatedData.jobTitle,
        companyName: validatedData.companyName,
        companyDivision: validatedData.companyDivision,
        organizationalUnit: validatedData.organizationalUnit,
        roleCategory: validatedData.roleCategory,
        roleProfile: validatedData.roleProfile,
        seniorityLevel: validatedData.seniorityLevel,
        employmentType: validatedData.employmentType || "CONTRACT",
        contractDuration: validatedData.contractDuration,
        startDate: validatedData.startDate,
        endDate: validatedData.endDate,
        extensionPossible: validatedData.extensionPossible || false,
        description: validatedData.description || "",
        missionContext: validatedData.missionContext,
        responsibilities: validatedData.responsibilities || [],
        objectives: validatedData.objectives || [],
        education: validatedData.education || [],
        experience: validatedData.experience || [],
        skills: validatedData.skills || [],
        languages: validatedData.languages || [], // Legacy list
        industry: validatedData.industry,
        domain: validatedData.domain,
        travelRequired: validatedData.travelRequired,
        applicationMethod: validatedData.applicationMethod,
        applicationDeadline: validatedData.applicationDeadline,
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
    console.error("Database Error:", error)
    return { error: "Failed to create position" }
  }
}

export async function updatePositionAction(id: string, data: Partial<JobPostingInput>): Promise<ActionState> {
  const session = await auth()

  if (!session || !session.user) {
    return { error: "Unauthorized" }
  }

  const isAllowed = await checkRateLimit(session.user.id || "unknown", 60)
  if (!isAllowed) {
    return { error: "Too Many Requests" }
  }

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
    return { error: "Position not found" }
  }

  // Fetch user details for granular permissions
  const user = await prisma.user.findUnique({ 
    where: { id: session.user.id } 
  })

  const isAdmin = user?.role === "ADMIN" || user?.role === "SUPER_ADMIN"
  const isGatekeeper = user?.isGatekeeper || false
  const isCreator = existingPosition.creatorId === session.user.id

  // 1. Permission Check
  if (!isAdmin && !isCreator && !isGatekeeper) {
    return { error: "Unauthorized" }
  }

  // Block editing if finalized
  const isFinalized = existingPosition.status === "CAMPAIGN_SENT" || existingPosition.status === "ARCHIVED"
  if (isFinalized && user?.role !== "SUPER_ADMIN") {
    return { error: "Position is finalized and cannot be edited." }
  }

  // 2. Workflow Rules for Basic Users
  if (!isAdmin) {
    const isApproving = isGatekeeper && existingPosition.status === "PENDING_APPROVAL"

    if (existingPosition.status !== "DRAFT" && !isApproving) {
      return { error: "Position cannot be edited after submission. Please contact an administrator." }
    }

    if (validatedBody.status && validatedBody.status !== "DRAFT" && validatedBody.status !== "PENDING_APPROVAL" && !isApproving) {
      return { error: "Invalid status transition." }
    }
  }

  // 3. Status Transition Logic
  let newStatus = validatedBody.status
  
  if (newStatus && newStatus !== existingPosition.status) {
    if (newStatus === "CAMPAIGN_SENT" || newStatus === "ARCHIVED") {
        const canApprove = isGatekeeper || user?.role === "SUPER_ADMIN"
        if (!canApprove) {
            return { error: "Only Gatekeepers can approve positions and launch campaigns" }
        }
    }
  }

  try {
    const jobPosting = await prisma.jobPosting.update({
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
        externalReference: validatedBody.externalReference,
        source: validatedBody.source,
        sourceUrl: validatedBody.sourceUrl,
        jobTitle: validatedBody.jobTitle,
        companyName: validatedBody.companyName,
        companyDivision: validatedBody.companyDivision,
        organizationalUnit: validatedBody.organizationalUnit,
        roleCategory: validatedBody.roleCategory,
        roleProfile: validatedBody.roleProfile,
        seniorityLevel: validatedBody.seniorityLevel,
        employmentType: validatedBody.employmentType,
        contractDuration: validatedBody.contractDuration,
        startDate: validatedBody.startDate,
        endDate: validatedBody.endDate,
        extensionPossible: validatedBody.extensionPossible,
        description: validatedBody.description,
        missionContext: validatedBody.missionContext,
        responsibilities: validatedBody.responsibilities,
        objectives: validatedBody.objectives,
        education: validatedBody.education,
        experience: validatedBody.experience,
        skills: validatedBody.skills,
        languages: validatedBody.languages,
        industry: validatedBody.industry,
        domain: validatedBody.domain,
        travelRequired: validatedBody.travelRequired,
        applicationMethod: validatedBody.applicationMethod,
        applicationDeadline: validatedBody.applicationDeadline,
        status: newStatus,

        // Relations Update
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
    console.error("Database Error:", error)
    return { error: "Failed to update position" }
  }
}

export async function deletePositionAction(id: string): Promise<ActionState> {
  const session = await auth()

  if (!session || !session.user) {
    return { error: "Unauthorized" }
  }

  const isAllowed = await checkRateLimit(session.user.id || "unknown", 60)
  if (!isAllowed) {
    return { error: "Too Many Requests" }
  }

  const position = await prisma.jobPosting.findUnique({
    where: { id },
    select: { creatorId: true }
  })

  if (!position) {
    return { error: "Position not found" }
  }

  const isAdmin = session.user.role === "ADMIN" || session.user.role === "SUPER_ADMIN"
  const isCreator = position.creatorId === session.user.id

  if (!isAdmin && !isCreator) {
    return { error: "Unauthorized" }
  }

  try {
    await prisma.jobPosting.delete({
      where: { id }
    })
    
    revalidatePath("/dashboard/positions")
    return { success: true }
  } catch (error) {
    console.error("Database Error:", error)
    return { error: "Failed to delete position" }
  }
}
