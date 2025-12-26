"use client"

import { useActionState } from "react"
import { updateProfile } from "@/app/actions/profile"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { User } from "lucide-react"

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
            <Alert className="border-green-500 text-green-900 bg-green-50">
              <AlertDescription>Profile updated successfully.</AlertDescription>
            </Alert>
          )}

          <div className="flex items-center space-x-4 mb-6">
            <div className="h-20 w-20 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border relative">
              {user.image ? (
                <img 
                  src={user.image} 
                  alt="Profile" 
                  className="h-full w-full object-cover" 
                />
              ) : (
                <User className="h-10 w-10 text-gray-400" />
              )}
            </div>
            <div className="flex-1">
              <Label htmlFor="image">Profile Picture</Label>
              <Input
                id="image"
                name="image"
                type="file"
                accept="image/*"
                className="mt-1"
              />
              <p className="text-xs text-gray-500 mt-1">
                Upload a new profile picture (JPG, PNG or GIF, max 5MB).
              </p>
              {state.fieldErrors?.image && (
                <p className="text-sm text-red-500 mt-1">{state.fieldErrors.image[0]}</p>
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
                <p className="text-sm text-red-500 mt-1">{state.fieldErrors.firstName[0]}</p>
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
                <p className="text-sm text-red-500 mt-1">{state.fieldErrors.lastName[0]}</p>
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
              className="bg-gray-100"
            />
            <p className="text-xs text-gray-500">
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
