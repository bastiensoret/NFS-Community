import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import GatekeeperDashboardClient from "./client"
import type { KanbanItem } from "@/components/kanban/KanbanCard"

export default async function GatekeeperDashboardPage() {
  const session = await auth()

  if (!session?.user?.id) {
    redirect("/auth/signin")
  }

  // Check if user is Gatekeeper or Super Admin
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { isGatekeeper: true, role: true }
  })

  if (!user?.isGatekeeper && user?.role !== "SUPER_ADMIN") {
    redirect("/dashboard")
  }

  // Fetch Candidates
  const candidates = await prisma.candidate.findMany({
    include: {
      creator: { select: { name: true, email: true } }
    },
    orderBy: { updatedAt: 'desc' }
  })

  const kanbanCandidates: KanbanItem[] = candidates.map(c => ({
    id: c.id,
    columnId: c.status || "DRAFT",
    title: `${c.firstName} ${c.lastName}`,
    subtitle: c.desiredRoles[0] || "No role specified",
    tags: [...c.hardSkills, ...c.softSkills].slice(0, 3),
    content: c.email,
    creator: c.creator?.name || c.creator?.email || "Unknown",
    date: c.updatedAt.toISOString(),
    seniority: c.seniorityLevel || undefined,
    location: c.location || undefined,
    phoneNumber: c.phoneNumber || undefined,
    type: "candidate"
  }))

  // Fetch Positions
  const positions = await prisma.jobPosting.findMany({
    include: {
      creator: { select: { name: true, email: true } }
    },
    orderBy: { lastUpdated: 'desc' }
  })

  const kanbanPositions: KanbanItem[] = positions.map(p => {
    // Map status to Kanban columns
    let columnId = p.status
    if (p.status === "CAMPAIGN_SENT") columnId = "ACTIVE"
    if (p.status === "ARCHIVED") columnId = "INACTIVE"
    // Fallback if status is not one of the standard ones, e.g. ACTIVE might be mapped to Campaign Sent?
    // Wait, createPositionAction sets default status "ACTIVE" for Admins. 
    // If status is ACTIVE, let's put it in "ACTIVE" column (Campaign Sent) or maybe create a separate logic?
    // The requirement says: APPROVED -> CAMPAIGN_SENT.
    // If Admin creates it, it's ACTIVE.
    // Let's treat ACTIVE and CAMPAIGN_SENT as same column "ACTIVE"?
    if (p.status === "ACTIVE") columnId = "ACTIVE"

    return {
      id: p.id,
      columnId,
      title: p.jobTitle,
      subtitle: p.companyName,
      tags: [p.location, p.country].filter(Boolean) as string[],
      content: p.description ? p.description.substring(0, 100) + "..." : "",
      creator: p.creator?.name || p.creator?.email || "Unknown",
      date: p.lastUpdated.toISOString(),
      seniority: p.seniorityLevel,
      location: p.location || undefined,
      phoneNumber: p.contactPhone || undefined,
      type: "position"
    }
  })

  return (
    <GatekeeperDashboardClient 
      candidates={kanbanCandidates} 
      positions={kanbanPositions} 
    />
  )
}
