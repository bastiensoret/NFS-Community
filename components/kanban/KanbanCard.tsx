"use client"

import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatDistanceToNow, isValid, parseISO } from "date-fns"
import { useEffect, useState } from "react"

export type KanbanItem = {
  id: string
  columnId: string
  title: string
  subtitle?: string
  tags?: string[]
  content?: string
  creator?: string
  date?: string
}

interface KanbanCardProps {
  item: KanbanItem
}

export function KanbanCard({ item }: KanbanCardProps) {
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
      className="cursor-grab hover:ring-2 hover:ring-primary/20 transition-all touch-none"
    >
      <CardHeader className="p-4 pb-2">
        <div className="flex justify-between items-start gap-2">
          <CardTitle className="text-sm font-medium leading-tight">
            {item.title}
          </CardTitle>
        </div>
        {item.subtitle && (
           <p className="text-xs text-muted-foreground">{item.subtitle}</p>
        )}
      </CardHeader>
      <CardContent className="p-4 pt-2 space-y-2">
         {item.content && (
             <p className="text-xs text-muted-foreground line-clamp-2">{item.content}</p>
         )}
         <div className="flex flex-wrap gap-1">
            {item.tags?.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-[10px] px-1 py-0 h-5">
                    {tag}
                </Badge>
            ))}
         </div>
         <div className="flex justify-between items-center text-[10px] text-muted-foreground pt-2 border-t mt-2">
             <span>{item.creator}</span>
             <span>{formattedDate || item.date}</span>
         </div>
      </CardContent>
    </Card>
  )
}
