"use client"

import { useActionState } from "react"
import { changePassword } from "@/app/actions/profile"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"

const initialState = {
  success: false,
  error: "",
  fieldErrors: {},
}

export function PasswordForm() {
  const [state, action, isPending] = useActionState(changePassword, initialState)

  return (
    <form action={action}>
      <Card>
        <CardHeader>
          <CardTitle>Change password</CardTitle>
          <CardDescription>
            Ensure your account is secure by using a strong password.
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
              <AlertDescription>Password changed successfully.</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="currentPassword">Current Password</Label>
            <Input
              id="currentPassword"
              name="currentPassword"
              type="password"
              required
            />
            {state.fieldErrors?.currentPassword && (
              <p className="text-sm text-destructive mt-1">{state.fieldErrors.currentPassword[0]}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="newPassword">New Password</Label>
            <Input
              id="newPassword"
              name="newPassword"
              type="password"
              required
            />
            {state.fieldErrors?.newPassword && (
              <p className="text-sm text-destructive mt-1">{state.fieldErrors.newPassword[0]}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm New Password</Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              required
            />
            {state.fieldErrors?.confirmPassword && (
              <p className="text-sm text-destructive mt-1">{state.fieldErrors.confirmPassword[0]}</p>
            )}
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={isPending}>
            {isPending ? "Updating..." : "Update Password"}
          </Button>
        </CardFooter>
      </Card>
    </form>
  )
}
