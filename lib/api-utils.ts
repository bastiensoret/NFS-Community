import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { hasPermission } from "@/lib/roles"
import { Session } from "next-auth"
import { checkRateLimit } from "@/lib/rate-limit"

type AuthenticatedHandler<T = any> = (
  req: NextRequest,
  session: Session,
  context: T
) => Promise<NextResponse>

export function withAuth<T = any>(
  handler: AuthenticatedHandler<T>,
  requiredPermission?: keyof typeof import("./roles").ROLE_PERMISSIONS['USER']
) {
  return async (req: NextRequest, context: T) => {
    try {
      const session = await auth()

      if (!session || !session.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
      }

      // Rate Limiting
      // Limit to 60 requests per minute per user
      const isAllowed = await checkRateLimit(session.user.id || "unknown", {
        tokensPerInterval: 60,
        interval: "minute"
      })

      if (!isAllowed) {
        return NextResponse.json(
          { error: "Too Many Requests" },
          { status: 429 }
        )
      }

      if (requiredPermission && !hasPermission(session.user.role, requiredPermission)) {
        return NextResponse.json(
          { error: "Forbidden: Insufficient permissions" },
          { status: 403 }
        )
      }

      return handler(req, session, context)
    } catch (error) {
      console.error("API Error:", error)
      return NextResponse.json(
        { error: "Internal Server Error" },
        { status: 500 }
      )
    }
  }
}
