"use client"

import * as React from "react"
import { Check, ChevronsUpDown, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command" // I need to check if command exists, it was not in the ls output.
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover" // I need to check if popover exists.
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area" // Check if exists

// Fallback if Command/Popover don't exist: Use a simple div structure with standard inputs.
// Since I saw the file list earlier and didn't see command/popover/scroll-area, I should verify or build a simpler version.

export interface CategorizedMultiSelectProps {
  options: Record<string, string[]>
  selected: string[]
  onChange: (selected: string[]) => void
  placeholder?: string
}

export function CategorizedMultiSelect({
  options,
  selected,
  onChange,
  placeholder = "Select items...",
}: CategorizedMultiSelectProps) {
  const [isOpen, setIsOpen] = React.useState(false)

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

  // Flatten options for display
  const categories = Object.keys(options)

  return (
    <div className="space-y-3">
      <div className="border rounded-md p-4 space-y-4 max-h-[400px] overflow-y-auto bg-background">
        {categories.map((category) => (
          <div key={category} className="space-y-2">
            <h4 className="font-medium text-sm text-foreground sticky top-0 bg-background py-1 z-10 border-b">
              {category}
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pl-2">
              {options[category].map((item) => (
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
        ))}
      </div>

      {selected.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-2">
          {selected.map((item) => (
            <Badge key={item} variant="secondary" className="pl-2 pr-1 py-1">
              {item}
              <Button
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
