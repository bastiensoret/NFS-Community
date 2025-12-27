import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { PositionsTable } from "./PositionsTable"
import { redirect } from "next/navigation"
import { Prisma } from "@prisma/client"

export default async function PositionsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; limit?: string; status?: string; cursor?: string }>
}) {
  const session = await auth()
  
  if (!session) {
    redirect("/auth/signin")
  }

  const resolvedParams = await searchParams
  const page = Number(resolvedParams?.page) || 1
  const limit = Number(resolvedParams?.limit) || 10
  const status = resolvedParams?.status
  const cursor = resolvedParams?.cursor
  
  const isAdmin = session.user?.role === "ADMIN" || session.user?.role === "SUPER_ADMIN"
  const isSuperAdmin = session.user?.role === "SUPER_ADMIN"

  // Build where clause
  const where: Prisma.JobPostingWhereInput = {}
  
  if (status) {
    where.status = status
  } else {
    where.status = "ACTIVE"
  }

  // Security & Visibility Rules
  if (where.status === "PENDING_APPROVAL") {
    // Visible to everyone
  } else if (where.status === "DRAFT") {
    if (!isSuperAdmin) {
      where.creatorId = session.user.id
    }
  }

  const queryOptions: Prisma.JobPostingFindManyArgs = {
    where,
    orderBy: [
      { postingDate: "desc" },
      { id: "desc" }
    ],
    take: limit,
  }

  if (cursor) {
    queryOptions.skip = 1
    queryOptions.cursor = { id: cursor }
  } else {
    queryOptions.skip = (page - 1) * limit
  }

  const [positions, total, pendingCount] = await Promise.all([
    prisma.jobPosting.findMany(queryOptions),
    prisma.jobPosting.count({ where }),
    prisma.jobPosting.count({ where: { status: "PENDING_APPROVAL" } })
  ])

  let nextCursor = undefined
  if (positions.length === limit) {
    nextCursor = positions[positions.length - 1].id
  }

  return (
    <PositionsTable 
      initialPositions={positions as any} 
      userRole={session.user?.role}
      currentUserId={session.user?.id}
      pendingCount={pendingCount}
      currentStatus={typeof where.status === 'string' ? where.status : "ACTIVE"}
      pagination={{
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        nextCursor
      }}
    />
  )
}
