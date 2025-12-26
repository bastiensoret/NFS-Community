import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { FileQuestion } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="flex h-screen flex-col items-center justify-center gap-4 bg-gray-50">
      <div className="flex items-center gap-2 text-gray-900">
        <FileQuestion className="h-8 w-8" />
        <h2 className="text-2xl font-bold">Page Not Found</h2>
      </div>
      <p className="text-gray-500">
        The page you are looking for does not exist or has been moved.
      </p>
      <Link href="/dashboard">
        <Button>Return to Dashboard</Button>
      </Link>
    </div>
  )
}
