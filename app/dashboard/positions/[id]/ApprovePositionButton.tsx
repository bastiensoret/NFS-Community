"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { CheckCircle2, XCircle } from "lucide-react"
import { useRouter } from "next/navigation"

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
      // Set to CAMPAIGN_SENT to trigger the workflow
      const response = await fetch(`/api/positions/${positionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "CAMPAIGN_SENT" }),
      })

      if (response.ok) {
        router.refresh()
        // Optionally redirect if needed, or just refresh to show new status
      } else {
        const error = await response.json()
        alert(error.error || "Failed to approve position")
      }
    } catch (error) {
      console.error("Error approving position:", error)
      alert("An error occurred")
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
