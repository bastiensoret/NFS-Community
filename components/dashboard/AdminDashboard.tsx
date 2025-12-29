import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, UserCheck, Flame, TrendingUp, Eye } from "lucide-react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

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
        <h1 className="text-3xl font-bold text-foreground">Admin dashboard</h1>
        <p className="text-muted-foreground mt-2">Manage candidates and positions</p>
      </div>

      {/* Priority Actions */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Candidates pending approval
            </CardTitle>
            {pendingCandidatesCount > 0 && <Flame className="h-4 w-4 text-muted-foreground" />}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingCandidatesCount}</div>
            <p className="text-xs text-muted-foreground">Awaiting approval</p>
            {pendingCandidatesCount > 0 && (
              <Button variant="link" className="p-0 h-auto" asChild>
                <Link href="/dashboard/candidates?status=PENDING_APPROVAL">
                  Review now <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Positions pending approval
            </CardTitle>
            {pendingPositionsCount > 0 && <Flame className="h-4 w-4 text-muted-foreground" />}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingPositionsCount}</div>
            <p className="text-xs text-muted-foreground">Awaiting approval</p>
            {pendingPositionsCount > 0 && (
              <Button variant="link" className="p-0 h-auto" asChild>
                <Link href="/dashboard/positions?status=PENDING_APPROVAL">
                  Review now <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Overview Stats */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total candidates</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCandidatesCount}</div>
            <p className="text-xs text-muted-foreground">All profiles</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active candidates</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeCandidatesCount}</div>
            <p className="text-xs text-muted-foreground">Available for matching</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total positions</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPositionsCount}</div>
            <p className="text-xs text-muted-foreground">All job postings</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active positions</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activePositionsCount}</div>
            <p className="text-xs text-muted-foreground">Currently open</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Candidate management</CardTitle>
            <CardDescription>Review and manage candidates</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/dashboard/candidates?status=PENDING_APPROVAL" className="block p-3 rounded-lg border hover:bg-muted/50 transition-colors">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Review pending</div>
                  <div className="text-sm text-muted-foreground">Approve candidate profiles</div>
                </div>
                {pendingCandidatesCount > 0 && (
                  <Badge variant="warning">{pendingCandidatesCount}</Badge>
                )}
              </div>
            </Link>
            <Link href="/dashboard/candidates/new" className="block p-3 rounded-lg border hover:bg-muted/50 transition-colors">
              <div className="font-medium">Add candidate</div>
              <div className="text-sm text-muted-foreground">Create new profile</div>
            </Link>
            <Link href="/dashboard/candidates" className="block p-3 rounded-lg border hover:bg-muted/50 transition-colors">
              <div className="font-medium">View all candidates</div>
              <div className="text-sm text-muted-foreground">Browse all profiles</div>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Position management</CardTitle>
            <CardDescription>Manage job opportunities</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/dashboard/positions?status=PENDING_APPROVAL" className="block p-3 rounded-lg border hover:bg-muted/50 transition-colors">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Review pending</div>
                  <div className="text-sm text-muted-foreground">Approve positions</div>
                </div>
                {pendingPositionsCount > 0 && (
                  <Badge variant="warning">{pendingPositionsCount}</Badge>
                )}
              </div>
            </Link>
            <Link href="/dashboard/positions/new" className="block p-3 rounded-lg border hover:bg-muted/50 transition-colors">
              <div className="font-medium">Create position</div>
              <div className="text-sm text-muted-foreground">Add new job posting</div>
            </Link>
            <Link href="/dashboard/positions" className="block p-3 rounded-lg border hover:bg-muted/50 transition-colors">
              <div className="font-medium">View all positions</div>
              <div className="text-sm text-muted-foreground">Browse all postings</div>
            </Link>
          </CardContent>
        </Card>

      </div>
    </div>
  )
}
