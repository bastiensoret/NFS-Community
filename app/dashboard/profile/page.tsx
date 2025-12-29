import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { ProfileForm } from "./ProfileForm"
import { PasswordForm } from "./PasswordForm"
import { DeleteAccount } from "./DeleteAccount"

export default async function ProfilePage() {
  const session = await auth()

  if (!session?.user?.id) {
    redirect("/auth/signin")
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  })

  if (!user) {
    redirect("/auth/signin")
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Profile Settings</h1>
        <p className="text-muted-foreground mt-2">
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
        
        <PasswordForm />
        
        <DeleteAccount />
      </div>
    </div>
  )
}
