import { PromptLibraryEmptyStateProps } from '@/types/components/ai-prompts'
import { BookOpen } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export function PromptLibraryEmptyState({ search, categoryFilter, handleOpenCreate }: PromptLibraryEmptyStateProps) {
  const { t } = useTranslation()
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center space-y-3">
      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
        <BookOpen className="w-8 h-8 text-primary" />
      </div>
      <p className="text-lg font-semibold text-foreground mb-0">
        {t('no_prompts_found', { defaultValue: 'No prompts found' })}
      </p>
      <p className="text-sm text-muted-foreground max-w-sm">
        {search || categoryFilter
          ? t('no_prompts_match_filter', { defaultValue: 'Try clearing your search or filter.' })
          : t('start_adding_prompts', { defaultValue: 'Click "Add Prompt" to start building your library.' })}
      </p>
    </div>
  )
}
