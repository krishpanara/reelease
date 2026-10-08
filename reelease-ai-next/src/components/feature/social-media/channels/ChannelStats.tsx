'use client'

import { CheckCircle2, Link2, PauseCircle, Sparkles } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { ChannelStatsProps } from '@/types/components/features'
import { cn } from '@/lib/utils'
import { StatCardProps } from '@/types/socialMedia'

const StatCard = ({
  title,
  description,
  value,
  icon: Icon,
  iconClassName,
  iconGlowClassName,
  topBorderClass,
}: StatCardProps & { topBorderClass: string }) => (
  <div className={cn(
    "bg-white dark:bg-white/3 border border-slate-100 dark:border-white/5 rounded-2xl p-6 sm:p-4 shadow-sm flex items-center justify-between transition-all duration-300 hover:-translate-y-1 hover:shadow-md group",
    topBorderClass
  )}>
    <div className="flex flex-col gap-1 flex-1 min-w-0">
      <p className="text-base font-semibold text-subtitle-color">{title}</p>
      <h3 className="text-3xl font-black text-foreground tabular-nums tracking-tight">{value}</h3>
      <p className="text-xs text-subtitle-color mt-1 font-medium">{description}</p>
    </div>
    <div
      className={cn(
        'w-12 h-12 rounded-full flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110',
        iconGlowClassName,
      )}
    >
      <Icon className={cn('w-5 h-5', iconClassName)} />
    </div>
  </div>
)

export const ChannelStats = ({ total, active, paused, recent }: ChannelStatsProps) => {
  const { t } = useTranslation()

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-6">
      <StatCard
        title={t('total_channels', { defaultValue: 'Total Channels' })}
        description={t('total_channels_desc', { defaultValue: 'All connected channels' })}
        value={total}
        icon={Link2}
        iconClassName="text-blue-600!"
        iconGlowClassName="bg-blue-600/10! text-blue-600!"
        topBorderClass="border-t-4! border-t-blue-600!"
      />
      <StatCard
        title={t('active_channels', { defaultValue: 'Active Channels' })}
        description={t('active_channels_desc', { defaultValue: 'Ready to publish' })}
        value={active}
        icon={CheckCircle2}
        iconClassName="text-emerald-600!"
        iconGlowClassName="bg-emerald-600/10! text-emerald-600!"
        topBorderClass="border-t-4! border-t-emerald-600!"
      />
      <StatCard
        title={t('paused_channels', { defaultValue: 'Paused Channels' })}
        description={t('paused_channels_desc', { defaultValue: 'Temporarily paused' })}
        value={paused}
        icon={PauseCircle}
        iconClassName="text-orange-600!"
        iconGlowClassName="bg-orange-600/10! text-orange-600!"
        topBorderClass="border-t-4! border-t-orange-600!"
      />
      <StatCard
        title={t('recently_connected', { defaultValue: 'Recently Connected' })}
        description={t('recently_connected_desc', { defaultValue: 'In last 30 days' })}
        value={recent}
        icon={Sparkles}
        iconClassName="text-purple-600!"
        iconGlowClassName="bg-purple-600/10! text-purple-600!"
        topBorderClass="border-t-4! border-t-purple-600!"
      />
    </div>
  )
}
