'use client'

import { Suspense } from 'react'
import { BarChart3 } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import AnalyticsContent from '@/components/feature/social-media/analytics/AnalyticsContent'
import { PageHeader } from '@/components/reusable/PageHeader'

const AnalyticsPage = () => {
  const { t } = useTranslation()

  return (
    <div className="space-y-6">
      <PageHeader
        icon={<BarChart3 className="w-6 h-6 text-primary animate-pulse" />}
        title={t('social_analytics', { defaultValue: 'Social Analytics' })}
        subtitle={t('social_analytics_desc', { defaultValue: 'Analyze your performance and engagement across all platforms' })}
        showBackButton={false}
      />

      <Suspense fallback={<div className="flex items-center justify-center min-h-[400px]">Loading analytics...</div>}>
        <AnalyticsContent />
      </Suspense>
    </div>
  )
}

export default AnalyticsPage
