"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Shield, Building2, Search, UserCog, ChevronLeft, ChevronRight } from "lucide-react"
import { getRoleDisplayName } from "@/lib/roles"
import { EditUserDialog } from "./EditUserDialog"
import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { useDebounce } from "@/lib/hooks/use-debounce"

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
  const [searchQuery, setSearchQuery] = useState(searchParams.get("query") || "")
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  // Debounce search update
  const debouncedSearch = useDebounce(searchQuery, 300)

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString())
    if (debouncedSearch) {
      params.set("query", debouncedSearch)
    } else {
      params.delete("query")
    }
    params.set("page", "1") // Reset to page 1 on search
    router.push(pathname + "?" + params.toString())
  }, [debouncedSearch, router, pathname]) // Don't include searchParams to avoid loop

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
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          type="text"
          placeholder="Search by name, email or role..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {users.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No users found matching "{searchQuery}"
        </div>
      ) : (
        <div className="space-y-4">
          {users.map((user) => (
            <div
              key={user.id}
              onClick={() => handleUserClick(user)}
              className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border">
                  {user.image ? (
                    <img 
                      src={user.image} 
                      alt="Profile" 
                      className="h-full w-full object-cover" 
                    />
                  ) : (
                    <div className="h-full w-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                      {user.firstName?.[0] || user.name?.[0] || user.email[0].toUpperCase()}
                    </div>
                  )}
                </div>
                <div>
                  <div className="font-medium text-gray-900">
                    {user.firstName && user.lastName 
                      ? `${user.firstName} ${user.lastName}`
                      : user.name || "User"}
                  </div>
                  <div className="text-sm text-gray-500">{user.email}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {user.isGatekeeper && (
                  <Badge className="flex items-center gap-1 bg-orange-500 hover:bg-orange-500 text-white border-0">
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
            <div className="text-sm text-gray-500">
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
