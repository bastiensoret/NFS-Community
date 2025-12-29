"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createPositionAction } from "@/app/actions/positions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { X, Plus } from "lucide-react"
import { CategorizedDropdownMultiSelect } from "@/components/ui/categorized-dropdown-multi-select"
import { RESPONSIBILITY_OPTIONS, SKILL_OPTIONS } from "@/lib/constants"
import { type JobPostingInput } from "@/lib/validations"
import { toast } from "sonner"

interface LanguageRequirement {
  language: string
  level: string
  mandatory: boolean
}

const LANGUAGES = ["French", "Dutch", "English", "German", "Italian", "Spanish"]
const LEVELS = ["Basic", "Intermediate", "Advanced", "Native"]

export default function NewJobPostingPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  
  const [formData, setFormData] = useState({
    // Core
    jobTitle: "",
    companyName: "",
    location: "",
    country: "Belgium",
    startDate: "",
    durationMonths: 6,
    seniorityLevel: "Medior",
    industrySector: "Banking",
    description: "",
    status: "DRAFT", // Will be set to PENDING_APPROVAL by backend for non-admins, but visually we show what's happening
  })

  const [workArrangement, setWorkArrangement] = useState({
    remote_allowed: true,
    on_site_days_per_week: 2
  })
  
  const [responsibilities, setResponsibilities] = useState<string[]>([])
  const [skills, setSkills] = useState<string[]>([])
  const [languages, setLanguages] = useState<LanguageRequirement[]>([])

  // Input states for new language
  const [newLanguage, setNewLanguage] = useState<LanguageRequirement>({ language: "English", level: "Intermediate", mandatory: false })

  const addLanguage = () => {
    if (newLanguage.language) {
      setLanguages([...languages, { ...newLanguage }])
      setNewLanguage({ language: "English", level: "Intermediate", mandatory: false })
    }
  }

  const removeLanguage = (index: number) => {
    setLanguages(languages.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // Construct payload strictly typed against schema input
    const payload: JobPostingInput = {
      ...formData,
      status: formData.status as any,
      country: formData.country as any, // Cast to enum type
      seniorityLevel: formData.seniorityLevel as any, // Cast to enum type
      industrySector: formData.industrySector as any, // Cast to enum type
      // Flatten work arrangement
      remoteAllowed: workArrangement.remote_allowed,
      onSiteDays: workArrangement.on_site_days_per_week,
      responsibilities,
      skills,
      languageRequirements: languages as any, // Zod input expects specific structure, casting to bypass strict array check for now or map it if needed
    }

    // Fix languageRequirements typing if possible, or just cast as any for the action call which validates it runtime.
    // Ideally: languages matches the schema input structure { language: enum, level: enum, mandatory: boolean }[]
    // The local LanguageRequirement interface has strings, schema has enums. Zod accepts strings that match enums.

    try {
      const result = await createPositionAction(payload)

      if (result.success) {
        toast.success("Position created successfully")
        router.push("/dashboard/positions")
        router.refresh()
      } else {
        if (result.validationErrors) {
          // Format Zod errors
          const errorMessages = Object.entries(result.validationErrors)
            .map(([field, messages]) => `${field}: ${messages.join(', ')}`)
            .join('\n')
          toast.error("Validation Failed", { description: errorMessages })
        } else {
          toast.error(result.error || "Failed to create position")
        }
      }
    } catch (error) {
      console.error("Submission error:", error)
      toast.error("Failed to create position")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Add new position</h1>
        <p className="text-muted-foreground mt-2">Create a new job opportunity</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic information</CardTitle>
            <CardDescription>Core details about the position</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="jobTitle">Job Title *</Label>
                <Input
                  id="jobTitle"
                  required
                  placeholder="e.g. Project Officer"
                  value={formData.jobTitle}
                  onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="companyName">Company Name *</Label>
                <Input
                  id="companyName"
                  required
                  placeholder="e.g. BNP Paribas Fortis"
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="location">Location (City) *</Label>
                <Input
                  id="location"
                  required
                  placeholder="e.g. Brussels"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="country">Location (Country) *</Label>
                <Select
                  value={formData.country}
                  onValueChange={(value) => setFormData({ ...formData, country: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Belgium">Belgium</SelectItem>
                    <SelectItem value="Netherlands">Netherlands</SelectItem>
                    <SelectItem value="Luxembourg">Luxembourg</SelectItem>
                    <SelectItem value="France">France</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Job Description</Label>
              <Textarea
                id="description"
                rows={4}
                placeholder="Brief description of the role and context..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Position Details */}
        <Card>
          <CardHeader>
            <CardTitle>Position details</CardTitle>
            <CardDescription>Specific requirements and logistics</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date *</Label>
                <Input
                  id="startDate"
                  type="date"
                  required
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="durationMonths">Mission duration (Months) *</Label>
                <Input
                  id="durationMonths"
                  type="number"
                  step="0.5"
                  min="0"
                  required
                  value={formData.durationMonths}
                  onChange={(e) => setFormData({ ...formData, durationMonths: parseFloat(e.target.value) || 0 })}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="seniorityLevel">Experience Level *</Label>
                <Select
                  value={formData.seniorityLevel}
                  onValueChange={(value) => setFormData({ ...formData, seniorityLevel: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Junior">Junior (-2 years)</SelectItem>
                    <SelectItem value="Medior">Medior (2-5 years)</SelectItem>
                    <SelectItem value="Senior">Senior (5-8 years)</SelectItem>
                    <SelectItem value="Expert">Expert (+8 years)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="industrySector">Industry Sector</Label>
                <Select
                  value={formData.industrySector}
                  onValueChange={(value) => setFormData({ ...formData, industrySector: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Banking">Banking</SelectItem>
                    <SelectItem value="Insurance">Insurance</SelectItem>
                    <SelectItem value="Finance">Finance</SelectItem>
                    <SelectItem value="IT">IT</SelectItem>
                    <SelectItem value="Healthcare">Healthcare</SelectItem>
                    <SelectItem value="Consulting">Consulting</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Skills & Requirements */}
        <Card>
          <CardHeader>
            <CardTitle>Skills & requirements</CardTitle>
            <CardDescription>Key responsibilities and required skills</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Key Responsibilities</Label>
                <CategorizedDropdownMultiSelect
                  options={RESPONSIBILITY_OPTIONS}
                  selected={responsibilities}
                  onChange={setResponsibilities}
                  placeholder="Select responsibilities..."
                />
              </div>

              <div className="space-y-2">
                <Label>Required Skills</Label>
                <CategorizedDropdownMultiSelect
                  options={SKILL_OPTIONS}
                  selected={skills}
                  onChange={setSkills}
                  placeholder="Select skills..."
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Language Requirements */}
        <Card>
          <CardHeader>
            <CardTitle>Language requirements</CardTitle>
            <CardDescription>Specify required languages and proficiency levels</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="p-4 border rounded-lg bg-muted/30">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
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
                        {LEVELS.map(level => (
                          <SelectItem key={level} value={level}>{level}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="lang-mandatory"
                      checked={newLanguage.mandatory}
                      onCheckedChange={(checked) => setNewLanguage({...newLanguage, mandatory: checked as boolean})}
                    />
                    <Label htmlFor="lang-mandatory" className="text-sm font-medium">Mandatory</Label>
                  </div>
                  <Button type="button" onClick={addLanguage} className="w-full">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Language
                  </Button>
                </div>
              </div>
              
              <div className="space-y-3">
                {languages.map((lang, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-card border rounded-lg">
                    <div className="flex gap-4 items-center">
                      <span className="font-semibold text-foreground min-w-24">{lang.language}</span>
                      <span className="text-muted-foreground">{lang.level}</span>
                      {lang.mandatory && <span className="text-xs font-medium text-destructive bg-destructive/10 px-2 py-1 rounded-full">Mandatory</span>}
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

        {/* Work Arrangement */}
        <Card>
          <CardHeader>
            <CardTitle>Work arrangement</CardTitle>
            <CardDescription>Remote work and office requirements</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-0.5">
                  <Label htmlFor="remote" className="text-base font-medium">Homeworking allowed</Label>
                  <p className="text-sm text-muted-foreground">Is the candidate allowed to work from home?</p>
                </div>
                <Checkbox 
                  id="remote"
                  checked={workArrangement.remote_allowed}
                  onCheckedChange={(checked) => setWorkArrangement({ ...workArrangement, remote_allowed: checked as boolean })}
                  className="h-5 w-5"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="officeDays">Minimum onsite days per week</Label>
                <div className="flex items-center gap-4">
                  <Input
                    id="officeDays"
                    type="number"
                    min="1"
                    max="5"
                    className="w-24"
                    value={workArrangement.on_site_days_per_week || 0}
                    onChange={(e) => setWorkArrangement({ ...workArrangement, on_site_days_per_week: parseInt(e.target.value) })}
                  />
                  <span className="text-sm text-muted-foreground">days/week required in office</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Status Information */}
        <Card>
          <CardHeader>
            <CardTitle>Status information</CardTitle>
            <CardDescription>Position status and workflow</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Input 
                  id="status"
                  value="Pending Creation"
                  disabled
                />
                <p className="text-xs text-muted-foreground">Status is managed automatically.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Form Actions */}
        <div className="flex gap-4 pt-4">
          <Button type="submit" disabled={loading} className="min-w-32">
            {loading ? "Creating..." : "Create Position"}
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
