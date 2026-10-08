import React from 'react'
import { useTranslation } from 'react-i18next'
import { Card } from '@/components/ui/card'
import { Youtube, Instagram, Facebook, Linkedin, Twitter, Globe } from 'lucide-react'
import { cn } from '@/lib/utils'
import { CircularProgress } from './CircularProgress'
import { PlatformCoverageCardProps } from '@/types'
import { ThreadsIcon } from '@/components/ui/threadsIcon'

export const PlatformCoverageCard = ({ uniquePlatforms }: PlatformCoverageCardProps) => {
  const { t } = useTranslation()

  return (
    <Card className="w-full border-glass-border glass-card bg-white dark:bg-slate-900/30 rounded-border-radius p-5 sm:p-6">
      <div className="flex items-center justify-between border-b border-glass-border pb-4 mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-100/50 dark:border-rose-900/30 flex items-center justify-center text-rose-600 dark:text-rose-400">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-black text-title-color dark:text-white tracking-tight">
              {t('platform_coverage', { defaultValue: 'Platform Coverage' })}
            </h3>
            <p className="text-base text-subtitle-color  font-medium mt-0.5">
              {t('platform_coverage_desc', { defaultValue: 'Your connected platforms and channels status.' })}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {/* Coverage Ratio Indicator */}
        <div className="bg-subcard dark:bg-white/3 border border-glass-border p-3.5 rounded-border-radius-inner flex items-center justify-between">
          <div>
            <span className="text-3xs  text-subtitle-color   font-black tracking-wider block">
              {t('coverage_ratio', { defaultValue: 'Coverage Ratio' })}
            </span>
            <span className="text-lg font-black text-title-color dark:text-white mt-1 block">
              {t('platforms_connected_ratio', {
                connected: uniquePlatforms.length,
                total: 6,
                defaultValue: '{{connected}} of 6 Platforms'
              })}
            </span>
          </div>
          <div className="shrink-0">
            <CircularProgress percentage={Math.round((uniquePlatforms.length / 5) * 100)} color="info" size={48} strokeWidth={4} />
          </div>
        </div>

        {/* Platforms Grid of mini-cards */}
        <div className="grid grid-cols-2 gap-4 mt-4">
          {[
            { key: 'youtube', name: 'YouTube', icon: Youtube, color: '#FF0000' },
            { key: 'instagram', name: 'Instagram', icon: Instagram, color: '#E4405F' },
            { key: 'facebook', name: 'Facebook', icon: Facebook, color: '#1877F2' },
            { key: 'linkedin', name: 'LinkedIn', icon: Linkedin, color: '#0A66C2' },
            { key: 'twitter', name: 'Twitter / X', icon: Twitter, color: '#1DA1F2' },
             { key: 'threads', name: 'Threads', icon: ThreadsIcon, color: '#000000' },
          ].map((plat) => {
            const isConnected = uniquePlatforms.includes(plat.key)
            const PlatIcon = plat.icon
            return (
              <div
                key={plat.key}
                className={cn(
                  "p-3 rounded-border-radius-inner border flex flex-col justify-between min-h-[90px] transition-all duration-300 hover:scale-[1.02]",
                  isConnected
                    ? "bg-emerald-500/5 border-emerald-500/20 shadow-[0_2px_8px_-3px_rgba(16,185,129,0.1)]"
                    : "bg-subcard dark:bg-white/2 border-glass-border opacity-75 hover:opacity-100",
                )}
              >
                <div className="flex items-center justify-between">
                  <div
                    className={cn(
                      "w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border",
                      plat.key === 'threads' && "border-black/10 dark:border-white/20 bg-black/5 dark:bg-white/10 text-black dark:text-white"
                    )}
                    style={plat.key === 'threads' ? undefined : {
                      borderColor: `${plat.color}30`,
                      backgroundColor: `${plat.color}10`,
                      color: plat.color
                    }}
                  >
                    <PlatIcon className="w-4 h-4" />
                  </div>
                  <span className={cn(
                    'text-3xs font-black px-2 py-1 rounded-md ',
                    isConnected
                      ? 'text-emerald-500 bg-emerald-500/10'
                      : 'text-subtitle-color bg-slate-100 dark:bg-white/5'
                  )}>
                    {isConnected ? t('linked', { defaultValue: 'Linked' }) : t('offline', { defaultValue: 'Offline' })}
                  </span>
                </div>
                <div className="mt-2">
                  <span className="text-sm font-black text-title-color dark:text-white block leading-tight">
                    {plat.name}
                  </span>
                  <span className="text-xs text-subtitle-color    block mt-0.5">
                    {isConnected ? t('active_connection', { defaultValue: 'Ready to post' }) : t('not_connected', { defaultValue: 'Configure connection' })}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </Card>
  )
}
