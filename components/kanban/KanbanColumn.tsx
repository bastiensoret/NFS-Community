"use client"

import { SortableContext, useSortable } from "@dnd-kit/sortable"
import { useMemo } from "react"
import { KanbanCard, type KanbanItem } from "./KanbanCard"

export type ColumnType = {
  id: string
  title: string
}

interface KanbanColumnProps {
  column: ColumnType
  items: KanbanItem[]
  onViewClick?: (id: string, type?: "candidate" | "position") => void
}

export function KanbanColumn({ column, items, onViewClick }: KanbanColumnProps) {
  const itemsIds = useMemo(() => items.map((item) => item.id), [items])

  const { setNodeRef } = useSortable({
    id: column.id,
    data: {
      type: "Column",
      column,
    },
  })

  return (
    <div
      ref={setNodeRef}
      className="bg-muted/50 w-[350px] min-w-[350px] max-w-[350px] rounded-lg flex flex-col max-h-full"
    >
      <div className="p-4 font-semibold border-b border-border flex justify-between items-center bg-card rounded-t-lg">
        {column.title}
        <span className="bg-muted text-muted-foreground px-2 py-1 rounded-full text-xs">
          {items.length}
        </span>
      </div>
      <div className="flex-1 p-2 flex flex-col gap-2 overflow-y-auto min-h-[100px]">
        <SortableContext items={itemsIds}>
          {items.map((item) => (
            <KanbanCard key={item.id} item={item} onViewClick={onViewClick} />
          ))}
        </SortableContext>
      </div>
    </div>
  )
}
