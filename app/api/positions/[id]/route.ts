import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { withAuth } from "@/lib/api-utils"

export const GET = withAuth<{ params: Promise<{ id: string }> }>(async (request, session, { params }) => {
  const { id } = await params
  
  const jobPosting = await prisma.jobPosting.findUnique({
    where: { id }
  })

  if (!jobPosting) {
    return NextResponse.json({ error: "Position not found" }, { status: 404 })
  }

  // Visibility Check: DRAFTs are private to Creator and Super Admin
  if (jobPosting.status === "DRAFT") {
    const isCreator = jobPosting.creatorId === session.user.id
    const isSuperAdmin = session.user.role === "SUPER_ADMIN"
    
    if (!isCreator && !isSuperAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }
  }

  return NextResponse.json(jobPosting)
})

export const PATCH = withAuth<{ params: Promise<{ id: string }> }>(async (request, session, { params }) => {
  const { id } = await params
  const body = await request.json()

  // Fetch existing position
  const existingPosition = await prisma.jobPosting.findUnique({
    where: { id }
  })

  if (!existingPosition) {
    return NextResponse.json({ error: "Position not found" }, { status: 404 })
  }

  // Fetch user details for granular permissions (e.g. isGatekeeper)
  const user = await prisma.user.findUnique({ 
    where: { id: session.user.id } 
  })

  const isAdmin = user?.role === "ADMIN" || user?.role === "SUPER_ADMIN"
  const isGatekeeper = user?.isGatekeeper || false
  const isCreator = existingPosition.creatorId === session.user.id

  // 1. Permission Check: Must be Admin OR Creator
  if (!isAdmin && !isCreator) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
  }

  // Block editing if position is already finalized (Campaign Sent or Archived), unless Super Admin
  const isFinalized = existingPosition.status === "CAMPAIGN_SENT" || existingPosition.status === "ARCHIVED"
  if (isFinalized && user?.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Position is finalized and cannot be edited." }, { status: 403 })
  }

  // 2. Workflow Rules for Basic Users (Non-Admins)
  if (!isAdmin) {
    // Cannot edit if not in DRAFT
    if (existingPosition.status !== "DRAFT") {
      return NextResponse.json({ 
        error: "Position cannot be edited after submission. Please contact an administrator." 
      }, { status: 403 })
    }

    // Can only transition to PENDING_APPROVAL
    if (body.status && body.status !== "DRAFT" && body.status !== "PENDING_APPROVAL") {
      return NextResponse.json({ 
        error: "Invalid status transition. You can only save as Draft or submit for Approval." 
      }, { status: 403 })
    }
  }

  // 3. Status Transition Logic
  let newStatus = body.status
  
  if (newStatus && newStatus !== existingPosition.status) {
    // Gatekeeper Approval Flow
    if (newStatus === "CAMPAIGN_SENT" || newStatus === "ARCHIVED") {
        // "the gatekeeper (and only users that have that power) has the ability to 'approve'"
        // Super Admin has full rights on everything.
        const canApprove = isGatekeeper || user?.role === "SUPER_ADMIN"
        
        if (!canApprove) {
            return NextResponse.json({ error: "Only Gatekeepers can approve positions and launch campaigns" }, { status: 403 })
        }
    }
  }

  const jobPosting = await prisma.jobPosting.update({
    where: { id },
    data: {
      // New Fields
      reference: body.reference,
      location: body.location,
      country: body.country,
      durationMonths: body.durationMonths,
      industrySector: body.industrySector,
      workArrangement: body.workArrangement,
      languageRequirements: body.languageRequirements,
      detailedRequirements: body.detailedRequirements,
      educationRequirements: body.educationRequirements,
      contractDetails: body.contractDetails,

      // Existing Fields
      externalReference: body.externalReference,
      source: body.source,
      sourceUrl: body.sourceUrl,
      jobTitle: body.jobTitle,
      companyName: body.companyName,
      companyDivision: body.companyDivision,
      organizationalUnit: body.organizationalUnit,
      roleCategory: body.roleCategory,
      roleProfile: body.roleProfile,
      seniorityLevel: body.seniorityLevel,
      workLocation: body.workLocation,
      employmentType: body.employmentType,
      contractDuration: body.contractDuration,
      startDate: body.startDate ? new Date(body.startDate) : undefined,
      endDate: body.endDate ? new Date(body.endDate) : undefined,
      extensionPossible: body.extensionPossible,
      description: body.description,
      missionContext: body.missionContext,
      responsibilities: body.responsibilities,
      objectives: body.objectives,
      education: body.education,
      experience: body.experience,
      skills: body.skills,
      languages: body.languages,
      industry: body.industry,
      domain: body.domain,
      travelRequired: body.travelRequired,
      salaryRange: body.salaryRange,
      applicationMethod: body.applicationMethod,
      contactPerson: body.contactPerson,
      applicationDeadline: body.applicationDeadline ? new Date(body.applicationDeadline) : undefined,
      status: newStatus,
    }
  })

  return NextResponse.json(jobPosting)
}, 'canPostPositions')

export const DELETE = withAuth<{ params: Promise<{ id: string }> }>(async (request, session, { params }) => {
  const { id } = await params

  await prisma.jobPosting.delete({
    where: { id }
  })

  return NextResponse.json({ message: "Position deleted successfully" })
}, 'canPostPositions')
