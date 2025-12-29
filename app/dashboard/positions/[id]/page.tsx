import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { notFound, redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Calendar, MapPin, Building2, Briefcase, Clock, Globe, Laptop, ExternalLink, Pencil } from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"
import { ApprovePositionButton } from "./ApprovePositionButton"

interface WorkLocation {
  address?: string
  city?: string
  postalCode?: string
  country?: string
  workArrangement?: string
  officeDaysRequired?: number
}

export default async function PositionDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await auth()
  
  if (!session) {
    redirect("/auth/signin")
  }

  const { id } = await params
  const position = await prisma.jobPosting.findUnique({
    where: { id },
    include: { 
      creator: true,
      languageRequirements: true 
    },
  })

  if (!position) {
    notFound()
  }

  // Visibility Check: DRAFTs are private to Creator and Super Admin
  if (position.status === "DRAFT") {
    const isCreator = position.creatorId === session.user?.id
    const isSuperAdmin = session.user?.role === "SUPER_ADMIN"
    
    if (!isCreator && !isSuperAdmin) {
      redirect("/dashboard/positions")
    }
  }

  // Cast legacy workLocation if needed (it is Json? in schema)
  const location = position.workLocation as unknown as WorkLocation
  
  // Use relation for languages
  const languages = position.languageRequirements

  const isSuperAdmin = session.user?.role === "SUPER_ADMIN"
  const isAdmin = session.user?.role === "ADMIN"
  const isGatekeeper = session.user?.isGatekeeper || false
  const isRecruiter = session.user?.role === "RECRUITER"
  const isCreator = position.creatorId === session.user?.id

  // Edit Permissions:
  // - Admin, Super Admin, Recruiter can edit generally
  // - Creator can edit if DRAFT
  // - Restriction: Nobody (except Super Admin) can edit if finalized (ARCHIVED/CAMPAIGN_SENT)
  const isFinalized = position.status === "ARCHIVED" || position.status === "CAMPAIGN_SENT"
  const isDraft = position.status === "DRAFT"
  
  let canManage = isAdmin || isSuperAdmin || isRecruiter || (isCreator && isDraft)
  
  if (isFinalized && !isSuperAdmin) {
    canManage = false
  }

  // Gatekeeper: At least Administrator role AND isGatekeeper flag (or Super Admin)
  const canValidate = (isGatekeeper && session.user?.role !== "USER") || isSuperAdmin

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return <Badge variant="success">Active</Badge>
      case "CAMPAIGN_SENT":
        return <Badge variant="purple">Campaign Sent</Badge>
      case "ARCHIVED":
        return <Badge variant="secondary">Archived</Badge>
      case "PENDING_APPROVAL":
        return <Badge variant="warning">Pending Approval</Badge>
      case "DRAFT":
        return <Badge variant="secondary">Draft</Badge>
      default:
        return <Badge variant="outline">{status.replace('_', ' ')}</Badge>
    }
  }

  const getLocationString = () => {
    const parts = []
    if (position.location) parts.push(position.location)
    else if (location?.city) parts.push(location.city)
    
    if (position.country) parts.push(position.country)
    else if (location?.country) parts.push(location.country)
    
    return parts.join(", ") || "Not specified"
  }

  const getOnSiteString = () => {
    if (position.remoteAllowed) {
        return position.onSiteDays 
            ? `${position.onSiteDays} days/week on-site (Remote Allowed)`
            : "Remote Allowed"
    }
    // Fallback to legacy
    if (location?.workArrangement) return location.workArrangement.replace('_', ' ').toLowerCase()
    return "On-site"
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/positions">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-bold text-foreground">{position.jobTitle}</h1>
              {(position.reference || position.externalReference) && (
                <Badge variant="secondary" className="font-mono text-muted-foreground font-normal">
                  {position.reference || position.externalReference}
                </Badge>
              )}
            </div>
            <p className="text-muted-foreground">{position.companyName}</p>
            {canValidate && position.creator && (
               <p className="text-sm text-muted-foreground mt-1">
                 Created by: {position.creator.name || position.creator.email}
               </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {getStatusBadge(position.status)}
          
          {/* Gatekeeper Approval Button */}
          {canValidate && position.status === "PENDING_APPROVAL" && (
            <ApprovePositionButton positionId={position.id} />
          )}

          {canManage && (
            <Link href={`/dashboard/positions/${position.id}/edit`}>
              <Button>
                <Pencil className="mr-2 h-4 w-4" />
                Edit position
              </Button>
            </Link>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="whitespace-pre-wrap text-foreground">
                {position.description}
              </div>

              {position.responsibilities.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2">Key responsibilities</h3>
                  <ul className="list-disc pl-5 space-y-1 text-foreground">
                    {position.responsibilities.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}

              {position.skills.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2">Required Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {position.skills.map((skill, i) => (
                      <Badge key={i} variant="secondary">{skill}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {languages && languages.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2">Languages</h3>
                  <div className="grid sm:grid-cols-2 gap-2">
                    {languages.map((lang, i) => (
                      <div key={i} className="flex justify-between items-center bg-muted/50 p-2 rounded text-sm">
                        <span className="font-medium">{lang.language}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground">{lang.level}</span>
                          {lang.mandatory && <Badge variant="outline" className="text-xs border-destructive/20 text-destructive bg-destructive/10">Required</Badge>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {position.objectives.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2">Objectives</h3>
                  <ul className="list-disc pl-5 space-y-1 text-foreground">
                    {position.objectives.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Additional information</CardTitle>
            </CardHeader>
            <CardContent className="grid sm:grid-cols-2 gap-6">
              {(position.industrySector || position.industry) && (
                <div>
                  <span className="text-sm text-muted-foreground block mb-1">Industry</span>
                  <span className="font-medium">{position.industrySector || position.industry}</span>
                </div>
              )}
              {position.domain && (
                <div>
                  <span className="text-sm text-muted-foreground block mb-1">Domain</span>
                  <span className="font-medium">{position.domain}</span>
                </div>
              )}
              {position.source && (
                <div>
                  <span className="text-sm text-muted-foreground block mb-1">Source</span>
                  <span className="font-medium">{position.source}</span>
                </div>
              )}
              {position.sourceUrl && (
                <div>
                  <span className="text-sm text-muted-foreground block mb-1">Source URL</span>
                  <a href={position.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center gap-1">
                    Link <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              )}
              {position.applicationMethod && (
                <div>
                  <span className="text-sm text-muted-foreground block mb-1">Application method</span>
                  <span className="font-medium">{position.applicationMethod}</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Key details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <Briefcase className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <span className="text-sm text-muted-foreground block">Employment type</span>
                  <span className="font-medium capitalize">{position.employmentType.replace('_', ' ').toLowerCase()}</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Building2 className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <span className="text-sm text-muted-foreground block">Seniority level</span>
                  <span className="font-medium capitalize">{position.seniorityLevel.toLowerCase()}</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <span className="text-sm text-muted-foreground block">Location</span>
                  <span className="font-medium">{getLocationString()}</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Laptop className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <span className="text-sm text-muted-foreground block">Work arrangement</span>
                  <span className="font-medium capitalize">{getOnSiteString()}</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <span className="text-sm text-muted-foreground block">Start date</span>
                  <span className="font-medium">
                    {position.startDate ? format(new Date(position.startDate), "MMM d, yyyy") : "ASAP"}
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <span className="text-sm text-muted-foreground block">Duration</span>
                  <span className="font-medium">
                    {position.durationMonths 
                      ? `${position.durationMonths} months` 
                      : position.contractDuration 
                        ? `${position.contractDuration} months` 
                        : "Not specified"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {position.companyDivision && (
            <Card>
              <CardHeader>
                <CardTitle>Company info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <span className="text-sm text-muted-foreground block mb-1">Division</span>
                  <span className="font-medium">{position.companyDivision}</span>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
