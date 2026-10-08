'use client'

import { SupportFaqClient } from '@/components/feature/support'
import { PageHeader } from '@/components/reusable/PageHeader'
import { HelpCircle } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export default function SupportFaqPage() {
  const { t } = useTranslation()
  return (
    <div className="space-y-6 pb-2">
      <PageHeader
        icon={<HelpCircle className="w-6 h-6 text-primary animate-pulse" />}
        title={t('knowledge_base')}
        subtitle={t('knowledge_base_desc', {
          defaultValue:
            'Manage FAQs, help articles, and support content for your users from one centralized knowledge base.',
        })}
        showBackButton={false}
      />

      <SupportFaqClient />
    </div>
  )
}
