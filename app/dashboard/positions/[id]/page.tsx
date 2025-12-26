import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { notFound, redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Calendar, MapPin, Building2, Briefcase, Clock, Globe, Laptop, ExternalLink, Pencil } from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"

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
  })

  if (!position) {
    notFound()
  }

  const location = position.workLocation as unknown as WorkLocation
  const canManage = session.user?.role === "ADMIN" || session.user?.role === "SUPER_ADMIN" || session.user?.role === "RECRUITER"

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "bg-green-100 text-green-800"
      case "CLOSED":
        return "bg-gray-100 text-gray-800"
      case "FILLED":
        return "bg-blue-100 text-blue-800"
      case "PENDING_REVIEW":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getLocationString = (loc: WorkLocation) => {
    if (!loc) return "Not specified"
    const parts = []
    if (loc.address) parts.push(loc.address)
    if (loc.city) parts.push(loc.city)
    if (loc.postalCode) parts.push(loc.postalCode)
    if (loc.country) parts.push(loc.country)
    return parts.join(", ") || "Not specified"
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
              <h1 className="text-2xl font-bold text-gray-900">{position.jobTitle}</h1>
              {position.externalReference && (
                <span className="text-sm font-mono text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                  {position.externalReference}
                </span>
              )}
            </div>
            <p className="text-gray-500">{position.companyName}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={getStatusColor(position.status)}>
            {position.status.replace('_', ' ')}
          </Badge>
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
              <div className="whitespace-pre-wrap text-gray-700">
                {position.description}
              </div>

              {position.responsibilities.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2">Key responsibilities</h3>
                  <ul className="list-disc pl-5 space-y-1 text-gray-700">
                    {position.responsibilities.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}

              {position.objectives.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2">Objectives</h3>
                  <ul className="list-disc pl-5 space-y-1 text-gray-700">
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
              {position.industry && (
                <div>
                  <span className="text-sm text-gray-500 block mb-1">Industry</span>
                  <span className="font-medium">{position.industry}</span>
                </div>
              )}
              {position.domain && (
                <div>
                  <span className="text-sm text-gray-500 block mb-1">Domain</span>
                  <span className="font-medium">{position.domain}</span>
                </div>
              )}
              {position.source && (
                <div>
                  <span className="text-sm text-gray-500 block mb-1">Source</span>
                  <span className="font-medium">{position.source}</span>
                </div>
              )}
              {position.sourceUrl && (
                <div>
                  <span className="text-sm text-gray-500 block mb-1">Source URL</span>
                  <a href={position.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center gap-1">
                    Link <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              )}
              {position.applicationMethod && (
                <div>
                  <span className="text-sm text-gray-500 block mb-1">Application method</span>
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
                <Briefcase className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <span className="text-sm text-gray-500 block">Employment type</span>
                  <span className="font-medium capitalize">{position.employmentType.replace('_', ' ').toLowerCase()}</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Building2 className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <span className="text-sm text-gray-500 block">Seniority level</span>
                  <span className="font-medium capitalize">{position.seniorityLevel.toLowerCase()}</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <span className="text-sm text-gray-500 block">Location</span>
                  <span className="font-medium">{getLocationString(location)}</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Laptop className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <span className="text-sm text-gray-500 block">Work arrangement</span>
                  <span className="font-medium capitalize">
                    {location?.workArrangement?.toLowerCase().replace('_', '-') || "Not specified"}
                  </span>
                  {(location?.officeDaysRequired !== undefined && location?.officeDaysRequired !== null) && (
                    <span className="text-sm text-gray-500 block mt-0.5">
                      ({location.officeDaysRequired} days on-site)
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <span className="text-sm text-gray-500 block">Start date</span>
                  <span className="font-medium">
                    {position.startDate ? format(new Date(position.startDate), "MMM d, yyyy") : "ASAP"}
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <span className="text-sm text-gray-500 block">Duration</span>
                  <span className="font-medium">
                    {position.contractDuration ? `${position.contractDuration} months` : "Not specified"}
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
                  <span className="text-sm text-gray-500 block mb-1">Division</span>
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
