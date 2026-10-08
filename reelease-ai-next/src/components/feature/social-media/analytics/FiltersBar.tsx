import React from 'react'
import { Calendar, ChevronDown, LayoutDashboard } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { platformIcons, platformColors } from '@/data/analyticsData'
import { FiltersBarProps } from '@/types/analytics'
import { cn } from '@/lib/utils'
import { platformsConfig } from '@/data/socialMedia'

export default function FiltersBar({
  selectedPlatform,
  setSelectedPlatform,
  period,
  setPeriod,
  availablePlatforms,
  periods,
  t,
}: FiltersBarProps) {
  const selectedPeriod = periods.find((p) => p.value === period)

  return (
    <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 p-4 rounded-border-radius bg-white dark:bg-white/3 glass-card border border-glass-border">
      {/* Platform Tabs Selector */}
      <div className="w-full lg:flex-1 min-w-0 flex items-center gap-3 overflow-hidden">
        <span className="text-sm font-semibold text-subtitle-color hidden md:block shrink-0">
          {t('platforms', { defaultValue: 'Platforms' })}:
        </span>
        <div className="flex-1 overflow-x-auto no-scrollbar py-1 px-1">
          <div className="flex items-center gap-2 w-max">
            {availablePlatforms.map((plat) => {
              const Icon = plat === 'all' ? LayoutDashboard : platformIcons[plat]
              const isSelected = selectedPlatform === plat
              const platColor = platformColors[plat] || '#000000'
              const platformCfg = platformsConfig.find((p) => p.id === plat)

              return (
                <Button
                  key={plat}
                  onClick={() => setSelectedPlatform(plat)}
                  variant="ghost"
                  data-active={isSelected ? 'true' : 'false'}
                  className={cn(
                    'h-9 px-4 py-2! rounded-border-radius-inner! text-md font-semibold gap-2 transition-all duration-300 shrink-0 border flex items-center',
                    isSelected
                      ? (plat === 'all'
                        ? 'primary-btn text-white! border-none! shadow-sm'
                        : cn(
                            platformCfg?.bg,
                            plat === 'threads' ? 'text-black! dark:text-white!' : 'text-white!',
                            plat !== 'threads' && 'border-none!',
                            'shadow-sm'
                          ))
                      : 'bg-white dark:bg-white/3! border-glass-border hover:border-primary/50',
                    !isSelected && plat === 'all' && 'text-title-color!',
                    !isSelected && platColor === '#1C1C1C' && 'text-foreground!'
                  )}
                  style={
                    !isSelected && plat !== 'all' && platColor !== '#1C1C1C'
                      ? { color: platColor }
                      : undefined
                  }
                >
                  {Icon && (
                    <Icon
                      className={cn(
                        "w-4 h-4 shrink-0",
                        isSelected
                          ? (plat === 'threads' ? "text-black dark:text-white" : "text-white")
                          : (plat === 'all' ? "text-primary" : "")
                      )}
                      {...(plat !== 'all' ? { filled: !isSelected } : {})}
                    />
                  )}
                  <span className="capitalize">
                    {plat === 'all' ? t('all_platforms', { defaultValue: 'All Platforms' }) : plat}
                  </span>
                </Button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Time Period Popover Selector */}
      <div className="flex justify-end w-full lg:w-auto shrink-0">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="gap-2 rounded-xl border-glass-border dark:bg-white/3 text-xs font-semibold text-title-color! h-10 px-4"
            >
              <Calendar className="w-4 h-4" />
              {selectedPeriod
                ? t(selectedPeriod.labelKey, { defaultValue: selectedPeriod.defaultLabel })
                : t('this_month', { defaultValue: 'This Month' })}
              <ChevronDown className="w-3.5 h-3.5" />
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className="w-40 px-2 py-2 border-glass-border bg-white dark:bg-slate-950 backdrop-blur-3xl rounded-xl shadow-2xl"
            align="end"
          >
            {periods.map((p) => (
              <button
                key={p.value}
                onClick={() => setPeriod(p.value)}
                className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-semibold transition-colors ${
                  period === p.value
                    ? 'bg-primary/10 text-primary'
                    : 'text-subtitle-color hover:text-primary! hover:bg-primary/10!'
                }`}
              >
                {t(p.labelKey, { defaultValue: p.defaultLabel })}
              </button>
            ))}
          </PopoverContent>
        </Popover>
      </div>
    </div>
  )
}
