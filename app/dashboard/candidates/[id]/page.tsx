import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { notFound, redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Mail, Phone, MapPin, Briefcase, Award, User, Pencil, Building2, Languages } from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"

export default async function CandidateDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await auth()
  
  if (!session) {
    redirect("/auth/signin")
  }

  const { id } = await params
  const candidate = await prisma.candidate.findUnique({
    where: { id },
    include: { 
      creator: true,
    },
  })

  if (!candidate) {
    notFound()
  }

  // Permission Check
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true, isGatekeeper: true }
  })

  const userRole = user?.role || session.user.role
  const isGatekeeper = user?.isGatekeeper || session.user.isGatekeeper
  const isCreator = candidate.creatorId === session.user.id
  const isAdmin = userRole === "ADMIN" || userRole === "SUPER_ADMIN"
  const isRecruiter = userRole === "RECRUITER"

  // Visibility Logic
  // - Admins, Recruiters, Gatekeepers: Can view all
  // - Creators: Can view their own
  // - Others: Can view ACTIVE only
  
  const canManage = isAdmin || isRecruiter || isGatekeeper
  const isOwner = isCreator

  if (!canManage && !isOwner && candidate.status !== "ACTIVE") {
    redirect("/dashboard/candidates")
  }

  const canEdit = isAdmin || isGatekeeper || (isOwner && candidate.status === "DRAFT")

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "bg-green-100 text-green-800"
      case "PENDING_APPROVAL":
        return "bg-yellow-100 text-yellow-800"
      case "DRAFT":
        return "bg-gray-100 text-gray-800"
      case "INACTIVE":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/candidates">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-gray-900">
                {candidate.firstName} {candidate.lastName}
              </h1>
            </div>
            <div className="flex items-center gap-2 text-gray-500 mt-1">
              <Mail className="h-4 w-4" />
              <span>{candidate.email}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={getStatusColor(candidate.status)}>
            {candidate.status.replace('_', ' ')}
          </Badge>
          
          {canEdit && (
            <Link href={`/dashboard/candidates/${candidate.id}/edit`}>
              <Button>
                <Pencil className="mr-2 h-4 w-4" />
                Edit Profile
              </Button>
            </Link>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Professional Profile</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              
              {/* Desired Roles */}
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2 flex items-center gap-2">
                  <Briefcase className="h-4 w-4" /> Desired Roles
                </h3>
                <div className="flex flex-wrap gap-2">
                  {candidate.desiredRoles.length > 0 ? (
                    candidate.desiredRoles.map((role, i) => (
                      <Badge key={i} variant="secondary">{role}</Badge>
                    ))
                  ) : (
                    <span className="text-gray-400 italic">No roles specified</span>
                  )}
                </div>
              </div>

              {/* Skills */}
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2 flex items-center gap-2">
                  <Award className="h-4 w-4" /> Skills
                </h3>
                <div className="flex flex-wrap gap-2">
                  {candidate.skills.length > 0 ? (
                    candidate.skills.map((skill, i) => (
                      <Badge key={i} variant="outline">{skill}</Badge>
                    ))
                  ) : (
                    <span className="text-gray-400 italic">No skills listed</span>
                  )}
                </div>
              </div>

              {/* Industries */}
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2 flex items-center gap-2">
                  <Building2 className="h-4 w-4" /> Industries
                </h3>
                <div className="flex flex-wrap gap-2">
                  {candidate.industries.length > 0 ? (
                    candidate.industries.map((ind, i) => (
                      <Badge key={i} variant="outline">{ind}</Badge>
                    ))
                  ) : (
                    <span className="text-gray-400 italic">No industries specified</span>
                  )}
                </div>
              </div>

            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Qualifications</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
               {/* Certifications */}
               <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2 flex items-center gap-2">
                  <Award className="h-4 w-4" /> Certifications
                </h3>
                {candidate.certifications.length > 0 ? (
                  <ul className="list-disc pl-5 space-y-1 text-gray-700">
                    {candidate.certifications.map((cert, i) => (
                      <li key={i}>{cert}</li>
                    ))}
                  </ul>
                ) : (
                  <span className="text-gray-400 italic">No certifications listed</span>
                )}
              </div>

              {/* Languages */}
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2 flex items-center gap-2">
                  <Languages className="h-4 w-4" /> Languages
                </h3>
                <div className="flex flex-wrap gap-2">
                  {candidate.languages.length > 0 ? (
                    candidate.languages.map((lang, i) => (
                      <Badge key={i} variant="secondary">{lang}</Badge>
                    ))
                  ) : (
                    <span className="text-gray-400 italic">No languages specified</span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Key Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <User className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <span className="text-sm text-gray-500 block">Seniority Level</span>
                  <span className="font-medium capitalize">
                    {candidate.seniorityLevel ? candidate.seniorityLevel.toLowerCase() : "Not specified"}
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <span className="text-sm text-gray-500 block">Location</span>
                  <span className="font-medium">
                    {candidate.location || "Not specified"}
                  </span>
                </div>
              </div>

              {candidate.phoneNumber && (
                <div className="flex items-start gap-3">
                  <Phone className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <span className="text-sm text-gray-500 block">Phone</span>
                    <span className="font-medium">
                      {candidate.phoneNumber}
                    </span>
                  </div>
                </div>
              )}

              <div className="pt-4 border-t mt-4">
                <div className="text-xs text-gray-400 space-y-1">
                  <p>Created: {format(new Date(candidate.createdAt), "PPP")}</p>
                  {candidate.creator && (
                     <p>By: {candidate.creator.name || candidate.creator.email}</p>
                  )}
                </div>
              </div>

            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
