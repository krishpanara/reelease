'use client'

import { Button } from '@/components/ui/button'
import { DailyPromptHeaderProps } from '@/types'
import { Dices, Loader2, Sparkles } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export const DailyPromptHeader = ({ isLoading, isRotating, onShuffle }: DailyPromptHeaderProps) => {
  const { t } = useTranslation()

  return (
    <div className="relative z-10 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-full primary-btn border border-primary/20 bg-primary/10 shadow-[0_0_15px_rgba(var(--primary-rgb),0.2)]">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-title-color dark:text-white mb-0 tracking-tight flex items-center gap-2 leading-none">
            {t('prompt_of_the_day', { defaultValue: 'Prompt of the Day' })}
          </h3>
          <p className="text-xs text-subtitle-color font-medium leading-relaxed mt-1 line-clamp-2">
            {t('prompt_of_the_day_desc', { defaultValue: 'Get daily creative ideas for your AI generators' })}
          </p>
        </div>
      </div>

      <Button
        variant="ghost"
        size="icon"
        className="w-9 h-9 rounded-full border border-glass-border text-subtitle-color transition-all cursor-pointer shrink-0"
        onClick={onShuffle}
        title={t('shuffle_prompt', { defaultValue: 'Shuffle Prompt' })}
        disabled={isLoading}
      >
        {isLoading ? (
          <Loader2 className="w-5 h-5 animate-spin text-primary" />
        ) : (
          <Dices
            className={`w-5 h-5 transition-transform duration-500 ${isRotating ? 'rotate-[360deg] scale-110' : ''
              }`}
          />
        )}
      </Button>
    </div>
  )
}
