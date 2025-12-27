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

export const POST = withAuth(async (request, session) => {
  const body = await request.json()
  
  // Validate request body
  const validatedData = jobPostingSchema.parse(body)

  // Determine initial status based on user role
  const isAdmin = session.user.role === "ADMIN" || session.user.role === "SUPER_ADMIN"
  const initialStatus = isAdmin ? (validatedData.status || "ACTIVE") : "PENDING_APPROVAL"

  // Generate Reference ID if not provided
  let reference = validatedData.reference
  if (!reference) {
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "")
    const randomSuffix = Math.floor(Math.random() * 1000).toString().padStart(3, "0")
    reference = `POS-${dateStr}-${randomSuffix}`
  }

    const jobPosting = await prisma.jobPosting.create({
    data: {
      // New Core Fields
      reference: reference,
      location: validatedData.location,
      country: validatedData.country,
      durationMonths: validatedData.durationMonths,
      industrySector: validatedData.industrySector,
      
      // New Complex Fields (JSON)
      workArrangement: validatedData.workArrangement as Prisma.InputJsonValue,
      languageRequirements: validatedData.languageRequirements as Prisma.InputJsonValue,
      detailedRequirements: validatedData.detailedRequirements as Prisma.InputJsonValue,
      educationRequirements: validatedData.educationRequirements as Prisma.InputJsonValue,
      contractDetails: validatedData.contractDetails as Prisma.InputJsonValue,

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
      status: initialStatus,
    }
  })

  return NextResponse.json(jobPosting, { status: 201 })
})
