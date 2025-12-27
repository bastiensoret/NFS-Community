"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { X } from "lucide-react"
import { createCandidateAction } from "@/app/actions/candidates"
import { type CandidateInput } from "@/lib/validations"
import { toast } from "sonner"

export default function NewCandidatePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    seniorityLevel: "",
    location: "",
  })
  const [desiredRoles, setDesiredRoles] = useState<string[]>([])
  const [skills, setSkills] = useState<string[]>([])
  const [industries, setIndustries] = useState<string[]>([])
  const [certifications, setCertifications] = useState<string[]>([])
  const [currentInput, setCurrentInput] = useState({
    role: "",
    skill: "",
    industry: "",
    certification: "",
  })

  const addItem = (type: 'role' | 'skill' | 'industry' | 'certification') => {
    const value = currentInput[type].trim()
    if (!value) return

    switch (type) {
      case 'role':
        if (!desiredRoles.includes(value)) {
          setDesiredRoles([...desiredRoles, value])
        }
        break
      case 'skill':
        if (!skills.includes(value)) {
          setSkills([...skills, value])
        }
        break
      case 'industry':
        if (!industries.includes(value)) {
          setIndustries([...industries, value])
        }
        break
      case 'certification':
        if (!certifications.includes(value)) {
          setCertifications([...certifications, value])
        }
        break
    }
    setCurrentInput({ ...currentInput, [type]: "" })
  }

  const removeItem = (type: 'role' | 'skill' | 'industry' | 'certification', value: string) => {
    switch (type) {
      case 'role':
        setDesiredRoles(desiredRoles.filter(r => r !== value))
        break
      case 'skill':
        setSkills(skills.filter(s => s !== value))
        break
      case 'industry':
        setIndustries(industries.filter(i => i !== value))
        break
      case 'certification':
        setCertifications(certifications.filter(c => c !== value))
        break
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const payload: CandidateInput = {
      ...formData,
      desiredRoles,
      skills,
      industries,
      certifications,
      profileDataJson: {
        ...formData,
        desiredRoles,
        skills,
        industries,
        certifications,
      }
    }

    try {
      const result = await createCandidateAction(payload)

      if (result.success) {
        toast.success("Candidate created successfully")
        router.push("/dashboard/candidates")
        router.refresh()
      } else {
        if (result.validationErrors) {
            const errorMessages = Object.entries(result.validationErrors)
                .map(([field, messages]) => `${field}: ${messages.join(', ')}`)
                .join('\n')
            toast.error("Validation Failed", { description: errorMessages })
        } else {
            toast.error(result.error || "Failed to create candidate")
        }
      }
    } catch (error) {
      toast.error("Failed to create candidate")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Add New Candidate</h1>
        <p className="text-gray-500 mt-2">Create a new candidate profile</p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Candidate Information</CardTitle>
            <CardDescription>Enter the candidate's details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  required
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  required
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Phone Number</Label>
                <Input
                  id="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="seniorityLevel">Seniority Level</Label>
                <Select
                  value={formData.seniorityLevel}
                  onValueChange={(value) => setFormData({ ...formData, seniorityLevel: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select level" />
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
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Desired Roles</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="e.g., Product Owner, Business Analyst"
                  value={currentInput.role}
                  onChange={(e) => setCurrentInput({ ...currentInput, role: e.target.value })}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addItem('role'))}
                />
                <Button type="button" onClick={() => addItem('role')}>Add</Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {desiredRoles.map((role) => (
                  <Badge key={role} variant="secondary">
                    {role}
                    <button
                      type="button"
                      onClick={() => removeItem('role', role)}
                      className="ml-2"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Skills</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="e.g., JavaScript, Project Management"
                  value={currentInput.skill}
                  onChange={(e) => setCurrentInput({ ...currentInput, skill: e.target.value })}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addItem('skill'))}
                />
                <Button type="button" onClick={() => addItem('skill')}>Add</Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {skills.map((skill) => (
                  <Badge key={skill} variant="secondary">
                    {skill}
                    <button
                      type="button"
                      onClick={() => removeItem('skill', skill)}
                      className="ml-2"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Industries</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="e.g., Banking, Insurance"
                  value={currentInput.industry}
                  onChange={(e) => setCurrentInput({ ...currentInput, industry: e.target.value })}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addItem('industry'))}
                />
                <Button type="button" onClick={() => addItem('industry')}>Add</Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {industries.map((industry) => (
                  <Badge key={industry} variant="secondary">
                    {industry}
                    <button
                      type="button"
                      onClick={() => removeItem('industry', industry)}
                      className="ml-2"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Certifications</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="e.g., PMP, SCRUM Master"
                  value={currentInput.certification}
                  onChange={(e) => setCurrentInput({ ...currentInput, certification: e.target.value })}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addItem('certification'))}
                />
                <Button type="button" onClick={() => addItem('certification')}>Add</Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {certifications.map((cert) => (
                  <Badge key={cert} variant="secondary">
                    {cert}
                    <button
                      type="button"
                      onClick={() => removeItem('certification', cert)}
                      className="ml-2"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <Button type="submit" disabled={loading}>
                {loading ? "Creating..." : "Create Candidate"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  )
}
