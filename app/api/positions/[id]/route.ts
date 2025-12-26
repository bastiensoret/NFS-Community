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

  return NextResponse.json(jobPosting)
})

export const PATCH = withAuth<{ params: Promise<{ id: string }> }>(async (request, session, { params }) => {
  const { id } = await params
  const body = await request.json()

  const jobPosting = await prisma.jobPosting.update({
    where: { id },
    data: {
      // New Fields
      reference: body.reference,
      location: body.location,
      country: body.country,
      durationMonths: body.durationMonths,
      urgent: body.urgent,
      industrySector: body.industrySector,
      workArrangement: body.workArrangement,
      languageRequirements: body.languageRequirements,
      detailedRequirements: body.detailedRequirements,
      educationRequirements: body.educationRequirements,
      contractDetails: body.contractDetails,
      department: body.department,
      applicationInstructions: body.applicationInstructions,
      contactInfo: body.contactInfo,

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
      status: body.status,
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
