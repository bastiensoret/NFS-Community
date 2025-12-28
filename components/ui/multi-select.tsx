"use client"

import * as React from "react"
import { Check, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

export interface MultiSelectProps {
  options: string[]
  selected: string[]
  onChange: (selected: string[]) => void
  placeholder?: string
  className?: string
}

export function MultiSelect({
  options,
  selected,
  onChange,
  placeholder = "Select items...",
  className
}: MultiSelectProps) {
  
  const handleSelect = (item: string) => {
    if (selected.includes(item)) {
      onChange(selected.filter((i) => i !== item))
    } else {
      onChange([...selected, item])
    }
  }

  const handleRemove = (item: string) => {
    onChange(selected.filter((i) => i !== item))
  }

  return (
    <div className={cn("space-y-3", className)}>
      <div className="border rounded-md p-4 space-y-4 max-h-[200px] overflow-y-auto bg-white">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {options.map((item) => (
            <div key={item} className="flex items-start space-x-2">
              <Checkbox
                id={`item-${item}`}
                checked={selected.includes(item)}
                onCheckedChange={() => handleSelect(item)}
              />
              <Label
                htmlFor={`item-${item}`}
                className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer pt-0.5"
              >
                {item}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {selected.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-2">
          {selected.map((item) => (
            <Badge key={item} variant="secondary" className="pl-2 pr-1 py-1">
              {item}
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-4 w-4 ml-1 hover:bg-transparent"
                onClick={() => handleRemove(item)}
              >
                <X className="h-3 w-3" />
                <span className="sr-only">Remove {item}</span>
              </Button>
            </Badge>
          ))}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-6 text-xs"
            onClick={() => onChange([])}
          >
            Clear all
          </Button>
        </div>
      )}
    </div>
  )
}
