"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { X } from "lucide-react"

export default function NewJobPostingPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    jobTitle: "",
    companyName: "",
    companyDivision: "",
    seniorityLevel: "MID",
    employmentType: "FULL_TIME",
    description: "",
    externalReference: "",
    source: "",
    sourceUrl: "",
    industry: "",
    domain: "",
    applicationMethod: "",
  })
  
  const [workLocation, setWorkLocation] = useState({
    address: "",
    city: "",
    postalCode: "",
    country: "",
    workArrangement: "HYBRID",
    officeDaysRequired: 3,
  })

  const [responsibilities, setResponsibilities] = useState<string[]>([])
  const [objectives, setObjectives] = useState<string[]>([])
  const [currentInput, setCurrentInput] = useState({
    responsibility: "",
    objective: "",
  })

  const addItem = (type: 'responsibility' | 'objective') => {
    const value = currentInput[type].trim()
    if (!value) return

    if (type === 'responsibility') {
      setResponsibilities([...responsibilities, value])
    } else {
      setObjectives([...objectives, value])
    }
    setCurrentInput({ ...currentInput, [type]: "" })
  }

  const removeItem = (type: 'responsibility' | 'objective', index: number) => {
    if (type === 'responsibility') {
      setResponsibilities(responsibilities.filter((_, i) => i !== index))
    } else {
      setObjectives(objectives.filter((_, i) => i !== index))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch("/api/positions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          workLocation,
          responsibilities,
          objectives,
          languages: [],
        }),
      })

      if (response.ok) {
        router.push("/dashboard/positions")
      } else {
        const error = await response.json()
        alert(error.error || "Failed to create position")
      }
    } catch (error) {
      alert("Failed to create position")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Add New Position</h1>
        <p className="text-gray-500 mt-2">Create a new job opportunity</p>
      </div>

      <form onSubmit={handleSubmit}>
        <Tabs defaultValue="basic" className="space-y-6">
          <TabsList>
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="location">Location</TabsTrigger>
            <TabsTrigger value="details">Details</TabsTrigger>
          </TabsList>

          <TabsContent value="basic">
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>Enter the position details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="jobTitle">Job Title *</Label>
                    <Input
                      id="jobTitle"
                      required
                      value={formData.jobTitle}
                      onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="companyName">Company Name *</Label>
                    <Input
                      id="companyName"
                      required
                      value={formData.companyName}
                      onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="companyDivision">Company Division</Label>
                    <Input
                      id="companyDivision"
                      value={formData.companyDivision}
                      onChange={(e) => setFormData({ ...formData, companyDivision: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="externalReference">External Reference</Label>
                    <Input
                      id="externalReference"
                      value={formData.externalReference}
                      onChange={(e) => setFormData({ ...formData, externalReference: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="seniorityLevel">Seniority Level *</Label>
                    <Select
                      value={formData.seniorityLevel}
                      onValueChange={(value) => setFormData({ ...formData, seniorityLevel: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="JUNIOR">Junior</SelectItem>
                        <SelectItem value="MID">Mid</SelectItem>
                        <SelectItem value="SENIOR">Senior</SelectItem>
                        <SelectItem value="LEAD">Lead</SelectItem>
                        <SelectItem value="EXPERT">Expert</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="employmentType">Employment Type *</Label>
                    <Select
                      value={formData.employmentType}
                      onValueChange={(value) => setFormData({ ...formData, employmentType: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="FULL_TIME">Full Time</SelectItem>
                        <SelectItem value="PART_TIME">Part Time</SelectItem>
                        <SelectItem value="CONTRACT">Contract</SelectItem>
                        <SelectItem value="TEMPORARY">Temporary</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="industry">Industry</Label>
                    <Input
                      id="industry"
                      placeholder="e.g., Banking, Insurance"
                      value={formData.industry}
                      onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="domain">Domain</Label>
                    <Input
                      id="domain"
                      placeholder="e.g., Life Insurance"
                      value={formData.domain}
                      onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Job Description *</Label>
                  <Textarea
                    id="description"
                    required
                    rows={6}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="location">
            <Card>
              <CardHeader>
                <CardTitle>Work Location</CardTitle>
                <CardDescription>Specify where the work will be performed</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={workLocation.address}
                    onChange={(e) => setWorkLocation({ ...workLocation, address: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={workLocation.city}
                      onChange={(e) => setWorkLocation({ ...workLocation, city: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="postalCode">Postal Code</Label>
                    <Input
                      id="postalCode"
                      value={workLocation.postalCode}
                      onChange={(e) => setWorkLocation({ ...workLocation, postalCode: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="country">Country</Label>
                    <Input
                      id="country"
                      value={workLocation.country}
                      onChange={(e) => setWorkLocation({ ...workLocation, country: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="workArrangement">Work Arrangement</Label>
                    <Select
                      value={workLocation.workArrangement}
                      onValueChange={(value) => setWorkLocation({ ...workLocation, workArrangement: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="REMOTE">Remote</SelectItem>
                        <SelectItem value="HYBRID">Hybrid</SelectItem>
                        <SelectItem value="ON_SITE">On-site</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="officeDaysRequired">Office Days Required</Label>
                    <Input
                      id="officeDaysRequired"
                      type="number"
                      min="0"
                      max="5"
                      value={workLocation.officeDaysRequired}
                      onChange={(e) => setWorkLocation({ ...workLocation, officeDaysRequired: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="details">
            <Card>
              <CardHeader>
                <CardTitle>Additional Details</CardTitle>
                <CardDescription>Responsibilities and objectives</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Responsibilities</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add a responsibility"
                      value={currentInput.responsibility}
                      onChange={(e) => setCurrentInput({ ...currentInput, responsibility: e.target.value })}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addItem('responsibility'))}
                    />
                    <Button type="button" onClick={() => addItem('responsibility')}>Add</Button>
                  </div>
                  <div className="space-y-2 mt-2">
                    {responsibilities.map((resp, idx) => (
                      <div key={idx} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                        <span className="flex-1 text-sm">{resp}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeItem('responsibility', idx)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Objectives</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add an objective"
                      value={currentInput.objective}
                      onChange={(e) => setCurrentInput({ ...currentInput, objective: e.target.value })}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addItem('objective'))}
                    />
                    <Button type="button" onClick={() => addItem('objective')}>Add</Button>
                  </div>
                  <div className="space-y-2 mt-2">
                    {objectives.map((obj, idx) => (
                      <div key={idx} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                        <span className="flex-1 text-sm">{obj}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeItem('objective', idx)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="applicationMethod">Application Method</Label>
                  <Input
                    id="applicationMethod"
                    placeholder="e.g., Email, Online Portal"
                    value={formData.applicationMethod}
                    onChange={(e) => setFormData({ ...formData, applicationMethod: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="source">Source</Label>
                    <Input
                      id="source"
                      placeholder="e.g., LinkedIn, Company Website"
                      value={formData.source}
                      onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sourceUrl">Source URL</Label>
                    <Input
                      id="sourceUrl"
                      type="url"
                      placeholder="https://..."
                      value={formData.sourceUrl}
                      onChange={(e) => setFormData({ ...formData, sourceUrl: e.target.value })}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex gap-4 pt-6">
          <Button type="submit" disabled={loading}>
            {loading ? "Creating..." : "Create Position"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  )
}
