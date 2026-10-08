import { promptStatsConfig } from '@/data/aiTemplates'
import { PromptLibraryStatsProps } from '@/types/components/ai-prompts'
import { useTranslation } from 'react-i18next'

export function PromptLibraryStats({ total, categoriesCount, currentPageCount }: PromptLibraryStatsProps) {
  const { t } = useTranslation()
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-6 gap-6">
      {promptStatsConfig.map((stat) => {
        const Icon = stat.icon
        let value = 0
        if (stat.valueKey === 'total') value = total
        if (stat.valueKey === 'categoriesCount') value = categoriesCount
        if (stat.valueKey === 'currentPageCount') value = currentPageCount

        return (
          <div key={stat.id} className="glass-card bg-white dark:bg-white/3 gradient-border rounded-border-radius p-5 flex items-center gap-5">
            <div className="w-10 h-10 rounded-radius bg-primary/10 flex items-center justify-center shrink-0">
              <Icon className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t(stat.labelKey, { defaultValue: stat.defaultLabel })}</p>
              <p className="text-xl font-bold text-foreground">{value}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
