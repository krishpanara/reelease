'use client'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdownMenu'
import { FacebookIcon as Facebook } from '@/components/ui/FacebookIcon'
import { InstagramIcon as Instagram } from '@/components/ui/InstagramIcon'
import { LinkedInIcon as Linkedin } from '@/components/ui/LinkedInIcon'
import SafeImage from '@/components/ui/SafeImage'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ThreadsIcon } from '@/components/ui/threadsIcon'
import { XIcon as Twitter } from '@/components/ui/XIcon'
import { cn } from '@/lib/utils'
import { ChannelsTableProps } from '@/types/socialMedia'
import { getMediaUrl } from '@/utils'
import { formatEngagementCount, getPlatformLabel } from '@/utils/channelHelpers'
import { BarChart3, ExternalLink, Loader2, MoreHorizontal, Plus, RefreshCw, Trash2, Youtube } from 'lucide-react'
import { useTranslation } from 'react-i18next'

const getPlatformIcon = (platform: string) => {
  switch (platform.toLowerCase()) {
    case 'facebook':
      return { icon: Facebook, className: 'text-[#1877F2]' }
    case 'instagram':
      return { icon: Instagram, className: 'text-rose-500' }
    case 'twitter':
      return { icon: Twitter, className: 'text-foreground' }
    case 'linkedin':
    case 'linkedin_page':
      return { icon: Linkedin, className: 'text-[#0A66C2]' }
    case 'youtube':
      return { icon: Youtube, className: 'text-red-600' }
    case 'threads':
      return { icon: ThreadsIcon, className: 'text-foreground' }
    default:
      return { icon: MoreHorizontal, className: 'text-muted-foreground' }
  }
}

