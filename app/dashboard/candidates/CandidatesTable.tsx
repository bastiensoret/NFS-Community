"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Plus, Pencil, Trash2, ChevronLeft, ChevronRight } from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"
import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { deleteCandidateAction } from "@/app/actions/candidates"
import { toast } from "sonner"

interface Candidate {
  id: string
  firstName: string
  lastName: string
  email: string
  phoneNumber: string | null
  desiredRoles: string[]
  skills: string[]
  seniorityLevel: string | null
  location: string | null
  createdAt: Date
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
  pagination: PaginationProps
}

export function CandidatesTable({ initialCandidates, userRole, pagination }: CandidatesTableProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [candidates, setCandidates] = useState<Candidate[]>(initialCandidates)
  const canManage = userRole === "ADMIN" || userRole === "SUPER_ADMIN" || userRole === "RECRUITER"

  const createQueryString = (name: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set(name, value)
    return params.toString()
  }

  const handlePageChange = (newPage: number) => {
    router.push(pathname + "?" + createQueryString("page", String(newPage)))
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

  const handlePrevPage = () => {
      const params = new URLSearchParams(searchParams.toString())
      params.delete("cursor")
      params.set("page", String(pagination.page - 1))
      router.push(pathname + "?" + params.toString())
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this candidate?")) return

    try {
      const result = await deleteCandidateAction(id)

      if (result.success) {
        setCandidates(candidates.filter(c => c.id !== id))
        router.refresh()
        toast.success("Candidate deleted successfully")
      } else {
        console.error("Failed to delete candidate:", result.error)
        toast.error(result.error || "Failed to delete candidate")
      }
    } catch (error) {
      console.error("Failed to delete candidate:", error)
      toast.error("An error occurred")
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Candidates</h1>
          <p className="text-gray-500 mt-2">Manage candidate profiles</p>
        </div>
        {canManage && (
          <Link href="/dashboard/candidates/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Candidate
            </Button>
          </Link>
        )}
      </div>

      <Card>
        <CardContent>
          {candidates.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No candidates found. Add your first candidate to get started.</p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Desired Roles</TableHead>
                    <TableHead>Seniority</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Created</TableHead>
                    {canManage && <TableHead className="text-right">Actions</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {candidates.map((candidate) => (
                    <TableRow key={candidate.id}>
                      <TableCell className="font-medium">
                        {candidate.firstName} {candidate.lastName}
                      </TableCell>
                      <TableCell>{candidate.email}</TableCell>
                      <TableCell>{candidate.phoneNumber || "-"}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {candidate.desiredRoles.slice(0, 2).map((role, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs">
                              {role}
                            </Badge>
                          ))}
                          {candidate.desiredRoles.length > 2 && (
                            <Badge variant="secondary" className="text-xs">
                              +{candidate.desiredRoles.length - 2}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{candidate.seniorityLevel || "-"}</TableCell>
                      <TableCell>{candidate.location || "-"}</TableCell>
                      <TableCell>{format(new Date(candidate.createdAt), "MMM d, yyyy")}</TableCell>
                      {canManage && (
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Link href={`/dashboard/candidates/${candidate.id}`}>
                              <Button variant="ghost" size="icon">
                                <Pencil className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(candidate.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
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
        </CardContent>
      </Card>
    </div>
  )
}
