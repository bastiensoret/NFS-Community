import { auth } from "@/auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Briefcase, UserCheck } from "lucide-react"
import { prisma } from "@/lib/prisma"

export default async function DashboardPage() {
  const session = await auth()
  
  const [candidatesCount, jobPostingsCount, activeJobsCount] = await Promise.all([
    prisma.candidate.count(),
    prisma.jobPosting.count(),
    prisma.jobPosting.count({ where: { status: "ACTIVE" } }),
  ])

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-2">Welcome back, {session?.user?.name || session?.user?.email}</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Candidates</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{candidatesCount}</div>
            <p className="text-xs text-muted-foreground">Registered profiles</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Positions</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{jobPostingsCount}</div>
            <p className="text-xs text-muted-foreground">Total positions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending positions to send</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeJobsCount}</div>
            <p className="text-xs text-muted-foreground">Currently open</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks and operations</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <a href="/dashboard/candidates/new" className="block p-3 rounded-lg border hover:bg-gray-50 transition-colors">
              <div className="font-medium">Add New Candidate</div>
              <div className="text-sm text-gray-500">Create a new candidate profile</div>
            </a>
            <a href="/dashboard/positions/new" className="block p-3 rounded-lg border hover:bg-gray-50 transition-colors">
              <div className="font-medium">Create Position</div>
              <div className="text-sm text-gray-500">Add a new job opportunity</div>
            </a>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
