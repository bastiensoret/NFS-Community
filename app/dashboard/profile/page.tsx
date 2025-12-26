import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { ProfileForm } from "./ProfileForm"
import { PasswordForm } from "./PasswordForm"
import { MyPositionsList } from "./MyPositionsList"

export default async function ProfilePage() {
  const session = await auth()

  if (!session?.user?.id) {
    redirect("/auth/signin")
  }

  const [user, createdPositions] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.user.id },
    }),
    prisma.jobPosting.findMany({
      where: { creatorId: session.user.id },
      orderBy: { postingDate: "desc" },
      select: {
        id: true,
        jobTitle: true,
        companyName: true,
        status: true,
        postingDate: true,
        reference: true,
      }
    })
  ])

  if (!user) {
    redirect("/auth/signin")
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
        <p className="text-gray-500 mt-2">
          Manage your account settings and preferences.
        </p>
      </div>
      
      <div className="space-y-6">
        <ProfileForm 
          user={{
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            image: user.image,
          }} 
        />
        
        <MyPositionsList positions={createdPositions} />

        <PasswordForm />
      </div>
    </div>
  )
}
