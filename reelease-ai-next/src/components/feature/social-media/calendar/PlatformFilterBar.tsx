'use client'

import { Button } from '@/components/ui/button'
import { platformsConfig } from '@/data/socialMedia'
import { PlatformFilterBarProps } from '@/types/socialMedia'
import { X, LayoutGrid } from 'lucide-react'
import { cn } from '@/lib/utils'

export function PlatformFilterBar({
  selectedPlatforms,
  togglePlatformFilter,
  selectedContentTypes,
  selectedStatus,
  search,
  clearAllFilters,
}: PlatformFilterBarProps) {
  const hasActiveFilters =
    selectedPlatforms.length > 0 || selectedContentTypes.length > 0 || selectedStatus !== 'all' || search

  return (
    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 w-full rounded-2xl border border-glass-border bg-white dark:bg-white/3 p-3 overflow-hidden">
      <div className="flex items-center gap-3 overflow-x-auto no-scrollbar w-full md:w-auto flex-1 py-1 px-1">
        <span className="text-sm font-semibold text-subtitle-color hidden md:block shrink-0">Platforms:</span>
        <div className="flex items-center gap-2 w-max">
          <Button
            variant="ghost"
            onClick={clearAllFilters}
            className={cn(
              'h-9 px-4 py-2! rounded-border-radius-inner! text-sm font-semibold gap-2 transition-all duration-300 shrink-0 border flex items-center',
              selectedPlatforms.length === 0
                ? 'primary-btn text-white! border-none! shadow-sm'
                : 'bg-white dark:bg-white/3! border-glass-border hover:border-primary/50 text-title-color!'
            )}
          >
            <LayoutGrid className={cn("w-4 h-4 shrink-0", selectedPlatforms.length === 0 ? "text-white" : "text-primary")} />
            <span>All Platforms</span>
          </Button>

          {platformsConfig.map((platform) => {
            const active = selectedPlatforms.includes(platform.id)
            const Icon = platform.icon
            const platColor = platform.color || '#000000'

            return (
              <Button
                key={platform.id}
                onClick={() => togglePlatformFilter(platform.id)}
                variant="ghost"
                className={cn(
                  'h-9 px-4 py-2! rounded-border-radius-inner! text-sm font-semibold gap-2 transition-all duration-300 shrink-0 border flex items-center',
                  active
                    ? cn(
                        platform.bg,
                        platform.id === 'threads' ? 'text-black! dark:text-white!' : 'text-white!',
                        platform.id !== 'threads' && 'border-none!',
                        'shadow-sm'
                      )
                    : 'bg-white dark:bg-white/3! border-glass-border hover:border-primary/50',
                  !active && platColor === '#000000' && 'text-foreground!'
                )}
                style={
                  !active && platColor !== '#000000'
                    ? { color: platColor }
                    : undefined
                }
              >
                <Icon
                  className={cn(
                    "w-4 h-4 shrink-0",
                    active
                      ? (platform.id === 'threads' ? "text-black dark:text-white" : "text-white")
                      : ""
                  )}
                  filled={!active}
                />
                <span>{platform.label}</span>
              </Button>
            )
          })}
        </div>
      </div>
      
      {hasActiveFilters && (
        <Button
          onClick={clearAllFilters}
          className="text-sm h-9 ml-auto font-bold rounded-full flex items-center gap-1 bg-destructive! text-white! border-0 shrink-0 px-4"
        >
          <X className="w-3 h-3" /> Clear All filters
        </Button>
      )}
    </div>
  )
}
