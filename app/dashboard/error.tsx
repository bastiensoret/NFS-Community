'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { AlertCircle } from 'lucide-react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex h-[50vh] flex-col items-center justify-center gap-4">
      <div className="flex items-center gap-2 text-destructive">
        <AlertCircle className="h-6 w-6" />
        <h1 className="text-3xl font-bold">Something went wrong!</h1>
      </div>
      <p className="text-sm text-muted-foreground">
        {error.message || "An unexpected error occurred while loading the dashboard."}
      </p>
      <Button onClick={() => reset()}>Try again</Button>
    </div>
  )
}
