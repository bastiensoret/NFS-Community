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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING_APPROVAL":
        return "bg-yellow-100 text-yellow-800"
      case "ACTIVE":
        return "bg-green-100 text-green-800"
      case "CAMPAIGN_SENT":
        return "bg-purple-100 text-purple-800"
      case "ARCHIVED":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>My created positions</CardTitle>
      </CardHeader>
      <CardContent>
        {positions.length === 0 ? (
          <p className="text-gray-500 text-sm">You haven't created any positions yet.</p>
        ) : (
          <div className="space-y-4">
            {positions.map((position) => (
              <div
                key={position.id}
                className="flex items-center justify-between p-4 border rounded-lg bg-white"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900">{position.jobTitle}</span>
                    {position.reference && (
                      <span className="text-xs font-mono text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                        {position.reference}
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-gray-500">
                    {position.companyName} • Created on {format(new Date(position.postingDate), "MMM d, yyyy")}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Badge className={getStatusColor(position.status)}>
                    {getStatusLabel(position.status)}
                  </Badge>
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
