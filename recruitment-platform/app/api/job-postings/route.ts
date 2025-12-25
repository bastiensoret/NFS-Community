import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { jobPostingSchema } from "@/lib/validations"
import { z } from "zod"
import { ROLES, hasPermission } from "@/lib/roles"

export async function GET() {
  try {
    const session = await auth()
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const jobPostings = await prisma.jobPosting.findMany({
      orderBy: { postingDate: "desc" }
    })

    return NextResponse.json(jobPostings)
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch job postings" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (!hasPermission(session.user.role, 'canPostJobs')) {
      return NextResponse.json({ error: "Forbidden: Insufficient permissions" }, { status: 403 })
    }

    const body = await request.json()
    
    // Validate request body
    const validatedData = jobPostingSchema.parse(body)

    const jobPosting = await prisma.jobPosting.create({
      data: {
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
        workLocation: typeof validatedData.workLocation === 'string' ? validatedData.workLocation : JSON.stringify(validatedData.workLocation),
        employmentType: validatedData.employmentType,
        contractDuration: validatedData.contractDuration,
        startDate: validatedData.startDate,
        endDate: validatedData.endDate,
        extensionPossible: validatedData.extensionPossible || false,
        description: validatedData.description,
        missionContext: validatedData.missionContext,
        responsibilities: typeof validatedData.responsibilities === 'string' ? validatedData.responsibilities : JSON.stringify(validatedData.responsibilities || []),
        objectives: typeof validatedData.objectives === 'string' ? validatedData.objectives : JSON.stringify(validatedData.objectives || []),
        education: validatedData.education ? (typeof validatedData.education === 'string' ? validatedData.education : JSON.stringify(validatedData.education)) : null,
        experience: validatedData.experience ? (typeof validatedData.experience === 'string' ? validatedData.experience : JSON.stringify(validatedData.experience)) : null,
        skills: validatedData.skills ? (typeof validatedData.skills === 'string' ? validatedData.skills : JSON.stringify(validatedData.skills)) : null,
        languages: typeof validatedData.languages === 'string' ? validatedData.languages : JSON.stringify(validatedData.languages || []),
        industry: validatedData.industry,
        domain: validatedData.domain,
        travelRequired: validatedData.travelRequired,
        salaryRange: validatedData.salaryRange ? (typeof validatedData.salaryRange === 'string' ? validatedData.salaryRange : JSON.stringify(validatedData.salaryRange)) : null,
        applicationMethod: validatedData.applicationMethod,
        contactPerson: validatedData.contactPerson ? (typeof validatedData.contactPerson === 'string' ? validatedData.contactPerson : JSON.stringify(validatedData.contactPerson)) : null,
        applicationDeadline: validatedData.applicationDeadline,
        status: validatedData.status,
      }
    })

    return NextResponse.json(jobPosting, { status: 201 })
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation failed", details: error.issues }, { status: 400 })
    }
    console.error("Error creating job posting:", error)
    return NextResponse.json(
      { error: "Failed to create job posting" },
      { status: 500 }
    )
  }
}
