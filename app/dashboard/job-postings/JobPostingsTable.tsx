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

interface JobPosting {
  id: string
  jobTitle: string
  companyName: string
  seniorityLevel: string
  employmentType: string
  status: string
  postingDate: Date
}

interface PaginationProps {
  page: number
  limit: number
  total: number
  totalPages: number
}

interface JobPostingsTableProps {
  initialJobPostings: JobPosting[]
  userRole?: string
  pagination: PaginationProps
}

export function JobPostingsTable({ initialJobPostings, userRole, pagination }: JobPostingsTableProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [jobPostings, setJobPostings] = useState<JobPosting[]>(initialJobPostings)
  const canManage = userRole === "ADMIN" || userRole === "SUPER_ADMIN" || userRole === "RECRUITER"

  const createQueryString = (name: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set(name, value)
    return params.toString()
  }

  const handlePageChange = (newPage: number) => {
    router.push(pathname + "?" + createQueryString("page", String(newPage)))
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this job posting?")) return

    try {
      const response = await fetch(`/api/job-postings/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setJobPostings(jobPostings.filter(job => job.id !== id))
        router.refresh()
      }
    } catch (error) {
      console.error("Failed to delete job posting:", error)
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
      case "PENDING_REVIEW":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Job Postings</h1>
          <p className="text-gray-500 mt-2">Manage job opportunities</p>
        </div>
        {canManage && (
          <Link href="/dashboard/job-postings/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Job Posting
            </Button>
          </Link>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Job Postings</CardTitle>
          <CardDescription>A list of all job opportunities</CardDescription>
        </CardHeader>
        <CardContent>
          {jobPostings.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No job postings found. Add your first job posting to get started.</p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Job Title</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Seniority</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Posted</TableHead>
                    {canManage && <TableHead className="text-right">Actions</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {jobPostings.map((job) => (
                    <TableRow key={job.id}>
                      <TableCell className="font-medium">{job.jobTitle}</TableCell>
                      <TableCell>{job.companyName}</TableCell>
                      <TableCell>{job.seniorityLevel}</TableCell>
                      <TableCell>{job.employmentType.replace('_', ' ')}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(job.status)}>
                          {job.status.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>{format(new Date(job.postingDate), "MMM d, yyyy")}</TableCell>
                      {canManage && (
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Link href={`/dashboard/job-postings/${job.id}`}>
                              <Button variant="ghost" size="icon">
                                <Pencil className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(job.id)}
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
