'use client'

import React, { useState } from 'react'
import { Check, ChevronDown, Search, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import Input from '@/components/ui/input'
import Label from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { MultiSelectFieldProps } from '@/types'

export default function MultiSelectField({
  label,
  options,
  value,
  onChange,
  placeholder,
  error,
  className
}: MultiSelectFieldProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')

  const selectedOptions = options.filter(opt => value.includes(opt.value))
  const filteredOptions = options.filter(opt => opt.label.toLowerCase().includes(search.toLowerCase()))

  const toggleOption = (optionValue: string) => {
    const newValue = value.includes(optionValue)
      ? value.filter(v => v !== optionValue)
      : [...value, optionValue]
    onChange(newValue)
  }

  const removeOption = (e: React.MouseEvent, optionValue: string) => {
    e.stopPropagation()
    onChange(value.filter(v => v !== optionValue))
  }

  return (
    <div className={cn('space-y-2 flex flex-col', className)}>
      {label && <Label className="text-sm font-medium dark:text-white text-black">{label}</Label>}

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <div
            className={cn(
              "flex min-h-[3rem]  oveflow-auto custom-scrollbar w-full items-center justify-between rounded-radius inner-card bg-white/3! px-3 py-2 text-sm transition-all hover:bg-background/80 cursor-pointer focus-within:border-primary/50",
              error && "border-destructive/50",
              open && "border-primary/50"
            )}
          >
            <div className="flex flex-wrap gap-1.5 flex-1 items-center">
              {selectedOptions.length > 0 ? (
                selectedOptions.map((option) => (
                  <Badge
                    key={option.value}
                    variant="secondary"
                    className="pl-2 rtl:pr-3 rtl:pl-0 group pr-1 py-0.5 h-8 rounded-md bg-primary/20 hover:bg-primary hover:text-white! text-primary border-primary/50 flex items-center gap-1 group transition-all"
                  >
                    <span className="text-xs font-medium leading-none">{option.label}</span>
                    <Button
                      onClick={(e) => removeOption(e, option.value)}
                      className="rounded-sm group-hover:text-white!  bg-[unset]! p-2! text-primary/50!   transition-all"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </Badge>
                ))
              ) : (
                <span className="text-muted-foreground ml-1">
                  {placeholder || `Select options...`}
                </span>
              )}
            </div>
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50 transition-transform duration-200 group-data-[state=open]:rotate-180" />
          </div>
        </PopoverTrigger>
        <PopoverContent
          className="w-[var(--radix-popover-trigger-width)] p-2 rounded-border-radius! glass-dark-card border-border/40 shadow-xl/5 z-[9999]"
          align="start"
        >
          <div className="relative mb-2">
            <Search className="absolute left-3 rtl:left-auto rtl:right-3 top-1/2  -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search..."
              value={search}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
              className="pl-9  rtl:pr-9  h-10 bg-background border-glass-border rounded-lg focus:bg-background"
            />
          </div>
          <div className="max-h-60 overflow-y-auto no-scrollbar space-y-0.5">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => {
                const isSelected = value.includes(option.value)
                return (
                  <div
                    key={option.value}
                    onClick={() => toggleOption(option.value)}
                    className={cn(
                      "flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-all ",
                      isSelected ? "bg-primary/10 text-primary font-medium" : "hover:bg-primary/5 text-muted-foreground"
                    )}
                  >
                    <div className={cn(
                      "w-4 h-4 rounded border flex items-center justify-center transition-all",
                      isSelected ? "bg-primary border-primary text-white" : "border-border/60 bg-background/20"
                    )}>
                      {isSelected && <Check className="w-3 h-3" strokeWidth={3} />}
                    </div>
                    <span className="text-sm truncate">{option.label}</span>
                  </div>
                )
              })
            ) : (
              <div className="p-4 text-center text-sm text-subtitle-color">
                No results found.
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>

      {error && <p className="text-xs text-destructive mt-1 font-medium">{error}</p>}
    </div>
  )
}
