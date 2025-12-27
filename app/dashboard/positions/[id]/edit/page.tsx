import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { notFound, redirect } from "next/navigation"
import { EditPositionForm } from "./EditPositionForm"

export default async function EditPositionPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await auth()
  
  if (!session) {
    redirect("/auth/signin")
  }

  const { id } = await params
  const position = await prisma.jobPosting.findUnique({
    where: { id },
    include: {
      languageRequirements: true
    }
  })

  if (!position) {
    notFound()
  }

  // Permission Logic
  const userRole = session.user?.role
  const isCreator = position.creatorId === session.user?.id
  const isAdmin = userRole === "ADMIN" || userRole === "SUPER_ADMIN"
  const isRecruiter = userRole === "RECRUITER"

  // Basic Users can only edit their own DRAFT positions
  // Admins/Recruiters can edit positions generally (subject to other workflow constraints in the form/API)
  const canEdit = isAdmin || isRecruiter || (isCreator && position.status === "DRAFT")

  if (!canEdit) {
    redirect("/dashboard/positions")
  }

  return <EditPositionForm position={position} userRole={userRole || "USER"} />
}
