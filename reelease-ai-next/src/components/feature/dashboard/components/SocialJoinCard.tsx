'use client'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ROUTES } from '@/constants/routes'
import { channels } from '@/data/channels'
import { dashboardItemVariants } from '@/data/dashboard'
import { useGetSocialAccountsQuery } from '@/redux/api/socialApi'
import { motion } from 'framer-motion'
import { Check, Plus, Share2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useTranslation } from 'react-i18next'

export const SocialJoinCard = () => {
  const { t } = useTranslation()
  const router = useRouter()
  const { data: accountsData } = useGetSocialAccountsQuery(undefined)

  const connectedPlatforms = accountsData?.data?.map((acc: any) => acc.platform.toLowerCase()) || []

  const joinedChannels = channels.map((c) => ({
    ...c,
    isConnected: connectedPlatforms.includes(c.id),
  }))

  return (
    <motion.section className="col-span-1" variants={dashboardItemVariants}>
      <Card className="h-full gradient-border border border-white/10 rounded-border-radius transition-all duration-700 hover:border-white/20 relative overflow-hidden group/card">
        {/* Background Decorative */}
        <div className="absolute -top-10 ltr:-right-10 rtl:-left-10 w-32 h-32 bg-primary/10 rounded-full blur-3xl group-hover/card:bg-primary/20 transition-colors" />

        <div className="relative z-10 sm:p-5 p-4 flex flex-col h-full space-y-5">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-full transition-transform duration-700 group-hover/card:scale-110 ring-1 ring-white/10 bg-primary/5 text-primary">
              <Share2 className="w-6 h-6" />
            </div>
            <div className="space-y-0.5">
              <h3 className="lg:text-lg text-base font-medium text-title-color dark:text-white ">
                {t('wanna_join_channels', { defaultValue: 'Join Channels' })}
              </h3>
              <p className="text-xs text-subtitle-color font-medium ">
                {t('connect_to_expand_reach', { defaultValue: 'Expand your reach instantly' })}
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3 flex-1 justify-center">
            {joinedChannels.map((channel) => (
              <Button
                key={channel.id}
                variant="outline"
                onClick={() => !channel.isConnected && router.push(ROUTES.SOCIAL_MEDIA.CHANNELS)}
                className={`w-full justify-between h-11 bg-white/3 border-white/10 rounded-xl px-4 transition-all duration-500 group/btn ${channel.isConnected
                  ? 'cursor-default opacity-80 border-primary/20 bg-primary/5'
                  : 'hover:border-primary/50 cursor-pointer'
                  }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="p-1.5 rounded-lg flex items-center justify-center transition-transform duration-500 group-hover/btn:scale-110"
                    style={{
                      backgroundColor: channel.isConnected ? 'rgba(var(--primary), 0.1)' : `${channel.color}20`,
                      color: channel.isConnected ? 'var(--primary)' : channel.color,
                    }}
                  >
                    <channel.icon className="w-4 h-4" />
                  </div>
                  <span
                    className={`text-sm font-semibold transition-colors ${channel.isConnected ? 'text-primary' : 'text-subtitle-color dark:text-white/80 dark:group-hover/btn:text-white group-hover/btn:text-primary'
                      }`}
                  >
                    {channel.name}
                  </span>
                </div>
                {channel.isConnected ? (
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold text-primary/60 uppercase tracking-tight">
                      {t('connected', 'Connected')}
                    </span>
                    <Check className="w-4 h-4 text-primary" />
                  </div>
                ) : (
                  <Plus className="w-4 h-4 text-white/20 group-hover/btn:text-primary group-hover/btn:rotate-90 transition-all duration-500" />
                )}
              </Button>
            ))}
          </div>

          <div className="pt-3">
            <p className="text-xs text-center text-subtitle-color">
              {t('manage_all_accounts_in_settings', { defaultValue: 'Manage all accounts in settings' })}
            </p>
          </div>
        </div>
      </Card>
    </motion.section>
  )
}
