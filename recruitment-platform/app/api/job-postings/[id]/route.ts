import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const jobPosting = await prisma.jobPosting.findUnique({
      where: { id: params.id }
    })

    if (!jobPosting) {
      return NextResponse.json({ error: "Job posting not found" }, { status: 404 })
    }

    const parsedJobPosting = {
      ...jobPosting,
      workLocation: JSON.parse(jobPosting.workLocation),
      responsibilities: JSON.parse(jobPosting.responsibilities),
      objectives: JSON.parse(jobPosting.objectives),
      education: jobPosting.education ? JSON.parse(jobPosting.education) : null,
      experience: jobPosting.experience ? JSON.parse(jobPosting.experience) : null,
      skills: jobPosting.skills ? JSON.parse(jobPosting.skills) : null,
      languages: JSON.parse(jobPosting.languages),
      salaryRange: jobPosting.salaryRange ? JSON.parse(jobPosting.salaryRange) : null,
      contactPerson: jobPosting.contactPerson ? JSON.parse(jobPosting.contactPerson) : null,
    }

    return NextResponse.json(parsedJobPosting)
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch job posting" },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()

    const jobPosting = await prisma.jobPosting.update({
      where: { id: params.id },
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
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update job posting" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await prisma.jobPosting.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: "Job posting deleted successfully" })
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete job posting" },
      { status: 500 }
    )
  }
}
