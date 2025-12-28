import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { CandidatesTable } from "./CandidatesTable"
import { redirect } from "next/navigation"
import { Prisma } from "@prisma/client"

export default async function CandidatesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; limit?: string; cursor?: string; status?: string; query?: string }>
}) {
  const session = await auth()
  
  if (!session) {
    redirect("/auth/signin")
  }

  const resolvedParams = await searchParams
  const page = Number(resolvedParams?.page) || 1
  const limit = Number(resolvedParams?.limit) || 10
  const cursor = resolvedParams?.cursor
  const status = resolvedParams?.status
  const query = resolvedParams?.query
  
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true, isGatekeeper: true }
  })
  
  const userRole = user?.role || session.user.role
  const isGatekeeper = user?.isGatekeeper || session.user.isGatekeeper
  const canManage = userRole === "ADMIN" || userRole === "SUPER_ADMIN" || userRole === "RECRUITER" || isGatekeeper

  const where: Prisma.CandidateWhereInput = {}

  // Text Search
  if (query) {
    where.OR = [
      { firstName: { contains: query, mode: 'insensitive' } },
      { lastName: { contains: query, mode: 'insensitive' } },
      { email: { contains: query, mode: 'insensitive' } },
    ]
  }

  // Status Filter
  if (status && status !== "ALL") {
    where.status = status
  }

  if (!canManage) {
    // Basic users see:
    // 1. Their own candidates (any status)
    // 2. Active candidates from others
    // We need to combine this with existing filters
    
    const visibilityFilter: Prisma.CandidateWhereInput = {
      OR: [
        { creatorId: session.user.id },
        { status: "ACTIVE" }
      ]
    }

    // Combine filters safely
    if (where.OR) {
        where.AND = [
            visibilityFilter,
            { OR: where.OR }
        ]
        delete where.OR
    } else {
        where.AND = [visibilityFilter]
    }
  }

  const queryOptions: Prisma.CandidateFindManyArgs = {
    where,
    orderBy: [
      { updatedAt: "desc" },
      { id: "desc" }
    ],
    take: limit,
    include: {
        creator: {
            select: { name: true, email: true }
        }
    }
  }

  if (cursor) {
    queryOptions.skip = 1
    queryOptions.cursor = { id: cursor }
  } else {
    queryOptions.skip = (page - 1) * limit
  }

  const [candidates, total] = await Promise.all([
    prisma.candidate.findMany(queryOptions),
    prisma.candidate.count({ where }),
  ])

  let nextCursor = undefined
  if (candidates.length === limit) {
    nextCursor = candidates[candidates.length - 1].id
  }
  
  // Serialize dates for Client Component
  const serializedCandidates = candidates.map(c => ({
    ...c,
    createdAt: c.createdAt.toISOString(),
    updatedAt: c.updatedAt.toISOString(),
  }))
  
  return (
    <CandidatesTable 
      initialCandidates={serializedCandidates} 
      userRole={session.user?.role}
      currentUserId={session.user?.id}
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
