'use client'

import Input from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { Search } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Pagination } from './Pagination'
import Spinner from './Spinner'
import { Skeleton } from '@/components/ui/skeleton'
import { DataCardGridProps } from '@/types'


export function DataCardGrid<T>({
  data,
  renderCard,
  renderSkeleton,
  currentPage = 1,
  totalPages = 1,
  totalResults = 0,
  onPageChange,
  isLoading = false,
  emptyMessage,
  onRowsPerPageChange,
  rowsPerPage,
  searchValue,
  onSearchChange,
  searchPlaceholder,
  gridClassName,
  hasImages = false,
}: DataCardGridProps<T>) {
  const { t } = useTranslation()
  const [isSearchFocused, setIsSearchFocused] = useState(false)

  const defaultEmptyMessage = emptyMessage || t('no_results')
  const showToolbar = !!(onSearchChange || onRowsPerPageChange)

  return (
    <div className="space-y-6">
      {showToolbar && (
        <div className="flex items-center justify-between gap-3 mb-0 flex-wrap">
          <div className="flex flex-row gap-3 flex-1">
            {onSearchChange && (
              <div
                className={cn(
                  'relative transition-all duration-300 ease-in-out',
                  isSearchFocused ? 'w-full sm:max-w-md' : 'w-full sm:max-w-sm',
                )}
              >
                <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                <Input
                  placeholder={searchPlaceholder || t('search')}
                  value={searchValue || ''}
                  onChange={(e) => onSearchChange(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setIsSearchFocused(false)}
                  className="ps-9 h-11 w-full bg-white/3 border border-glass-border rounded-xl focus:ring-primary/20 transition-all"
                />
              </div>
            )}
          </div>
        </div>
      )}

      {isLoading ? (
        <div className={cn("grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6", gridClassName)}>
          {Array.from({ length: rowsPerPage || 8 }).map((_, i) => 
            renderSkeleton ? (
              renderSkeleton(i)
            ) : (
              <div
                key={i}
                className={cn(
                  "glass-card rounded-border-radius border border-glass-border bg-white dark:bg-white/3 flex flex-col animate-pulse overflow-hidden",
                  hasImages ? "p-2 h-[340px]" : "p-4 sm:p-6 h-[200px]"
                )}
              >
                {hasImages ? (
                  <>
                    {/* Thumbnail skeleton */}
                    <Skeleton className="relative flex-none aspect-[16/10] rounded-border-radius bg-slate-200/80 dark:bg-white/10 mb-4" />
                    
                    {/* Title & switch skeleton */}
                    <div className="flex justify-between items-center w-full px-2">
                      <Skeleton className="w-1/2 h-5 bg-slate-200/80 dark:bg-white/10 rounded" />
                      <Skeleton className="w-10 h-5 rounded-full bg-slate-200/80 dark:bg-white/10" />
                    </div>

                    {/* Category badge */}
                    <div className="px-2 pt-2">
                      <Skeleton className="w-16 h-5 rounded-full bg-slate-200/80 dark:bg-white/10" />
                    </div>

                    {/* Prompt/Description */}
                    <div className="space-y-1.5 px-2 pt-3 flex-1">
                      <Skeleton className="w-full h-3 bg-slate-200/80 dark:bg-white/10 rounded" />
                      <Skeleton className="w-4/5 h-3 bg-slate-200/80 dark:bg-white/10 rounded" />
                    </div>
                  </>
                ) : (
                  <>
                    {/* Top Row: Avatar and Action buttons */}
                    <div className="flex justify-between items-center w-full">
                      <Skeleton className="w-12 h-12 rounded-full bg-slate-200/80 dark:bg-white/10 shrink-0" />
                      <div className="flex gap-2">
                        <Skeleton className="w-7 h-7 rounded-full bg-slate-200/80 dark:bg-white/10" />
                        <Skeleton className="w-7 h-7 rounded-full bg-slate-200/80 dark:bg-white/10" />
                      </div>
                    </div>

                    {/* Title & Status Toggle */}
                    <div className="flex justify-between items-center w-full pt-2">
                      <Skeleton className="w-1/2 h-5 bg-slate-200/80 dark:bg-white/10 rounded" />
                      <Skeleton className="w-10 h-5 rounded-full bg-slate-200/80 dark:bg-white/10" />
                    </div>

                    {/* Description / Content lines */}
                    <div className="space-y-2 pt-2 flex-1">
                      <Skeleton className="w-full h-3 bg-slate-200/80 dark:bg-white/10 rounded" />
                      <Skeleton className="w-5/6 h-3 bg-slate-200/80 dark:bg-white/10 rounded" />
                    </div>

                    {/* Footer / Badge */}
                    <div className="pt-2">
                      <Skeleton className="w-16 h-5 rounded-full bg-slate-200/80 dark:bg-white/10" />
                    </div>
                  </>
                )}
              </div>
            )
          )}
        </div>
      ) : data.length > 0 ? (
        <div className={cn("grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6", gridClassName)}>
          {data.map((item, index) => (
            <div key={index}>
              {renderCard(item)}
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center min-h-90 dark:bg-white/3 bg-white rounded-border-radius border-2 border-dashed border-glass-border sm:p-12 p-6 text-center">
          <div className="w-16 h-16 rounded-full bg-primary/5 flex items-center justify-center mb-4">
            <Search className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-xl font-bold text-title-color dark:text-white mb-2">{t('no_results_found')}</h3>
          <p className="text-subtitle-color max-w-sm">{defaultEmptyMessage}</p>
        </div>
      )}

      {onPageChange && totalPages > 0 && (
        <div className="pt-6 border-t border-glass-border">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={onPageChange}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={onRowsPerPageChange}
            showRowsPerPage={true}
            totalResults={totalResults || (totalPages <= 1 ? data.length : 0)}
          />
        </div>
      )}
    </div>
  )
}
