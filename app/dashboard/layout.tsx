import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Sidebar } from "@/components/dashboard/Sidebar"
import { signOutAction } from "@/app/actions/auth"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session?.user?.id) {
    redirect("/auth/signin")
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      image: true,
      name: true,
      email: true,
      role: true,
    }
  })

  const currentUser = user || session.user

  return (
    <div className="fixed inset-0 flex bg-muted/40 overflow-hidden">
      <Sidebar user={currentUser} onSignOut={signOutAction} />

      <main className="flex-1 overflow-auto p-8">
        {children}
      </main>
    </div>
  )
}
