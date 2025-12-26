import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { ProfileForm } from "./ProfileForm"
import { PasswordForm } from "./PasswordForm"
import { Separator } from "@/components/ui/separator"

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
    <div className="space-y-6 max-w-4xl">
      <div>
        <h3 className="text-lg font-medium">Profile Settings</h3>
        <p className="text-sm text-muted-foreground">
          Manage your account settings and preferences.
        </p>
      </div>
      <Separator />
      
      <div className="grid gap-6">
        <ProfileForm 
          user={{
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            image: user.image,
          }} 
        />
        
        <PasswordForm />
      </div>
    </div>
  )
}
