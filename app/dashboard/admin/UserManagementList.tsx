"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Shield, Search, UserCog, ChevronLeft, ChevronRight } from "lucide-react"
import { getRoleDisplayName } from "@/lib/roles"
import { EditUserDialog } from "./EditUserDialog"
import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { useDebouncedCallback } from "use-debounce"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

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
  image: string | null
}

interface PaginationProps {
  page: number
  limit: number
  total: number
  totalPages: number
}

export function UserManagementList({ users, pagination }: { users: User[], pagination: PaginationProps }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  const handleSearch = useDebouncedCallback((term: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (term) {
      params.set("query", term)
    } else {
      params.delete("query")
    }
    params.set("page", "1")
    router.replace(`${pathname}?${params.toString()}`)
  }, 300)

  const handleUserClick = (user: User) => {
    setSelectedUser(user)
    setDialogOpen(true)
  }

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("page", String(newPage))
    router.push(pathname + "?" + params.toString())
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search by name, email or role..."
          defaultValue={searchParams.get("query")?.toString()}
          onChange={(e) => handleSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {users.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No users found matching &quot;{searchParams.get("query")}&quot;
        </div>
      ) : (
        <div className="space-y-4">
          {users.map((user) => (
            <div
              key={user.id}
              onClick={() => handleUserClick(user)}
              className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-4">
                <Avatar className="h-10 w-10 border">
                  <AvatarImage src={user.image || ""} alt={user.name || "User"} />
                  <AvatarFallback className="bg-muted text-muted-foreground font-bold">
                     {user.firstName?.[0] || user.name?.[0] || user.email[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium text-foreground">
                    {user.firstName && user.lastName 
                      ? `${user.firstName} ${user.lastName}`
                      : user.name || "User"}
                  </div>
                  <div className="text-sm text-muted-foreground">{user.email}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {user.isGatekeeper && (
                  <Badge variant="warning" className="flex items-center gap-1">
                    <UserCog className="h-3 w-3" />
                    Gatekeeper
                  </Badge>
                )}
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Shield className="h-3 w-3" />
                  {getRoleDisplayName(user.role)}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      )}

      {users.length > 0 && (
        <div className="flex items-center justify-end space-x-2 py-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page <= 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <div className="text-sm text-muted-foreground">
              Page {pagination.page} of {pagination.totalPages}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
        </div>
      )}

      <EditUserDialog
        user={selectedUser}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </div>
  )
}
