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
import { DropdownMultiSelect } from "@/components/ui/dropdown-multi-select"
import { CategorizedDropdownMultiSelect } from "@/components/ui/categorized-dropdown-multi-select"
import { cn } from "@/lib/utils"
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
  birthDate: string | null
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
    const level = candidate.educationLevel || ""
    return candidate.education.map(degree => ({ level, degreeName: degree }))
  }

  // Initialize language requirements (for now, just convert to basic structure)
  const initLanguageRequirements = (): LanguageRequirement[] => {
    return candidate.languages.map(lang => ({ 
      language: lang, 
      level: ""
    }))
  }

  const [formData, setFormData] = useState({
    firstName: candidate.firstName,
    lastName: candidate.lastName,
    email: candidate.email,
    phoneNumber: candidate.phoneNumber,
    birthDate: candidate.birthDate ? new Date(candidate.birthDate).toISOString().split('T')[0] : "",
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
  
  const [newLanguage, setNewLanguage] = useState<LanguageRequirement>({ language: "", level: "" })
  const [newEducation, setNewEducation] = useState<EducationEntry>({ level: "", degreeName: "" })

  const addLanguage = () => {
    if (newLanguage.language && newLanguage.level) {
      setLanguages([...languages, { ...newLanguage }])
      setNewLanguage({ language: "", level: "" })
    }
  }

  const removeLanguage = (index: number) => {
    setLanguages(languages.filter((_, i) => i !== index))
  }

  const addEducation = () => {
    if (newEducation.degreeName.trim() && newEducation.level) {
      setEducationEntries([...educationEntries, { ...newEducation }])
      setNewEducation({ level: "", degreeName: "" })
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
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Edit candidate</h1>
        <p className="text-muted-foreground mt-2">Update candidate profile</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Personal information</CardTitle>
            <CardDescription>Basic contact details of the candidate</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First name *</Label>
                <Input
                  id="firstName"
                  required
                  placeholder="e.g., John"
                  className="placeholder:text-muted-foreground"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last name *</Label>
                <Input
                  id="lastName"
                  required
                  placeholder="e.g., Doe"
                  className="placeholder:text-muted-foreground"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  placeholder="e.g., john.doe@example.com"
                  className="placeholder:text-muted-foreground"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Phone number *</Label>
                <Input
                  id="phoneNumber"
                  required
                  placeholder="e.g., +32 123 45 67 89"
                  className="placeholder:text-muted-foreground"
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  placeholder="e.g., Brussels, Belgium"
                  className="placeholder:text-muted-foreground"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="birthDate">Birth date</Label>
                <Input
                  id="birthDate"
                  type="date"
                  className={cn(
                    "placeholder:text-muted-foreground",
                    !formData.birthDate && "text-muted-foreground"
                  )}
                  value={formData.birthDate}
                  onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                />
              </div>
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
                <Label className="font-normal">Previous roles</Label>
                <DropdownMultiSelect
                  options={ROLE_OPTIONS}
                  selected={previousRoles}
                  onChange={setPreviousRoles}
                  placeholder="Select previous roles"
                  className="placeholder:text-muted-foreground"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="seniorityLevel">Seniority level *</Label>
                <Select
                  required
                  value={formData.seniorityLevel || undefined}
                  onValueChange={(value) => setFormData({ ...formData, seniorityLevel: value })}
                >
                  <SelectTrigger className={cn(
                    "text-muted-foreground",
                    formData.seniorityLevel && "text-foreground"
                  )}>
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
            </div>

            <div className="space-y-2">
              <Label>Education</Label>
              <div className="p-4 border rounded-lg bg-muted/30">
                <div className="flex flex-col md:flex-row gap-4 items-end">
                  <div className="flex flex-col md:flex-row gap-4 flex-1">
                    <div className="space-y-2 w-full md:w-[200px] flex-none">
                      <Label className="text-sm font-medium">Level</Label>
                      <Select 
                        value={newEducation.level || undefined}
                        onValueChange={(val) => setNewEducation({...newEducation, level: val})}
                      >
                        <SelectTrigger className={cn(
                          "bg-background text-muted-foreground",
                          newEducation.level && "text-foreground"
                        )}>
                          <SelectValue placeholder="Select level" />
                        </SelectTrigger>
                        <SelectContent>
                          {EDUCATION_LEVELS.map(level => (
                            <SelectItem key={level} value={level}>{level}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2 flex-1">
                      <Label className="text-sm font-medium">Degree name</Label>
                      <Input
                        className="bg-background placeholder:text-muted-foreground"
                        placeholder="e.g., Computer Science"
                        value={newEducation.degreeName}
                        onChange={(e) => setNewEducation({...newEducation, degreeName: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="flex-none ml-auto">
                    <Button type="button" onClick={addEducation}>
                      <Plus className="mr-2 h-4 w-4" />
                      Add education
                    </Button>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                {educationEntries.map((edu, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-card border rounded-lg">
                    <div className="flex gap-4 items-center flex-1">
                      <span className="font-semibold text-foreground min-w-[120px]">{edu.level}</span>
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
            <CardDescription>Candidate&apos;s professional preferences and expertise</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label className="font-normal">Desired roles *</Label>
              <DropdownMultiSelect
                options={ROLE_OPTIONS}
                selected={desiredRoles}
                onChange={setDesiredRoles}
                placeholder="Select desired roles..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="font-normal">Soft skills *</Label>
                <DropdownMultiSelect
                  options={SOFT_SKILL_OPTIONS}
                  selected={softSkills}
                  onChange={setSoftSkills}
                  placeholder="Select soft skills..."
                />
              </div>

              <div className="space-y-2">
                <Label className="font-normal">Hard skills *</Label>
                <CategorizedDropdownMultiSelect
                  options={HARD_SKILL_OPTIONS}
                  selected={hardSkills}
                  onChange={setHardSkills}
                  placeholder="Select hard skills..."
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="font-normal">Industries</Label>
                <DropdownMultiSelect
                  options={INDUSTRY_OPTIONS}
                  selected={industries}
                  onChange={setIndustries}
                  placeholder="Select industries..."
                />
              </div>

              <div className="space-y-2">
                <Label className="font-normal">Certifications</Label>
                <DropdownMultiSelect
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
                <div className="flex flex-col md:flex-row gap-4 items-end">
                  <div className="flex flex-col md:flex-row gap-4 flex-1">
                    <div className="space-y-2 w-full md:w-[200px] flex-none">
                      <Label className="text-sm font-medium">Language</Label>
                      <Select 
                        value={newLanguage.language || undefined}
                        onValueChange={(val) => setNewLanguage({...newLanguage, language: val})}
                      >
                        <SelectTrigger className={cn(
                          "bg-background text-muted-foreground",
                          newLanguage.language && "text-foreground"
                        )}>
                          <SelectValue placeholder="Select language" />
                        </SelectTrigger>
                        <SelectContent>
                          {LANGUAGES.map(lang => (
                            <SelectItem key={lang} value={lang}>{lang}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2 w-full md:w-[200px] flex-none">
                      <Label className="text-sm font-medium">Level</Label>
                      <Select 
                        value={newLanguage.level || undefined} 
                        onValueChange={(val) => setNewLanguage({...newLanguage, level: val})}
                      >
                        <SelectTrigger className={cn(
                          "bg-background text-muted-foreground",
                          newLanguage.level && "text-foreground"
                        )}>
                          <SelectValue placeholder="Select level" />
                        </SelectTrigger>
                        <SelectContent>
                          {LANGUAGE_LEVELS.map(level => (
                            <SelectItem key={level} value={level}>{level}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="flex-none ml-auto">
                    <Button type="button" onClick={addLanguage}>
                      <Plus className="mr-2 h-4 w-4" />
                      Add language
                    </Button>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                {languages.map((lang, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-card border rounded-lg">
                    <div className="flex gap-4 items-center flex-1">
                      <span className="font-semibold text-foreground min-w-[120px]">{lang.language}</span>
                      <span className="text-muted-foreground">{lang.level}</span>
                    </div>
                    <Button type="button" variant="ghost" size="sm" onClick={() => removeLanguage(idx)}>
                      <X className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                    </Button>
                  </div>
                ))}
                {languages.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">No language requirements added yet</p>
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status || undefined}
                  onValueChange={(value) => setFormData({ ...formData, status: value })}
                  disabled
                >
                  <SelectTrigger className={cn(
                    "bg-muted text-muted-foreground",
                    formData.status && "text-foreground"
                  )}>
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="createdAt">Created at</Label>
                <Input
                  id="createdAt"
                  value={new Date(candidate.createdAt).toLocaleString()}
                  disabled
                  className="bg-muted"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="updatedAt">Updated at</Label>
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

        <div className="flex gap-4 pt-4">
          <Button type="submit" disabled={loading} className="min-w-32">
            {loading ? "Saving..." : "Save changes"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            className="min-w-24"
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  )
}
