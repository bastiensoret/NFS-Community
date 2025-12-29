"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Plus, Pencil, Trash2, ChevronLeft, ChevronRight, Search, Filter } from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"
import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { deleteCandidateAction } from "@/app/actions/candidates"
import { toast } from "sonner"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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

interface Candidate {
  id: string
  firstName: string
  lastName: string
  email: string
  phoneNumber: string | null
  desiredRoles: string[]
  skills: string[]
  industries: string[]
  certifications: string[]
  languages: string[]
  seniorityLevel: string | null
  location: string | null
  createdAt: string | Date
  status?: string
  creator?: {
    name: string | null
    email: string | null
  } | null
  creatorId?: string | null
}

interface PaginationProps {
  page: number
  limit: number
  total: number
  totalPages: number
  nextCursor?: string
}

interface CandidatesTableProps {
  initialCandidates: Candidate[]
  userRole?: string
  currentUserId?: string
  pagination: PaginationProps
}

export function CandidatesTable({ initialCandidates, userRole, currentUserId, pagination }: CandidatesTableProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [candidates, setCandidates] = useState<Candidate[]>(initialCandidates)
  const canManage = userRole === "ADMIN" || userRole === "SUPER_ADMIN"
  const canCreate = true // All authenticated users can create candidates

  // Sync state with props when initialCandidates changes
  if (candidates !== initialCandidates) {
    setCandidates(initialCandidates)
  }

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case "ACTIVE":
        return <Badge variant="success">Active</Badge>
      case "PENDING_APPROVAL":
        return <Badge variant="warning">Pending</Badge>
      case "DRAFT":
        return <Badge variant="secondary">Draft</Badge>
      case "INACTIVE":
        return <Badge variant="destructive">Inactive</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  const createQueryString = (name: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set(name, value)
    return params.toString()
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

  const handleStatusFilter = (status: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (status && status !== "ALL") {
      params.set("status", status)
    } else {
      params.delete("status")
    }
    params.set("page", "1")
    router.push(`${pathname}?${params.toString()}`)
  }

  const handlePageChange = (newPage: number) => {
    router.push(pathname + "?" + createQueryString("page", String(newPage)))
  }


  const handleDelete = async () => {
    if (!deleteId) return

    setIsDeleting(true)
    try {
      const result = await deleteCandidateAction(deleteId)

      if (result.success) {
        setCandidates(candidates.filter(c => c.id !== deleteId))
        setDeleteId(null)
        router.refresh()
        toast.success("Candidate deleted successfully")
      } else {
        console.error("Failed to delete candidate:", result.error)
        toast.error(result.error || "Failed to delete candidate")
      }
    } catch (error) {
      console.error("Failed to delete candidate:", error)
      toast.error("An error occurred")
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Candidates</h1>
          <p className="text-muted-foreground mt-2">Manage candidate profiles</p>
        </div>
        {canCreate && (
          <Link href="/dashboard/candidates/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Candidate
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
                placeholder="Search candidates..."
                className="pl-9 h-10"
                onChange={(e) => handleSearch(e.target.value)}
                defaultValue={searchParams.get("query")?.toString()}
              />
            </div>
            <div className="w-full sm:w-[200px]">
              <Select 
                  onValueChange={handleStatusFilter} 
                  defaultValue={searchParams.get("status") || "ALL"}
              >
                <SelectTrigger className="h-10">
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-muted-foreground" />
                    <SelectValue placeholder="Filter by status" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Statuses</SelectItem>
                  <SelectItem value="DRAFT">Draft</SelectItem>
                  <SelectItem value="PENDING_APPROVAL">Pending Approval</SelectItem>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="INACTIVE">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <CardContent className="p-6">
          {candidates.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No candidates found. Add your first candidate to get started.</p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Status</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Roles</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Creator</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {candidates.map((candidate) => {
                    const isOwner = currentUserId && candidate.creatorId === currentUserId
                    const canEdit = canManage || (isOwner && candidate.status === 'DRAFT')
                    const canDelete = canManage // Only admins can delete based on requirements

                    return (
                    <TableRow key={candidate.id}>
                      <TableCell>{getStatusBadge(candidate.status)}</TableCell>
                      <TableCell className="font-medium">
                        <Link href={`/dashboard/candidates/${candidate.id}`} className="hover:underline">
                          {candidate.firstName} {candidate.lastName}
                        </Link>
                      </TableCell>
                      <TableCell>{candidate.email}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {candidate.desiredRoles.slice(0, 1).map((role, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs">
                              {role}
                            </Badge>
                          ))}
                          {candidate.desiredRoles.length > 1 && (
                            <Badge variant="secondary" className="text-xs">
                              +{candidate.desiredRoles.length - 1}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{candidate.location || "-"}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {candidate.creator?.name || candidate.creator?.email || "-"}
                      </TableCell>
                      <TableCell>{format(new Date(candidate.createdAt), "MMM d, yyyy")}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          {canEdit && (
                            <Link href={`/dashboard/candidates/${candidate.id}/edit`}>
                              <Button variant="ghost" size="icon">
                                <Pencil className="h-4 w-4" />
                              </Button>
                            </Link>
                          )}
                          {canDelete && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-destructive hover:text-destructive hover:bg-destructive/10"
                              onClick={() => setDeleteId(candidate.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
              
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
                <div className="text-sm text-muted-foreground">
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
        </CardContent>
      </Card>
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Candidate</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this candidate? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={(e) => {
                e.preventDefault()
                handleDelete()
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
