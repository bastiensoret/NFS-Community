import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Users, Briefcase, LogOut, Home, Shield, User, ChevronsUpDown, SquareKanban } from "lucide-react"
import { getRoleDisplayName } from "@/lib/roles"
import { prisma } from "@/lib/prisma"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

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
      <aside className="w-64 bg-background border-r flex flex-col">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-foreground">NFS Community</h1>
          <p className="text-sm text-muted-foreground mt-1">Building our reputation</p>
        </div>
        
        <nav className="px-4 space-y-2 flex-1">
          <Link href="/dashboard">
            <Button variant="ghost" className="w-full justify-start">
              <Home className="mr-2 h-4 w-4" />
              Dashboard
            </Button>
          </Link>
          <Link href="/dashboard/candidates">
            <Button variant="ghost" className="w-full justify-start">
              <Users className="mr-2 h-4 w-4" />
              Candidates
            </Button>
          </Link>
          <Link href="/dashboard/positions">
            <Button variant="ghost" className="w-full justify-start">
              <Briefcase className="mr-2 h-4 w-4" />
              Positions
            </Button>
          </Link>
          {(currentUser?.role === "GATEKEEPER" || currentUser?.role === "ADMIN" || currentUser?.role === "SUPER_ADMIN") && (
            <Link href="/dashboard/gatekeeper">
              <Button variant="ghost" className="w-full justify-start">
                <SquareKanban className="mr-2 h-4 w-4" />
                Gatekeeper Board
              </Button>
            </Link>
          )}
        </nav>

        <div className="px-4 pb-2">
          {currentUser?.role === "SUPER_ADMIN" && (
            <Link href="/dashboard/admin">
              <Button variant="ghost" className="w-full justify-start">
                <Shield className="mr-2 h-4 w-4" />
                Administration
              </Button>
            </Link>
          )}
        </div>

        <div className="p-4 border-t">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="flex items-center gap-3 px-2 py-2 w-full hover:bg-accent rounded-md cursor-pointer transition-colors outline-none">
                <Avatar className="h-8 w-8 border">
                  <AvatarImage src={currentUser?.image || ""} alt={currentUser?.name || "User"} />
                  <AvatarFallback className="bg-muted text-muted-foreground text-xs font-bold">
                    {currentUser?.name?.[0] || currentUser?.email?.[0]?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {currentUser?.name || currentUser?.email}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {getRoleDisplayName(currentUser?.role || '')}
                  </p>
                </div>
                <ChevronsUpDown className="h-4 w-4 text-muted-foreground" />
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" side="top">
              <DropdownMenuItem asChild>
                <Link href="/dashboard/profile" className="cursor-pointer flex w-full items-center">
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <form action={async () => {
                  "use server"
                  const { signOut } = await import("@/auth")
                  await signOut()
                }} className="w-full">
                  <Button variant="ghost" type="submit" className="w-full justify-start px-2 py-1.5 h-auto font-normal text-sm cursor-pointer hover:bg-transparent">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Disconnect</span>
                  </Button>
                </form>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>

      <main className="flex-1 overflow-auto p-8">
        {children}
      </main>
    </div>
  )
}
