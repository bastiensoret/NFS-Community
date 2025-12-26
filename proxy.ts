import NextAuth from "next-auth"
import authConfig from "./auth.config"

const { auth } = NextAuth(authConfig)

export default auth((req) => {
  const isLoggedIn = !!req.auth
  const isOnDashboard = req.nextUrl.pathname.startsWith('/dashboard')
  const isOnAdmin = req.nextUrl.pathname.startsWith('/dashboard/admin')
  
  // Protect dashboard routes
  if (isOnDashboard) {
    if (!isLoggedIn) {
      return Response.redirect(new URL('/auth/signin', req.nextUrl))
    }
  }

  // Optional: Add stricter checks for admin routes if role is available in session
  // Note: req.auth.user.role might require type augmentation or checking token
})

// Configure matcher to run proxy on specific paths
export const config = {
  matcher: [
    /*
    * Match all request paths except for the ones starting with:
    * - api (API routes)
    * - _next/static (static files)
    * - _next/image (image optimization files)
    * - favicon.ico (favicon file)
    * - auth (auth routes)
    */
    "/((?!api|_next/static|_next/image|favicon.ico|auth).*)",
  ],
}
