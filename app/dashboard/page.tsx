import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { UserDashboard } from "@/components/dashboard/UserDashboard"
import { AdminDashboard } from "@/components/dashboard/AdminDashboard"
import { GatekeeperDashboard } from "@/components/dashboard/GatekeeperDashboard"

export default async function DashboardPage() {
  const session = await auth()
  
  if (!session) {
    throw new Error("Not authenticated")
  }

  // Fetch user details with fresh data
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true, isGatekeeper: true }
  })

  const userRole = user?.role || session.user.role
  const isGatekeeper = user?.isGatekeeper || session.user.isGatekeeper

  // Fetch statistics based on user role
  const [
    totalCandidates,
    activeCandidates,
    pendingCandidates,
    totalPositions,
    activePositions,
    pendingPositions,
    userCandidates,
    userPositions,
    campaignSentPositions
  ] = await Promise.all([
    // Overall stats
    prisma.candidate.count(),
    prisma.candidate.count({ where: { status: "ACTIVE" } }),
    prisma.candidate.count({ where: { status: "PENDING_APPROVAL" } }),
    prisma.jobPosting.count(),
    prisma.jobPosting.count({ where: { status: "ACTIVE" } }),
    prisma.jobPosting.count({ where: { status: "PENDING_APPROVAL" } }),
    
    // User-specific stats
    prisma.candidate.count({ where: { creatorId: session.user.id } }),
    prisma.jobPosting.count({ where: { creatorId: session.user.id } }),
    prisma.jobPosting.count({ where: { status: "CAMPAIGN_SENT" } })
  ])

  // Render dashboard based on user role
  if (userRole === "ADMIN" || userRole === "SUPER_ADMIN") {
    return (
      <AdminDashboard
        pendingCandidatesCount={pendingCandidates}
        activeCandidatesCount={activeCandidates}
        totalCandidatesCount={totalCandidates}
        pendingPositionsCount={pendingPositions}
        activePositionsCount={activePositions}
        totalPositionsCount={totalPositions}
      />
    )
  }

  if (isGatekeeper) {
    return (
      <GatekeeperDashboard
        pendingPositionsCount={pendingPositions}
        approvedPositionsCount={activePositions}
        campaignSentCount={campaignSentPositions}
        totalPositionsCount={totalPositions}
      />
    )
  }

  // Default: Basic User dashboard (for all other roles including any former RECRUITER role)
  return (
    <UserDashboard
      userId={session.user.id}
      candidatesCount={userCandidates}
      positionsCount={userPositions}
      pendingPositionsCount={pendingPositions}
    />
  )
}
