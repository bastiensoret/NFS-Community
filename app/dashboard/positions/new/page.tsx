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
import { CategorizedMultiSelect } from "@/components/ui/categorized-multi-select"
import { RESPONSIBILITY_OPTIONS, SKILL_OPTIONS } from "@/lib/constants"

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

    const payload = {
      ...formData,
      workArrangement,
      responsibilities,
      skills,
      languageRequirements: languages,
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
                
                <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Input 
                      id="status"
                      value="Pending Creation"
                      disabled
                      className="bg-gray-100"
                    />
                    <p className="text-xs text-gray-500">Status is managed automatically.</p>
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
                    placeholder="Brief description of the role and context..."
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
                          <SelectTrigger className="bg-white">
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
