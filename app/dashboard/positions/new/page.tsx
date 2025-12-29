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
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Add new position</h1>
        <p className="text-muted-foreground mt-2">Create a new job opportunity</p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Position Information</CardTitle>
            <CardDescription>Create a new job opportunity</CardDescription>
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

            <div className="space-y-2">
              <Label>Languages</Label>
              <div className="flex items-end justify-between p-4 border rounded-lg bg-muted/50">
                <div className="flex gap-4 items-end">
                  <div className="w-[200px] space-y-1">
                    <Label className="text-xs">Language</Label>
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
                  <div className="w-[150px] space-y-1">
                    <Label className="text-xs">Level</Label>
                    <Select 
                      value={newLanguage.level} 
                      onValueChange={(val) => setNewLanguage({...newLanguage, level: val})}
                    >
                      <SelectTrigger className="bg-background"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {LEVELS.map(level => (
                          <SelectItem key={level} value={level}>{level}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center space-x-2 pb-3">
                    <Checkbox 
                      id="lang-mandatory"
                      checked={newLanguage.mandatory}
                      onCheckedChange={(checked) => setNewLanguage({...newLanguage, mandatory: checked as boolean})}
                      className="bg-background"
                    />
                    <Label htmlFor="lang-mandatory" className="text-xs">Mandatory</Label>
                  </div>
                </div>
                <Button type="button" onClick={addLanguage} size="icon"><Plus className="h-4 w-4" /></Button>
              </div>
              
              <div className="space-y-2 mt-2">
                {languages.map((lang, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 bg-card border rounded text-sm shadow-sm">
                    <div className="flex gap-4 items-center">
                      <span className="font-semibold text-foreground w-24">{lang.language}</span>
                      <span className="text-muted-foreground">{lang.level}</span>
                      {lang.mandatory && <span className="text-xs font-medium text-destructive bg-destructive/10 px-2 py-0.5 rounded-full">Mandatory</span>}
                    </div>
                    <Button type="button" variant="ghost" size="icon" onClick={() => removeLanguage(idx)}>
                      <X className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-0.5">
                  <Label htmlFor="remote" className="text-base">Homeworking allowed</Label>
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

            <div className="flex gap-4 pt-4">
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
          </CardContent>
        </Card>
      </form>
    </div>
  )
}
