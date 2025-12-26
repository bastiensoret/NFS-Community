import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { candidateSchema } from "@/lib/validations"
import { z } from "zod"
import { withAuth } from "@/lib/api-utils"
import { Prisma } from "@prisma/client"

export const GET = withAuth(async (request) => {
  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get("page") || "1")
  const limit = parseInt(searchParams.get("limit") || "10")
  const skip = (page - 1) * limit

  const [candidates, total] = await Promise.all([
    prisma.candidate.findMany({
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.candidate.count(),
  ])

  return NextResponse.json({
    data: candidates,
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
  const validatedData = candidateSchema.parse(body)

  const candidate = await prisma.candidate.create({
    data: {
      firstName: validatedData.firstName,
      lastName: validatedData.lastName,
      email: validatedData.email,
      phoneNumber: validatedData.phoneNumber,
      desiredRoles: validatedData.desiredRoles,
      skills: validatedData.skills,
      industries: validatedData.industries,
      seniorityLevel: validatedData.seniorityLevel,
      certifications: validatedData.certifications,
      location: validatedData.location,
      profileDataJson: validatedData.profileDataJson ?? Prisma.JsonNull,
    }
  })

  return NextResponse.json(candidate, { status: 201 })
}, 'canProposeCandidates')
