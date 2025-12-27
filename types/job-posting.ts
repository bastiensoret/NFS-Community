
export type JobPostingDTO = {
  id: string
  creatorId: string | null
  jobTitle: string
  companyName: string
  seniorityLevel: string
  employmentType: string
  status: string
  postingDate: string // Serialized date
  reference: string | null
  externalReference: string | null
  location: string
  country: string
  durationMonths: number | null
  
  // New Flattened Fields
  remoteAllowed: boolean
  onSiteDays: number | null

  // Legacy Fields (kept for display compatibility)
  workLocation: any // JSON
  workArrangement: any // JSON
  startDate: string | null // Serialized date
  contractDuration: string | null
}
