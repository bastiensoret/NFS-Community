import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { candidateSchema } from "@/lib/validations"
import { z } from "zod"

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
    
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (!hasPermission(session.user.role, 'canProposeCandidates')) {
      return NextResponse.json({ error: "Forbidden: Insufficient permissions" }, { status: 403 })
    }

    const body = await request.json()
    
    // Validate request body
    const validatedData = candidateSchema.parse(body)

    const candidate = await prisma.candidate.create({
      data: {
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
        email: validatedData.email,
        phoneNumber: validatedData.phoneNumber,
        desiredRoles: typeof validatedData.desiredRoles === 'string' ? validatedData.desiredRoles : JSON.stringify(validatedData.desiredRoles || []),
        skills: typeof validatedData.skills === 'string' ? validatedData.skills : JSON.stringify(validatedData.skills || []),
        industries: typeof validatedData.industries === 'string' ? validatedData.industries : JSON.stringify(validatedData.industries || []),
        seniorityLevel: validatedData.seniorityLevel,
        certifications: typeof validatedData.certifications === 'string' ? validatedData.certifications : JSON.stringify(validatedData.certifications || []),
        location: validatedData.location,
        profileDataJson: validatedData.profileDataJson ? JSON.stringify(validatedData.profileDataJson) : null,
      }
    })

    return NextResponse.json(candidate, { status: 201 })
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation failed", details: error.issues }, { status: 400 })
    }
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
