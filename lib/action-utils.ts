import { auth } from "@/auth"
import { checkRateLimit } from "@/lib/rate-limit"
import { type Role, hasPermission, ROLE_PERMISSIONS } from "@/lib/roles"

export type ActionState = {
  success?: boolean
  error?: string
  validationErrors?: Record<string, string[]>
  [key: string]: any
}

export class ActionError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "ActionError"
  }
}

export async function authenticated(permission?: keyof typeof ROLE_PERMISSIONS[Role]) {
  const session = await auth()
  
  if (!session?.user?.id || !session.user.role) {
    throw new ActionError("Unauthorized")
  }

  const isAllowed = await checkRateLimit(session.user.id)
  if (!isAllowed) {
    throw new ActionError("Too Many Requests")
  }

  if (permission) {
    if (!hasPermission(session.user.role as Role, permission)) {
      throw new ActionError("Forbidden: Insufficient permissions")
    }
  }

  return session.user
}

export function handleActionError(error: unknown): ActionState {
  console.error("Action Error:", error)
  if (error instanceof ActionError) {
    return { error: error.message }
  }
  return { error: "An unexpected error occurred" }
}
