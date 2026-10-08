'use client'

import TextAreaField from '@/components/shared/form-fields/TextAreaField'
import TextInput from '@/components/shared/form-fields/TextInput'
import { Card } from '@/components/ui/card'
import { Globe } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export default function BlogSEOInfo() {
  const { t } = useTranslation()

  return (
    <Card className="rounded-[2.5rem] border border-border/40 overflow-hidden p-4 sm:p-6 space-y-8 border-t-secondary/10 dark:bg-white/3 bg-white">
      <div className="flex items-center gap-3 text-secondary">
        <Globe className="h-6 w-6 text-primary" />
        <h3 className="text-xl font-medium text-title-color dark:text-white">{t('seo_optimization_settings')}</h3>
      </div>

      <div className="space-y-6">
        <TextInput
          name="meta_title"
          label={t('search_engine_title')}
          placeholder={t('enter_meta_title')}
          className="h-14 rounded-2xl bg-background/50 border-border/40"
        />
        <TextAreaField
          name="meta_description"
          label={t('search_engine_description')}
          placeholder={t('enter_meta_description')}
          rows={4}
          className="rounded-2xl bg-background/50 border-border/40"
        />
      </div>
    </Card>
  )
}
