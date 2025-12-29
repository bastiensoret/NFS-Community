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
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"

export interface CategorizedDropdownMultiSelectProps {
  options: Record<string, string[]>
  selected: string[]
  onChange: (selected: string[]) => void
  placeholder?: string
  className?: string
  maxItems?: number
}

export function CategorizedDropdownMultiSelect({
  options,
  selected,
  onChange,
  placeholder = "Select items...",
  className,
  maxItems = 5
}: CategorizedDropdownMultiSelectProps) {
  const [open, setOpen] = React.useState(false)
  const [searchValue, setSearchValue] = React.useState("")

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

  // Flatten options for search
  const allOptions = Object.entries(options).flatMap(([category, items]) => 
    items.map(item => ({ category, item }))
  )

  const filteredOptions = allOptions.filter(({ item }) => 
    item.toLowerCase().includes(searchValue.toLowerCase())
  )

  // Group filtered options by category
  const groupedOptions = filteredOptions.reduce((acc, { category, item }) => {
    if (!acc[category]) acc[category] = []
    acc[category].push(item)
    return acc
  }, {} as Record<string, string[]>)

  const displayItems = selected.slice(0, maxItems)
  const remainingCount = selected.length - maxItems

  return (
    <div className={cn("space-y-2", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between h-auto min-h-[42px] py-2"
          >
            <div className="flex flex-wrap gap-1">
              {selected.length === 0 ? (
                <span className="text-muted-foreground">{placeholder}</span>
              ) : (
                <>
                  {displayItems.map((item) => (
                    <Badge key={item} variant="secondary" className="text-xs">
                      {item}
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-3 w-3 ml-1 hover:bg-transparent p-0"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleRemove(item)
                        }}
                      >
                        <X className="h-2 w-2" />
                        <span className="sr-only">Remove {item}</span>
                      </Button>
                    </Badge>
                  ))}
                  {remainingCount > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      +{remainingCount} more
                    </Badge>
                  )}
                </>
              )}
            </div>
            <ChevronsUpDown className="h-4 w-4 opacity-50 shrink-0" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command>
            <CommandInput 
              placeholder="Search options..." 
              value={searchValue}
              onValueChange={setSearchValue}
            />
            <CommandList>
              <CommandEmpty>No options found.</CommandEmpty>
              <ScrollArea className="h-64">
                {Object.entries(groupedOptions).map(([category, items], index) => (
                  <React.Fragment key={category}>
                    <CommandGroup heading={category}>
                      {items.map((item) => (
                        <CommandItem
                          key={item}
                          value={item}
                          onSelect={() => handleSelect(item)}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              selected.includes(item) ? "opacity-100" : "opacity-0"
                            )}
                          />
                          {item}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                    {index < Object.keys(groupedOptions).length - 1 && <CommandSeparator />}
                  </React.Fragment>
                ))}
              </ScrollArea>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {selected.length > 0 && (
        <div className="flex justify-between items-center">
          <span className="text-xs text-muted-foreground">
            {selected.length} item{selected.length !== 1 ? 's' : ''} selected
          </span>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-auto p-0 text-xs"
            onClick={() => onChange([])}
          >
            Clear all
          </Button>
        </div>
      )}
    </div>
  )
}
