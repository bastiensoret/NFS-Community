"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { X, Plus } from "lucide-react"
import { SENIORITY_LEVELS } from "@/lib/constants"
import { updateCandidateAction } from "@/app/actions/candidates"
import { type CandidateInput } from "@/lib/validations"
import { toast } from "sonner"
import { MultiSelect } from "@/components/ui/multi-select"
import { CategorizedMultiSelect } from "@/components/ui/categorized-multi-select"
import { 
  SOFT_SKILL_OPTIONS,
  HARD_SKILL_OPTIONS,
  ROLE_OPTIONS, 
  INDUSTRY_OPTIONS, 
  CERTIFICATION_OPTIONS
} from "@/lib/constants"

interface LanguageRequirement {
  language: string
  level: string
}

interface EducationEntry {
  level: string
  degreeName: string
}

const LANGUAGES = ["French", "Dutch", "English", "German", "Italian", "Spanish"]
const LANGUAGE_LEVELS = ["Basic", "Intermediate", "Advanced", "Native"]
const EDUCATION_LEVELS = ["Bachelor", "Master", "PhD"]

interface Candidate {
  id: string
  firstName: string
  lastName: string
  email: string
  phoneNumber: string
  location: string | null
  education: string[]
  educationLevel: string | null
  previousRoles: string[]
  seniorityLevel: string
  desiredRoles: string[]
  softSkills: string[]
  hardSkills: string[]
  certifications: string[]
  industries: string[]
  languages: string[]
  status: string
  creatorId: string | null
  createdAt: string
  updatedAt: string
}

