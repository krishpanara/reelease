'use client'

import { Button } from '@/components/ui/button'
import { platformsConfig } from '@/data/socialMedia'
import { cn } from '@/lib/utils'
import { CalendarPlatformTabsProps } from '@/types/socialMedia'
import { CalendarPlatformId } from '@/utils/calendarHelpers'
import { LayoutDashboard } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'

const CalendarPlatformTabs = ({ activePlatform, onPlatformChange }: CalendarPlatformTabsProps) => {
  const { t } = useTranslation()
  const containerRef = useRef<HTMLDivElement>(null)

  const tabs: { id: CalendarPlatformId; label: string; icon?: React.ComponentType<{ className?: string }> }[] = [
    { id: 'all', label: t('all_platforms', { defaultValue: 'All Platforms' }), icon: LayoutDashboard },
    ...platformsConfig.map((p) => ({ id: p.id as CalendarPlatformId, label: p.label, icon: p.icon })),
  ]

  useEffect(() => {
    if (!containerRef.current) return
    const activeButton = containerRef.current.querySelector('[data-active="true"]')
    if (activeButton) {
      activeButton.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center',
      })
    }
  }, [activePlatform])

  return (
    <div className="w-full rounded-2xl border border-glass-border bg-white dark:bg-white/3 p-3 flex items-center gap-3 overflow-hidden">
      <span className="text-sm font-semibold text-subtitle-color hidden md:block shrink-0">Platforms:</span>
      <div ref={containerRef} className="flex-1 overflow-x-auto no-scrollbar py-1 px-1">
        <div className="flex items-center gap-2 w-max">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activePlatform === tab.id
            const platformCfg = platformsConfig.find((p) => p.id === tab.id)

            return (
              <Button
                key={tab.id}
                onClick={() => onPlatformChange(tab.id)}
                variant="ghost"
                data-active={isActive ? 'true' : 'false'}
                className={cn(
                  'h-9 px-4 py-2! rounded-border-radius-inner! text-md font-semibold gap-2 transition-all duration-300 shrink-0 border flex items-center',
                  isActive
                    ? (tab.id === 'all'
                      ? 'primary-btn text-white! border-none! shadow-sm'
                      : cn(
                          platformCfg?.bg,
                          tab.id === 'threads' ? 'text-black! dark:text-white!' : 'text-white!',
                          tab.id !== 'threads' && 'border-none!',
                          'shadow-sm'
                        ))
                    : 'bg-white dark:bg-white/3! border-glass-border hover:border-primary/50',
                  !isActive && tab.id === 'all' && 'text-title-color!',
                  !isActive && platformCfg?.color === '#000000' && 'text-foreground!'
                )}
                style={
                  !isActive && tab.id !== 'all' && platformCfg?.color !== '#000000'
                    ? { color: platformCfg?.color }
                    : undefined
                }
              >
                {Icon && (
                  <Icon
                    className={cn(
                      "w-4 h-4 shrink-0",
                      isActive
                        ? (tab.id === 'threads' ? "text-black dark:text-white" : "text-white")
                        : (tab.id === 'all' ? "text-primary" : "")
                    )}
                    {...(tab.id !== 'all' ? { filled: !isActive } : {})}
                  />
                )}
                {tab.label}
              </Button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default CalendarPlatformTabs
