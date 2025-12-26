import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { JobPostingsTable } from "./JobPostingsTable"
import { redirect } from "next/navigation"

export default async function JobPostingsPage({
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

  const [jobPostings, total] = await Promise.all([
    prisma.jobPosting.findMany({
      orderBy: { postingDate: "desc" },
      skip,
      take: limit,
    }),
    prisma.jobPosting.count(),
  ])

  return (
    <JobPostingsTable 
      initialJobPostings={jobPostings} 
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
