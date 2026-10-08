'use client'

import { AIProTipsCardProps } from '@/types/components/features'
import { Lightbulb } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export function AIProTipsCard({ tips }: AIProTipsCardProps) {
  const { t } = useTranslation()

  return (
    <div className="bg-white dark:bg-white/3 border border-slate-200 dark:border-white/5 rounded-2xl p-5 space-y-3">
      <div className="flex items-center gap-2 text-amber-400">
        <Lightbulb className="w-4 h-4" />
        <h4 className="text-base font-bold">{t('pro_tips', { defaultValue: 'Pro Tips' })}</h4>
      </div>
      <p className="text-sm text-subtitle-color leading-relaxed font-medium">{tips}</p>
      <div className="space-y-1.5 text-xs text-slate-450  ">
        <p className="font-semibold text-[11px] text-slate-500">{t('example_prompts', { defaultValue: 'Example prompts:' })}</p>
        <ul className="list-disc pl-4 space-y-1">
          <li>A slow cinematic zoom in with depth of field and soft lighting</li>
          <li>Drone flyover with smooth parallax over a mountain landscape</li>
        </ul>
      </div>
    </div>
  )
}
