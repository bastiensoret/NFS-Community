"use client"

import dynamic from "next/dynamic"
import React, { Suspense } from "react"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const SignInForm = dynamic(() => import("./SignInForm"), {
  ssr: false,
  loading: () => (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold">Sign in</CardTitle>
        <CardDescription>
          Loading...
        </CardDescription>
      </CardHeader>
    </Card>
  ),
})

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <Suspense fallback={<div>Loading...</div>}>
        <SignInForm />
      </Suspense>
    </div>
  )
}
