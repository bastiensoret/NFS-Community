import type { NextAuthConfig } from "next-auth"
import AzureADProvider from "next-auth/providers/azure-ad"

const isProduction = process.env.VERCEL === "1"

if (isProduction && !process.env.AUTH_MICROSOFT_ENTRA_ID_ID) {
  throw new Error("AUTH_MICROSOFT_ENTRA_ID_ID is required in production")
}

export default {
  providers: [
    ...(process.env.AUTH_MICROSOFT_ENTRA_ID_ID && process.env.AUTH_MICROSOFT_ENTRA_ID_SECRET && process.env.AUTH_MICROSOFT_ENTRA_ID_TENANT_ID
      ? [
          AzureADProvider({
            clientId: process.env.AUTH_MICROSOFT_ENTRA_ID_ID,
            clientSecret: process.env.AUTH_MICROSOFT_ENTRA_ID_SECRET,
            issuer: `https://login.microsoftonline.com/${process.env.AUTH_MICROSOFT_ENTRA_ID_TENANT_ID}/v2.0`,
          }),
        ]
      : []),
  ],
  callbacks: {
    async signIn({ account, profile }) {
      console.log("SignIn Callback:", { provider: account?.provider, profileId: profile?.id })
      if (account?.provider === "azure-ad") {
        const allowedTenantId = process.env.AUTH_MICROSOFT_ENTRA_ID_TENANT_ID
        console.log("Checking Tenant ID:", { received: profile?.tid, expected: allowedTenantId })
        
        if (allowedTenantId && profile?.tid !== allowedTenantId) {
          console.error(`Access denied: Tenant ID mismatch. Expected ${allowedTenantId}, got ${profile?.tid}`)
          return false
        }
      }
      return true
    },
    async jwt({ token, user, account, profile }) {
      console.log("JWT Callback:", { hasUser: !!user, hasAccount: !!account, hasProfile: !!profile })
      if (user) {
        token.id = user.id
        token.role = user.role
      }

      if (profile?.tid) {
        token.tenantId = profile.tid as string
      }

      if (account?.provider === "credentials" && !token.tenantId) {
        token.tenantId = "local"
      }

      return token
    },
    async session({ session, token }) {
      console.log("Session Callback:", { userId: token?.id, userRole: token?.role })
      if (token && session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
        session.user.tenantId = token.tenantId as string
      }
      return session
    },
  },
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/auth/signin",
  },
} satisfies NextAuthConfig
