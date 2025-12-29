"use client"

import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatDistanceToNow, isValid, parseISO } from "date-fns"
import { useEffect, useState } from "react"
import { MapPin, User, Clock, GraduationCap, Phone, ExternalLink } from "lucide-react"
import { SENIORITY_LEVELS } from "@/lib/constants"

export type KanbanItem = {
  id: string
  columnId: string
  title: string
  subtitle?: string
  tags?: string[]
  content?: string
  creator?: string
  date?: string
  // Additional optional fields for better display
  seniority?: string
  location?: string
  phoneNumber?: string
  type?: "candidate" | "position"
}

interface KanbanCardProps {
  item: KanbanItem
  onViewClick?: (id: string, type?: "candidate" | "position") => void
}

export function KanbanCard({ item, onViewClick }: KanbanCardProps) {
  const [formattedDate, setFormattedDate] = useState<string | null>(null)

  useEffect(() => {
    if (item.date) {
      try {
        const date = parseISO(item.date)
        if (isValid(date)) {
          setFormattedDate(formatDistanceToNow(date, { addSuffix: true }))
        } else {
          setFormattedDate(item.date)
        }
      } catch (e) {
        setFormattedDate(item.date)
      }
    }
  }, [item.date])

  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: item.id,
    data: {
      type: "Item",
      item,
    },
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="opacity-30 bg-muted/50 border-2 border-primary h-[150px] min-h-[150px] rounded-xl cursor-grab relative"
      />
    )
  }

  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="cursor-grab hover:ring-2 hover:ring-primary/20 transition-all touch-none overflow-hidden group border-muted-foreground/20 bg-card py-0 gap-0"
    >
      <CardContent className="p-4 space-y-3.5">
        {/* Header: Title */}
        <div className="flex justify-between items-start gap-2">
          <div className="space-y-1 flex-1">
            <h3 className="text-sm font-bold leading-snug group-hover:text-primary transition-colors">
              {item.title}
            </h3>
            {item.subtitle && (
              <p className="text-[11px] text-muted-foreground font-semibold line-clamp-1">
                {item.subtitle}
              </p>
            )}
          </div>
          {onViewClick && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e) => {
                e.stopPropagation()
                onViewClick(item.id, item.type)
              }}
              onPointerDown={(e) => e.stopPropagation()}
            >
              <ExternalLink className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>

        {/* Quick Info Grid */}
        <div className="grid grid-cols-1 gap-2">
          {item.seniority && (
            <div className="flex items-center gap-2.5 text-[10px] text-muted-foreground">
              <GraduationCap className="h-3.5 w-3.5 shrink-0 text-muted-foreground/70" />
              <span className="truncate">
                {SENIORITY_LEVELS.find(l => l.value === item.seniority)?.label || item.seniority}
              </span>
            </div>
          )}
          {item.location && (
            <div className="flex items-center gap-2.5 text-[10px] text-muted-foreground">
              <MapPin className="h-3.5 w-3.5 shrink-0 text-muted-foreground/70" />
              <span className="truncate">{item.location}</span>
            </div>
          )}
          {item.phoneNumber && (
            <div className="flex items-center gap-2.5 text-[10px] text-muted-foreground">
              <Phone className="h-3.5 w-3.5 shrink-0 text-muted-foreground/70" />
              <span className="truncate">{item.phoneNumber}</span>
            </div>
          )}
        </div>

        {/* Tags/Skills */}
        {item.tags && item.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-1">
            {item.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-[9px] px-2 py-0.5 h-5 bg-muted/60 border-none font-medium text-muted-foreground hover:bg-muted transition-colors">
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {/* Footer: Metadata */}
        <div className="flex justify-between items-center text-[9px] text-muted-foreground/60 pt-4 border-t border-border/50">
          <div className="flex items-center gap-2">
            <User className="h-3 w-3" />
            <span className="truncate max-w-[100px]">{item.creator}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-3 w-3" />
            <span>{formattedDate || item.date}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
