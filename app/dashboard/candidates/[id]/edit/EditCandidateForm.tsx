"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { updateCandidateAction } from "@/app/actions/candidates"
import { type CandidateInput } from "@/lib/validations"
import { toast } from "sonner"
import { MultiSelect } from "@/components/ui/multi-select"
import { CategorizedMultiSelect } from "@/components/ui/categorized-multi-select"
import { 
  SKILL_OPTIONS, 
  ROLE_OPTIONS, 
  INDUSTRY_OPTIONS, 
  CERTIFICATION_OPTIONS, 
  LANGUAGES 
} from "@/lib/constants"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface Candidate {
  id: string
  firstName: string
  lastName: string
  email: string
  phoneNumber: string | null
  desiredRoles: string[]
  skills: string[]
  industries: string[]
  seniorityLevel: string | null
  certifications: string[]
  languages: string[]
  location: string | null
  status: string
  profileDataJson: any
}

export function EditCandidateForm({ candidate, userRole }: { candidate: Candidate, userRole?: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    firstName: candidate.firstName,
    lastName: candidate.lastName,
    email: candidate.email,
    phoneNumber: candidate.phoneNumber || "",
    seniorityLevel: candidate.seniorityLevel || "",
    location: candidate.location || "",
    status: candidate.status,
  })
  
  const [desiredRoles, setDesiredRoles] = useState<string[]>(candidate.desiredRoles)
  const [skills, setSkills] = useState<string[]>(candidate.skills)
  const [industries, setIndustries] = useState<string[]>(candidate.industries)
  const [certifications, setCertifications] = useState<string[]>(candidate.certifications)
  const [languages, setLanguages] = useState<string[]>(candidate.languages)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const payload: CandidateInput = {
      ...formData,
      status: formData.status as any,
      desiredRoles,
      skills,
      industries,
      certifications,
      languages,
      profileDataJson: {
        ...candidate.profileDataJson,
        ...formData,
        desiredRoles,
        skills,
        industries,
        certifications,
        languages,
      }
    }

    try {
      const result = await updateCandidateAction(candidate.id, payload)

      if (result.success) {
        toast.success("Candidate updated successfully")
        router.refresh()
      } else {
        if (result.validationErrors) {
            const errorMessages = Object.entries(result.validationErrors)
                .map(([field, messages]) => `${field}: ${messages.join(', ')}`)
                .join('\n')
            toast.error("Validation Failed", { description: errorMessages })
        } else {
            toast.error(result.error || "Failed to update candidate")
        }
      }
    } catch (error) {
      toast.error("Failed to update candidate")
    } finally {
      setLoading(false)
    }
  }

  const isAdmin = userRole === "ADMIN" || userRole === "SUPER_ADMIN"
  const canDelete = isAdmin // For now only admins

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Edit Candidate</h1>
        <p className="text-gray-500 mt-2">Update candidate profile</p>
      </div>

      <form onSubmit={handleSubmit}>
        <Tabs defaultValue="info" className="space-y-6">
          <TabsList className="w-full justify-start bg-transparent p-0 h-auto gap-6 rounded-none border-b">
            <TabsTrigger 
              value="info" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-black data-[state=active]:bg-transparent data-[state=active]:shadow-none px-0 py-3 text-base"
            >
              Information
            </TabsTrigger>
            <TabsTrigger 
              value="skills" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-black data-[state=active]:bg-transparent data-[state=active]:shadow-none px-0 py-3 text-base"
            >
              Skills & Experience
            </TabsTrigger>
          </TabsList>

          <TabsContent value="info">
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>Basic details of the candidate</CardDescription>
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
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value) => setFormData({ ...formData, status: value })}
                      disabled={!isAdmin && formData.status !== 'DRAFT'}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="DRAFT">Draft</SelectItem>
                        <SelectItem value="PENDING_APPROVAL">Pending Approval</SelectItem>
                        <SelectItem value="ACTIVE">Active</SelectItem>
                        <SelectItem value="INACTIVE">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="skills">
            <Card>
              <CardHeader>
                <CardTitle>Skills & Experience</CardTitle>
                <CardDescription>Professional qualifications</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
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
                       <SelectItem value="Junior">Junior</SelectItem>
                       <SelectItem value="Medior">Medior</SelectItem>
                       <SelectItem value="Senior">Senior</SelectItem>
                       <SelectItem value="Expert">Expert</SelectItem>
                     </SelectContent>
                   </Select>
                 </div>

                <div className="space-y-2">
                  <Label>Desired Roles</Label>
                  <MultiSelect
                    options={ROLE_OPTIONS}
                    selected={desiredRoles}
                    onChange={setDesiredRoles}
                    placeholder="Select desired roles..."
                  />
                </div>

                <div className="space-y-2">
                  <Label>Skills</Label>
                  <CategorizedMultiSelect
                    options={SKILL_OPTIONS}
                    selected={skills}
                    onChange={setSkills}
                    placeholder="Select skills..."
                  />
                </div>

                <div className="space-y-2">
                  <Label>Industries</Label>
                  <MultiSelect
                    options={INDUSTRY_OPTIONS}
                    selected={industries}
                    onChange={setIndustries}
                    placeholder="Select industries..."
                  />
                </div>

                <div className="space-y-2">
                  <Label>Certifications</Label>
                  <MultiSelect
                    options={CERTIFICATION_OPTIONS}
                    selected={certifications}
                    onChange={setCertifications}
                    placeholder="Select certifications..."
                  />
                </div>

                <div className="space-y-2">
                  <Label>Languages</Label>
                  <MultiSelect
                    options={LANGUAGES}
                    selected={languages}
                    onChange={setLanguages}
                    placeholder="Select languages..."
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex gap-4 pt-4">
          <Button type="submit" disabled={loading}>
            {loading ? "Saving..." : "Save Changes"}
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
