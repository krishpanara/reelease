'use client'

import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { aiVideoTools, resolutionOptions } from '@/data/features'
import { cn } from '@/lib/utils'
import { MotionParametersPanelProps } from '@/types'
import { Layout, Monitor, Settings } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export const MotionParametersPanel = ({
  ratio,
  setRatio,
  quality,
  setQuality,
  sound,
  setSound,
}: MotionParametersPanelProps) => {
  const { t } = useTranslation()

  return (
    <aside className="lg:col-span-4 flex flex-col gap-6 order-3 lg:order-3 min-w-0">
      <div className="glass-card border-glass-border bg-white dark:bg-white/3 dark:border-white/20 sm:p-6 p-4 rounded-border-radius space-y-6">
        <div className="flex items-center gap-2 text-base font-bold text-title-color dark:text-white pb-3 border-b border-border/30 dark:border-white/5">
          <Settings className="w-5 h-5 text-primary" />
          Motion Parameters
        </div>

        {/* Ratio */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2 text-sm font-bold text-title-color dark:text-white/80">
              <Layout className="w-5 h-5 text-primary" />
              {t('ratio')}
            </div>
            <span className="text-3xs font-bold text-primary/60 bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">
              {ratio}
            </span>
          </div>

          <div className="grid grid-cols-4 sm:grid-cols-2 xl:grid-cols-3 gap-2 flex-col sm:flex-row  ">
            {aiVideoTools.map((option) => (
              <Button
                key={option.value}
                onClick={() => setRatio(option.value)}
                className={cn(
                  'relative group/btn flex items-center justify-center gap-1.5 h-12 rounded-full transition-all duration-300 border',
                  ratio === option.value
                    ? 'border-primary text-primary '
                    : 'bg-foreground/5 dark:bg-white/5 border-border/30 5 ',
                )}
              >
                {ratio === option.value && (
                  <div className="absolute inset-0 bg-primary/10 blur-xl rounded-full opacity-50" />
                )}
                <option.icon
                  className={cn(
                    'sm:w-5 sm:h-5 w-4 h-4 transition-transform duration-300 group-hover/btn:scale-110',
                    ratio === option.value ? 'text-primary' : 'text-foreground/40 dark:text-white/40',
                  )}
                />
                <span
                  className={cn(
                    'text-xs uppercase tracking-wider',
                    ratio === option.value ? 'text-primary' : 'text-foreground/40 dark:text-white/40',
                  )}
                >
                  {option.label}
                </span>
              </Button>
            ))}
          </div>
        </div>

        {/* Resolution */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2 text-sm font-bold text-title-color dark:text-white/80 ">
              <Monitor className="w-4 h-4 text-primary" />
              {t('resolution')}
            </div>
            <span className="text-3xs font-bold! text-primary/60 bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">
              {quality}
            </span>
          </div>

          <div className="flex gap-2 p-2  rounded-border-radius flex-col sm:flex-row ">
            {resolutionOptions.map((option) => (
              <Button
                key={option.value}
                onClick={() => setQuality(option.value)}
                className={cn(
                  'relative flex-1 h-12  rounded-xl transition-all  duration-300 flex items-center justify-center gap-2 border font-bold text-[12px] uppercase tracking-widest overflow-hidden',
                  quality === option.value
                    ? ' border-primary text-white! primary-btn'
                    : 'bg-black/3! dark:bg-white/5! border-border/30  dark:border-white/5 text-foreground/40 dark:text-white/40 hover:bg-foreground/10 dark:hover:bg-white/10'
                )}
              >
                {quality === option.value && (
                  <div className="absolute inset-0 " />
                )}
                <span className="relative z-10 font-semibold tracking-tight">{option.label}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* Sound */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-title-color dark:text-white/80">
            <Settings className="w-5 h-5 text-primary" />
            {t('sound')}
          </div>
          <div className="h-12 px-5 bg-black/3 dark:bg-white/3 rounded-border-radius border border-glass-border  flex items-center justify-between">
            <span
              className={`text-xs font-semibold tracking-normal transition-colors ${sound ? 'text-primary' : 'text-subtitle-color'
                }`}
            >
              {sound ? 'Audio Enabled' : 'Muted'}
            </span>
            <Switch
              checked={sound}
              onCheckedChange={setSound}
              className="data-[state=checked]:bg-primary transition-all scale-110"
            />
          </div>
        </div>
      </div>
    </aside>
  )
}
