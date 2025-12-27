"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Plus, Pencil, Trash2, ChevronLeft, ChevronRight } from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"
import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface Position {
  id: string
  jobTitle: string
  companyName: string
  seniorityLevel: string
  employmentType: string
  status: string
  postingDate: Date
  reference?: string | null
  externalReference?: string | null
  location?: string | null
  country?: string | null
  durationMonths?: number | null
  workLocation: any // Json
  workArrangement?: any // Json
  startDate?: Date | null
  contractDuration?: string | null
}

interface PaginationProps {
  page: number
  limit: number
  total: number
  totalPages: number
}

interface PositionsTableProps {
  initialPositions: Position[]
  userRole?: string
  pagination: PaginationProps
  pendingCount?: number
  currentStatus?: string
}

export function PositionsTable({ initialPositions, userRole, pagination, pendingCount = 0, currentStatus = "ACTIVE" }: PositionsTableProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [positions, setPositions] = useState<Position[]>(initialPositions)
  const isAdmin = userRole === "ADMIN" || userRole === "SUPER_ADMIN"
  const canManage = isAdmin || userRole === "RECRUITER"

  const createQueryString = (name: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set(name, value)
    return params.toString()
  }

  const handleTabChange = (value: string) => {
    const status = value === "pending" ? "PENDING_APPROVAL" : "ACTIVE"
    const params = new URLSearchParams(searchParams.toString())
    params.set("status", status)
    params.set("page", "1") 
    router.push(pathname + "?" + params.toString())
  }

  const handlePageChange = (newPage: number) => {
    router.push(pathname + "?" + createQueryString("page", String(newPage)))
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this position?")) return

    try {
      const response = await fetch(`/api/positions/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setPositions(positions.filter(pos => pos.id !== id))
        router.refresh()
      }
    } catch (error) {
      console.error("Failed to delete position:", error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "bg-green-100 text-green-800"
      case "CLOSED":
        return "bg-gray-100 text-gray-800"
      case "FILLED":
        return "bg-blue-100 text-blue-800"
      case "PENDING_APPROVAL":
        return "bg-yellow-100 text-yellow-800"
      case "PENDING_REVIEW":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getLocationString = (position: Position) => {
    const parts = []
    if (position.location) parts.push(position.location)
    else if (position.workLocation?.city) parts.push(position.workLocation.city)
    
    if (position.country) parts.push(position.country)
    else if (position.workLocation?.country) parts.push(position.workLocation.country)
    
    return parts.join(", ") || "Not specified"
  }

  const getOnSiteRequirement = (position: Position) => {
    if (position.workArrangement?.on_site_days_per_week !== undefined) {
      return `${position.workArrangement.on_site_days_per_week} days`
    }
    if (position.workLocation?.officeDaysRequired !== undefined) {
      return `${position.workLocation.officeDaysRequired} days`
    }
    return "Not specified"
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Positions</h1>
          <p className="text-gray-500 mt-2">Manage open positions</p>
        </div>
        {canManage && (
          <Link href="/dashboard/positions/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add position
            </Button>
          </Link>
        )}
      </div>

      {isAdmin && (
        <Tabs value={currentStatus === "PENDING_APPROVAL" ? "pending" : "active"} onValueChange={handleTabChange} className="w-full">
          <TabsList>
            <TabsTrigger value="active">Active Positions</TabsTrigger>
            <TabsTrigger value="pending" className="relative">
              Pending Approval
              {pendingCount > 0 && (
                <span className="ml-2 bg-red-100 text-red-600 text-xs font-bold px-2 py-0.5 rounded-full">
                  {pendingCount}
                </span>
              )}
            </TabsTrigger>
          </TabsList>
        </Tabs>
      )}

      {positions.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-gray-500">No positions found. Add your first position to get started.</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {positions.map((position) => (
              <Card key={position.id} className="flex flex-col">
                <CardHeader className="pb-4">
                  <div className="flex justify-between items-start gap-2 mb-2">
                    <div className="flex flex-col gap-1">
                      {(position.reference || position.externalReference) && (
                        <div className="flex gap-2">
                          <span className="text-xs font-mono text-gray-500 bg-gray-100 px-2 py-0.5 rounded w-fit">
                            {position.reference || position.externalReference}
                          </span>
                        </div>
                      )}
                      <CardTitle className="text-lg leading-tight">{position.jobTitle}</CardTitle>
                    </div>
                    <Badge className={getStatusColor(position.status)}>
                      {position.status.replace('_', ' ')}
                    </Badge>
                  </div>
                  <CardDescription className="font-medium text-gray-700">
                    {position.companyName}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1 text-sm space-y-3">
                  <div className="grid grid-cols-2 gap-y-3 gap-x-2">
                    <div>
                      <span className="text-gray-500 block text-xs mb-0.5">Location</span>
                      <span className="font-medium">{getLocationString(position)}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 block text-xs mb-0.5">Experience</span>
                      <span className="font-medium capitalize">{position.seniorityLevel.toLowerCase()}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 block text-xs mb-0.5">Start date</span>
                      <span className="font-medium">
                        {position.startDate ? format(new Date(position.startDate), "MMM d, yyyy") : "ASAP"}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500 block text-xs mb-0.5">Duration</span>
                      <span className="font-medium">
                        {position.durationMonths 
                          ? `${position.durationMonths} months` 
                          : position.contractDuration 
                            ? `${position.contractDuration} months` 
                            : "Not specified"}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500 block text-xs mb-0.5">On-site</span>
                      <span className="font-medium">{getOnSiteRequirement(position)}</span>
                    </div>
                  </div>
                </CardContent>
                {canManage && (
                  <div className="px-6 py-4 bg-gray-50 rounded-b-lg border-t flex justify-end gap-2 mt-auto">
                    <Link href={`/dashboard/positions/${position.id}`}>
                      <Button variant="outline" size="sm" className="h-8">
                        <Pencil className="h-3.5 w-3.5 mr-1.5" />
                        Edit
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                      onClick={() => handleDelete(position.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                      Delete
                    </Button>
                  </div>
                )}
              </Card>
            ))}
          </div>

          <div className="flex items-center justify-end space-x-2 py-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page <= 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <div className="text-sm text-gray-500">
              Page {pagination.page} of {pagination.totalPages}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </>
      )}
    </div>
  )
}
