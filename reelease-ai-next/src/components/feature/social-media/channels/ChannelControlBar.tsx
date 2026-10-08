'use client'

import { Button } from '@/components/ui/button'
import Input from '@/components/ui/input'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { platformsConfig } from '@/data/socialMedia'
import { ChannelControlBarProps, ChannelSortOption } from '@/types/components/features'
import { LayoutGrid, List, Search, SlidersHorizontal, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export const ChannelControlBar = ({
  searchQuery,
  onSearchChange,
  viewMode,
  onViewModeChange,
  platformFilter,
  onPlatformFilterChange,
  statusFilter,
  onStatusFilterChange,
  sortBy,
  onSortChange,
  onClearFilters,
  hasActiveFilters,
}: ChannelControlBarProps) => {
  const { t } = useTranslation()

  return (
    <div className="flex flex-col xl:flex-row items-stretch xl:items-center gap-3">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-subtitle-color" />
        <Input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={t('search_channels_or_accounts', { defaultValue: 'Search channels or accounts...' })}
          className="w-full pl-10 pr-9 rounded-border-radius-inner! border border-glass-border text-sm bg-white"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => onSearchChange('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Select value={platformFilter} onValueChange={onPlatformFilterChange}>
          <SelectTrigger className="w-[140px] rounded-[9px] border-glass-border text-xs bg-white font-bold h-11!">
            <SelectValue placeholder={t('all_platforms', { defaultValue: 'All Platforms' })} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('all_platforms', { defaultValue: 'All Platforms' })}</SelectItem>
            {platformsConfig.map((p) => (
              <SelectItem key={p.id} value={p.id}>
                {p.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={onStatusFilterChange}>
          <SelectTrigger className="w-[120px] rounded-[9px] border-glass-border text-xs bg-white font-bold h-11!">
            <SelectValue placeholder={t('status', { defaultValue: 'Status' })} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('all_statuses', { defaultValue: 'All Statuses' })}</SelectItem>
            <SelectItem value="ACTIVE">{t('active', { defaultValue: 'Active' })}</SelectItem>
            <SelectItem value="PAUSED">{t('paused', { defaultValue: 'Paused' })}</SelectItem>
          </SelectContent>
        </Select>

        {/* <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                'px-3 h-9! rounded-xl border-glass-border text-title! dark:bg-white/3 text-xs bg-white font-bold gap-2',
                hasActiveFilters && 'border-primary/40  bg-primary/10 text-primary',
              )}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              {t('filters', { defaultValue: 'Filters' })}
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-56 glass-card border-glass-border rounded-[9px] p-3 space-y-2 h-11!">
            <p className="text-xs  font-bold text-muted-foreground uppercase tracking-wider px-1">
              {t('active_filters', { defaultValue: 'Active Filters' })}
            </p>
            <p className="text-sm text-foreground px-1">
              {platformFilter !== 'all' && (
                <span className="block">
                  {t('platform', { defaultValue: 'Platform' })}: {platformFilter}
                </span>
              )}
              {statusFilter !== 'all' && (
                <span className="block">
                  {t('status', { defaultValue: 'Status' })}: {statusFilter}
                </span>
              )}
              {searchQuery && (
                <span className="block">
                  {t('search', { defaultValue: 'Search' })}: {searchQuery}
                </span>
              )}
              {!hasActiveFilters && (
                <span className="text-muted-foreground">
                  {t('no_filters_applied', { defaultValue: 'No filters applied' })}
                </span>
              )}
            </p>
            {hasActiveFilters && (
              <Button variant="outline" size="sm" onClick={onClearFilters} className="w-full rounded-full text-xs bg-black/3 dark:bg-white/3">
                {t('clear_filters', { defaultValue: 'Clear Filters' })}
              </Button>
            )}
          </PopoverContent>
        </Popover> */}

        <Select value={sortBy} onValueChange={(v) => onSortChange(v as ChannelSortOption)}>
          <SelectTrigger className=" w-[130px] bg-white  border-glass-border dark:bg-white/3 text-xs font-bold rounded-[9px] h-11!">
            <SelectValue placeholder={t('sort', { defaultValue: 'Sort' })} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name_asc">{t('name_a_z', { defaultValue: 'Name (A-Z)' })}</SelectItem>
            <SelectItem value="name_desc">{t('name_z_a', { defaultValue: 'Name (Z-A)' })}</SelectItem>
            <SelectItem value="platform">{t('platform', { defaultValue: 'Platform' })}</SelectItem>
            <SelectItem value="recent">{t('recently_connected', { defaultValue: 'Recently Connected' })}</SelectItem>
            <SelectItem value="status">{t('status', { defaultValue: 'Status' })}</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex items-center bg-white dark:bg-white/3 border border-glass-border  p-1 h-11! rounded-[9px]">
          <Button
            onClick={() => onViewModeChange('grid')}
            variant="ghost"
            className={cn(
              'h-9! w-9! p-0! rounded-[8px]! hover:[unset]',
              viewMode === 'grid' ? 'primary-btn text-primary-foreground!' : 'text-title-color!',
            )}
            title={t('grid_view', { defaultValue: 'Grid view' })}
          >
            <LayoutGrid className="w-3 h-3" />
          </Button>
          <Button
            onClick={() => onViewModeChange('list')}
            variant="ghost"
            className={cn(
              'h-9! w-9! p-0! rounded-[8px]! hover:[unset]',
              viewMode === 'list' ? 'primary-btn text-primary-foreground!' : 'text-title-color!',
            )}
            title={t('list_view', { defaultValue: 'List view' })}
          >
            <List className="w-3 h-3" />
          </Button>
        </div>
      </div>
    </div>
  )
}
