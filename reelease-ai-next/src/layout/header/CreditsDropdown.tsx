import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { useGetDashboardStatsQuery } from '@/redux/api/dashboardApi'
import { useAppSelector } from '@/redux/hooks'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Sparkles, Zap, Target, TrendingUp, Info, Image as ImageIcon, Layers, Video, ImagePlay, Move, Box, LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

const FeatureIconMap: Record<string, LucideIcon> = {
  image: ImageIcon,
  images: Layers,
  video: Video,
  clapperboard: ImagePlay,
  move: Move,
}

const CreditsDropdown = () => {
  const { t } = useTranslation()
  const { user, isAuthenticated } = useAppSelector((state) => state.auth)
  const { data: statsResp } = useGetDashboardStatsQuery(undefined, {
    pollingInterval: 15000,
    skip: !isAuthenticated,
  })
  const [isPopoverOpen, setIsPopoverOpen] = useState(false)

  if (user?.role !== 'user') return null

  const totalCredits = user.total_credits ?? 0
  const remainingCredits = user.remaining_credits ?? 0
  const usedCredits = user.used_credits ?? Math.max(0, totalCredits - remainingCredits)
  const usagePercentage = totalCredits > 0 ? Math.min((usedCredits / totalCredits) * 100, 100) : 0

  return (
    <div onMouseEnter={() => setIsPopoverOpen(true)} onMouseLeave={() => setIsPopoverOpen(false)} className="relative">
      <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
        <PopoverTrigger asChild>
          <Button className=" group px-2 sm:px-4 py-2 h-11 hover:bg-black/3!  flex cursor-pointer md575:hidden rounded-border-radius-inner!" size="sm">
            <span className="btn-lining-content text-xs sm:text-sm whitespace-nowrap dark:text-white  flex items-center gap-1.5 sm:gap-2">
              <span className="hidden min-[400px]:inline">{t('credits')}: </span>
              {usedCredits}
              <span className="hidden sm:inline"> / {totalCredits}</span>
            </span>
          </Button>
        </PopoverTrigger>

        <PopoverContent
          sideOffset={8}
          className="w-90 p-0 overflow-hidden glass-card bg-white dark:bg-modal-bg-color rounded-2xl border-white/10 shadow-2xl animate-in fade-in zoom-in-95 duration-200 z-50"
        >
          {/* Header */}
          <div className="p-4 pb-0 bg-linear-to-b from-primary/10 to-transparent">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-base font-bold text-foreground flex items-center gap-2 ">
                <Zap className="w-4 h-4 text-primary fill-primary" />
                {t('credits_overview', { defaultValue: 'Credits Overview' })}
              </h4>
              <div className="text-[10px] bg-primary/20 text-primary px-2.5 py-0.5 rounded-full font-black">
                {usagePercentage.toFixed(0)}%
              </div>
            </div>

            <div className="space-y-2">
              <div >
                <div
                  className="h-full bg-primary transition-all duration-1000 ease-out shadow-[0_0_12px_rgba(147,197,253,0.4)]"
                  style={{ width: `${usagePercentage}%` }}
                />
              </div>
              <div className="flex justify-between text-sm font-medium text-subtitle-color">
                <span>{t('consumed', { defaultValue: 'Consumed' })}</span>
                <span className="dark:text-white text-black">{usedCredits} / {totalCredits}</span>
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="p-4 space-y-5">
            <div className="grid grid-cols-2 gap-3 text-black">
              <CreditStat
                label={t('total_credits', { defaultValue: 'Total Plan' })}
                value={totalCredits}
                icon={<Target className="w-3.5 h-3.5" />}
              />
              <CreditStat
                label={t('remaining', { defaultValue: 'Available' })}
                value={remainingCredits}
                highlight
                icon={<Sparkles className="w-3.5 h-3.5" />}
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-subtitle-color  tracking-tight">{t('feature_usage', { defaultValue: 'Features Usage' })}</p>
                <TrendingUp className="w-3.5 h-3.5 text-primary" />
              </div>

              <TooltipProvider delayDuration={0}>
                <div className="grid grid-cols-2 sm:grid-cols-3  gap-2 pt-1">
                  {(statsResp?.aiFeatures || []).map((feature) => {
                    const Icon = FeatureIconMap[feature.icon] || Box

                    return (
                      <Tooltip key={feature.feature_key}>
                        <TooltipTrigger asChild>
                          <div className="group/item flex flex-col items-center justify-center p-2 rounded-sm  border border-glass-border dark:hover:border-primary/20 hover:border-primary hover:bg-white/10 transition-all duration-300 cursor-default">
                            <div className="w-8 h-8 mb-1.5 rounded-lg bg-primary/10 flex items-center justify-center transition-all duration-500 group-hover/item:scale-105 group-hover/item:bg-primary/20 shadow-sm">
                              <Icon className="w-4 h-4 text-primary" />
                            </div>
                            <span className="text-[11px] font-black text-subtitle-color transition-all duration-300">
                              {feature.credits}
                            </span>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="font-bold text-[12px] bg-primary text-white border-none rounded-[6px]">
                          {feature.display_name}
                        </TooltipContent>
                      </Tooltip>
                    )
                  })}
                </div>
              </TooltipProvider>
            </div>
          </div>

          {/* Footer */}
          <div className="px-4 py-3 bg-white/3 border-t border-white/5 flex items-center gap-2">
            <Info className="w-5 h-5 text-primary" />
            <p className="text-xs text-subtitle-color font-medium">
              {t('credits_refresh_msg', { defaultValue: 'Credits refresh according to your billing cycle.' })}
            </p>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}

// Small helper to avoid repeating the stat card markup
const CreditStat = ({
  label,
  value,
  highlight,
  icon
}: {
  label: string;
  value: number;
  highlight?: boolean;
  icon?: React.ReactNode
}) => (
  <div className="p-3 rounded-sm dark:bg-white/5 bg-black/5 border border-glass-border dark:hover:border-primary/20 hover:border-primary transition-all duration-300 group/stat">
    <div className="flex items-center gap-2 mb-1.5">
      {icon && <div className="text-primary/60 group-hover/stat:text-primary transition-colors">{icon}</div>}
      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight">{label}</p>
    </div>
    <p className={cn(
      "text-sm font-black tabular-nums tracking-tight",
      highlight ? " text-subtitle-color" : "text-subtitle-color dark:text-white"
    )}>
      {value}
    </p>
  </div>
)

export default CreditsDropdown
