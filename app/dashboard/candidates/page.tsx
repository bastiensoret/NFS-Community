import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { CandidatesTable } from "./CandidatesTable"
import { redirect } from "next/navigation"

export default async function CandidatesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; limit?: string }>
}) {
  const session = await auth()
  
  if (!session) {
    redirect("/auth/signin")
  }

  const resolvedParams = await searchParams
  const page = Number(resolvedParams?.page) || 1
  const limit = Number(resolvedParams?.limit) || 10
  const skip = (page - 1) * limit

  const [candidates, total] = await Promise.all([
    prisma.candidate.findMany({
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.candidate.count(),
  ])

  // Data is now natively typed from Prisma (arrays are arrays, not strings)
  // We don't need manual JSON.parse anymore.
  
  return (
    <CandidatesTable 
      initialCandidates={candidates} 
      userRole={session.user?.role}
      pagination={{
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }}
    />
  )
}
