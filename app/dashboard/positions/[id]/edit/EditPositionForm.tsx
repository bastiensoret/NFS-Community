"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { updatePositionAction } from "@/app/actions/positions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { X, Plus } from "lucide-react"
import { CategorizedMultiSelect } from "@/components/ui/categorized-multi-select"
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

interface WorkArrangement {
  remote_allowed?: boolean
  on_site_days_per_week?: number
}

interface LegacyWorkLocation {
  city?: string
  country?: string
  workArrangement?: string
  officeDaysRequired?: number
}

interface Position {
  id: string
  creatorId?: string | null
  // Core Fields
  reference?: string | null
  jobTitle: string
  companyName: string
  location?: string | null
  country?: string | null
  startDate?: Date | null
  durationMonths?: number | null
  seniorityLevel: string

  // New Flattened Fields
  remoteAllowed?: boolean
  onSiteDays?: number | null
  minSalary?: number | null
  maxSalary?: number | null
  currency?: string | null
  contactName?: string | null
  contactEmail?: string | null
  contactPhone?: string | null

  // Extended Manual
  description: string
  responsibilities: string[]
  skills: string[]
  languageRequirements?: LanguageRequirement[]
  
  // Legacy/Other (kept for compatibility)
  workArrangement?: WorkArrangement | unknown // Json
  industrySector?: string | null
  status: string
  employmentType: string
  workLocation?: LegacyWorkLocation | unknown // Json
  contractDuration?: string | null
}

