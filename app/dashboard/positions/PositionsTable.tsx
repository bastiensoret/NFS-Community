"use client"

import { useState } from "react"
import { SENIORITY_LEVELS } from "@/lib/constants"
import { deletePositionAction } from "@/app/actions/positions"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Plus, Pencil, Trash2, ChevronLeft, ChevronRight, Search, Filter, Eye } from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"
import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useDebouncedCallback } from "use-debounce"

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
  workArrangement?: WorkArrangement | null
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

export function PositionsTable({ initialPositions, userRole, currentUserId, pagination, pendingCount = 0, currentStatus = "ALL" }: PositionsTableProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [positions, setPositions] = useState<Position[]>(initialPositions)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  
  if (positions !== initialPositions) {
    setPositions(initialPositions)
  }
  
  const handleSearch = useDebouncedCallback((term: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (term) {
      params.set("query", term)
    } else {
      params.delete("query")
    }
    params.set("page", "1")
    router.replace(`${pathname}?${params.toString()}`)
  }, 300)

  const handleStatusChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value && value !== "ALL") {
        params.set("status", value)
    } else {
        params.delete("status")
    }
    params.set("page", "1")
    params.delete("cursor")
    router.push(pathname + "?" + params.toString())
  }
  
  const isAdmin = userRole === "ADMIN" || userRole === "SUPER_ADMIN"
  const isUser = userRole === "USER"
  
  // Who can create positions?
  const canCreate = isAdmin || isUser

  const canEditPosition = (position: Position) => {
    if (isAdmin) return true
    // Users can only edit their own DRAFTS
    if (position.creatorId === currentUserId && position.status === "DRAFT") return true
    return false
  }

  const canDeletePosition = (position: Position) => {
    if (isAdmin) return true
    // Users can only delete their own positions until PENDING_APPROVAL status
    if (position.creatorId === currentUserId) {
      const deletableStatuses = ["DRAFT", "PENDING_APPROVAL"]
      return deletableStatuses.includes(position.status)
    }
    return false
  }

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("page", String(newPage))
    // We might want to handle cursor here if we strictly use cursor pagination, 
    // but for simple next/prev with page numbers, we rely on page param if API supports it or reset cursor
    if (newPage === 1) params.delete("cursor")
    router.push(pathname + "?" + params.toString())
  }
  
  const handleNextPage = () => {
    if (pagination.nextCursor) {
        const params = new URLSearchParams(searchParams.toString())
        params.set("cursor", pagination.nextCursor)
        params.set("page", String(pagination.page + 1))
        router.push(pathname + "?" + params.toString())
    } else {
        handlePageChange(pagination.page + 1)
    }
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return <Badge variant="success" className="px-2.5 py-0.5 border-0">{status.replace('_', ' ')}</Badge>
      case "CAMPAIGN_SENT":
        return <Badge variant="purple" className="px-2.5 py-0.5 border-0">{status.replace('_', ' ')}</Badge>
      case "ARCHIVED":
        return <Badge variant="secondary" className="px-2.5 py-0.5 border-0">{status.replace('_', ' ')}</Badge>
      case "PENDING_APPROVAL":
        return <Badge variant="warning" className="px-2.5 py-0.5 border-0">{status.replace('_', ' ')}</Badge>
      case "DRAFT":
        return <Badge variant="info" className="px-2.5 py-0.5">{status.replace('_', ' ')}</Badge>
      default:
        return <Badge variant="outline" className="px-2.5 py-0.5">{status.replace('_', ' ')}</Badge>
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Positions</h1>
          <p className="text-muted-foreground mt-1">Manage and track all job positions</p>
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

      <Card className="p-0 gap-0 overflow-hidden">
        <div className="p-6 border-b space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search positions..."
                className="pl-9 h-10"
                defaultValue={searchParams.get("query")?.toString()}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>
            <div className="w-full sm:w-[200px]">
              <Select value={currentStatus} onValueChange={handleStatusChange}>
                <SelectTrigger className="h-10">
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-muted-foreground" />
                    <SelectValue placeholder="Filter by status" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Statuses</SelectItem>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="PENDING_APPROVAL">
                    Pending Approval
                    {pendingCount > 0 && (
                        <span className="ml-2 bg-destructive/10 text-destructive text-xs font-bold px-1.5 py-0.5 rounded-full">
                            {pendingCount}
                        </span>
                    )}
                  </SelectItem>
                  <SelectItem value="CAMPAIGN_SENT">Campaign Sent</SelectItem>
                  <SelectItem value="ARCHIVED">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        
        <div className="p-6">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="h-12">Created date</TableHead>
                <TableHead className="h-12">Job title</TableHead>
                <TableHead className="h-12">Seniority level</TableHead>
                <TableHead className="h-12">Company</TableHead>
                <TableHead className="h-12">Location</TableHead>
                <TableHead className="h-12">Status</TableHead>
                <TableHead className="text-right h-12">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {positions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                    No positions found matching your criteria.
                  </TableCell>
                </TableRow>
              ) : (
                positions.map((position) => (
                  <TableRow key={position.id} className="group">
                    <TableCell className="py-4 text-muted-foreground">
                       {format(new Date(position.postingDate), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell className="py-4 font-medium text-foreground">
                      {position.jobTitle}
                    </TableCell>
                    <TableCell className="py-4 text-muted-foreground">
                      {SENIORITY_LEVELS.find(l => l.value === position.seniorityLevel)?.label || position.seniorityLevel}
                    </TableCell>
                    <TableCell className="py-4 text-muted-foreground">{position.companyName}</TableCell>
                    <TableCell className="py-4 text-muted-foreground">{getLocationString(position)}</TableCell>
                    <TableCell className="py-4">
                      {getStatusBadge(position.status)}
                    </TableCell>
                    <TableCell className="text-right py-4">
                      <div className="flex justify-end gap-2">
                        {/* View icon - always visible */}
                        <Link href={`/dashboard/positions/${position.id}`}>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                        
                        {/* Edit icon - only for those who can edit */}
                        {canEditPosition(position) && (
                          <Link href={`/dashboard/positions/${position.id}/edit`}>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                              <Pencil className="h-4 w-4" />
                            </Button>
                          </Link>
                        )}
                        
                        {/* Delete icon - only for those who can delete */}
                        {canDeletePosition(position) && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => setDeleteId(position.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Pagination */}
      {positions.length > 0 && (
        <div className="flex items-center justify-end space-x-2 py-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page <= 1}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>
            <div className="text-sm text-muted-foreground">
              Page {pagination.page} of {pagination.totalPages}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleNextPage}
              disabled={pagination.page >= pagination.totalPages}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
        </div>
      )}

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete position</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this position? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault()
                confirmDelete()
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

