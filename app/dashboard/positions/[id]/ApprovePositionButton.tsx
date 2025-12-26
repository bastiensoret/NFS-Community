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
    if (!confirm("Are you sure you want to approve this position? It will become visible to all users.")) return

    setLoading(true)
    try {
      const response = await fetch(`/api/positions/${positionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "ACTIVE" }),
      })

      if (response.ok) {
        router.refresh()
      } else {
        alert("Failed to approve position")
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
      {loading ? "Approving..." : "Validate Position"}
    </Button>
  )
}
