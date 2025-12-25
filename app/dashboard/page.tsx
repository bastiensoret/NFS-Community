import { auth } from "@/auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Briefcase, UserCheck, Mail, Shield, Calendar, Building2, User } from "lucide-react"
import { prisma } from "@/lib/prisma"
import { Badge } from "@/components/ui/badge"
import { getRoleDisplayName } from "@/lib/roles"

export default async function DashboardPage() {
  const session = await auth()
  
  const [candidatesCount, jobPostingsCount, activeJobsCount, fullUser] = await Promise.all([
    prisma.candidate.count(),
    prisma.jobPosting.count(),
    prisma.jobPosting.count({ where: { status: "ACTIVE" } }),
    session?.user?.id ? prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        tenantId: true,
        createdAt: true,
      },
    }) : null,
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
            <CardTitle className="text-sm font-medium">Total Candidates</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{candidatesCount}</div>
            <p className="text-xs text-muted-foreground">Registered profiles</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Job Postings</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{jobPostingsCount}</div>
            <p className="text-xs text-muted-foreground">Total positions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Jobs</CardTitle>
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
            <a href="/dashboard/job-postings/new" className="block p-3 rounded-lg border hover:bg-gray-50 transition-colors">
              <div className="font-medium">Create Job Posting</div>
              <div className="text-sm text-gray-500">Add a new job opportunity</div>
            </a>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Your Profile</CardTitle>
            <CardDescription>Account information</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold">
                  {fullUser?.firstName?.[0] || fullUser?.name?.[0] || fullUser?.email?.[0].toUpperCase()}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {fullUser?.firstName && fullUser?.lastName 
                      ? `${fullUser.firstName} ${fullUser.lastName}`
                      : fullUser?.name || "User"}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Mail className="h-3.5 w-3.5 text-gray-400" />
                    <p className="text-sm text-gray-600">{fullUser?.email}</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Shield className="h-3 w-3" />
                  {getRoleDisplayName(fullUser?.role || '')}
                </Badge>
              </div>

              <div className="space-y-3 pt-2 border-t">
                {fullUser?.tenantId && (
                  <div className="flex items-center gap-3 text-sm">
                    <Building2 className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-500">Organization</span>
                    <span className="ml-auto font-medium text-gray-700">{fullUser.tenantId}</span>
                  </div>
                )}
                <div className="flex items-center gap-3 text-sm">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-500">Member since</span>
                  <span className="ml-auto font-medium text-gray-700">
                    {fullUser?.createdAt 
                      ? new Date(fullUser.createdAt).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric', 
                          year: 'numeric' 
                        })
                      : "Unknown"}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
