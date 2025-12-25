import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "./lib/prisma"
import authConfig from "./auth.config"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"

const isProduction = process.env.VERCEL === "1"
const isDevLoginEnabled = !isProduction && process.env.AUTH_ENABLE_DEV_LOGIN === "true"

export const { handlers: { GET, POST }, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma) as any,
  ...authConfig,
  providers: [
    ...authConfig.providers,
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
})
