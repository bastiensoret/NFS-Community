"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Shield, Building2, Search } from "lucide-react"
import { getRoleDisplayName } from "@/lib/roles"

type User = {
  id: string
  name: string | null
  email: string
  firstName: string | null
  lastName: string | null
  role: string
  tenantId: string | null
  createdAt: Date
}

export function UserManagementList({ users }: { users: User[] }) {
  const [searchQuery, setSearchQuery] = useState("")

  const filteredUsers = users.filter((user) => {
    const searchLower = searchQuery.toLowerCase()
    const fullName = user.firstName && user.lastName 
      ? `${user.firstName} ${user.lastName}`.toLowerCase()
      : (user.name || "").toLowerCase()
    
    return (
      fullName.includes(searchLower) ||
      user.email.toLowerCase().includes(searchLower) ||
      user.role.toLowerCase().includes(searchLower) ||
      (user.tenantId && user.tenantId.toLowerCase().includes(searchLower))
    )
  })

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          type="text"
          placeholder="Search by name, email, role, or organization..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {filteredUsers.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No users found matching "{searchQuery}"
        </div>
      ) : (
        <div className="space-y-4">
          {filteredUsers.map((user) => (
            <div
              key={user.id}
              className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                  {user.firstName?.[0] || user.name?.[0] || user.email[0].toUpperCase()}
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
                {user.tenantId && (
                  <div className="flex items-center gap-1 text-sm text-gray-500">
                    <Building2 className="h-3.5 w-3.5" />
                    <span>{user.tenantId}</span>
                  </div>
                )}
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Shield className="h-3 w-3" />
                  {getRoleDisplayName(user.role)}
                </Badge>
                <span className="text-xs text-gray-400">
                  {new Date(user.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
