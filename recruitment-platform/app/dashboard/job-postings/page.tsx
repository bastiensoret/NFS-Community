"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Plus, Pencil, Trash2 } from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"

interface JobPosting {
  id: string
  jobTitle: string
  companyName: string
  seniorityLevel: string
  employmentType: string
  status: string
  postingDate: string
}

export default function JobPostingsPage() {
  const [jobPostings, setJobPostings] = useState<JobPosting[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchJobPostings()
  }, [])

  const fetchJobPostings = async () => {
    try {
      const response = await fetch("/api/job-postings")
      if (response.ok) {
        const data = await response.json()
        setJobPostings(data)
      }
    } catch (error) {
      console.error("Failed to fetch job postings:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this job posting?")) return

    try {
      const response = await fetch(`/api/job-postings/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        fetchJobPostings()
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

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Job Postings</h1>
          <p className="text-gray-500 mt-2">Manage job opportunities</p>
        </div>
        <Link href="/dashboard/job-postings/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Job Posting
          </Button>
        </Link>
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
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Job Title</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Seniority</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Posted</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
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
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
