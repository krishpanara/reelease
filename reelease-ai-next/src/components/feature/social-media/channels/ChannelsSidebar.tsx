'use client'

import { Button } from '@/components/ui/button'
import { FacebookIcon as Facebook } from '@/components/ui/FacebookIcon'
import { InstagramIcon as Instagram } from '@/components/ui/InstagramIcon'
import { LinkedInIcon as Linkedin } from '@/components/ui/LinkedInIcon'
import SafeImage from '@/components/ui/SafeImage'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ThreadsIcon } from '@/components/ui/threadsIcon'
import { XIcon as Twitter } from '@/components/ui/XIcon'
import { YouTubeIcon as Youtube } from '@/components/ui/YouTubeIcon'
import { cn } from '@/lib/utils'
import { ChannelStatsPeriod } from '@/types/components/features'
import { ChannelsSidebarProps } from '@/types/socialMedia'
import { getMediaUrl } from '@/utils'
import { formatEngagementCount } from '@/utils/channelHelpers'
import { BarChart3, Link2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import QuickActionsCard from './QuickActionsCard'

const getPlatformConfig = (platform: string) => {
  switch (platform.toLowerCase()) {
    case 'facebook':
      return { icon: Facebook, bg: 'bg-[#1877F2]' }
    case 'instagram':
      return { icon: Instagram, bg: 'bg-gradient-to-tr from-[#FFB700] via-[#FF006B] to-[#AD00FF]' }
    case 'twitter':
    case 'x':
      return { icon: Twitter, bg: 'bg-[#000000]' }
    case 'linkedin':
    case 'linkedin_page':
      return { icon: Linkedin, bg: 'bg-[#0A66C2]' }
    case 'youtube':
      return { icon: Youtube, bg: 'bg-red-600' }
    case 'threads':
      return { icon: ThreadsIcon, bg: 'bg-white dark:bg-black border border-black/10 dark:border-white/20' }
    default:
      return { icon: Link2, bg: 'bg-muted' }
  }
}
const ChannelsSidebar = ({
  topChannels,
  performancePeriod,
  onPerformancePeriodChange,
  total,
  active,
  paused,
  expired = 0,
  onConnectNew,
  onReconnectAll,
  onExport,
  onChannelGroups,
  onViewAnalytics,
  onViewHealthDetails,
  isReconnectingAll,
}: ChannelsSidebarProps) => {
  const { t } = useTranslation()

  return (
    <aside className="w-full xl:w-[300px] shrink-0 space-y-4">
      <QuickActionsCard
        onConnectNew={onConnectNew}
        onReconnectAll={onReconnectAll}
        onExport={onExport}
        onChannelGroups={onChannelGroups}
        isReconnectingAll={isReconnectingAll}
      />

      <div className="glass-card  rounded-border-radius bg-white dark:bg-white/3 border border-glass-border p-5 space-y-4">
        <div className="flex flex-col gap-y-3 items-start justify-between">
          <h3 className="text-base font-bold text-foreground shrink-0">
            {t('top_performing_channels', { defaultValue: 'Top Performing Channels' })}
          </h3>
          <div className="flex items-center justify-between w-full">
            <Select
              value={performancePeriod}
              onValueChange={(v) => onPerformancePeriodChange(v as ChannelStatsPeriod)}
            >
              <SelectTrigger className="h-8 w-[125px] rounded-lg border-glass-border bg-black/5 dark:bg-white/3 text-xs font-bold">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">{t('today', { defaultValue: 'Today' })}</SelectItem>
                <SelectItem value="week">{t('this_week', { defaultValue: 'This Week' })}</SelectItem>
                <SelectItem value="month">{t('this_month', { defaultValue: 'This Month' })}</SelectItem>
                <SelectItem value="year">{t('this_year', { defaultValue: 'This Year' })}</SelectItem>
                <SelectItem value="all">{t('all_time', { defaultValue: 'All Time' })}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>


        {topChannels.length === 0 ? (
          <p className="text-sm text-title-color text-center py-4">
            {t('no_channel_stats_yet', { defaultValue: 'No performance data for this period.' })}
          </p>
        ) : (
          <div className="space-y-3">
            {topChannels.map((channel, index) => {
              const config = getPlatformConfig(channel.platform)
              const PlatformIcon = config.icon
              const handle = channel.username ? `@${channel.username}` : channel.name
              const isCustomIcon = ['facebook', 'instagram', 'twitter', 'x', 'linkedin', 'linkedin_page', 'youtube', 'threads'].includes(channel.platform.toLowerCase())
              return (
                <div
                  key={channel.id}
                  className="flex items-center gap-3 p-2 rounded-xl transition-colors"
                >
                  <div className="relative w-10 h-10 shrink-0">
                    <div className="w-full h-full rounded-full overflow-hidden border border-glass-border relative">
                      {channel.profile_picture ? (
                        <SafeImage
                          src={getMediaUrl(channel.profile_picture) || channel.profile_picture}
                          fallbackName={channel.name}
                          alt=""
                          fill
                          className="object-cover"
                          referrerPolicy="no-referrer"
                          unoptimized
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary font-bold text-sm">
                          {channel.name.charAt(0)}
                        </div>
                      )}
                    </div>
                    <span
                      className={cn(
                        "absolute -bottom-0.5 -right-0.5 w-[18px] h-[18px] flex items-center justify-center z-10",
                        isCustomIcon
                          ? 'drop-shadow-[0_0_1px_#fff] dark:drop-shadow-[0_0_1px_#0f172a] drop-shadow-[0_0.5px_1px_rgba(0,0,0,0.25)]'
                          : cn("rounded-full border border-background overflow-hidden", config.bg)
                      )}
                    >
                      <PlatformIcon
                        className="w-full h-full"
                        {...(isCustomIcon ? { filled: true } : {})}
                      />
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">{channel.name}</p>
                    <p className="text-sm text-muted-foreground truncate">{handle}</p>
                  </div>
                  <span className="text-sm font-bold text-primary tabular-nums">
                    {formatEngagementCount(channel.engagement)}
                  </span>
                </div>
              )
            })}
          </div>
        )}

        <Button
          variant="outline"
          onClick={() => onViewAnalytics()}
          className="w-full h-10 rounded-xl primary-btn text-white border-glass-border font-bold text-xs gap-2"
        >
          <BarChart3 className="w-4 h-4" strokeWidth={2.5} />
          {t('view_all_analytics', { defaultValue: 'View All Analytics' })}
        </Button>
      </div>

      {/* <ChannelHealthCard
        total={total}
        active={active}
        paused={paused}
        expired={expired}
        onViewDetails={onViewHealthDetails}
      /> */}
    </aside>
  )
}

export default ChannelsSidebar
