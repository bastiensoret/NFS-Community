import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { hasPermission } from "@/lib/roles"
import { Session } from "next-auth"
import { checkRateLimit } from "@/lib/rate-limit"
import { ZodError } from "zod"

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
      const isAllowed = await checkRateLimit(session.user.id || "unknown", 60)

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

      return await handler(req, session, context)
    } catch (error: any) {
      console.error("API Error details:", error)
      
      // Check for ZodError (instanceof or shape)
      if (error instanceof ZodError || (error?.name === 'ZodError') || error?.errors) {
        return NextResponse.json(
          { error: "Validation Error", details: error.errors },
          { status: 400 }
        )
      }

      return NextResponse.json(
        { error: "Internal Server Error", message: error instanceof Error ? error.message : "Unknown error" },
        { status: 500 }
      )
    }
  }
}