export function EditCandidateForm({ candidate }: { candidate: Candidate }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  // Initialize education entries from candidate data
  const initEducationEntries = (): EducationEntry[] => {
    if (candidate.education.length === 0) return []
    const level = candidate.educationLevel || "Bachelor"
    return candidate.education.map(degree => ({ level, degreeName: degree }))
  }

  // Initialize language requirements (for now, just convert to basic structure)
  const initLanguageRequirements = (): LanguageRequirement[] => {
    return candidate.languages.map(lang => ({ 
      language: lang, 
      level: "Intermediate"
    }))
  }

  const [formData, setFormData] = useState({
    firstName: candidate.firstName,
    lastName: candidate.lastName,
    email: candidate.email,
    phoneNumber: candidate.phoneNumber,
    seniorityLevel: candidate.seniorityLevel,
    location: candidate.location || "",
    status: candidate.status,
  })
  
  const [educationEntries, setEducationEntries] = useState<EducationEntry[]>(initEducationEntries())
  const [previousRoles, setPreviousRoles] = useState<string[]>(candidate.previousRoles)
  const [desiredRoles, setDesiredRoles] = useState<string[]>(candidate.desiredRoles)
  const [softSkills, setSoftSkills] = useState<string[]>(candidate.softSkills)
  const [hardSkills, setHardSkills] = useState<string[]>(candidate.hardSkills)
  const [industries, setIndustries] = useState<string[]>(candidate.industries)
  const [certifications, setCertifications] = useState<string[]>(candidate.certifications)
  const [languages, setLanguages] = useState<LanguageRequirement[]>(initLanguageRequirements())
  
  const [newLanguage, setNewLanguage] = useState<LanguageRequirement>({ language: "English", level: "Intermediate" })
  const [newEducation, setNewEducation] = useState<EducationEntry>({ level: "Bachelor", degreeName: "" })

  const addLanguage = () => {
    if (newLanguage.language) {
      setLanguages([...languages, { ...newLanguage }])
      setNewLanguage({ language: "English", level: "Intermediate" })
    }
  }

  const removeLanguage = (index: number) => {
    setLanguages(languages.filter((_, i) => i !== index))
  }

  const addEducation = () => {
    if (newEducation.degreeName.trim()) {
      setEducationEntries([...educationEntries, { ...newEducation }])
      setNewEducation({ level: "Bachelor", degreeName: "" })
    }
  }

  const removeEducation = (index: number) => {
    setEducationEntries(educationEntries.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // Extract education data
    const educationLevels = educationEntries.map(e => e.level)
    const educationDegrees = educationEntries.map(e => e.degreeName)
    const primaryEducationLevel = educationLevels.length > 0 ? educationLevels[educationLevels.length - 1] : undefined

    const payload: CandidateInput = {
      ...formData,
      status: formData.status as CandidateInput['status'],
      education: educationDegrees,
      educationLevel: primaryEducationLevel as CandidateInput['educationLevel'],
      previousRoles,
      desiredRoles,
      softSkills,
      hardSkills,
      industries,
      certifications,
      languages: languages.map(l => l.language),
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
    } catch {
      toast.error("Failed to update candidate")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Edit candidate</h1>
        <p className="text-muted-foreground mt-2">Update candidate profile</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Personal information</CardTitle>
            <CardDescription>Basic details of the candidate</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First name *</Label>
                <Input
                  id="firstName"
                  required
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last name *</Label>
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
                <Label htmlFor="phoneNumber">Phone number *</Label>
                <Input
                  id="phoneNumber"
                  required
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Experience</CardTitle>
            <CardDescription>Educational background and work experience</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="seniorityLevel">Seniority Level *</Label>
                <Select
                  required
                  value={formData.seniorityLevel}
                  onValueChange={(value) => setFormData({ ...formData, seniorityLevel: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent>
                    {SENIORITY_LEVELS.map((level) => (
                      <SelectItem key={level.value} value={level.value}>
                        {level.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Previous Roles</Label>
                <MultiSelect
                  options={[]}
                  selected={previousRoles}
                  onChange={setPreviousRoles}
                  placeholder="Add previous roles (values coming later)..."
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Education</Label>
              <div className="p-4 border rounded-lg bg-muted/30">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Level</Label>
                    <Select 
                      value={newEducation.level}
                      onValueChange={(val) => setNewEducation({...newEducation, level: val})}
                    >
                      <SelectTrigger className="bg-background">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {EDUCATION_LEVELS.map(level => (
                          <SelectItem key={level} value={level}>{level}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Degree name</Label>
                    <Input
                      className="bg-background"
                      placeholder="e.g., Computer Science"
                      value={newEducation.degreeName}
                      onChange={(e) => setNewEducation({...newEducation, degreeName: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium opacity-0">Action</Label>
                    <Button type="button" onClick={addEducation} className="w-full">
                      <Plus className="mr-2 h-4 w-4" />
                      Add Education
                    </Button>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                {educationEntries.map((edu, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-card border rounded-lg">
                    <div className="flex gap-4 items-center">
                      <span className="font-semibold text-foreground min-w-20">{edu.level}</span>
                      <span className="text-muted-foreground">{edu.degreeName}</span>
                    </div>
                    <Button type="button" variant="ghost" size="sm" onClick={() => removeEducation(idx)}>
                      <X className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                    </Button>
                  </div>
                ))}
                {educationEntries.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">No education entries added yet</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Professional profile</CardTitle>
            <CardDescription>Professional qualifications and skills</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Desired Roles *</Label>
              <MultiSelect
                options={ROLE_OPTIONS}
                selected={desiredRoles}
                onChange={setDesiredRoles}
                placeholder="Select desired roles..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Soft Skills *</Label>
                <MultiSelect
                  options={SOFT_SKILL_OPTIONS}
                  selected={softSkills}
                  onChange={setSoftSkills}
                  placeholder="Select soft skills..."
                />
              </div>

              <div className="space-y-2">
                <Label>Hard Skills *</Label>
                <CategorizedMultiSelect
                  options={HARD_SKILL_OPTIONS}
                  selected={hardSkills}
                  onChange={setHardSkills}
                  placeholder="Select hard skills..."
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
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
            </div>

            <div className="space-y-2">
              <Label>Languages *</Label>
              <div className="p-4 border rounded-lg bg-muted/30">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Language</Label>
                    <Select 
                      value={newLanguage.language}
                      onValueChange={(val) => setNewLanguage({...newLanguage, language: val})}
                    >
                      <SelectTrigger className="bg-background">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {LANGUAGES.map(lang => (
                          <SelectItem key={lang} value={lang}>{lang}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Level</Label>
                    <Select 
                      value={newLanguage.level} 
                      onValueChange={(val) => setNewLanguage({...newLanguage, level: val})}
                    >
                      <SelectTrigger className="bg-background">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {LANGUAGE_LEVELS.map(level => (
                          <SelectItem key={level} value={level}>{level}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium opacity-0">Action</Label>
                    <Button type="button" onClick={addLanguage} className="w-full">
                      <Plus className="mr-2 h-4 w-4" />
                      Add Language
                    </Button>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                {languages.map((lang, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-card border rounded-lg">
                    <div className="flex gap-4 items-center">
                      <span className="font-semibold text-foreground min-w-24">{lang.language}</span>
                      <span className="text-muted-foreground">{lang.level}</span>
                    </div>
                    <Button type="button" variant="ghost" size="sm" onClick={() => removeLanguage(idx)}>
                      <X className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                    </Button>
                  </div>
                ))}
                {languages.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">No languages defined yet.</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Metadata</CardTitle>
            <CardDescription>System information (read-only)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData({ ...formData, status: value })}
                  disabled
                >
                  <SelectTrigger className="bg-muted">
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
              <div className="space-y-2">
                <Label htmlFor="creatorId">Creator ID</Label>
                <Input
                  id="creatorId"
                  value={candidate.creatorId || "N/A"}
                  disabled
                  className="bg-muted"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="createdAt">Created At</Label>
                <Input
                  id="createdAt"
                  value={new Date(candidate.createdAt).toLocaleString()}
                  disabled
                  className="bg-muted"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="updatedAt">Updated At</Label>
                <Input
                  id="updatedAt"
                  value={new Date(candidate.updatedAt).toLocaleString()}
                  disabled
                  className="bg-muted"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-4">
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
