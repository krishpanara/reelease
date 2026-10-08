'use client'

import { Button } from '@/components/ui/button'
import { Clock, Sparkles } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useTranslation } from 'react-i18next'
import { ROUTES } from '@/constants/routes'
import { PageHeader } from '@/components/reusable/PageHeader'
import { AIFeaturePageHeaderProps } from '@/types/components/features'



export function AIFeaturePageHeader({ title, subtitle, icon }: AIFeaturePageHeaderProps) {
  const { t } = useTranslation()
  const router = useRouter()

  return (
    <PageHeader
      icon={icon || <Sparkles className="w-6 h-6 text-primary animate-pulse" />}
      title={title}
      subtitle={subtitle}
      showBackButton={false}
      endContent={
        <div className="justify-end items-end flex-wrap gap-3 flex">
          <Button
            onClick={() => router.push(ROUTES.USAGE_LOGS)}
            variant="outline"
            className="h-10 rounded-xl bg-slate-50 dark:bg-white/3 border border-slate-200 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5 text-slate-700 dark:text-white gap-2 font-bold text-xs shrink-0 self-start md:self-center"
          >
            <Clock className="w-4 h-4 text-purple-400" />
            {t('generation_history', { defaultValue: 'Generation History' })}
          </Button>
        </div>
      }
    />
  )
}
