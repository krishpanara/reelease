'use client'

import { FacebookIcon as Facebook } from '@/components/ui/FacebookIcon'
import { InstagramIcon as Instagram } from '@/components/ui/InstagramIcon'
import { LinkedInIcon as Linkedin } from '@/components/ui/LinkedInIcon'
import SafeImage from '@/components/ui/SafeImage'
import { XIcon as Twitter } from '@/components/ui/XIcon'
import { YouTubeIcon as Youtube } from '@/components/ui/YouTubeIcon'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdownMenu'
import { ThreadsIcon } from '@/components/ui/threadsIcon'
import { cn } from '@/lib/utils'
import { ChannelCardProps } from '@/types/components/features'
import { getMediaUrl } from '@/utils'
import { formatEngagementCount, getPlatformLabel } from '@/utils/channelHelpers'
import { BarChart3, ExternalLink, Loader2, MoreHorizontal, Pause, Play, RefreshCw, Trash2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'

const getPlatformConfig = (platform: string) => {
  switch (platform.toLowerCase()) {
    case 'facebook':
      return { icon: Facebook, bg: 'bg-[#1877F2]' }
    case 'instagram':
      return { icon: Instagram, bg: 'bg-gradient-to-tr from-[#FFB700] via-[#FF006B] to-[#AD00FF]' }
    case 'twitter':
      return { icon: Twitter, bg: 'bg-[#000000]' }
    case 'linkedin':
    case 'linkedin_page':
      return { icon: Linkedin, bg: 'bg-[#0A66C2]' }
    case 'youtube':
      return { icon: Youtube, bg: 'bg-red-600' }
    case 'threads':
      return { icon: ThreadsIcon, bg: 'bg-white dark:bg-black border border-black/10 dark:border-white/20' }
    default:
      return { icon: MoreHorizontal, bg: 'bg-muted' }
  }
}

const CardActionBar = ({
  channelId,
  isPaused,
  onOpen,
  onAnalytics,
  onReconnect,
  onReauth,
  onPause,
  onDelete,
  isMetricsLoading,
  isPauseLoading,
  viewMode,
  platform
}: {
  channelId: string
  platform: string
  isPaused: boolean
  onOpen: (id: string) => void
  onAnalytics: (id: string) => void
  onReconnect: (id: string) => void
  onReauth: (id: string) => void
  onPause: (id: string) => void
  onDelete: (id: string) => void
  isMetricsLoading?: boolean
  isPauseLoading?: boolean
  viewMode: 'grid' | 'list'
}) => {
  const { t } = useTranslation()
  const isGrid = viewMode === 'grid'

  const btnClass = cn(
    'h-10 rounded-[6px] border border-glass-border flex items-center justify-center transition-all duration-300 text-subtitle-color p-0! shrink-0',
    isGrid ? 'w-full' : 'w-10 h-10',
    isPaused
      ? 'border-solid border-glass-border'
      : 'border-glass-border'
  )

  const containerClass = cn(
    isGrid ? 'grid grid-cols-4 gap-2 w-full mt-auto bg-transparent!' : 'flex items-center gap-2 shrink-0'
  )

  return (
    <div className={containerClass}>
      <Button
        variant="ghost"
        onClick={() => onOpen(channelId)}
        className={btnClass}
        title={t('open_channel', { defaultValue: 'Open Channel' })}
      >
        <ExternalLink className="w-4 h-4" />
      </Button>
      <Button
        variant="ghost"
        onClick={() => onReconnect(channelId)}
        disabled={isMetricsLoading}
        className={btnClass}
        title={t('refresh_data', { defaultValue: 'Refresh Data' })}
      >
        {isMetricsLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
      </Button>

      <Button
        variant="ghost"
        onClick={() => onAnalytics(platform)}
        className={btnClass}
        title={t('analytics', { defaultValue: 'Analytics' })}
      >
        <BarChart3 className="w-4 h-4" />
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className={btnClass} title={t('more', { defaultValue: 'More' })}>
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="glass-card border-glass-border rounded-border-radius">
          <DropdownMenuItem
            onClick={() => onReauth(channelId)}
            className="gap-2 font-medium text-xs"
          >
            <RefreshCw className="w-4 h-4" />
            {t('reconnect_profile', { defaultValue: 'Reconnect Profile' })}
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => onPause(channelId)}
            disabled={isPauseLoading}
            className="gap-2 font-medium text-xs"
          >
            {isPauseLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : isPaused ? (
              <Play className="w-4 h-4" />
            ) : (
              <Pause className="w-4 h-4" />
            )}
            {isPaused
              ? t('resume', { defaultValue: 'Resume Channel' })
              : t('pause', { defaultValue: 'Pause Channel' })}
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => onDelete(channelId)}
            className="gap-2 text-destructive focus:text-destructive font-medium text-xs"
          >
            <Trash2 className="w-4 h-4" />
            {t('delete', { defaultValue: 'Delete' })}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

export const ChannelCard = ({
  channel,
  viewMode,
  onOpen,
  onAnalytics,
  onReconnect,
  onReauth,
  onPause,
  onDelete,
  metrics,
  isMetricsLoading,
  isPauseLoading,
}: ChannelCardProps) => {
  const { t } = useTranslation()
  const isActive = channel.status === 'ACTIVE'
  const config = getPlatformConfig(channel.platform)
  const PlatformIcon = config.icon

  const postsDisplay = String(metrics?.postsThisMonth ?? 0)
  const engagementDisplay = formatEngagementCount(metrics?.engagement ?? 0)

  const isCustomIcon = ['facebook', 'instagram', 'twitter', 'x', 'linkedin', 'linkedin_page', 'youtube', 'threads'].includes(channel.platform.toLowerCase())

  if (viewMode === 'list') {
    return (
      <div className={cn(
        "rounded-border-radius border p-4 flex flex-row items-center justify-between gap-4 hover:translate-y-0.5  transition-all duration-300 min-w-[800px] 2xl:min-w-0",
        isActive ? "bg-white dark:bg-white/3 border-glass-border dark:border-white/5 " : "bg-transparent border-2 border-dashed border-glass-border/60"
      )}>
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <div className="relative shrink-0">
            <div className={cn("w-14 h-14 rounded-full overflow-hidden border", isActive ? "border-slate-100 dark:border-white/5 bg-black/5 dark:bg-white/5" : "border-glass-border/60 !border-dashed bg-transparent")}>
              {channel.profile_picture ? (
                <SafeImage
                  src={getMediaUrl(channel.profile_picture) || channel.profile_picture}
                  fallbackName={channel.name}
                  alt={channel.name}
                  width={56}
                  height={56}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                  unoptimized
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary font-bold text-xl">
                  {channel.name.charAt(0)}
                </div>
              )}
            </div>
            <span
              className={cn(
                'absolute -bottom-1 -right-1 w-6 h-6 flex items-center justify-center z-10',
                isCustomIcon
                  ? 'drop-shadow-[0_0_1.5px_#fff] dark:drop-shadow-[0_0_1.5px_#0f172a] drop-shadow-[0_1px_2px_rgba(0,0,0,0.25)]'
                  : cn('rounded-full border-2 border-glass-border overflow-hidden', config.bg)
              )}
            >
              <PlatformIcon
                className="w-full h-full"
                {...(isCustomIcon ? { filled: true } : {})}
              />
            </span>
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-1.5">
              <h4 className="font-bold text-sm text-foreground truncate">{channel.name}</h4>
              <div className="flex items-center gap-1">
                <span className={cn(
                  "w-1.5 h-1.5 rounded-full shrink-0",
                  isActive ? "bg-emerald-500" : "bg-orange-500"
                )} />
                <span className={cn(
                  "text-[10px] font-semibold uppercase",
                  isActive ? "text-emerald-600 dark:text-emerald-500" : "text-orange-600 dark:text-orange-500"
                )}>
                  {t(channel.status.toLowerCase(), { defaultValue: channel.status })}
                </span>
              </div>
            </div>
            <p className="font-medium text-xs text-muted-foreground truncate mt-0.5">
              {channel.username ? `@${channel.username}` : channel.name} · {getPlatformLabel(channel.platform)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-6 px-2 shrink-0">
          <div className={cn(
            "text-center min-w-[90px] rounded-border-radius-inner border px-3 py-2",
            isActive ? "bg-white dark:bg-white/3 border-glass-border" : "border-dashed border-glass-border"
          )}>
            <p className="text-2xs font-bold text-subtitle-color/85  tracking-wider mb-0.5">
              {t('posts_this_month', { defaultValue: 'Posts' })}
            </p>
            <p className="text-base font-black text-foreground tabular-nums leading-none">
              {isMetricsLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin mx-auto text-primary" /> : postsDisplay}
            </p>
          </div>
          <div className={cn(
            "text-center min-w-[90px] rounded-border-radius-inner border px-3 py-2",
            isActive ? "bg-white dark:bg-white/3 border-glass-border" : "border-dashed border-glass-border"
          )}>
            <p className="text-2xs font-bold text-subtitle-color/85  tracking-wider mb-0.5">
              {t('engagement', { defaultValue: 'Engagement' })}
            </p>
            <p className="text-base font-black text-foreground tabular-nums leading-none">
              {isMetricsLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin mx-auto text-primary" /> : engagementDisplay}
            </p>
          </div>
        </div>

        <CardActionBar
          viewMode={viewMode}
          channelId={channel.id}
          platform={channel.platform}
          isPaused={channel.status === 'PAUSED'}
          onOpen={onOpen}
          onAnalytics={onAnalytics}
          onReconnect={onReconnect}
          onReauth={onReauth}
          onPause={onPause}
          onDelete={onDelete}
          isMetricsLoading={isMetricsLoading}
          isPauseLoading={isPauseLoading}
        />
      </div>
    )
  }

  return (
    <div className={cn(
      "rounded-2xl border p-6 flex flex-col hover:-translate-y-1  transition-all duration-300 h-full justify-between gap-4",
      isActive ? "bg-white dark:bg-white/3 border-glass-border dark:border-white/5" : "bg-transparent border-2 border-dashed border-glass-border/60"
    )}>
      <div className="flex items-start gap-4">
        <div className="relative shrink-0">
          <div className={cn("w-14 h-14 rounded-full overflow-hidden border", isActive ? "border-slate-100 dark:border-white/5 bg-black/5 dark:bg-white/5" : "border-glass-border/60 !border-dashed bg-transparent")}>
            {channel.profile_picture ? (
              <SafeImage
                src={getMediaUrl(channel.profile_picture) || channel.profile_picture}
                fallbackName={channel.name}
                alt={channel.name}
                width={56}
                height={56}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
                unoptimized
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary font-bold text-xl">
                {channel.name.charAt(0)}
              </div>
            )}
          </div>
          <span
            className={cn(
              'absolute -bottom-1 -right-1 w-6 h-6 flex items-center justify-center z-10',
              isCustomIcon
                ? 'drop-shadow-[0_0_1.5px_#fff] dark:drop-shadow-[0_0_1.5px_#0f172a] drop-shadow-[0_1px_2px_rgba(0,0,0,0.25)]'
                : cn('rounded-full border-2 border-white dark:border-slate-900 shadow-sm overflow-hidden', config.bg)
            )}
          >
            <PlatformIcon
              className="w-full h-full"
              {...(isCustomIcon ? { filled: true } : {})}
            />
          </span>
        </div>

        <div className="flex-1 min-w-0 flex flex-col justify-center">
          <h4 className="font-bold text-[15px] text-foreground truncate leading-snug">{channel.name}</h4>
          <div className="flex items-center gap-1 mt-0.5">
            <span className={cn(
              "w-1.5 h-1.5 rounded-full shrink-0",
              isActive ? "bg-emerald-500" : "bg-orange-500"
            )} />
            <span className={cn(
              "text-[10px] font-semibold uppercase",
              isActive ? "text-emerald-600 dark:text-emerald-500" : "text-orange-600 dark:text-orange-500"
            )}>
              {t(channel.status.toLowerCase(), { defaultValue: channel.status })}
            </span>
          </div>
          <p className="font-medium text-xs text-muted-foreground truncate mt-1">
            {channel.username ? `@${channel.username}` : channel.name}
          </p>
        </div>
      </div>

      <div className="grid sm:grid-cols-2  gap-3">
        <div className={cn(
          "rounded-border-radius-inner border px-3 py-3 text-center transition-all duration-300",
          isActive ? "bg-slate-50 dark:bg-white/3 border-glass-border" : "border-dashed border-glass-border"
        )}>
          <p className="text-2xs font-bold text-subtitle-color mb-1">
            {t('posts_this_month', { defaultValue: 'Posts This Month' })}
          </p>
          <p className="text- font-black text-foreground tabular-nums leading-none">
            {isMetricsLoading ? <Loader2 className="w-4 h-4 animate-spin mx-auto text-primary" /> : postsDisplay}
          </p>
        </div>
        <div className={cn(
          "rounded-border-radius-inner border px-3 py-3 text-center transition-all duration-300",
          isActive ? "bg-slate-50 dark:bg-white/3 border-glass-border" : "border-dashed border-glass-border"
        )}>
          <p className="text-2xs font-bold text-subtitle-color mb-1">
            {t('engagement', { defaultValue: 'Engagement' })}
          </p>
          <p className="text-xl font-black text-foreground tabular-nums leading-none">
            {isMetricsLoading ? <Loader2 className="w-4 h-4 animate-spin mx-auto text-primary" /> : engagementDisplay}
          </p>
        </div>
      </div>

      <CardActionBar
        viewMode={viewMode}
        platform={channel.platform}
        channelId={channel.id}
        isPaused={channel.status === 'PAUSED'}
        onOpen={onOpen}
        onAnalytics={onAnalytics}
        onReconnect={onReconnect}
        onReauth={onReauth}
        onPause={onPause}
        onDelete={onDelete}
        isMetricsLoading={isMetricsLoading}
        isPauseLoading={isPauseLoading}
      />
    </div>
  )
}
