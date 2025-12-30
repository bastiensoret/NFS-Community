import NextAuth from "next-auth"
import authConfig from "./auth.config"

const { auth } = NextAuth(authConfig)

export default auth((req) => {
  const isLoggedIn = !!req.auth
  const isOnDashboard = req.nextUrl.pathname.startsWith("/dashboard")
  
  if (isOnDashboard) {
    if (isLoggedIn) return
    return Response.redirect(new URL("/auth/signin", req.nextUrl))
  }
})

export const config = {
  // Matcher ignoring static files and api routes
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
