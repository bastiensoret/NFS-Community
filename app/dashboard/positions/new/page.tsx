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

export default function NewJobPostingPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  
  const [formData, setFormData] = useState({
    // Core
    reference: "",
    jobTitle: "",
    companyName: "",
    location: "",
    country: "",
    startDate: "",
    durationMonths: 6,
    seniorityLevel: "Mid",
    urgent: false,
    department: "",
    industrySector: "Banking",

    // Extended
    description: "",
    applicationInstructions: "",
    status: "ACTIVE",
    employmentType: "CONTRACT",
    
    // Contact
    contactPerson: "",
    contactEmail: "",
    
    // Legacy mapping (hidden/defaulted)
    companyDivision: "",
    externalReference: "",
    source: "",
    sourceUrl: "",
    industry: "",
    domain: "",
    applicationMethod: "",
    contractDuration: "",
  })

  const [workArrangement, setWorkArrangement] = useState({
    remote_allowed: true,
    on_site_days_per_week: 2
  })
  
  const [responsibilities, setResponsibilities] = useState<string[]>([])
  const [skills, setSkills] = useState<string[]>([])
  const [languages, setLanguages] = useState<LanguageRequirement[]>([])

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
        technical_skills: [],
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
      const response = await fetch("/api/positions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (response.ok) {
        router.push("/dashboard/positions")
        router.refresh()
      } else {
        const error = await response.json()
        console.error("Creation error:", error)
        if (error.details) {
          // Format Zod errors
          const errorMessages = error.details.map((d: any) => `${d.path.join('.')}: ${d.message}`).join('\n')
          alert(`Validation Failed:\n${errorMessages}`)
        } else {
          alert(error.message || error.error || "Failed to create position")
        }
      }
    } catch (error) {
      console.error("Submission error:", error)
      alert("Failed to create position")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Add new position</h1>
        <p className="text-gray-500 mt-2">Create a new job opportunity</p>
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
                      placeholder="e.g. SRQ150435"
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

                <div className="grid grid-cols-2 gap-4">
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
                    placeholder="Brief description of the role and context..."
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
                      placeholder="Add a skill (e.g. MS Office, Java)..."
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
                    placeholder="Special instructions for applicants..."
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
