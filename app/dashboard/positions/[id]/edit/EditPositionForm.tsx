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
import { Checkbox } from "@/components/ui/checkbox"
import { X, Plus } from "lucide-react"

interface LanguageRequirement {
  language: string
  level: string
  mandatory: boolean
}

interface TechnicalSkill {
  skill_name: string
  years_experience?: number | null
  proficiency_level?: string
  mandatory?: boolean
}

interface Position {
  id: string
  // Core Fields
  reference?: string | null
  jobTitle: string
  companyName: string
  location?: string | null
  country?: string | null
  startDate?: Date | null
  durationMonths?: number | null
  seniorityLevel: string
  urgent: boolean

  // Extended Manual
  description: string
  responsibilities: string[]
  skills: string[]
  languageRequirements?: any
  workArrangement?: any
  contactInfo?: any
  industrySector?: string | null
  
  // Extended Auto
  detailedRequirements?: any
  educationRequirements?: any
  contractDetails?: any
  department?: string | null
  applicationInstructions?: string | null
  
  // Legacy/Other
  companyDivision?: string | null
  externalReference?: string | null
  employmentType: string
  industry?: string | null
  domain?: string | null
  objectives: string[]
  applicationMethod?: string | null
  source?: string | null
  sourceUrl?: string | null
  contractDuration?: string | null
  status: string
  workLocation?: any
}

