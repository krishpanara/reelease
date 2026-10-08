'use client'

import SocialActivityContent from '@/components/feature/social-media/activity/SocialActivityContent'
import { PageHeader } from '@/components/reusable/PageHeader'
import { Button } from '@/components/ui/button'
import { ROUTES } from '@/constants/routes'
import { CalendarIcon, Clock3, Send } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Suspense } from 'react'
import { useTranslation } from 'react-i18next'

const SocialActivityPage = () => {
  const router = useRouter()
  const { t } = useTranslation()
  return (
    <div className="space-y-6">
      <PageHeader
        icon={<Clock3 className="w-6 h-6 text-primary animate-pulse" />}
        title={t('social_activity')}
        subtitle={t('social_activity_desc', { defaultValue: 'Manage your social media activity' })}
        showBackButton={false}
        endContent={
          <>
            <Button
              variant="ghost"
              onClick={() => router.push(ROUTES.SOCIAL_MEDIA.CALENDAR)}
              title={t('publish_calendar', { defaultValue: 'Publish Calendar' })}
              className="h-10 w-10 p-0! dark:bg-white/3! dark:text-white text-black border border-glass-border bg-black/3 hover:bg-primary hover:text-white transition-all animate-fade-in flex items-center justify-center shrink-0"
            >
              <CalendarIcon className="w-5 h-5" />
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push(ROUTES.SOCIAL_MEDIA.COMPOSER)}
              className="flex w-full sm:w-auto items-center justify-center gap-2 px-6 rounded-border-radius primary-btn text-white! font-bold transition-all"
            >
              <Send className="w-4 h-4" />
              {t('publish_post')}
            </Button>
          </>
        }
      />

      <Suspense fallback={<div className="flex items-center justify-center min-h-100">{t('loading_activity')}</div>}>
        <SocialActivityContent />
      </Suspense>
    </div>
  )
}

export default SocialActivityPage
