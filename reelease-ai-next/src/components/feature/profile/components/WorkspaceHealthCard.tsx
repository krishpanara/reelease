import { Button } from '@/components/ui/button'
import { Activity } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { WorkspaceHealthCardProps } from '@/types'
import { useTranslation } from 'react-i18next'
import { CircularProgress } from './CircularProgress'

export const WorkspaceHealthCard = ({
  computedHealthGauges,
  onReportClick
}: WorkspaceHealthCardProps) => {
  const { t } = useTranslation()

  return (
    <Card className="w-full border-glass-border glass-card bg-white dark:bg-slate-900/30 rounded-border-radius p-5 sm:p-6 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between border-b border-glass-border pb-4 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-50 dark:bg-violet-950/40 border border-violet-100/50 dark:border-violet-900/30 flex items-center justify-center text-violet-600 dark:text-violet-400">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-title-color dark:text-white tracking-tight">
                {t('workspace_health', { defaultValue: 'Workspace Health' })}
              </h3>
              <p className="text-base text-subtitle-color  font-medium mt-0.5">
                {t('workspace_health_desc', { defaultValue: 'Your workspace performance and quality score.' })}
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            className="h-8 px-3 rounded-lg border-glass-border text-xs font-bold text-subtitle-color   cursor-pointer dark:bg-transparent"
            onClick={onReportClick}
          >
            {t('view_full_report', { defaultValue: 'View Report' })}
          </Button>
        </div>

        {/* Stacking Progress Circular Indicators */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 items-center justify-items-center py-2">
          {computedHealthGauges.map((gauge) => (
            <div key={gauge.key} className="flex flex-col items-center text-center space-y-3">
              <CircularProgress percentage={gauge.percentage} color={gauge.color} />
              <div className="space-y-0.5">
                <span className="text-sm text-title-color dark:text-white font-extrabold block leading-tight">
                  {t(gauge.labelKey, { defaultValue: gauge.defaultLabel })}
                </span>
                <span
                  className={cn(
                    'text-xs font-black uppercase tracking-wider block',
                    gauge.color === 'success' && 'text-emerald-500 dark:text-emerald-400',
                    gauge.color === 'info' && 'text-blue-500 dark:text-blue-400',
                    gauge.color === 'warning' && 'text-amber-500 dark:text-amber-400',
                    gauge.color === 'error' && 'text-red-500 dark:text-red-400'
                  )}
                >
                  {t(gauge.statusKey, { defaultValue: gauge.defaultStatus })}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  )
}
