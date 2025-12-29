import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { notFound, redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Mail, Phone, MapPin, Briefcase, Award, User, Pencil, Building2, Languages, Calendar, UserCircle2 } from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"
import { Separator } from "@/components/ui/separator"

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

  // Visibility Logic
  // - Admins, Gatekeepers: Can view all
  // - Creators: Can view their own
  // - Others: Can view ACTIVE only
  
  const canManage = isAdmin || isGatekeeper
  const isOwner = isCreator

  if (!canManage && !isOwner && candidate.status !== "ACTIVE") {
    redirect("/dashboard/candidates")
  }

  const canEdit = isAdmin || isGatekeeper || (isOwner && candidate.status === "DRAFT")

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return <Badge variant="success">Active</Badge>
      case "PENDING_APPROVAL":
        return <Badge variant="warning">Pending Approval</Badge>
      case "DRAFT":
        return <Badge variant="secondary">Draft</Badge>
      case "INACTIVE":
        return <Badge variant="destructive">Inactive</Badge>
      default:
        return <Badge variant="outline">{status.replace('_', ' ')}</Badge>
    }
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-8">
      {/* Back Button */}
      <div>
        <Link href="/dashboard/candidates">
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to candidates
          </Button>
        </Link>
      </div>

      {/* Hero Section */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Avatar */}
            <div className="flex-shrink-0">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                <UserCircle2 className="w-16 h-16 text-primary/60" />
              </div>
            </div>

            {/* Main Info */}
            <div className="flex-1 space-y-4">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-bold text-foreground mb-2">
                    {candidate.firstName} {candidate.lastName}
                  </h1>
                  <div className="flex flex-wrap items-center gap-4 text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      <span className="text-sm">{candidate.email}</span>
                    </div>
                    {candidate.phoneNumber && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        <span className="text-sm">{candidate.phoneNumber}</span>
                      </div>
                    )}
                    {candidate.location && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        <span className="text-sm">{candidate.location}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusBadge(candidate.status)}
                  {canEdit && (
                    <Link href={`/dashboard/candidates/${candidate.id}/edit`}>
                      <Button size="sm">
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit
                      </Button>
                    </Link>
                  )}
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Seniority</p>
                  <p className="text-sm font-semibold capitalize">
                    {candidate.seniorityLevel ? candidate.seniorityLevel.toLowerCase().replace('_', ' ') : "Not specified"}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Roles</p>
                  <p className="text-sm font-semibold">
                    {candidate.desiredRoles.length > 0 ? `${candidate.desiredRoles.length} role${candidate.desiredRoles.length > 1 ? 's' : ''}` : "None"}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Skills</p>
                  <p className="text-sm font-semibold">
                    {candidate.skills.length > 0 ? `${candidate.skills.length} skill${candidate.skills.length > 1 ? 's' : ''}` : "None"}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Languages</p>
                  <p className="text-sm font-semibold">
                    {candidate.languages.length > 0 ? `${candidate.languages.length} language${candidate.languages.length > 1 ? 's' : ''}` : "None"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Professional Overview */}
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-semibold mb-2">Professional overview</h2>
          <p className="text-muted-foreground text-sm">Roles, industries, and languages</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Desired Roles */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Briefcase className="h-5 w-5 text-primary" />
                Desired roles
              </CardTitle>
              <CardDescription>
                Positions the candidate is interested in
              </CardDescription>
            </CardHeader>
            <CardContent>
              {candidate.desiredRoles.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {candidate.desiredRoles.map((role, i) => (
                    <Badge key={i} variant="secondary" className="text-sm py-1 px-3">
                      {role}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground italic">No roles specified</p>
              )}
            </CardContent>
          </Card>

          {/* Industries */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Building2 className="h-5 w-5 text-primary" />
                Industries
              </CardTitle>
              <CardDescription>
                Industry experience and interests
              </CardDescription>
            </CardHeader>
            <CardContent>
              {candidate.industries.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {candidate.industries.map((ind, i) => (
                    <Badge key={i} variant="outline" className="text-sm py-1 px-3">
                      {ind}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground italic">No industries specified</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Languages */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Languages className="h-5 w-5 text-primary" />
              Languages
            </CardTitle>
            <CardDescription>
              Languages the candidate can communicate in
            </CardDescription>
          </CardHeader>
          <CardContent>
            {candidate.languages.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {candidate.languages.map((lang, i) => (
                  <Badge key={i} variant="secondary" className="text-sm py-1 px-3">
                    {lang}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground italic">No languages specified</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Separator />

      {/* Skills & Expertise */}
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-semibold mb-2">Skills & expertise</h2>
          <p className="text-muted-foreground text-sm">Technical skills and certifications</p>
        </div>

        {/* Skills */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Award className="h-5 w-5 text-primary" />
              Technical & professional skills
            </CardTitle>
            <CardDescription>
              Core competencies and technical abilities
            </CardDescription>
          </CardHeader>
          <CardContent>
            {candidate.skills.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {candidate.skills.map((skill, i) => (
                  <Badge key={i} variant="outline" className="text-sm py-1 px-3">
                    {skill}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground italic">No skills listed</p>
            )}
          </CardContent>
        </Card>

        {/* Certifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Award className="h-5 w-5 text-primary" />
              Certifications
            </CardTitle>
            <CardDescription>
              Professional certifications and qualifications
            </CardDescription>
          </CardHeader>
          <CardContent>
            {candidate.certifications.length > 0 ? (
              <div className="grid gap-3">
                {candidate.certifications.map((cert, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                    <Award className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-sm font-medium">{cert}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground italic">No certifications listed</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Separator />

      {/* Additional Details */}
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-semibold mb-2">Additional details</h2>
          <p className="text-muted-foreground text-sm">Profile metadata and creation information</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Calendar className="h-5 w-5 text-primary" />
              Profile information
            </CardTitle>
            <CardDescription>
              Metadata and creation details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Created on</p>
                <p className="text-sm">{format(new Date(candidate.createdAt), "PPP")}</p>
              </div>
              {candidate.creator && (
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Created by</p>
                  <p className="text-sm">{candidate.creator.name || candidate.creator.email}</p>
                </div>
              )}
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Profile status</p>
                <div>{getStatusBadge(candidate.status)}</div>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Profile ID</p>
                <p className="text-sm font-mono text-muted-foreground">{candidate.id}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
