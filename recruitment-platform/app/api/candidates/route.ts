import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await auth()
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const candidates = await prisma.candidate.findMany({
      orderBy: { createdAt: "desc" }
    })

    return NextResponse.json(candidates)
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch candidates" },
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

    const candidate = await prisma.candidate.create({
      data: {
        firstName: body.firstName,
        lastName: body.lastName,
        email: body.email,
        phoneNumber: body.phoneNumber,
        desiredRoles: JSON.stringify(body.desiredRoles || []),
        skills: JSON.stringify(body.skills || []),
        industries: JSON.stringify(body.industries || []),
        seniorityLevel: body.seniorityLevel,
        certifications: JSON.stringify(body.certifications || []),
        location: body.location,
        profileDataJson: JSON.stringify(body.profileDataJson),
      }
    })

    return NextResponse.json(candidate, { status: 201 })
  } catch (error: any) {
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "A candidate with this email already exists" },
        { status: 409 }
      )
    }
    return NextResponse.json(
      { error: "Failed to create candidate" },
      { status: 500 }
    )
  }
}