const ActionButtons = ({
  channelId,
  onOpen,
  onReconnect,
  onReauth,
  onDelete,
  isLoading,
}: {
  channelId: string
  onOpen: (id: string) => void
  onReconnect: (id: string) => void
  onReauth: (id: string) => void
  onDelete: (id: string) => void
  isLoading?: boolean
}) => {
  const { t } = useTranslation()
  const iconBtnClass =
    'h-8 w-8 shrink-0 rounded-lg border border-glass-border bg-black/5 dark:bg-white/3 hover:bg-primary/10 hover:border-primary/30 hover:text-primary'

  return (
    <div className="flex items-center justify-end gap-1.5">
      <Button
        variant="outline"
        size="icon"
        onClick={() => onOpen(channelId)}
        className={iconBtnClass}
        title={t('open_channel', { defaultValue: 'Open Channel' })}
      >
        <ExternalLink className="w-3.5 h-3.5" />
      </Button>
      <Button
        variant="outline"
        size="icon"
        onClick={() => onReconnect(channelId)}
        disabled={isLoading}
        className={iconBtnClass}
        title={t('refresh_data', { defaultValue: 'Refresh Data' })}
      >
        {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
      </Button>
      <Button
        variant="outline"
        size="icon"
        onClick={() => onOpen(channelId)}
        className={iconBtnClass}
        title={t('analytics', { defaultValue: 'Analytics' })}
      >
        <BarChart3 className="w-3.5 h-3.5" />
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon" className={iconBtnClass} title={t('more', { defaultValue: 'More' })}>
            <MoreHorizontal className="w-3.5 h-3.5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="glass-card border-glass-border rounded-xl">
          <DropdownMenuItem
            onClick={() => onReauth(channelId)}
            className="gap-2 font-medium text-xs"
          >
            <RefreshCw className="w-4 h-4" />
            {t('reconnect_profile', { defaultValue: 'Reconnect Profile' })}
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

export const ChannelsTable = ({
  rows,
  showAddRow,
  onAddChannel,
  onOpen,
  onReconnect,
  onReauth,
  onDelete,
  loadingMetricsId,
  isLoading,
}: ChannelsTableProps) => {
  const { t } = useTranslation()

  return (
    <div className="glass-card rounded-2xl bg-white/50 dark:bg-white/3 border border-glass-border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="border-glass-border hover:bg-transparent">
            <TableHead className="text-xs font-bold uppercase text-muted-foreground">
              {t('channel', { defaultValue: 'Channel' })}
            </TableHead>
            <TableHead className="text-xs font-bold uppercase text-muted-foreground">
              {t('platform', { defaultValue: 'Platform' })}
            </TableHead>
            <TableHead className="text-xs font-bold uppercase text-muted-foreground hidden md:table-cell">
              {t('handle', { defaultValue: 'Handle' })}
            </TableHead>
            <TableHead className="text-xs font-bold uppercase text-muted-foreground text-center">
              {t('posts_this_month', { defaultValue: 'Posts This Month' })}
            </TableHead>
            <TableHead className="text-xs font-bold uppercase text-muted-foreground text-center">
              {t('engagement', { defaultValue: 'Engagement' })}
            </TableHead>
            <TableHead className="text-xs font-bold uppercase text-muted-foreground text-right w-[180px]">
              {t('actions', { defaultValue: 'Actions' })}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                <Loader2 className="w-6 h-6 animate-spin mx-auto" />
              </TableCell>
            </TableRow>
          ) : (
            <>
              {showAddRow && onAddChannel && (
                <TableRow
                  className="border-glass-border cursor-pointer hover:bg-primary/5 transition-colors"
                  onClick={onAddChannel}
                >
                  <TableCell colSpan={6} className="py-5">
                    <div className="flex items-center justify-center gap-3 text-primary">
                      <div className="w-10 h-10 rounded-full border-2 border-dashed border-primary/40 flex items-center justify-center">
                        <Plus className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-bold text-foreground">{t('add_new_channel', { defaultValue: 'Add New Channel' })}</p>
                        <p className="text-xs text-muted-foreground">
                          {t('connect_more_accounts', { defaultValue: 'Connect more accounts to get started.' })}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              )}
              {rows.map((channel) => {
                const isActive = channel.status === 'ACTIVE'
                const { icon: PlatformIcon, className: platformIconClass } = getPlatformIcon(channel.platform)
                const isCustomIcon = ['facebook', 'instagram', 'twitter', 'x', 'linkedin', 'linkedin_page', 'youtube', 'threads'].includes(channel.platform.toLowerCase())
                const metricsLoading = loadingMetricsId === channel.id

                return (
                  <TableRow key={channel.id} className="border-glass-border hover:bg-black/5 dark:hover:bg-white/3">
                    <TableCell>
                      <div className="flex items-center gap-3 min-w-[180px]">
                        <div className="w-10 h-10 rounded-xl overflow-hidden border border-glass-border shrink-0">
                          {channel.profile_picture ? (
                            <SafeImage
                              src={getMediaUrl(channel.profile_picture) || channel.profile_picture}
                              fallbackName={channel.name}
                              alt={channel.name}
                              width={40}
                              height={40}
                              className="w-full h-full object-cover"
                              referrerPolicy="no-referrer"
                              unoptimized
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary font-bold text-sm">
                              {channel.name.charAt(0)}
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-sm text-foreground truncate">{channel.name}</p>
                          <span
                            className={cn(
                              'inline-flex mt-0.5 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase border',
                              isActive
                                ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                                : 'bg-orange-500/10 text-orange-500 border-orange-500/20',
                            )}
                          >
                            {t(channel.status.toLowerCase(), { defaultValue: channel.status })}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <PlatformIcon
                          className={cn('w-4 h-4', platformIconClass)}
                          {...(isCustomIcon ? { filled: true } : {})}
                        />
                        <span className="text-sm font-medium">{getPlatformLabel(channel.platform)}</span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-sm text-muted-foreground">@{channel.username}</TableCell>
                    <TableCell className="text-center font-bold tabular-nums">
                      {metricsLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                      ) : (
                        channel.postsThisMonth
                      )}
                    </TableCell>
                    <TableCell className="text-center font-bold tabular-nums text-primary">
                      {metricsLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                      ) : (
                        formatEngagementCount(channel.engagement)
                      )}
                    </TableCell>
                    <TableCell>
                      <ActionButtons
                        channelId={channel.id}
                        onOpen={onOpen}
                        onReconnect={onReconnect}
                        onReauth={onReauth}
                        onDelete={onDelete}
                        isLoading={metricsLoading}
                      />
                    </TableCell>
                  </TableRow>
                )
              })}
              {!showAddRow && rows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-muted-foreground text-sm">
                    {t('no_channels_found', { defaultValue: 'No channels found' })}
                  </TableCell>
                </TableRow>
              )}
            </>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
