"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { CheckCircle2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { updatePositionAction } from "@/app/actions/positions"
import { toast } from "sonner"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface ApprovePositionButtonProps {
  positionId: string
}

export function ApprovePositionButton({ positionId }: ApprovePositionButtonProps) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleApprove = async () => {
    setLoading(true)
    try {
      const result = await updatePositionAction(positionId, { status: "CAMPAIGN_SENT" })

      if (result.success) {
        toast.success("Position approved and campaign launched!")
        router.refresh()
      } else {
        toast.error(result.error || "Failed to approve position")
      }
    } catch (error) {
      console.error("Error approving position:", error)
      toast.error("An error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="success">
          <CheckCircle2 className="mr-2 h-4 w-4" />
          Approve & Launch Campaign
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Approve position?</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to approve this position? This will trigger the email campaign and mark the position as Campaign Sent.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleApprove} disabled={loading} variant="success">
            {loading ? "Processing..." : "Confirm Approval"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
