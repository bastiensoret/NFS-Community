import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Briefcase, Clock, CheckCircle, AlertTriangle, TrendingUp, Eye, Send } from "lucide-react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

interface GatekeeperDashboardProps {
  pendingPositionsCount: number
  approvedPositionsCount: number
  campaignSentCount: number
  totalPositionsCount: number
}

export function GatekeeperDashboard({ 
  pendingPositionsCount, 
  approvedPositionsCount, 
  campaignSentCount,
  totalPositionsCount 
}: GatekeeperDashboardProps) {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Gatekeeper Dashboard</h1>
        <p className="text-muted-foreground mt-2">Review and approve position submissions</p>
      </div>

      {/* Priority Actions */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-orange-200 bg-orange-50/50 dark:bg-orange-950/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-800 dark:text-orange-200">
              Positions Pending Approval
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-800 dark:text-orange-200">{pendingPositionsCount}</div>
            <p className="text-xs text-muted-foreground">Need your review</p>
            {pendingPositionsCount > 0 && (
              <Button variant="link" className="p-0 h-auto text-orange-600 hover:text-orange-700 dark:text-orange-400" asChild>
                <Link href="/dashboard/positions?status=PENDING_APPROVAL">
                  Review Now <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-green-50/50 dark:bg-green-950/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-800 dark:text-green-200">
              Ready for Campaign
            </CardTitle>
            <Send className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-800 dark:text-green-200">{approvedPositionsCount}</div>
            <p className="text-xs text-muted-foreground">Approved and ready to send</p>
            {approvedPositionsCount > 0 && (
              <Button variant="link" className="p-0 h-auto text-green-600 hover:text-green-700 dark:text-green-400" asChild>
                <Link href="/dashboard/positions?status=ACTIVE">
                  Launch Campaigns <ArrowRight className="ml-1 h-4 w-4" />
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
            <CardTitle className="text-sm font-medium">Total Positions</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPositionsCount}</div>
            <p className="text-xs text-muted-foreground">All job postings</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingPositionsCount}</div>
            <p className="text-xs text-muted-foreground">Awaiting approval</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{approvedPositionsCount}</div>
            <p className="text-xs text-muted-foreground">Ready for campaign</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Campaigns Sent</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{campaignSentCount}</div>
            <p className="text-xs text-muted-foreground">Active campaigns</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Position Review</CardTitle>
            <CardDescription>Review and approve position submissions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/dashboard/positions?status=PENDING_APPROVAL" className="block p-4 rounded-lg border hover:bg-muted/50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-5 w-5 text-orange-600" />
                  <div>
                    <div className="font-medium">Review Pending Positions</div>
                    <div className="text-sm text-muted-foreground">Approve or reject submissions</div>
                  </div>
                </div>
                {pendingPositionsCount > 0 && (
                  <Badge variant="warning">{pendingPositionsCount}</Badge>
                )}
              </div>
            </Link>
            <Link href="/dashboard/positions?status=ACTIVE" className="block p-4 rounded-lg border hover:bg-muted/50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Send className="h-5 w-5 text-green-600" />
                  <div>
                    <div className="font-medium">Launch Campaigns</div>
                    <div className="text-sm text-muted-foreground">Send approved positions</div>
                  </div>
                </div>
                {approvedPositionsCount > 0 && (
                  <Badge variant="success">{approvedPositionsCount}</Badge>
                )}
              </div>
            </Link>
            <Link href="/dashboard/positions" className="block p-4 rounded-lg border hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-3">
                <Eye className="h-5 w-5 text-blue-600" />
                <div>
                  <div className="font-medium">View All Positions</div>
                  <div className="text-sm text-muted-foreground">Browse all job postings</div>
                </div>
              </div>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tools & Resources</CardTitle>
            <CardDescription>Additional gatekeeper tools</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/dashboard/gatekeeper" className="block p-4 rounded-lg border hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-3">
                <Briefcase className="h-5 w-5 text-purple-600" />
                <div>
                  <div className="font-medium">Kanban Board</div>
                  <div className="text-sm text-muted-foreground">Visual workflow management</div>
                </div>
              </div>
            </Link>
            <Link href="/dashboard/positions/new" className="block p-4 rounded-lg border hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-3">
                <Briefcase className="h-5 w-5 text-primary" />
                <div>
                  <div className="font-medium">Create Position</div>
                  <div className="text-sm text-muted-foreground">Add new job posting</div>
                </div>
              </div>
            </Link>
            <Link href="/dashboard/profile" className="block p-4 rounded-lg border hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-3">
                <Eye className="h-5 w-5 text-muted-foreground" />
                <div>
                  <div className="font-medium">Profile Settings</div>
                  <div className="text-sm text-muted-foreground">Update your profile</div>
                </div>
              </div>
            </Link>
          </CardContent>
        </Card>
      </div>

    </div>
  )
}
