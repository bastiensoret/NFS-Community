import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Briefcase, Plus, TrendingUp, Clock } from "lucide-react"
import Link from "next/link"

interface UserDashboardProps {
  userId: string
  candidatesCount: number
  positionsCount: number
  pendingPositionsCount: number
}

export function UserDashboard({ userId, candidatesCount, positionsCount, pendingPositionsCount }: UserDashboardProps) {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-2">Manage your candidates and positions</p>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Your Candidates</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{candidatesCount}</div>
            <p className="text-xs text-muted-foreground">Profiles you've created</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Your Positions</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{positionsCount}</div>
            <p className="text-xs text-muted-foreground">Positions you've posted</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Approval</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingPositionsCount}</div>
            <p className="text-xs text-muted-foreground">Positions awaiting approval</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Create new content</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/dashboard/candidates/new" className="block p-4 rounded-lg border hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-3">
                <Plus className="h-5 w-5 text-primary" />
                <div>
                  <div className="font-medium">Add New Candidate</div>
                  <div className="text-sm text-muted-foreground">Create a new candidate profile</div>
                </div>
              </div>
            </Link>
            <Link href="/dashboard/positions/new" className="block p-4 rounded-lg border hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-3">
                <Plus className="h-5 w-5 text-primary" />
                <div>
                  <div className="font-medium">Create Position</div>
                  <div className="text-sm text-muted-foreground">Add a new job opportunity</div>
                </div>
              </div>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>View Your Data</CardTitle>
            <CardDescription>Manage your existing content</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/dashboard/candidates" className="block p-4 rounded-lg border hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-blue-600" />
                <div>
                  <div className="font-medium">View All Candidates</div>
                  <div className="text-sm text-muted-foreground">Browse and manage candidate profiles</div>
                </div>
              </div>
            </Link>
            <Link href="/dashboard/positions" className="block p-4 rounded-lg border hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-3">
                <Briefcase className="h-5 w-5 text-green-600" />
                <div>
                  <div className="font-medium">View All Positions</div>
                  <div className="text-sm text-muted-foreground">Browse and manage job positions</div>
                </div>
              </div>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Getting Started</CardTitle>
          <CardDescription>Quick guide to make the most of your dashboard</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 rounded-full bg-blue-500 mt-2"></div>
            <div>
              <div className="font-medium">Create Candidates</div>
              <div className="text-sm text-muted-foreground">Add candidate profiles to build your talent pool</div>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 rounded-full bg-green-500 mt-2"></div>
            <div>
              <div className="font-medium">Post Positions</div>
              <div className="text-sm text-muted-foreground">Create job opportunities that need to be filled</div>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 rounded-full bg-orange-500 mt-2"></div>
            <div>
              <div className="font-medium">Track Progress</div>
              <div className="text-sm text-muted-foreground">Monitor the status of your positions and candidates</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
