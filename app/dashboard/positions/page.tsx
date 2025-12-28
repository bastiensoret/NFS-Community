import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { PositionsTable } from "./PositionsTable"
import { redirect } from "next/navigation"
import { Prisma } from "@prisma/client"

export default async function PositionsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; limit?: string; status?: string; query?: string; cursor?: string }>
}) {
  const session = await auth()
  
  if (!session) {
    redirect("/auth/signin")
  }

  const resolvedParams = await searchParams
  const page = Number(resolvedParams?.page) || 1
  const limit = Number(resolvedParams?.limit) || 10
  const status = resolvedParams?.status
  const query = resolvedParams?.query
  const cursor = resolvedParams?.cursor
  
  const isAdmin = session.user?.role === "ADMIN" || session.user?.role === "SUPER_ADMIN"
  const isSuperAdmin = session.user?.role === "SUPER_ADMIN"

  // Build where clause
  const where: Prisma.JobPostingWhereInput = {}
  
  // Status Filter
  if (status && status !== "ALL") {
    where.status = status
  } else {
    where.status = { not: "DRAFT" }
  }

  // Search Filter
  if (query) {
    where.OR = [
      { jobTitle: { contains: query, mode: 'insensitive' } },
      { companyName: { contains: query, mode: 'insensitive' } },
      { reference: { contains: query, mode: 'insensitive' } },
    ]
  }

  // Security & Visibility Rules
  if (!isAdmin && !isSuperAdmin) {
    // If specifically requesting DRAFT, only show own drafts
    if (where.status === 'DRAFT') {
        where.creatorId = session.user.id
    }
    // Otherwise (ACTIVE, PENDING, etc) - visible to all
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

  // Transform to DTO (Serialize Dates)
  const serializedPositions = positions.map(pos => ({
    ...pos,
    postingDate: pos.postingDate.toISOString(),
    startDate: pos.startDate?.toISOString() ?? null,
    endDate: pos.endDate?.toISOString() ?? null,
    applicationDeadline: pos.applicationDeadline?.toISOString() ?? null,
    lastUpdated: pos.lastUpdated.toISOString(),
    // Ensure JSON fields are handled or typed as needed, strictly they are strictly typed in Prisma Client but might need loose handling for legacy
    workLocation: pos.workLocation as any, 
  }))

  return (
    <PositionsTable 
      initialPositions={serializedPositions} 
      userRole={session.user?.role}
      currentUserId={session.user?.id}
      pendingCount={pendingCount}
      currentStatus={status || "ALL"}
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
