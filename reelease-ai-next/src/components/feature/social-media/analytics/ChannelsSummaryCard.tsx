import React from 'react'
import { Card } from '@/components/ui/card'
import { Layers, Facebook } from 'lucide-react'
import SafeImage from '@/components/ui/SafeImage'
import { platformIcons, platformColors } from '@/data/analyticsData'
import { ChannelsSummaryProps } from '@/types/analytics'

export default function ChannelsSummaryCard({ filteredAccounts, t }: ChannelsSummaryProps) {
  return (
    <Card className="p-5 glass-card dark:bg-white/3 border-none">
      <div className="flex items-center gap-2 mb-4">
        <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500">
          <Layers className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-title-color dark:text-white">
            {t('channel_performance', { defaultValue: 'Channel Status' })}
          </h3>
          <p className="text-sm text-subtitle-color">
            {t('overview_of_connected_social_profiles', { defaultValue: 'Summary of active profiles' })}
          </p>
        </div>
      </div>

      <div className="space-y-3 overflow-auto max-h-[200px] pr-1 no-scrollbar mt-4">
        {filteredAccounts.length > 0 ? (
          filteredAccounts.map((account) => {
            const Icon = platformIcons[account.platform.toLowerCase()] || Facebook
            const color = platformColors[account.platform.toLowerCase()] || '#8B5CF6'

            return (
              <div
                key={account._id || account.id}
                className="p-2 rounded-border-radius-inner dark:bg-white/3 bg-subcard border border-glass-border flex items-center justify-between transition-colors duration-200"
              >
                <div className="flex items-center gap-3 min-w-0">
                  {account.profile_picture ? (
                    <SafeImage
                      src={account.profile_picture}
                      fallbackName={account.account_name}
                      alt=""
                      width={32}
                      height={32}
                      className="rounded-full w-8 h-8 object-cover bg-black/20 shrink-0"
                      unoptimized
                    />
                  ) : (
                    <div className="w-8 h-8 flex items-center justify-center shrink-0">
                      <Icon className="w-full h-full" filled={true} />
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-title-color truncate leading-tight">
                      {account.account_name}
                    </p>
                    <p className="text-xs text-muted-foreground capitalize mt-0.5">{account.platform}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-right shrink-0">
                  <div>
                    <span className="text-sm font-bold text-subtitle-color block">
                      {account.followerCount >= 1000
                        ? `${(account.followerCount / 1000).toFixed(1)}K`
                        : account.followerCount}
                    </span>
                    <span className="text-xs text-muted-foreground block">Followers</span>
                  </div>
                  <div className="min-w-[48px]">
                    <span className="text-xs font-extrabold text-primary block">
                      {account.engagementRate}%
                    </span>
                    <span className="text-xs text-muted-foreground block">Eng. Rate</span>
                  </div>
                </div>
              </div>
            )
          })
        ) : (
          <div className="text-center py-6 text-muted-foreground">
            <p className="text-xs">{t('no_channels_connected', { defaultValue: 'No channels connected.' })}</p>
          </div>
        )}
      </div>
    </Card>
  )
}
