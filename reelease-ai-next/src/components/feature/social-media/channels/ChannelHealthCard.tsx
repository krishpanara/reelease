'use client'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { ChannelHealthCardProps } from '@/types/socialMedia'
import { useTranslation } from 'react-i18next'

const ChannelHealthCard = ({ total, active, paused, expired = 0, onViewDetails }: ChannelHealthCardProps) => {
  const { t } = useTranslation()
  const disconnected = Math.max(0, total - active - paused - expired)
  const healthyPercent = total > 0 ? Math.round((active / total) * 100) : 100

  const legend = [
    { label: t('active', { defaultValue: 'Active' }), count: active, color: 'bg-emerald-500' },
    { label: t('paused', { defaultValue: 'Paused' }), count: paused, color: 'bg-orange-500' },
    { label: t('disconnected', { defaultValue: 'Disconnected' }), count: disconnected, color: 'bg-muted-foreground' },
    { label: t('expired', { defaultValue: 'Expired' }), count: expired, color: 'bg-destructive' },
  ]

  return (
    <div className="glass-card rounded-border-radius bg-white dark:bg-white/3 border border-glass-border p-5 space-y-5">
      <h3 className="font-bold text-title-color text-base">
        {t('channel_health', { defaultValue: 'Channel Health' })}
      </h3>

      <div className="flex flex-col items-center gap-4">
        <div className="relative w-36 h-36">
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background: `conic-gradient(var(--primary) ${healthyPercent * 3.6}deg, rgba(var(--primary-rgb), 0.15) 0deg)`,
            }}
          />
          <div className="absolute inset-[10px] rounded-full dark:bg-light-body! bg-white flex flex-col items-center justify-center border border-glass-border">
            <span className="text-3xl font-black text-primary tabular-nums">{healthyPercent}%</span>
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              {t('healthy', { defaultValue: 'Healthy' })}
            </span>
          </div>
        </div>

        <div className="w-full space-y-2">
          {legend.map((item) => (
            <div key={item.label} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <span className={cn('w-2.5 h-2.5 rounded-full', item.color)} />
                <span className="text-muted-foreground font-medium">{item.label}</span>
              </div>
              <span className="font-bold text-foreground tabular-nums">{item.count}</span>
            </div>
          ))}
        </div>
      </div>

      <Button
        variant="outline"
        onClick={onViewDetails}
        className="w-full primary-btn text-white h-10 rounded-xl font-bold text-xs"
      >
        {t('view_health_details', { defaultValue: 'View Health Details' })}
      </Button>
    </div>
  )
}

export default ChannelHealthCard
