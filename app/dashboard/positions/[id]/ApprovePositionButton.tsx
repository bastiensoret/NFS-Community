"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { CheckCircle2, XCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import { updatePositionAction } from "@/app/actions/positions"
import { toast } from "sonner"

interface ApprovePositionButtonProps {
  positionId: string
}

export function ApprovePositionButton({ positionId }: ApprovePositionButtonProps) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleApprove = async () => {
    if (!confirm("Are you sure you want to approve this position? This will trigger the email campaign and mark the position as Campaign Sent.")) return

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
    <Button 
      onClick={handleApprove} 
      disabled={loading}
      className="bg-green-600 hover:bg-green-700 text-white"
    >
      <CheckCircle2 className="mr-2 h-4 w-4" />
      {loading ? "Processing..." : "Approve & Launch Campaign"}
    </Button>
  )
}
