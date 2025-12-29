"use client"

import { useMemo, useState, useEffect } from "react"
import { DndContext, DragOverlay, useSensor, useSensors, MouseSensor, TouchSensor, DragStartEvent, DragEndEvent, DragOverEvent } from "@dnd-kit/core"
import { SortableContext, arrayMove } from "@dnd-kit/sortable"
import { KanbanColumn, type ColumnType } from "./KanbanColumn"
import { KanbanCard, type KanbanItem } from "./KanbanCard"
import { createPortal } from "react-dom"

interface KanbanBoardProps {
  initialItems: KanbanItem[]
  columns: ColumnType[]
  onStatusChange: (itemId: string, newStatus: string) => Promise<void>
}

export function KanbanBoard({ initialItems, columns, onStatusChange }: KanbanBoardProps) {
  const [items, setItems] = useState<KanbanItem[]>(initialItems)
  const [activeItem, setActiveItem] = useState<KanbanItem | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 10,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    })
  )

  const columnsId = useMemo(() => columns.map((col) => col.id), [columns])

  if (!mounted) {
    return (
      <div className="flex gap-4 overflow-x-auto pb-4 h-full min-h-[500px]">
        {columns.map((col) => (
          <div
            key={col.id}
            className="bg-muted/50 w-[350px] min-w-[350px] max-w-[350px] rounded-lg flex flex-col max-h-full"
          >
            <div className="p-4 font-semibold border-b border-border flex justify-between items-center bg-card rounded-t-lg">
              {col.title}
              <span className="bg-muted text-muted-foreground px-2 py-1 rounded-full text-xs">
                {items.filter((item) => item.columnId === col.id).length}
              </span>
            </div>
            <div className="flex-1 p-2 flex flex-col gap-2 overflow-y-auto min-h-[100px]">
              {items
                .filter((item) => item.columnId === col.id)
                .map((item) => (
                  <KanbanCard key={item.id} item={item} />
                ))}
            </div>
          </div>
        ))}
      </div>
    )
  }

  function onDragStart(event: DragStartEvent) {
    if (event.active.data.current?.type === "Item") {
      setActiveItem(event.active.data.current.item)
    }
  }

  function onDragOver(event: DragOverEvent) {
    const { active, over } = event
    if (!over) return

    const activeId = active.id
    const overId = over.id

    if (activeId === overId) return

    const isActiveItem = active.data.current?.type === "Item"
    const isOverItem = over.data.current?.type === "Item"

    if (!isActiveItem) return

    // Dropping an item over another item
    if (isActiveItem && isOverItem) {
      setItems((items) => {
        const activeIndex = items.findIndex((t) => t.id === activeId)
        const overIndex = items.findIndex((t) => t.id === overId)

        if (items[activeIndex].columnId !== items[overIndex].columnId) {
          items[activeIndex].columnId = items[overIndex].columnId
          return arrayMove(items, activeIndex, overIndex - 1)
        }

        return arrayMove(items, activeIndex, overIndex)
      })
    }

    const isOverColumn = over.data.current?.type === "Column"

    // Dropping an item over a column
    if (isActiveItem && isOverColumn) {
      setItems((items) => {
        const activeIndex = items.findIndex((t) => t.id === activeId)
        items[activeIndex].columnId = overId.toString()
        return arrayMove(items, activeIndex, activeIndex)
      })
    }
  }

  async function onDragEnd(event: DragEndEvent) {
    setActiveItem(null)
    const { active, over } = event
    if (!over) return

    const activeId = active.id.toString()
    const overId = over.id.toString()

    const activeItem = items.find((item) => item.id === activeId)
    if (!activeItem) return

    let newStatus = activeItem.columnId

    // If dropped over a column directly
    if (columns.some(col => col.id === overId)) {
      newStatus = overId
    } else {
       // If dropped over an item, finding the column of that item is handled in onDragOver via state update
       // But we need to confirm the new status from the state
       const updatedItem = items.find((item) => item.id === activeId)
       if (updatedItem) {
         newStatus = updatedItem.columnId
       }
    }
    
    // Only trigger update if status changed
    // Note: initialItems is not updated automatically, so we compare with what we know
    // But since we updated state in onDragOver, activeItem.columnId might already be the new one?
    // Actually items state is updated optimistically.
    
    // We should trigger the server action here
    if (newStatus) {
       await onStatusChange(activeId, newStatus)
    }
  }

  return (
    <DndContext
      id="kanban-board"
      sensors={sensors}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragEnd={onDragEnd}
    >
      <div className="flex gap-4 overflow-x-auto pb-4 h-full min-h-[500px]">
        {columns.map((col) => (
          <KanbanColumn
            key={col.id}
            column={col}
            items={items.filter((item) => item.columnId === col.id)}
          />
        ))}
      </div>

      {mounted && createPortal(
        <DragOverlay>
          {activeItem && (
            <KanbanCard item={activeItem} />
          )}
        </DragOverlay>,
        document.body
      )}
    </DndContext>
  )
}
