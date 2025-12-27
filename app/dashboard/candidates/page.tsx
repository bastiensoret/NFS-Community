import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { CandidatesTable } from "./CandidatesTable"
import { redirect } from "next/navigation"

export default async function CandidatesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; limit?: string; cursor?: string }>
}) {
  const session = await auth()
  
  if (!session) {
    redirect("/auth/signin")
  }

  const resolvedParams = await searchParams
  const page = Number(resolvedParams?.page) || 1
  const limit = Number(resolvedParams?.limit) || 10
  const cursor = resolvedParams?.cursor
  
  const queryOptions: any = {
    orderBy: [
      { createdAt: "desc" },
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

  const [candidates, total] = await Promise.all([
    prisma.candidate.findMany(queryOptions),
    prisma.candidate.count(),
  ])

  let nextCursor = undefined
  if (candidates.length === limit) {
    nextCursor = candidates[candidates.length - 1].id
  }
  
  return (
    <CandidatesTable 
      initialCandidates={candidates} 
      userRole={session.user?.role}
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
