'use client'

import { Suspense, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChartNetwork, Settings } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import ChannelsContent from '@/components/feature/social-media/channels/ChannelsContent'
import ChannelsPageHeaderActions from '@/components/feature/social-media/channels/ChannelsPageHeaderActions'
import { PageHeader } from '@/components/reusable/PageHeader'
import { Button } from '@/components/ui/button'
import { ROUTES } from '@/constants/routes'
import { usePermission } from '@/hooks/usePermission'

const ChannelsPage = () => {
  const { t } = useTranslation()
  const router = useRouter()
  const { isAdmin } = usePermission()

  return (
    <div className="space-y-6">
      <PageHeader
        icon={<ChartNetwork className="w-6 h-6 text-primary animate-pulse" />}
        title={t('channels', { defaultValue: 'Channels' })}
        subtitle={t('channels_desc', { defaultValue: 'Manage your social media channels' })}
        showBackButton={false}
        endContent={
          <div className="flex flex-wrap items-center gap-2 lg:justify-end justify-center w-full sm:w-auto">
            <ChannelsPageHeaderActions />
            {isAdmin() && (
              <Button
                variant="outline"
                onClick={() => router.push(`${ROUTES.APP_SETTINGS.HOME}?tab=social`)}
                className="flex items-center gap-2 p-0! w-10 h-10  rounded-xl bg-white/5 border border-white/10 text-sm font-medium hover:bg-white/10 transition-all shrink-0"
              >
                <Settings className="w-5 h-5" />
              </Button>
            )}
          </div>
        }
      />

      <Suspense fallback={<div className="flex items-center justify-center min-h-[400px]">Loading channels...</div>}>
        <ChannelsContent />
      </Suspense>
    </div>
  )
}

export default ChannelsPage
