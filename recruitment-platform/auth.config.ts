import type { NextAuthConfig } from "next-auth"
import AzureADProvider from "next-auth/providers/azure-ad"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { prisma } from "./lib/prisma"

const isProduction = process.env.VERCEL === "1"
const isDevLoginEnabled = !isProduction && process.env.AUTH_ENABLE_DEV_LOGIN === "true"

if (isProduction && !process.env.AZURE_AD_CLIENT_ID) {
  throw new Error("AZURE_AD_CLIENT_ID is required in production")
}

export default {
  providers: [
    ...(process.env.AZURE_AD_CLIENT_ID && process.env.AZURE_AD_CLIENT_SECRET && process.env.AZURE_AD_TENANT_ID
      ? [
          AzureADProvider({
            clientId: process.env.AZURE_AD_CLIENT_ID,
            clientSecret: process.env.AZURE_AD_CLIENT_SECRET,
            tenantId: process.env.AZURE_AD_TENANT_ID,
          }),
        ]
      : []),
    ...(isDevLoginEnabled
      ? [
          CredentialsProvider({
            name: "Dev Credentials",
            credentials: {
              email: { label: "Email", type: "email" },
              password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
              if (!credentials?.email || !credentials?.password) {
                return null
              }

              const user = await prisma.user.findUnique({
                where: { email: credentials.email as string },
              })

              if (!user || !user.password) {
                return null
              }

              const isPasswordValid = await bcrypt.compare(
                credentials.password as string,
                user.password
              )

              if (!isPasswordValid) {
                return null
              }

              return {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
              }
            },
          }),
        ]
      : []),
  ],
  callbacks: {
    async jwt({ token, user, account, profile }) {
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
