"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Plus, Pencil, Trash2 } from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"

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
  createdAt: string
}

export default function CandidatesPage() {
  const { data: session } = useSession()
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [loading, setLoading] = useState(true)
  
  const canManage = session?.user?.role === "ADMIN" || session?.user?.role === "RECRUITER"

  useEffect(() => {
    fetchCandidates()
  }, [])

  const fetchCandidates = async () => {
    try {
      const response = await fetch("/api/candidates")
      if (response.ok) {
        const data = await response.json()
        setCandidates(data)
      }
    } catch (error) {
      console.error("Failed to fetch candidates:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this candidate?")) return

    try {
      const response = await fetch(`/api/candidates/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        fetchCandidates()
      }
    } catch (error) {
      console.error("Failed to delete candidate:", error)
    }
  }

  if (loading) {
    return <div>Loading...</div>
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
        <CardHeader>
          <CardTitle>All Candidates</CardTitle>
          <CardDescription>A list of all registered candidates</CardDescription>
        </CardHeader>
        <CardContent>
          {candidates.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No candidates found. Add your first candidate to get started.</p>
            </div>
          ) : (
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
          )}
        </CardContent>
      </Card>
    </div>
  )
}
