import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

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
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()

    const jobPosting = await prisma.jobPosting.create({
      data: {
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
        workLocation: JSON.stringify(body.workLocation),
        employmentType: body.employmentType,
        contractDuration: body.contractDuration,
        startDate: body.startDate ? new Date(body.startDate) : null,
        endDate: body.endDate ? new Date(body.endDate) : null,
        extensionPossible: body.extensionPossible || false,
        description: body.description,
        missionContext: body.missionContext,
        responsibilities: JSON.stringify(body.responsibilities || []),
        objectives: JSON.stringify(body.objectives || []),
        education: body.education ? JSON.stringify(body.education) : null,
        experience: body.experience ? JSON.stringify(body.experience) : null,
        skills: body.skills ? JSON.stringify(body.skills) : null,
        languages: JSON.stringify(body.languages || []),
        industry: body.industry,
        domain: body.domain,
        travelRequired: body.travelRequired,
        salaryRange: body.salaryRange ? JSON.stringify(body.salaryRange) : null,
        applicationMethod: body.applicationMethod,
        contactPerson: body.contactPerson ? JSON.stringify(body.contactPerson) : null,
        applicationDeadline: body.applicationDeadline ? new Date(body.applicationDeadline) : null,
        status: body.status || "ACTIVE",
      }
    })

    return NextResponse.json(jobPosting, { status: 201 })
  } catch (error: any) {
    console.error("Error creating job posting:", error)
    return NextResponse.json(
      { error: "Failed to create job posting" },
      { status: 500 }
    )
  }
}
