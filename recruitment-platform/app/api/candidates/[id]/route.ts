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

    const candidate = await prisma.candidate.findUnique({
      where: { id: params.id }
    })

    if (!candidate) {
      return NextResponse.json({ error: "Candidate not found" }, { status: 404 })
    }

    const parsedCandidate = {
      ...candidate,
      desiredRoles: JSON.parse(candidate.desiredRoles),
      skills: JSON.parse(candidate.skills),
      industries: JSON.parse(candidate.industries),
      certifications: JSON.parse(candidate.certifications),
      profileDataJson: candidate.profileDataJson ? JSON.parse(candidate.profileDataJson) : null,
    }

    return NextResponse.json(parsedCandidate)
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch candidate" },
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

    const candidate = await prisma.candidate.update({
      where: { id: params.id },
      data: {
        firstName: body.firstName,
        lastName: body.lastName,
        email: body.email,
        phoneNumber: body.phoneNumber,
        desiredRoles: body.desiredRoles,
        skills: body.skills,
        industries: body.industries,
        seniorityLevel: body.seniorityLevel,
        certifications: body.certifications,
        location: body.location,
        profileDataJson: body.profileDataJson,
      }
    })

    return NextResponse.json(candidate)
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update candidate" },
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

    await prisma.candidate.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: "Candidate deleted successfully" })
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete candidate" },
      { status: 500 }
    )
  }
}