export function EditPositionForm({ position, userRole }: { position: Position, userRole: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  
  // Determine initial Work Arrangement from new fields or legacy JSON
  const getInitialWorkArrangement = () => {
    if (position.remoteAllowed !== undefined) {
      return {
        remote_allowed: position.remoteAllowed,
        on_site_days_per_week: position.onSiteDays ?? 2
      }
    }
    // Fallback to legacy
    if (position.workArrangement) {
        return position.workArrangement as WorkArrangement
    }
    if ((position.workLocation as any)?.workArrangement) {
      const loc = position.workLocation as any
      return {
        remote_allowed: loc.workArrangement !== 'ON_SITE',
        on_site_days_per_week: loc.officeDaysRequired
      }
    }
    return {
      remote_allowed: true,
      on_site_days_per_week: 2
    }
  }

  const initialWorkArrangement = getInitialWorkArrangement()

  const initialLanguages: LanguageRequirement[] = Array.isArray(position.languageRequirements) 
    ? position.languageRequirements 
    : []

  const [formData, setFormData] = useState({
    // Core
    jobTitle: position.jobTitle,
    companyName: position.companyName,
    location: position.location || (position.workLocation as any)?.city || "",
    country: position.country || (position.workLocation as any)?.country || "Belgium",
    startDate: position.startDate ? new Date(position.startDate).toISOString().split('T')[0] : "",
    durationMonths: position.durationMonths || (position.contractDuration ? parseFloat(position.contractDuration) : 0),
    seniorityLevel: position.seniorityLevel,
    industrySector: position.industrySector || "Banking",

    // Extended
    description: position.description,
    status: position.status,
  })

  const [workArrangement, setWorkArrangement] = useState<WorkArrangement>(initialWorkArrangement as WorkArrangement)
  
  const [responsibilities, setResponsibilities] = useState<string[]>(position.responsibilities || [])
  const [skills, setSkills] = useState<string[]>(position.skills || [])
  const [languages, setLanguages] = useState<LanguageRequirement[]>(initialLanguages)

  // Input states
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

    const payload: JobPostingInput = {
      ...formData,
      reference: position.reference || undefined, // Preserve original reference
      seniorityLevel: formData.seniorityLevel as any,
      industrySector: formData.industrySector as any,
      status: formData.status as any,
      // Flatten Work Arrangement
      remoteAllowed: workArrangement.remote_allowed,
      onSiteDays: workArrangement.on_site_days_per_week,
      
      responsibilities,
      skills,
      languageRequirements: languages as any,
    }

    try {
      const result = await updatePositionAction(position.id, payload)

      if (result.success) {
        toast.success("Position updated successfully")
        router.push(`/dashboard/positions/${position.id}`)
        router.refresh()
      } else {
        if (result.validationErrors) {
            const errorMessages = Object.entries(result.validationErrors)
                .map(([field, messages]) => `${field}: ${(messages as string[]).join(', ')}`)
                .join('\n')
            toast.error("Validation Failed", { description: errorMessages })
        } else {
            toast.error(result.error || "Failed to update position")
        }
      }
    } catch (error) {
      toast.error("Failed to update position")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitForApproval = async (e: React.MouseEvent) => {
    e.preventDefault()
    if (!confirm("Are you sure you want to submit this position for approval? You will not be able to edit it afterwards.")) return
    
    setLoading(true)

    const payload: JobPostingInput = {
      ...formData,
      reference: position.reference || undefined,
      seniorityLevel: formData.seniorityLevel as any,
      industrySector: formData.industrySector as any,
      // Flatten Work Arrangement
      remoteAllowed: workArrangement.remote_allowed,
      onSiteDays: workArrangement.on_site_days_per_week,

      responsibilities,
      skills,
      languageRequirements: languages as any,
      status: "PENDING_APPROVAL"
    }

    try {
      const result = await updatePositionAction(position.id, payload)

      if (result.success) {
        toast.success("Position submitted for approval successfully")
        router.push(`/dashboard/positions/${position.id}`)
        router.refresh()
      } else {
        if (result.validationErrors) {
            const errorMessages = Object.entries(result.validationErrors)
                .map(([field, messages]) => `${field}: ${messages.join(', ')}`)
                .join('\n')
            toast.error("Validation Failed", { description: errorMessages })
        } else {
            toast.error(result.error || "Failed to submit for approval")
        }
      }
    } catch (error) {
      toast.error("Failed to submit for approval")
    } finally {
      setLoading(false)
    }
  }

  const canEditStatus = userRole === "ADMIN" || userRole === "SUPER_ADMIN"
  const isDraft = position.status === "DRAFT"

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Edit position</h1>
        <p className="text-gray-500 mt-2">Update job opportunity details</p>
      </div>

      <form onSubmit={handleSubmit}>
        <Tabs defaultValue="core" className="space-y-6">
          <TabsList>
            <TabsTrigger value="core">Core information</TabsTrigger>
            <TabsTrigger value="requirements">Requirements</TabsTrigger>
            <TabsTrigger value="details">Details</TabsTrigger>
          </TabsList>

          <TabsContent value="core">
            <Card>
              <CardHeader>
                <CardTitle>Core information</CardTitle>
                <CardDescription>Fields required to display a position</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Reference ID</Label>
                    <Input
                      disabled
                      value={position.reference || position.id}
                      className="bg-gray-100"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value) => setFormData({ ...formData, status: value })}
                      disabled={!canEditStatus}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="DRAFT">Draft</SelectItem>
                        <SelectItem value="PENDING_APPROVAL">Pending Approval</SelectItem>
                        <SelectItem value="ACTIVE">Active</SelectItem>
                        <SelectItem value="CAMPAIGN_SENT">Campaign Sent</SelectItem>
                        <SelectItem value="ARCHIVED">Archived</SelectItem>
                      </SelectContent>
                    </Select>
                    {!canEditStatus && <p className="text-xs text-gray-500">Only Admins can change status.</p>}
                  </div>
                </div>

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
                    <Label htmlFor="location">Location (City) *</Label>
                    <Input
                      id="location"
                      required
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

                <div className="grid grid-cols-2 gap-4">
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

                <div className="grid grid-cols-2 gap-4">
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
          </TabsContent>

          <TabsContent value="requirements">
            <Card>
              <CardHeader>
                <CardTitle>Requirements & Skills</CardTitle>
                <CardDescription>Detailed requirements for the candidate</CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                <div className="space-y-2">
                  <Label htmlFor="description">Job Description</Label>
                  <Textarea
                    id="description"
                    rows={6}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Key Responsibilities</Label>
                  <CategorizedMultiSelect
                    options={RESPONSIBILITY_OPTIONS}
                    selected={responsibilities}
                    onChange={setResponsibilities}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Required Skills</Label>
                  <CategorizedMultiSelect
                    options={SKILL_OPTIONS}
                    selected={skills}
                    onChange={setSkills}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Languages</Label>
                  <div className="flex items-end justify-between p-4 border rounded-lg bg-gray-50">
                    <div className="flex gap-4 items-end">
                      <div className="w-[200px] space-y-1">
                        <Label className="text-xs">Language</Label>
                        <Select 
                          value={newLanguage.language}
                          onValueChange={(val) => setNewLanguage({...newLanguage, language: val})}
                        >
                          <SelectTrigger className="bg-white"><SelectValue /></SelectTrigger>
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
                          <SelectTrigger className="bg-white"><SelectValue /></SelectTrigger>
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
                          className="bg-white"
                        />
                        <Label htmlFor="lang-mandatory" className="text-xs">Mandatory</Label>
                      </div>
                    </div>
                    <Button type="button" onClick={addLanguage} size="icon"><Plus className="h-4 w-4" /></Button>
                  </div>
                  
                  <div className="space-y-2 mt-2">
                    {languages.map((lang, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2 bg-white border rounded text-sm shadow-sm">
                        <div className="flex gap-4 items-center">
                          <span className="font-semibold text-gray-900 w-24">{lang.language}</span>
                          <span className="text-gray-600">{lang.level}</span>
                          {lang.mandatory && <span className="text-xs font-medium text-red-600 bg-red-50 px-2 py-0.5 rounded-full">Mandatory</span>}
                        </div>
                        <Button type="button" variant="ghost" size="icon" onClick={() => removeLanguage(idx)}>
                          <X className="h-4 w-4 text-gray-500 hover:text-red-600" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="details">
            <Card>
              <CardHeader>
                <CardTitle>Additional Details</CardTitle>
                <CardDescription>Work arrangement specifics</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-0.5">
                      <Label htmlFor="remote" className="text-base">Homeworking allowed</Label>
                      <p className="text-sm text-gray-500">Is the candidate allowed to work from home?</p>
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
                      <span className="text-sm text-gray-500">days/week required in office</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex gap-4 pt-6">
          <Button type="submit" disabled={loading} variant={isDraft ? "outline" : "default"}>
            {loading ? "Saving..." : (isDraft ? "Save Draft" : "Save changes")}
          </Button>
          
          {isDraft && (
            <Button 
                type="button" 
                disabled={loading} 
                onClick={handleSubmitForApproval}
                className="bg-blue-600 hover:bg-blue-700 text-white"
            >
                Submit for Approval
            </Button>
          )}

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
