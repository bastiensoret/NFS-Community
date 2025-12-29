"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { KanbanBoard } from "@/components/kanban/KanbanBoard"
import { updateCandidateAction } from "@/app/actions/candidates"
import { updatePositionAction } from "@/app/actions/positions"
import { toast } from "sonner"
import type { KanbanItem } from "@/components/kanban/KanbanCard"

interface GatekeeperDashboardClientProps {
  candidates: KanbanItem[]
  positions: KanbanItem[]
}

export default function GatekeeperDashboardClient({ candidates, positions }: GatekeeperDashboardClientProps) {
  const [activeTab, setActiveTab] = useState<"candidates" | "positions">("candidates")

  async function handleCandidateStatusChange(id: string, newStatus: string) {
    try {
      const result = await updateCandidateAction(id, { status: newStatus as any })
      if (!result.success) {
        toast.error("Failed to update status", { description: result.error as string })
        // You might want to revert the state here or force a reload
      } else {
        toast.success("Candidate status updated")
      }
    } catch (error) {
      toast.error("An error occurred")
    }
  }

  async function handlePositionStatusChange(id: string, newStatus: string) {
    try {
      // Mapping Kanban status to Position status
      // Kanban: DRAFT, PENDING_APPROVAL, ACTIVE (Campaign Sent), ARCHIVED
      let apiStatus = newStatus
      if (newStatus === "ACTIVE") apiStatus = "CAMPAIGN_SENT"
      if (newStatus === "INACTIVE") apiStatus = "ARCHIVED"

      const result = await updatePositionAction(id, { status: apiStatus as any })
      if (!result.success) {
         toast.error("Failed to update status", { description: result.error as string })
      } else {
         toast.success("Position status updated")
      }
    } catch (error) {
       toast.error("An error occurred")
    }
  }

  const candidateColumns = [
    { id: "DRAFT", title: "Draft" },
    { id: "PENDING_APPROVAL", title: "Pending approval" },
    { id: "ACTIVE", title: "Active" },
    { id: "INACTIVE", title: "Inactive" },
  ]

  const positionColumns = [
    { id: "DRAFT", title: "Draft" },
    { id: "PENDING_APPROVAL", title: "Pending approval" },
    { id: "ACTIVE", title: "Campaign sent (active)" },
    { id: "INACTIVE", title: "Archived" },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">Gatekeeping</h1>
      </div>
      
      <div className="flex items-center gap-4 bg-muted/50 p-1 rounded-lg w-fit">
        <button
          onClick={() => setActiveTab("candidates")}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
            activeTab === "candidates"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Candidates
        </button>
        <button
          onClick={() => setActiveTab("positions")}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
            activeTab === "positions"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Positions
        </button>
      </div>

      {activeTab === "candidates" ? (
        <div className="space-y-4">
          <KanbanBoard
            initialItems={candidates}
            columns={candidateColumns}
            onStatusChange={handleCandidateStatusChange}
          />
        </div>
      ) : (
        <div className="space-y-4">
          <KanbanBoard
            initialItems={positions}
            columns={positionColumns}
            onStatusChange={handlePositionStatusChange}
          />
        </div>
      )}
    </div>
  )
}
