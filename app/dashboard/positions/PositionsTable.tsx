"use client"

import { useState } from "react"
import { deletePositionAction } from "@/app/actions/positions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Plus, Pencil, Trash2, ChevronLeft, ChevronRight } from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"
import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface WorkArrangement {
  remote_allowed?: boolean
  on_site_days_per_week?: number
}

interface LegacyWorkLocation {
  city?: string
  country?: string
  workArrangement?: string
  officeDaysRequired?: number
}

interface Position {
  id: string
  creatorId?: string | null
  jobTitle: string
  companyName: string
  seniorityLevel: string
  employmentType: string
  status: string
  postingDate: string // Serialized
  reference?: string | null
  externalReference?: string | null
  location?: string | null
  country?: string | null
  durationMonths?: number | null
  
  // New Flattened Fields
  remoteAllowed?: boolean
  onSiteDays?: number | null

  // Legacy Fields (kept for display compatibility)
  workLocation: LegacyWorkLocation | null
  workArrangement?: any | null
  startDate?: string | null // Serialized
  contractDuration?: string | null
}

interface PaginationProps {
  page: number
  limit: number
  total: number
  totalPages: number
  nextCursor?: string
}

interface PositionsTableProps {
  initialPositions: Position[]
  userRole?: string
  currentUserId?: string
  pagination: PaginationProps
  pendingCount?: number
  currentStatus?: string
}

export function PositionsTable({ initialPositions, userRole, currentUserId, pagination, pendingCount = 0, currentStatus = "ACTIVE" }: PositionsTableProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [positions, setPositions] = useState<Position[]>(initialPositions)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  
  const isAdmin = userRole === "ADMIN" || userRole === "SUPER_ADMIN"
  const isRecruiter = userRole === "RECRUITER"
  const isUser = userRole === "USER"
  
  // Who can create positions?
  const canCreate = isAdmin || isRecruiter || isUser

  const canEditPosition = (position: Position) => {
    if (isAdmin || isRecruiter) return true
    // Users can only edit their own DRAFTS
    if (position.creatorId === currentUserId && position.status === "DRAFT") return true
    return false
  }

  const createQueryString = (name: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set(name, value)
    return params.toString()
  }

  const handleTabChange = (value: string) => {
    let status = "ACTIVE"
    switch (value) {
      case "pending":
        status = "PENDING_APPROVAL"
        break
      case "campaign":
        status = "CAMPAIGN_SENT"
        break
      case "archived":
        status = "ARCHIVED"
        break
      case "draft":
        status = "DRAFT"
        break
      default:
        status = "ACTIVE"
    }
    
    const params = new URLSearchParams(searchParams.toString())
    params.set("status", status)
    params.set("page", "1")
    params.delete("cursor") // Reset cursor on tab change
    router.push(pathname + "?" + params.toString())
  }

  const getTabValue = () => {
    switch (currentStatus) {
      case "PENDING_APPROVAL": return "pending"
      case "CAMPAIGN_SENT": return "campaign"
      case "ARCHIVED": return "archived"
      case "DRAFT": return "draft"
      default: return "active"
    }
  }

  const handlePageChange = (newPage: number) => {
    // For offset pagination fallback or if we want to reset
    router.push(pathname + "?" + createQueryString("page", String(newPage)))
  }

  const handleNextPage = () => {
    if (pagination.nextCursor) {
        const params = new URLSearchParams(searchParams.toString())
        params.set("cursor", pagination.nextCursor)
        params.set("page", String(pagination.page + 1)) // Keep page count for UI if desired
        router.push(pathname + "?" + params.toString())
    } else {
        handlePageChange(pagination.page + 1)
    }
  }

  const handlePrevPage = () => {
      // Basic prev page support (resets cursor to rely on offset or previous stack)
      // For true bi-directional cursor, we'd need 'prevCursor' or history.
      // Fallback to offset for previous page is acceptable for hybrid approach
      // OR we just go back to page - 1 without cursor (offset based)
      const params = new URLSearchParams(searchParams.toString())
      params.delete("cursor")
      params.set("page", String(pagination.page - 1))
      router.push(pathname + "?" + params.toString())
  }

  const confirmDelete = async () => {
    if (!deleteId) return
    
    setIsDeleting(true)
    try {
      const result = await deletePositionAction(deleteId)

      if (result.success) {
        setPositions(positions.filter(pos => pos.id !== deleteId))
        setDeleteId(null)
        toast.success("Position deleted successfully")
        router.refresh()
      } else {
        console.error("Failed to delete position:", result.error)
        toast.error(result.error || "Failed to delete position")
      }
    } catch (error) {
      console.error("Failed to delete position:", error)
      toast.error("An error occurred while deleting the position")
    } finally {
      setIsDeleting(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "bg-green-100 text-green-800"
      case "CAMPAIGN_SENT":
        return "bg-purple-100 text-purple-800"
      case "ARCHIVED":
        return "bg-gray-100 text-gray-800"
      case "PENDING_APPROVAL":
        return "bg-yellow-100 text-yellow-800"
      case "DRAFT":
        return "bg-blue-50 text-blue-700 border-blue-200"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getLocationString = (position: Position) => {
    const parts = []
    
    // Prioritize new flattened fields
    if (position.location) parts.push(position.location)
    else if (position.workLocation?.city) parts.push(position.workLocation.city)
    
    if (position.country) parts.push(position.country)
    else if (position.workLocation?.country) parts.push(position.workLocation.country)
    
    return parts.join(", ") || "Not specified"
  }

  const getOnSiteRequirement = (position: Position) => {
    // 1. New Flattened Schema
    if (position.remoteAllowed !== undefined) {
      if (position.remoteAllowed) {
         return position.onSiteDays ? `${position.onSiteDays} days/week on-site` : "Remote Allowed"
      }
      return "On-site"
    }

    // 2. Legacy JSON (workArrangement)
    const wa = position.workArrangement
    if (wa) {
      if (wa.remote_allowed) {
        return wa.on_site_days_per_week ? `${wa.on_site_days_per_week} days/week` : "Remote Allowed"
      }
      return "On-site"
    }
    
    // 3. Oldest Legacy JSON (workLocation)
    const legacyWa = position.workLocation
    if (legacyWa) {
       if (legacyWa.workArrangement === 'ON_SITE') return "On-site"
       if (legacyWa.officeDaysRequired) return `${legacyWa.officeDaysRequired} days/week`
       return "Remote Allowed"
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
        {canCreate && (
          <Link href="/dashboard/positions/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add position
            </Button>
          </Link>
        )}
      </div>

      <Tabs value={getTabValue()} onValueChange={handleTabChange} className="w-full">
        <TabsList>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="draft">Drafts</TabsTrigger>
          <TabsTrigger value="campaign">Campaign Sent</TabsTrigger>
          <TabsTrigger value="archived">Archived</TabsTrigger>
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
                {canEditPosition(position) && (
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
                      onClick={() => setDeleteId(position.id)}
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

      <Dialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Position</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this position? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)} disabled={isDeleting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete} disabled={isDeleting}>
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
