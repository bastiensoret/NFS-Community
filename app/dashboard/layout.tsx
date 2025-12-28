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
    <div className="flex h-screen bg-gray-50">
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-gray-900">NFS Community</h1>
          <p className="text-sm text-gray-500 mt-1">Building our reputation</p>
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

        <div className="p-4 border-t border-gray-200">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="flex items-center gap-3 px-2 py-2 w-full hover:bg-gray-100 rounded-md cursor-pointer transition-colors outline-none">
                <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border shrink-0">
                  {currentUser?.image ? (
                    <img 
                      src={currentUser.image} 
                      alt="Profile" 
                      className="h-full w-full object-cover" 
                    />
                  ) : (
                    <div className="h-full w-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
                      {currentUser?.name?.[0] || currentUser?.email?.[0]?.toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {currentUser?.name || currentUser?.email}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {getRoleDisplayName(currentUser?.role || '')}
                  </p>
                </div>
                <ChevronsUpDown className="h-4 w-4 text-gray-500" />
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
                  <button type="submit" className="w-full flex items-center cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Disconnect</span>
                  </button>
                </form>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  )
}
