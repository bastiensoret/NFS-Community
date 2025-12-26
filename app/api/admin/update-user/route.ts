import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { withAuth } from "@/lib/api-utils"

export const PATCH = withAuth(async (request, session) => {
  if (session.user.role !== "SUPER_ADMIN") {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 403 }
    )
  }

  const { userId, role, isGatekeeper } = await request.json()

  if (!userId || !role) {
    return NextResponse.json(
      { error: "User ID and role are required" },
      { status: 400 }
    )
  }

  const validRoles = ["BASIC_USER", "USER", "ADMIN", "SUPER_ADMIN"]
  if (!validRoles.includes(role)) {
    return NextResponse.json(
      { error: "Invalid role" },
      { status: 400 }
    )
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: { 
      role,
      isGatekeeper: isGatekeeper ?? false,
    },
    select: {
      id: true,
      email: true,
      role: true,
      isGatekeeper: true,
      name: true,
    },
  })

  return NextResponse.json({
    message: "User role updated successfully",
    user: updatedUser,
  })
}, 'canManageUsers')
