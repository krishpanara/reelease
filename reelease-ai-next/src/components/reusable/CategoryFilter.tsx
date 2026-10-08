'use client'

import { Button } from '@/components/ui/button'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import { CategoryFilterProps } from '@/types/components/category'

export function CategoryFilter({
  categories,
  activeCategory,
  onCategoryChange,
  allLabel,
  nameKey = 'name',
  valueKey = 'slug',
}: CategoryFilterProps) {
  const { t } = useTranslation()

  return (
    <div className="relative group/filter">
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2 px-1 -mx-1 mask-fade-right">
        <div className="flex items-center gap-2 shrink-0">
          <Button
            onClick={() => onCategoryChange('')}
            className={cn(
              "text-xs px-4 py-2 rounded-full border transition-all h-auto shrink-0 font-medium ",
              !activeCategory
                ? 'text-primary! border-primary!'
                : 'border-glass-border bg-white!  dark:bg-white/3! text-subtitle-color! '
            )}
          >
            {allLabel || t('all', { defaultValue: 'All' })}
          </Button>
          {categories.map((cat) => {
            const filterValue = cat[valueKey] || cat[nameKey]
            return (
              <Button
                key={cat._id || cat.id}
                onClick={() => onCategoryChange(filterValue === activeCategory ? '' : filterValue)}
                className={cn(
                  "text-xs px-4 py-2 rounded-full border transition-all h-auto shrink-0 font-medium",
                  activeCategory === filterValue
                    ? ' text-primary! border-primary!'
                    : 'border-glass-border bg-white!  dark:bg-white/3! text-subtitle-color!'
                )}
              >
                {cat[nameKey]}
              </Button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
