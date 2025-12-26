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

  // Only admins and recruiters can edit
  const canManage = session.user?.role === "ADMIN" || session.user?.role === "SUPER_ADMIN" || session.user?.role === "RECRUITER"
  
  if (!canManage) {
    redirect("/dashboard/positions")
  }

  const { id } = await params
  const position = await prisma.jobPosting.findUnique({
    where: { id },
  })

  if (!position) {
    notFound()
  }

  return <EditPositionForm position={position} />
}
