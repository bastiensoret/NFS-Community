"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ROLES, ROLE_DISPLAY_NAMES } from "@/lib/roles"
import { useRouter } from "next/navigation"
import { Alert, AlertDescription } from "@/components/ui/alert"

type User = {
  id: string
  name: string | null
  email: string
  firstName: string | null
  lastName: string | null
  role: string
  isGatekeeper: boolean
  tenantId: string | null
  createdAt: Date
}

type EditUserDialogProps = {
  user: User | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EditUserDialog({ user, open, onOpenChange }: EditUserDialogProps) {
  const router = useRouter()
  const [selectedRole, setSelectedRole] = useState(user?.role || "")
  const [isGatekeeper, setIsGatekeeper] = useState(user?.isGatekeeper || false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSave = async () => {
    if (!user) return

    setLoading(true)
    setError("")

    try {
      const response = await fetch("/api/admin/update-user", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.id,
          role: selectedRole,
          isGatekeeper: isGatekeeper,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Failed to update user")
        setLoading(false)
        return
      }

      router.refresh()
      onOpenChange(false)
    } catch (err) {
      setError("An error occurred while updating the user")
    } finally {
      setLoading(false)
    }
  }

  if (!user) return null

  const displayName = user.firstName && user.lastName
    ? `${user.firstName} ${user.lastName}`
    : user.name || user.email

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit User</DialogTitle>
          <DialogDescription>
            Update role and permissions for {displayName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <div className="text-sm">
              <span className="font-medium text-gray-700">Email:</span>{" "}
              <span className="text-gray-600">{user.email}</span>
            </div>
            {user.tenantId && (
              <div className="text-sm">
                <span className="font-medium text-gray-700">Organization:</span>{" "}
                <span className="text-gray-600">{user.tenantId}</span>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger id="role">
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(ROLES).map(([key, value]) => (
                  <SelectItem key={value} value={value}>
                    {ROLE_DISPLAY_NAMES[value as keyof typeof ROLE_DISPLAY_NAMES]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500">
              {selectedRole === "ADMIN" && "Can manage jobs and candidates"}
              {selectedRole === "SUPER_ADMIN" && "Full system access"}
              {selectedRole === "USER" && "Can post jobs and propose candidates"}
              {selectedRole === "BASIC_USER" && "View-only access to jobs"}
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="gatekeeper"
              checked={isGatekeeper}
              onCheckedChange={(checked) => setIsGatekeeper(checked as boolean)}
            />
            <Label
              htmlFor="gatekeeper"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
            >
              Gatekeeper responsibility
            </Label>
          </div>
          <p className="text-xs text-gray-500 -mt-2">
            Can approve job postings in addition to their role permissions
          </p>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