export function EditPositionForm({ position }: { position: Position }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  
  // Parse complex fields or default them
  const initialWorkArrangement = position.workArrangement || (position.workLocation?.workArrangement ? {
    remote_allowed: position.workLocation.workArrangement !== 'ON_SITE',
    on_site_days_per_week: position.workLocation.officeDaysRequired
  } : {
    remote_allowed: true,
    on_site_days_per_week: 2
  })

  const initialLanguages: LanguageRequirement[] = Array.isArray(position.languageRequirements) 
    ? position.languageRequirements 
    : []

  const initialTechnicalSkills: TechnicalSkill[] = position.detailedRequirements?.technical_skills || []

  const [formData, setFormData] = useState({
    // Core
    reference: position.reference || position.externalReference || "",
    jobTitle: position.jobTitle,
    companyName: position.companyName,
    location: position.location || position.workLocation?.city || "",
    country: position.country || position.workLocation?.country || "",
    startDate: position.startDate ? new Date(position.startDate).toISOString().split('T')[0] : "",
    durationMonths: position.durationMonths || (position.contractDuration ? parseFloat(position.contractDuration) : 0),
    seniorityLevel: position.seniorityLevel,
    urgent: position.urgent || false,
    department: position.department || "",
    industrySector: position.industrySector || position.industry || "Banking",

    // Extended
    description: position.description,
    applicationInstructions: position.applicationInstructions || "",
    status: position.status,
    employmentType: position.employmentType, 
    
    // Contact
    contactPerson: position.contactInfo?.contact_person || "",
    contactEmail: position.contactInfo?.email || "",
    
    // Legacy mapping
    companyDivision: position.companyDivision || "",
    externalReference: position.externalReference || "",
    source: position.source || "",
    sourceUrl: position.sourceUrl || "",
    industry: position.industry || "",
    domain: position.domain || "",
    applicationMethod: position.applicationMethod || "",
    contractDuration: position.contractDuration || "",
  })

  const [workArrangement, setWorkArrangement] = useState(initialWorkArrangement)
  
  const [responsibilities, setResponsibilities] = useState<string[]>(position.responsibilities || [])
  const [skills, setSkills] = useState<string[]>(position.skills || [])
  const [languages, setLanguages] = useState<LanguageRequirement[]>(initialLanguages)
  const [technicalSkills, setTechnicalSkills] = useState<TechnicalSkill[]>(initialTechnicalSkills)

  // Input states
  const [newResponsibility, setNewResponsibility] = useState("")
  const [newSkill, setNewSkill] = useState("")
  const [newLanguage, setNewLanguage] = useState<LanguageRequirement>({ language: "", level: "Intermediate", mandatory: false })

  const addItem = (type: 'responsibility' | 'skill') => {
    if (type === 'responsibility' && newResponsibility.trim()) {
      setResponsibilities([...responsibilities, newResponsibility.trim()])
      setNewResponsibility("")
    } else if (type === 'skill' && newSkill.trim()) {
      setSkills([...skills, newSkill.trim()])
      setNewSkill("")
    }
  }

  const addLanguage = () => {
    if (newLanguage.language.trim()) {
      setLanguages([...languages, { ...newLanguage }])
      setNewLanguage({ language: "", level: "Intermediate", mandatory: false })
    }
  }

  const removeItem = (type: 'responsibility' | 'skill' | 'language', index: number) => {
    if (type === 'responsibility') setResponsibilities(responsibilities.filter((_, i) => i !== index))
    if (type === 'skill') setSkills(skills.filter((_, i) => i !== index))
    if (type === 'language') setLanguages(languages.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const payload = {
      ...formData,
      workArrangement,
      responsibilities,
      skills,
      languageRequirements: languages,
      detailedRequirements: {
        technical_skills: technicalSkills,
        soft_skills: [],
        years_experience_required: { minimum: 0 }
      },
      contactInfo: {
        contact_person: formData.contactPerson,
        email: formData.contactEmail
      },
      // Map required
      contractDuration: formData.durationMonths.toString(),
      externalReference: formData.reference,
      workLocation: {
        city: formData.location,
        country: formData.country,
        workArrangement: workArrangement.remote_allowed ? 'HYBRID' : 'ON_SITE',
        officeDaysRequired: workArrangement.on_site_days_per_week
      }
    }

    try {
      const response = await fetch(`/api/positions/${position.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (response.ok) {
        router.push(`/dashboard/positions/${position.id}`)
        router.refresh()
      } else {
        const error = await response.json()
        alert(error.error || "Failed to update position")
      }
    } catch (error) {
      alert("Failed to update position")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Edit position</h1>
        <p className="text-gray-500 mt-2">Update job opportunity details</p>
      </div>

      <form onSubmit={handleSubmit}>
        <Tabs defaultValue="core" className="space-y-6">
          <TabsList>
            <TabsTrigger value="core">Core Info</TabsTrigger>
            <TabsTrigger value="requirements">Requirements</TabsTrigger>
            <TabsTrigger value="details">Details</TabsTrigger>
          </TabsList>

          <TabsContent value="core">
            <Card>
              <CardHeader>
                <CardTitle>Core Information</CardTitle>
                <CardDescription>Mandatory fields required to display a position</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="reference">Reference ID *</Label>
                    <Input
                      id="reference"
                      required
                      value={formData.reference}
                      onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="status">Status *</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value) => setFormData({ ...formData, status: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ACTIVE">Active</SelectItem>
                        <SelectItem value="DRAFT">Draft</SelectItem>
                        <SelectItem value="FILLED">Filled</SelectItem>
                        <SelectItem value="CLOSED">Closed</SelectItem>
                        <SelectItem value="ARCHIVED">Archived</SelectItem>
                      </SelectContent>
                    </Select>
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
                    <Label htmlFor="country">Country Code (ISO) *</Label>
                    <Input
                      id="country"
                      required
                      maxLength={2}
                      placeholder="e.g. BE"
                      value={formData.country}
                      onChange={(e) => setFormData({ ...formData, country: e.target.value.toUpperCase() })}
                    />
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
                    <Label htmlFor="durationMonths">Duration (Months) *</Label>
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
                        <SelectItem value="Junior">Junior</SelectItem>
                        <SelectItem value="Mid">Mid</SelectItem>
                        <SelectItem value="Senior">Senior</SelectItem>
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

                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="urgent" 
                    checked={formData.urgent}
                    onCheckedChange={(checked) => setFormData({ ...formData, urgent: checked as boolean })}
                  />
                  <Label htmlFor="urgent">Urgent Position</Label>
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
              <CardContent className="space-y-6">
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
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add a responsibility..."
                      value={newResponsibility}
                      onChange={(e) => setNewResponsibility(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addItem('responsibility'))}
                    />
                    <Button type="button" onClick={() => addItem('responsibility')} size="icon"><Plus className="h-4 w-4" /></Button>
                  </div>
                  <div className="space-y-2 mt-2">
                    {responsibilities.map((resp, idx) => (
                      <div key={idx} className="flex items-center gap-2 p-2 bg-gray-50 rounded text-sm">
                        <span className="flex-1">{resp}</span>
                        <Button type="button" variant="ghost" size="icon" onClick={() => removeItem('responsibility', idx)}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Required Skills</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add a skill..."
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addItem('skill'))}
                    />
                    <Button type="button" onClick={() => addItem('skill')} size="icon"><Plus className="h-4 w-4" /></Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {skills.map((skill, idx) => (
                      <div key={idx} className="flex items-center gap-1 p-1 px-3 bg-blue-50 text-blue-700 rounded-full text-sm">
                        <span>{skill}</span>
                        <button type="button" onClick={() => removeItem('skill', idx)} className="hover:text-blue-900">
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Language Requirements</Label>
                  <div className="flex gap-2 items-end">
                    <div className="flex-1 space-y-1">
                      <Label className="text-xs">Language</Label>
                      <Input 
                        value={newLanguage.language}
                        onChange={(e) => setNewLanguage({...newLanguage, language: e.target.value})}
                        placeholder="e.g. Dutch"
                      />
                    </div>
                    <div className="w-[150px] space-y-1">
                      <Label className="text-xs">Level</Label>
                      <Select 
                        value={newLanguage.level} 
                        onValueChange={(val) => setNewLanguage({...newLanguage, level: val})}
                      >
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Basic">Basic</SelectItem>
                          <SelectItem value="Intermediate">Intermediate</SelectItem>
                          <SelectItem value="Advanced">Advanced</SelectItem>
                          <SelectItem value="Native">Native</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center space-x-2 pb-3">
                      <Checkbox 
                        id="lang-mandatory"
                        checked={newLanguage.mandatory}
                        onCheckedChange={(checked) => setNewLanguage({...newLanguage, mandatory: checked as boolean})}
                      />
                      <Label htmlFor="lang-mandatory" className="text-xs">Mandatory</Label>
                    </div>
                    <Button type="button" onClick={addLanguage} size="icon"><Plus className="h-4 w-4" /></Button>
                  </div>
                  
                  <div className="space-y-2 mt-2">
                    {languages.map((lang, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 rounded text-sm">
                        <div className="flex gap-4">
                          <span className="font-medium">{lang.language}</span>
                          <span className="text-gray-500">{lang.level}</span>
                          {lang.mandatory && <span className="text-red-500 text-xs py-1 px-2 bg-red-50 rounded-full">Required</span>}
                        </div>
                        <Button type="button" variant="ghost" size="icon" onClick={() => removeItem('language', idx)}>
                          <X className="h-4 w-4" />
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
                <CardDescription>Work arrangement and other specifics</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4 border p-4 rounded-md">
                  <h3 className="font-medium text-sm">Work Arrangement</h3>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="remote"
                      checked={workArrangement.remote_allowed}
                      onCheckedChange={(checked) => setWorkArrangement({ ...workArrangement, remote_allowed: checked as boolean })}
                    />
                    <Label htmlFor="remote">Remote work allowed</Label>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="officeDays">On-site days per week</Label>
                    <Input
                      id="officeDays"
                      type="number"
                      min="0"
                      max="5"
                      className="w-24"
                      value={workArrangement.on_site_days_per_week || 0}
                      onChange={(e) => setWorkArrangement({ ...workArrangement, on_site_days_per_week: parseInt(e.target.value) })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="contactPerson">Contact Person</Label>
                    <Input
                      id="contactPerson"
                      value={formData.contactPerson}
                      onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contactEmail">Contact Email</Label>
                    <Input
                      id="contactEmail"
                      type="email"
                      value={formData.contactEmail}
                      onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  <Input
                    id="department"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="appInstructions">Application Instructions</Label>
                  <Textarea
                    id="appInstructions"
                    rows={3}
                    value={formData.applicationInstructions}
                    onChange={(e) => setFormData({ ...formData, applicationInstructions: e.target.value })}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex gap-4 pt-6">
          <Button type="submit" disabled={loading}>
            {loading ? "Saving..." : "Save changes"}
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
