import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { notFound, redirect } from "next/navigation"
import { EditCandidateForm } from "./EditCandidateForm"

export default async function EditCandidatePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await auth()
  
  if (!session) {
    redirect("/auth/signin")
  }

  const { id } = await params
  const candidate = await prisma.candidate.findUnique({
    where: { id },
  })

  if (!candidate) {
    notFound()
  }

  // Permission Check
  // Admins, Recruiters, and Gatekeepers can view/edit
  // Creators can edit their own DRAFTs
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true, isGatekeeper: true }
  })

  const userRole = user?.role || session.user.role
  const isGatekeeper = user?.isGatekeeper || session.user.isGatekeeper
  const isCreator = candidate.creatorId === session.user.id
  const isAdmin = userRole === "ADMIN" || userRole === "SUPER_ADMIN"

  const canEdit = isAdmin || isGatekeeper || (isCreator && candidate.status === "DRAFT")

  if (!canEdit) {
    // If they can't edit, maybe they can view? 
    // For now, redirect to list if unauthorized
    redirect("/dashboard/candidates")
  }

  return (
    <EditCandidateForm 
      candidate={candidate} 
      userRole={userRole} 
    />
  )
}
