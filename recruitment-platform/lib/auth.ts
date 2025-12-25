import { NextAuthOptions } from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import AzureADProvider from "next-auth/providers/azure-ad"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { prisma } from "./prisma"

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any,
  providers: [
    AzureADProvider({
      clientId: process.env.AZURE_AD_CLIENT_ID!,
      clientSecret: process.env.AZURE_AD_CLIENT_SECRET!,
      tenantId: process.env.AZURE_AD_TENANT_ID!,
    }),
    CredentialsProvider({
      name: "Dev Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          console.log('Missing credentials')
          return null
        }

        console.log('Attempting login for:', credentials.email)

        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        })

        if (!user) {
          console.log('User not found:', credentials.email)
          return null
        }

        if (!user.password) {
          console.log('User has no password:', credentials.email)
          return null
        }

        console.log('Comparing passwords...')
        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        )

        console.log('Password valid:', isPasswordValid)

        if (!isPasswordValid) {
          return null
        }

        console.log('Login successful for:', user.email)
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        }
      }
    })
  ],
  callbacks: {
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
      }
      return session
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
      }
      return token
    }
  },
  session: {
    strategy: "jwt"
  },
  pages: {
    signIn: "/auth/signin",
  }
}
