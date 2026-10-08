import { Card } from '@/components/ui/card'
import { ROUTES } from '@/constants/routes'
import { cardThemes, waves } from '@/data/profile'
import { ActivitySummaryCardProps } from '@/types'
import {
  ArrowUp,
  ArrowUpNarrowWideIcon,
  Award,
  BarChart3,
  ChevronRight
} from 'lucide-react'
import Link from 'next/link'
import { useTranslation } from 'react-i18next'

export const ActivitySummaryCard = ({ computedStats }: ActivitySummaryCardProps) => {
  const { t } = useTranslation()

  return (
    <Card className="xl:col-span-5 border-glass-border glass-card bg-white dark:bg-slate-900/30 rounded-border-radius p-5 sm:p-6 flex flex-col justify-between space-y-6">
      <div>
        <div className="flex items-center justify-between border-b border-glass-border pb-4 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100/50 dark:border-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-title-color dark:text-white tracking-tight">
                {t('activity_summary', { defaultValue: 'Activity Summary' })}
              </h3>
              <p className="text-base text-subtitle-color   font-medium mt-0.5">
                {t('activity_summary_desc', { defaultValue: 'Your key platform activity at a glance.' })}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          {computedStats.slice(0, 4).map((stat, index) => {
            const StatIcon = stat.icon
            const theme = cardThemes[index] || cardThemes[0]

            return (
              <div
                key={stat.key}
                className={`rounded-2xl p-5 sm:p-6 flex items-start gap-4 sm:gap-5 relative overflow-hidden transition-all duration-300 hover:shadow-md ${theme.cardBg}`}
              >
                <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${theme.iconBg}`}>
                  <StatIcon className="w-6 h-6" />
                </div>

                <div className="flex flex-col z-10 mb-6 sm:mb-8">
                  <span className="text-2xl sm:text-3xl font-black text-title-color dark:text-white leading-none tracking-tight">
                    {stat.value}
                  </span>
                  <span className="text-xs text-subtitle-color  font-bold mt-1.5">
                    {stat.labelKey ? t(stat.labelKey, { defaultValue: stat.defaultLabel }) : stat.defaultLabel}
                  </span>

                  <div className="mt-2.5 flex">
                    <span className="text-[10px] bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5">
                      <ArrowUp className="w-4 h-4" /> {stat.trend}
                    </span>
                  </div>
                </div>

                <svg
                  className="absolute bottom-0 left-0 right-0 w-full h-14 sm:h-16 pointer-events-none"
                  viewBox="0 0 100 20"
                  preserveAspectRatio="none"
                >
                  <defs>
                    <linearGradient id={`grad-${stat.key}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={theme.color} stopOpacity="0.15" />
                      <stop offset="100%" stopColor={theme.color} stopOpacity="0.0" />
                    </linearGradient>
                  </defs>
                  <path d={waves[index % 4].fill} fill={`url(#grad-${stat.key})`} />
                  <path
                    d={waves[index % 4].stroke}
                    fill="none"
                    stroke={theme.color}
                    strokeWidth="2"
                    vectorEffect="non-scaling-stroke"
                    strokeLinecap="round"
                    className="opacity-70 dark:opacity-55"
                  />
                </svg>
              </div>
            )
          })}
        </div>
      </div>

      <div className="bg-primary/5 dark:bg-indigo-950/10 border border-blue-100/50 dark:border-indigo-900/20 rounded-2xl p-4 py-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 border border-blue-200/30 dark:border-blue-900/20 shadow-sm shadow-blue-100/20 dark:shadow-none">
            <Award className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <h4 className="text-sm font-bold text-title-color line-clamp-1 ">
              {t('growth_alert_title', { defaultValue: 'Great going! Your platform is growing steadily.' })}
            </h4>
            <p className="text-xs text-subtitle-color line-clamp-1 mt-0.5">
              {t('growth_alert_desc', { defaultValue: 'Keep up the momentum and reach new milestones.' })}
            </p>
          </div>
        </div>

        <Link href={ROUTES.SOCIAL_MEDIA.ANALYTICS}>
          <button className="flex items-center gap-1 text-xs font-bold text-primary bg-white dark:bg-slate-800  px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 transition-all duration-200">
            {t('view_insights', { defaultValue: 'View Insights' })}
            <ChevronRight className="w-4 h-4" />
          </button>
        </Link>
      </div>
    </Card>
  )
}
