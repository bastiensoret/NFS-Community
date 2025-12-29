import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { FileQuestion } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="flex h-screen flex-col items-center justify-center gap-4 bg-background">
      <div className="flex items-center gap-2 text-foreground">
        <FileQuestion className="h-8 w-8" />
        <h1 className="text-3xl font-bold">Page not found</h1>
      </div>
      <p className="text-muted-foreground">
        The page you are looking for does not exist or has been moved.
      </p>
      <Link href="/dashboard">
        <Button>Return to Dashboard</Button>
      </Link>
    </div>
  )
}
