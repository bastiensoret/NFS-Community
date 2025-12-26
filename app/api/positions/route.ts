import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { jobPostingSchema } from "@/lib/validations"
import { z } from "zod"
import { withAuth } from "@/lib/api-utils"
import { Prisma } from "@prisma/client"

export const GET = withAuth(async (request) => {
  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get("page") || "1")
  const limit = parseInt(searchParams.get("limit") || "10")
  const skip = (page - 1) * limit

  const [jobPostings, total] = await Promise.all([
    prisma.jobPosting.findMany({
      orderBy: { postingDate: "desc" },
      skip,
      take: limit,
    }),
    prisma.jobPosting.count(),
  ])

  return NextResponse.json({
    data: jobPostings,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    }
  })
})

export const POST = withAuth(async (request) => {
  const body = await request.json()
  
  // Validate request body
  const validatedData = jobPostingSchema.parse(body)

    const jobPosting = await prisma.jobPosting.create({
    data: {
      // New Core Fields
      reference: validatedData.reference,
      location: validatedData.location,
      country: validatedData.country,
      durationMonths: validatedData.durationMonths,
      urgent: validatedData.urgent,
      industrySector: validatedData.industrySector,
      
      // New Complex Fields (JSON)
      workArrangement: validatedData.workArrangement as Prisma.InputJsonValue,
      languageRequirements: validatedData.languageRequirements as Prisma.InputJsonValue,
      detailedRequirements: validatedData.detailedRequirements as Prisma.InputJsonValue,
      educationRequirements: validatedData.educationRequirements as Prisma.InputJsonValue,
      contractDetails: validatedData.contractDetails as Prisma.InputJsonValue,
      contactInfo: validatedData.contactInfo as Prisma.InputJsonValue,
      department: validatedData.department,
      applicationInstructions: validatedData.applicationInstructions,

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
      workLocation: validatedData.workLocation as Prisma.InputJsonValue,
      employmentType: validatedData.employmentType || "CONTRACT", // Default or map
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
      languages: validatedData.languages || [],
      industry: validatedData.industry,
      domain: validatedData.domain,
      travelRequired: validatedData.travelRequired,
      salaryRange: validatedData.salaryRange as Prisma.InputJsonValue,
      applicationMethod: validatedData.applicationMethod,
      contactPerson: validatedData.contactPerson as Prisma.InputJsonValue,
      applicationDeadline: validatedData.applicationDeadline,
      status: validatedData.status,
    }
  })

  return NextResponse.json(jobPosting, { status: 201 })
}, 'canPostPositions')
