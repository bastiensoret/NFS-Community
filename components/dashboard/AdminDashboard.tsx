import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, UserCheck, Clock, AlertTriangle, TrendingUp, Eye } from "lucide-react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"

interface AdminDashboardProps {
  pendingCandidatesCount: number
  activeCandidatesCount: number
  totalCandidatesCount: number
  pendingPositionsCount: number
  activePositionsCount: number
  totalPositionsCount: number
}

export function AdminDashboard({ 
  pendingCandidatesCount, 
  activeCandidatesCount, 
  totalCandidatesCount,
  pendingPositionsCount,
  activePositionsCount,
  totalPositionsCount 
}: AdminDashboardProps) {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-2">Manage candidates and positions</p>
      </div>

      {/* Priority Actions */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-orange-200 bg-orange-50/50 dark:bg-orange-950/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-800 dark:text-orange-200">
              Candidates Pending Approval
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-800 dark:text-orange-200">{pendingCandidatesCount}</div>
            <p className="text-xs text-muted-foreground">Need your attention</p>
            {pendingCandidatesCount > 0 && (
              <Link href="/dashboard/candidates?status=PENDING_APPROVAL" className="inline-flex items-center mt-2 text-sm text-orange-600 hover:text-orange-700">
                Review Now →
              </Link>
            )}
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-blue-50/50 dark:bg-blue-950/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-800 dark:text-blue-200">
              Positions Pending Approval
            </CardTitle>
            <Clock className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-800 dark:text-blue-200">{pendingPositionsCount}</div>
            <p className="text-xs text-muted-foreground">Awaiting approval</p>
            {pendingPositionsCount > 0 && (
              <Link href="/dashboard/positions?status=PENDING_APPROVAL" className="inline-flex items-center mt-2 text-sm text-blue-600 hover:text-blue-700">
                Review Now →
              </Link>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Overview Stats */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Candidates</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCandidatesCount}</div>
            <p className="text-xs text-muted-foreground">All profiles</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Candidates</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeCandidatesCount}</div>
            <p className="text-xs text-muted-foreground">Available for matching</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Positions</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPositionsCount}</div>
            <p className="text-xs text-muted-foreground">All job postings</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Positions</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activePositionsCount}</div>
            <p className="text-xs text-muted-foreground">Currently open</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Candidate Management</CardTitle>
            <CardDescription>Review and manage candidates</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/dashboard/candidates?status=PENDING_APPROVAL" className="block p-3 rounded-lg border hover:bg-muted/50 transition-colors">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Review Pending</div>
                  <div className="text-sm text-muted-foreground">Approve candidate profiles</div>
                </div>
                {pendingCandidatesCount > 0 && (
                  <Badge variant="warning">{pendingCandidatesCount}</Badge>
                )}
              </div>
            </Link>
            <Link href="/dashboard/candidates/new" className="block p-3 rounded-lg border hover:bg-muted/50 transition-colors">
              <div className="font-medium">Add Candidate</div>
              <div className="text-sm text-muted-foreground">Create new profile</div>
            </Link>
            <Link href="/dashboard/candidates" className="block p-3 rounded-lg border hover:bg-muted/50 transition-colors">
              <div className="font-medium">View All Candidates</div>
              <div className="text-sm text-muted-foreground">Browse all profiles</div>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Position Management</CardTitle>
            <CardDescription>Manage job opportunities</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/dashboard/positions?status=PENDING_APPROVAL" className="block p-3 rounded-lg border hover:bg-muted/50 transition-colors">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Review Pending</div>
                  <div className="text-sm text-muted-foreground">Approve positions</div>
                </div>
                {pendingPositionsCount > 0 && (
                  <Badge variant="warning">{pendingPositionsCount}</Badge>
                )}
              </div>
            </Link>
            <Link href="/dashboard/positions/new" className="block p-3 rounded-lg border hover:bg-muted/50 transition-colors">
              <div className="font-medium">Create Position</div>
              <div className="text-sm text-muted-foreground">Add new job posting</div>
            </Link>
            <Link href="/dashboard/positions" className="block p-3 rounded-lg border hover:bg-muted/50 transition-colors">
              <div className="font-medium">View All Positions</div>
              <div className="text-sm text-muted-foreground">Browse all postings</div>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Management</CardTitle>
            <CardDescription>Administrative tasks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/dashboard/admin" className="block p-3 rounded-lg border hover:bg-muted/50 transition-colors">
              <div className="font-medium">User Management</div>
              <div className="text-sm text-muted-foreground">Manage user accounts</div>
            </Link>
            <Link href="/dashboard/gatekeeper" className="block p-3 rounded-lg border hover:bg-muted/50 transition-colors">
              <div className="font-medium">Gatekeeper Board</div>
              <div className="text-sm text-muted-foreground">View kanban board</div>
            </Link>
            <Link href="/dashboard/profile" className="block p-3 rounded-lg border hover:bg-muted/50 transition-colors">
              <div className="font-medium">Profile Settings</div>
              <div className="text-sm text-muted-foreground">Update your profile</div>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
