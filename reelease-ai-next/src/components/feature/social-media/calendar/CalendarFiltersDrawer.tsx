'use client'

import { Button } from '@/components/ui/button'
import { contentTypes, statuses } from '@/data/socialMedia'
import { CalendarFiltersDrawerProps } from '@/types/socialMedia'

export function CalendarFiltersDrawer({
  showFiltersPanel,
  selectedContentTypes,
  toggleContentTypeFilter,
  selectedStatus,
  setSelectedStatus,
  showDraftsFilter = false,
}: CalendarFiltersDrawerProps) {
  if (!showFiltersPanel) return null

  const filteredStatuses = showDraftsFilter
    ? statuses
    : statuses.filter((s) => s.id !== 'draft')

  return (
    <div className="absolute right-0 rtl:right-[unset] rtl:left-0 top-full mt-2 w-72 sm:w-80 bg-white dark:bg-light-body border border-glass-border rounded-border-radius p-4 glass-card shadow-2xl z-[100] animate-in fade-in slide-in-from-top-2 duration-200 grid grid-cols-1 gap-4">
      {/* Content Type Filter */}
      <div className="space-y-2">
        <span className="text-sm font-black text-title-color block text-left">
          Content Type
        </span>
        <div className="flex flex-wrap gap-2">
          {contentTypes.map((type) => {
            const active = selectedContentTypes.includes(type.id)
            return (
              <Button
                key={type.id}
                onClick={() => toggleContentTypeFilter(type.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${active
                  ? 'primary-btn text-white! border-primary'
                  : 'bg-black/5 dark:bg-white/3 text-muted-foreground dark:text-white border-glass-border hover:border-primary/30 hover:text-foreground'
                  }`}
              >
                {type.label}
              </Button>
            )
          })}
        </div>
      </div>

      {/* Status Filter Selection */}
      <div className="space-y-2 border-t border-glass-border pt-3">
        <span className="text-sm font-black text-title-color block text-left">
          Post Status
        </span>
        <div className="flex flex-wrap gap-2">
          {filteredStatuses.map((status) => {
            const active = selectedStatus === status.id
            return (
              <Button
                key={status.id}
                onClick={() => setSelectedStatus(status.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${active
                  ? 'primary-btn text-white! border-primary'
                  : 'bg-black/5 dark:bg-black/25 text-subtitle-color! border-glass-border hover:border-primary/30 hover:text-foreground'
                  }`}
              >
                {status.label}
              </Button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
