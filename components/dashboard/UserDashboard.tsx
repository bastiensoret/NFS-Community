import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Briefcase, Plus, TrendingUp, Clock, Calendar } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

interface Candidate {
  id: string
  firstName: string
  lastName: string
  status: string
  desiredRoles: string[]
  createdAt: Date
}

interface Position {
  id: string
  jobTitle: string
  status: string
  postingDate: Date
  applicationDeadline: Date | null
}

interface UserDashboardProps {
  userId: string
  candidatesCount: number
  positionsCount: number
  userCandidates: Candidate[]
  userPositions: Position[]
}

function getStatusVariant(status: string) {
  switch (status) {
    case 'ACTIVE':
    case 'APPROVED':
      return 'success'
    case 'PENDING_APPROVAL':
      return 'warning'
    case 'DRAFT':
      return 'secondary'
    case 'CAMPAIGN_SENT':
      return 'purple'
    case 'ARCHIVED':
    case 'INACTIVE':
      return 'destructive'
    default:
      return 'secondary'
  }
}

function formatStatus(status: string) {
  return status.split('_').map(word => word.charAt(0) + word.slice(1).toLowerCase()).join(' ')
}

export function UserDashboard({ 
  userId, 
  candidatesCount, 
  positionsCount, 
  userCandidates, 
  userPositions 
}: UserDashboardProps) {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-2">Manage your candidates and positions</p>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Your candidates */}
        <Card className="col-span-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="space-y-1">
              <CardTitle className="text-xl">Your candidates</CardTitle>
              <CardDescription>
                You have created {candidatesCount} candidate profile{candidatesCount !== 1 ? 's' : ''}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Link href="/dashboard/candidates/new">
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Plus className="h-4 w-4" />
                </Button>
              </Link>
              <Users className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border mt-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Roles</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Created</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {userCandidates.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                        No candidates found
                      </TableCell>
                    </TableRow>
                  ) : (
                    userCandidates.map((candidate) => (
                      <TableRow key={candidate.id}>
                        <TableCell className="font-medium">
                          <Link href={`/dashboard/candidates/${candidate.id}`} className="hover:underline">
                            {candidate.firstName} {candidate.lastName}
                          </Link>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {candidate.desiredRoles.slice(0, 2).map((role, i) => (
                              <span key={i} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-muted text-muted-foreground">
                                {role}
                              </span>
                            ))}
                            {candidate.desiredRoles.length > 2 && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-muted text-muted-foreground">
                                +{candidate.desiredRoles.length - 2}
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getStatusVariant(candidate.status)}>
                            {formatStatus(candidate.status)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right text-muted-foreground text-sm">
                          {new Date(candidate.createdAt).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
            <div className="mt-4">
               <Link href="/dashboard/candidates" className="text-sm text-primary hover:underline">
                 View all candidates
               </Link>
            </div>
          </CardContent>
        </Card>

        {/* Your positions */}
        <Card className="col-span-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="space-y-1">
              <CardTitle className="text-xl">Your positions</CardTitle>
              <CardDescription>
                You have posted {positionsCount} position{positionsCount !== 1 ? 's' : ''}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Link href="/dashboard/positions/new">
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Plus className="h-4 w-4" />
                </Button>
              </Link>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border mt-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Deadline</TableHead>
                    <TableHead className="text-right">Created</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {userPositions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                        No positions found
                      </TableCell>
                    </TableRow>
                  ) : (
                    userPositions.map((position) => (
                      <TableRow key={position.id}>
                        <TableCell className="font-medium">
                          <Link href={`/dashboard/positions/${position.id}`} className="hover:underline">
                            {position.jobTitle}
                          </Link>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getStatusVariant(position.status)}>
                            {formatStatus(position.status)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {position.applicationDeadline 
                            ? new Date(position.applicationDeadline).toLocaleDateString() 
                            : '-'}
                        </TableCell>
                        <TableCell className="text-right text-muted-foreground text-sm">
                          {new Date(position.postingDate).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
            <div className="mt-4">
               <Link href="/dashboard/positions" className="text-sm text-primary hover:underline">
                 View all positions
               </Link>
            </div>
          </CardContent>
        </Card>
      </div>

    </div>
  )
}

