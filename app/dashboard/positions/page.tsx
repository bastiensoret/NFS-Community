import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { PositionsTable } from "./PositionsTable"
import { redirect } from "next/navigation"

export default async function PositionsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; limit?: string; status?: string }>
}) {
  const session = await auth()
  
  if (!session) {
    redirect("/auth/signin")
  }

  const resolvedParams = await searchParams
  const page = Number(resolvedParams?.page) || 1
  const limit = Number(resolvedParams?.limit) || 10
  const status = resolvedParams?.status
  const skip = (page - 1) * limit

  const isAdmin = session.user?.role === "ADMIN" || session.user?.role === "SUPER_ADMIN"

  // Build where clause
  const where: any = {}
  
  if (status) {
    // If status is specifically requested
    where.status = status
  } else {
    // Default view: Show ACTIVE positions. 
    // If admin, they might want to see everything? 
    // Usually "Positions" tab shows the main active list.
    where.status = "ACTIVE"
  }

  // Security check: Only admins can see PENDING_APPROVAL via this generic list
  if (where.status === "PENDING_APPROVAL" && !isAdmin) {
    where.status = "ACTIVE" // Fallback or redirect
  }

  const [positions, total, pendingCount] = await Promise.all([
    prisma.jobPosting.findMany({
      where,
      orderBy: { postingDate: "desc" },
      skip,
      take: limit,
    }),
    prisma.jobPosting.count({ where }),
    // Count pending positions for the badge/tab if admin
    isAdmin ? prisma.jobPosting.count({ where: { status: "PENDING_APPROVAL" } }) : Promise.resolve(0)
  ])

  return (
    <PositionsTable 
      initialPositions={positions} 
      userRole={session.user?.role}
      pendingCount={pendingCount}
      currentStatus={where.status}
      pagination={{
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }}
    />
  )
}
