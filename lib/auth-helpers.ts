import { auth } from "@/auth"

export async function getSession() {
  return await auth()
}

export async function requireAuth() {
  const session = await getSession()
  if (!session) {
    throw new Error("Unauthorized")
  }
  return session
}

export async function requireRole(allowedRoles: string | string[]) {
  const session = await requireAuth()
  
  if (!session.user?.role) {
    throw new Error("Forbidden: No role assigned")
  }

  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles]
  
  if (!roles.includes(session.user.role)) {
    throw new Error(`Forbidden: Requires one of the following roles: ${roles.join(", ")}`)
  }

  return session
}
