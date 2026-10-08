'use client'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { QuickActionsCardProps } from '@/types/socialMedia'
import { ChevronRight, Download, Plus, RefreshCw, Users } from 'lucide-react'
import { useTranslation } from 'react-i18next'

const QuickActionsCard = ({
  onConnectNew,
  onReconnectAll,
  onExport,
  onChannelGroups,
  isReconnectingAll = false,
  className,
}: QuickActionsCardProps) => {
  const { t } = useTranslation()

  const items = [
    {
      key: 'connect',
      label: t('connect_new_account', { defaultValue: 'Connect New Account' }),
      description: t('connect_new_account_desc', {
        defaultValue: 'Link a new social profile to your workspace.',
      }),
      icon: Plus,
      colorClass: 'bg-blue-600/10 text-blue-600',
      onClick: onConnectNew,
    },
    {
      key: 'reconnect',
      label: t('reconnect_all', { defaultValue: 'Reconnect All' }),
      description: t('reconnect_all_desc', {
        defaultValue: 'Refresh tokens and sync metrics for every channel.',
      }),
      icon: RefreshCw,
      colorClass: 'bg-emerald-600/10 text-emerald-600',
      onClick: onReconnectAll,
      loading: isReconnectingAll,
    },
    {
      key: 'export',
      label: t('export_channels', { defaultValue: 'Export Channels' }),
      description: t('export_channels_desc', {
        defaultValue: 'Download your channel list and stats as JSON.',
      }),
      icon: Download,
      colorClass: 'bg-purple-600/10 text-purple-600',
      onClick: onExport,
    },
  ]

  return (
    <div className={cn('bg-white dark:bg-white/3 border border-glass-border rounded-2xl p-5 shadow-sm flex flex-col', className)}>
      <h3 className="font-bold text-foreground text-base dark:text-white mb-4">
        {t('quick_actions', { defaultValue: 'Quick Actions' })}
      </h3>
      <div className="flex flex-col ">
        {items.map((item) => (
          <div
            key={item.key}
            className="border-b border-glass-border last:border-b-0 pb-3  mb-3 last:pb-0 last:mb-0"
          >
            <Button
              variant="ghost"
              onClick={item.onClick}
              disabled={item.loading}
              className="w-full justify-between items-center h-auto py-1 px-3 -mx-3 rounded-xl text-left bg-transparent!   gap-3 group"
            >
              <div className="flex items-start gap-3 min-w-0 ">
                <div className={cn('w-9 h-9 rounded-full flex items-center justify-center shrink-0  group-hover:scale-110 transition-transform', item.colorClass)}>
                  <item.icon className={cn('w-4.5 h-4.5 shrink-0', item.loading && 'animate-spin')} />
                </div>
                <div className="min-w-0 ">
                  <p className="text-sm font-bold text-foreground leading-tight ">{item.label}</p>
                  <p className="text-xs text-subtitle-color font-normal mt-1 break-words whitespace-normal text-wrap">{item.description}</p>
                </div>
              </div>
              {/* <ChevronRight className="w-4 h-4 text-slate-400  shrink-0 text-right" /> */}
            </Button>
          </div>
        ))}
      </div>
    </div>
  )
}

export default QuickActionsCard
