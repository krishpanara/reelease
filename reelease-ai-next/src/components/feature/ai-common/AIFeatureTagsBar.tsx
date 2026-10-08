'use client'

import { AIFeatureTagsBarProps } from '@/types/components/features'



export function AIFeatureTagsBar({ tags }: AIFeatureTagsBarProps) {
  return (
    <div className="flex flex-wrap gap-2 py-1">
      {tags.map((tag) => {
        const Icon = tag.icon
        return (
          <span
            key={tag.label}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-white dark:bg-white/3 border border-slate-200 dark:border-white/5 text-slate-600 dark:text-slate-300"
          >
            <Icon className={`w-3.5 h-3.5 ${tag.iconClassName || ''}`} />
            {tag.label}
          </span>
        )
      })}
    </div>
  )
}
