'use client'

import { PageHeader } from '@/components/reusable/PageHeader'
import { LayoutDashboard } from 'lucide-react'
import { Suspense } from 'react'
import { useTranslation } from 'react-i18next'
import SocialDashboard from '@/components/feature/social-media/dashboard/SocialDashboard'
import Spinner from '@/components/reusable/Spinner'

const SocialDashboardPage = () => {
  const { t } = useTranslation()

  return (
    <div className="space-y-6">
      <PageHeader
        icon={<LayoutDashboard className="w-6 h-6 text-primary animate-pulse"  />}
        title={t('social_media_dashboard', { defaultValue: 'Social Media Dashboard' })}
        subtitle={t('social_media_dashboard_desc', {
          defaultValue: 'Overview of your social media activity and performance',
        })}
        showBackButton={false}
      />

      <Suspense fallback={<Spinner />}>
        <SocialDashboard />
      </Suspense>
    </div>
  )
}

export default SocialDashboardPage
