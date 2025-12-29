"use client"

import { useState } from "react"
import { Users, Briefcase, X } from "lucide-react"
import { KanbanBoard } from "@/components/kanban/KanbanBoard"
import { updateCandidateAction } from "@/app/actions/candidates"
import { updatePositionAction } from "@/app/actions/positions"
import { toast } from "sonner"
import type { KanbanItem } from "@/components/kanban/KanbanCard"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface GatekeeperDashboardClientProps {
  candidates: KanbanItem[]
  positions: KanbanItem[]
}

export default function GatekeeperDashboardClient({ candidates, positions }: GatekeeperDashboardClientProps) {
  const [activeTab, setActiveTab] = useState<"candidates" | "positions">("candidates")
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null)
  const [selectedItemType, setSelectedItemType] = useState<"candidate" | "position" | null>(null)

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

  function handleViewClick(id: string, type?: "candidate" | "position") {
    setSelectedItemId(id)
    setSelectedItemType(type || null)
    setViewDialogOpen(true)
  }

  const selectedItem = selectedItemType === "candidate" 
    ? candidates.find(c => c.id === selectedItemId)
    : positions.find(p => p.id === selectedItemId)

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
      
      <div className="flex items-center gap-1 bg-muted p-1 rounded-lg w-fit border shadow-sm">
        <button
          onClick={() => setActiveTab("candidates")}
          className={`flex items-center gap-2 px-6 py-2 rounded-md text-sm font-semibold transition-all duration-200 ${
            activeTab === "candidates"
              ? "bg-background text-primary shadow-md translate-y-[-1px]"
              : "text-muted-foreground hover:text-foreground hover:bg-background/50"
          }`}
        >
          <Users className={`h-4 w-4 ${activeTab === "candidates" ? "text-primary" : "text-muted-foreground"}`} />
          Candidates
          <span className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] ${
            activeTab === "candidates" ? "bg-primary/10 text-primary" : "bg-muted-foreground/10 text-muted-foreground"
          }`}>
            {candidates.length}
          </span>
        </button>
        <button
          onClick={() => setActiveTab("positions")}
          className={`flex items-center gap-2 px-6 py-2 rounded-md text-sm font-semibold transition-all duration-200 ${
            activeTab === "positions"
              ? "bg-background text-primary shadow-md translate-y-[-1px]"
              : "text-muted-foreground hover:text-foreground hover:bg-background/50"
          }`}
        >
          <Briefcase className={`h-4 w-4 ${activeTab === "positions" ? "text-primary" : "text-muted-foreground"}`} />
          Positions
          <span className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] ${
            activeTab === "positions" ? "bg-primary/10 text-primary" : "bg-muted-foreground/10 text-muted-foreground"
          }`}>
            {positions.length}
          </span>
        </button>
      </div>

      {activeTab === "candidates" ? (
        <div className="space-y-4">
          <KanbanBoard
            key="candidates-board"
            initialItems={candidates}
            columns={candidateColumns}
            onStatusChange={handleCandidateStatusChange}
            onViewClick={handleViewClick}
          />
        </div>
      ) : (
        <div className="space-y-4">
          <KanbanBoard
            key="positions-board"
            initialItems={positions}
            columns={positionColumns}
            onStatusChange={handlePositionStatusChange}
            onViewClick={handleViewClick}
          />
        </div>
      )}

      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedItem?.title || "Details"}</DialogTitle>
          </DialogHeader>
          {selectedItem && (
            <div className="space-y-4">
              {selectedItem.subtitle && (
                <div>
                  <h4 className="text-sm font-semibold text-muted-foreground mb-1">
                    {selectedItemType === "candidate" ? "Email" : "Company"}
                  </h4>
                  <p className="text-sm">{selectedItem.subtitle}</p>
                </div>
              )}
              
              {selectedItem.seniority && (
                <div>
                  <h4 className="text-sm font-semibold text-muted-foreground mb-1">Seniority Level</h4>
                  <p className="text-sm">{selectedItem.seniority}</p>
                </div>
              )}
              
              {selectedItem.location && (
                <div>
                  <h4 className="text-sm font-semibold text-muted-foreground mb-1">Location</h4>
                  <p className="text-sm">{selectedItem.location}</p>
                </div>
              )}
              
              {selectedItem.phoneNumber && (
                <div>
                  <h4 className="text-sm font-semibold text-muted-foreground mb-1">Phone Number</h4>
                  <p className="text-sm">{selectedItem.phoneNumber}</p>
                </div>
              )}
              
              {selectedItem.tags && selectedItem.tags.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-muted-foreground mb-2">
                    {selectedItemType === "candidate" ? "Skills" : "Tags"}
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedItem.tags.map((tag) => (
                      <span key={tag} className="px-2 py-1 bg-secondary text-secondary-foreground rounded-md text-xs">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {selectedItem.creator && (
                <div>
                  <h4 className="text-sm font-semibold text-muted-foreground mb-1">Created By</h4>
                  <p className="text-sm">{selectedItem.creator}</p>
                </div>
              )}
              
              {selectedItem.date && (
                <div>
                  <h4 className="text-sm font-semibold text-muted-foreground mb-1">Created</h4>
                  <p className="text-sm">{selectedItem.date}</p>
                </div>
              )}
              
              <div className="pt-4 border-t">
                <Button
                  onClick={() => {
                    window.open(
                      `/dashboard/${selectedItemType}s/${selectedItemId}`,
                      '_blank'
                    )
                  }}
                  className="w-full"
                >
                  Open Full Details
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
