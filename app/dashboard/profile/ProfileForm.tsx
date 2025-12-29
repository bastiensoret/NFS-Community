"use client"

import { useActionState } from "react"
import { updateProfile } from "@/app/actions/profile"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { User } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

type ProfileFormProps = {
  user: {
    firstName?: string | null
    lastName?: string | null
    email?: string | null
    image?: string | null
  }
}

const initialState = {
  success: false,
  error: "",
  fieldErrors: {},
}

export function ProfileForm({ user }: ProfileFormProps) {
  const [state, action, isPending] = useActionState(updateProfile, initialState)

  return (
    <form action={action}>
      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
          <CardDescription>
            Update your personal details and profile picture.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {state.error && (
            <Alert variant="destructive">
              <AlertDescription>{state.error}</AlertDescription>
            </Alert>
          )}
          {state.success && (
            <Alert variant="success">
              <AlertDescription>Profile updated successfully.</AlertDescription>
            </Alert>
          )}

          <div className="flex items-center space-x-4 mb-6">
            <Avatar className="h-20 w-20 border">
              <AvatarImage src={user.image || ""} alt="Profile" />
              <AvatarFallback className="bg-muted">
                <User className="h-10 w-10 text-muted-foreground" />
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <Label htmlFor="image">Profile Picture</Label>
              <Input
                id="image"
                name="image"
                type="file"
                accept="image/*"
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Upload a new profile picture (JPG, PNG or GIF, max 5MB).
              </p>
              {state.fieldErrors?.image && (
                <p className="text-sm text-destructive mt-1">{state.fieldErrors.image[0]}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                name="firstName"
                defaultValue={user.firstName || ""}
                placeholder="John"
                required
              />
              {state.fieldErrors?.firstName && (
                <p className="text-sm text-destructive mt-1">{state.fieldErrors.firstName[0]}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                name="lastName"
                defaultValue={user.lastName || ""}
                placeholder="Doe"
                required
              />
              {state.fieldErrors?.lastName && (
                <p className="text-sm text-destructive mt-1">{state.fieldErrors.lastName[0]}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              defaultValue={user.email || ""}
              disabled
            />
            <p className="text-xs text-muted-foreground">
              Email address cannot be changed directly.
            </p>
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={isPending}>
            {isPending ? "Saving..." : "Save Changes"}
          </Button>
        </CardFooter>
      </Card>
    </form>
  )
}
