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
  
  // Fetch fresh user data for permissions
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true, isGatekeeper: true }
  })

  const userRole = user?.role || session.user.role
  const isGatekeeper = user?.isGatekeeper || session.user.isGatekeeper
  const isAdmin = userRole === "ADMIN" || userRole === "SUPER_ADMIN"
  const canManage = isAdmin || isGatekeeper

  // Build where clause
  const where: Prisma.JobPostingWhereInput = {}
  
  // Status Filter
  if (status && status !== "ALL") {
    where.status = status
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
  if (!canManage) {
    // Basic users see:
    // 1. Their own positions (DRAFT, PENDING, etc.)
    // 2. Publicly visible positions (CAMPAIGN_SENT / ACTIVE)
    const visibilityFilter: Prisma.JobPostingWhereInput = {
        OR: [
            { creatorId: session.user.id },
            { status: "CAMPAIGN_SENT" },
            { status: "ACTIVE" } // Legacy support or Admin created
        ]
    }

    if (where.OR) {
        where.AND = [
            visibilityFilter,
            { OR: where.OR }
        ]
        delete where.OR
    } else {
        where.AND = [visibilityFilter]
    }
  } else if (!status || status === "ALL") {
     // For admins/managers, if no status filter is applied, maybe show everything?
     // Or default to not showing ARCHIVED unless asked?
     // Original logic was "not DRAFT".
     // Let's keep showing everything or filter out DRAFT?
     // Usually admins want to see what's happening.
     // Let's default to hiding DRAFTs of others? No, Admins can see everything.
     // Let's just default to showing all non-archived?
     // Original: where.status = { not: "DRAFT" }
     if (!status) {
         // Default view: Everything except perhaps DRAFTs that are not theirs?
         // Actually, simpler: show all.
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
      userRole={userRole}
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
