import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { withAuth } from "@/lib/api-utils"

export const GET = withAuth<{ params: Promise<{ id: string }> }>(async (request, session, { params }) => {
  const { id } = await params
  
  const candidate = await prisma.candidate.findUnique({
    where: { id }
  })

  if (!candidate) {
    return NextResponse.json({ error: "Candidate not found" }, { status: 404 })
  }

  return NextResponse.json(candidate)
})

export const PATCH = withAuth<{ params: Promise<{ id: string }> }>(async (request, session, { params }) => {
  const { id } = await params
  const body = await request.json()

  const candidate = await prisma.candidate.update({
    where: { id },
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
}, 'canProposeCandidates')

export const DELETE = withAuth<{ params: Promise<{ id: string }> }>(async (request, session, { params }) => {
  const { id } = await params

  await prisma.candidate.delete({
    where: { id }
  })

  return NextResponse.json({ message: "Candidate deleted successfully" })
}, 'canProposeCandidates')
