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
  const isSuperAdmin = session.user?.role === "SUPER_ADMIN"

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

  // Security & Visibility Rules
  if (where.status === "PENDING_APPROVAL") {
    // Visible to everyone as per workflow requirements
  } else if (where.status === "DRAFT") {
    // Drafts are ONLY visible to their Creator and Super Admin.
    // Regular Admins cannot see others' drafts.
    if (!isSuperAdmin) {
      where.creatorId = session.user.id
    }
  }
  // Other statuses (ACTIVE, CAMPAIGN_SENT, ARCHIVED) are visible to everyone.

  const [positions, total, pendingCount] = await Promise.all([
    prisma.jobPosting.findMany({
      where,
      orderBy: { postingDate: "desc" },
      skip,
      take: limit,
    }),
    prisma.jobPosting.count({ where }),
    // Count pending positions for the badge/tab for all users
    prisma.jobPosting.count({ where: { status: "PENDING_APPROVAL" } })
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
