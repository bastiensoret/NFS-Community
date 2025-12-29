"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Eye } from "lucide-react"

interface Position {
  id: string
  jobTitle: string
  companyName: string
  status: string
  postingDate: Date
  reference?: string | null
}

interface MyPositionsListProps {
  positions: Position[]
}

export function MyPositionsList({ positions }: MyPositionsListProps) {
  const getStatusLabel = (status: string) => {
    switch (status) {
      case "PENDING_APPROVAL":
        return "Created (Pending Approval)"
      case "ACTIVE":
        return "Approved by Admin"
      case "CAMPAIGN_SENT":
        return "Campaign Sent"
      case "ARCHIVED":
        return "Archived"
      default:
        return status.replace("_", " ")
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING_APPROVAL":
        return <Badge variant="warning">{getStatusLabel(status)}</Badge>
      case "ACTIVE":
        return <Badge variant="success">{getStatusLabel(status)}</Badge>
      case "CAMPAIGN_SENT":
        return <Badge variant="purple">{getStatusLabel(status)}</Badge>
      case "ARCHIVED":
        return <Badge variant="secondary">{getStatusLabel(status)}</Badge>
      default:
        return <Badge variant="outline">{getStatusLabel(status)}</Badge>
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>My created positions</CardTitle>
      </CardHeader>
      <CardContent>
        {positions.length === 0 ? (
          <p className="text-muted-foreground text-sm">You haven't created any positions yet.</p>
        ) : (
          <div className="space-y-4">
            {positions.map((position) => (
              <div
                key={position.id}
                className="flex items-center justify-between p-4 border rounded-lg bg-card"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-foreground">{position.jobTitle}</span>
                    {position.reference && (
                      <Badge variant="secondary" className="font-mono text-xs font-normal text-muted-foreground">
                        {position.reference}
                      </Badge>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {position.companyName}  Created on {format(new Date(position.postingDate), "MMM d, yyyy")}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  {getStatusBadge(position.status)}
                  <Link href={`/dashboard/positions/${position.id}`}>
                    <Button variant="ghost" size="icon">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
