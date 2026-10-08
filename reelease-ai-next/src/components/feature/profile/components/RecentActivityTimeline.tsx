import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { History } from 'lucide-react'
import { RecentActivityTimelineProps } from '@/types'
import { useTranslation } from 'react-i18next'

export const RecentActivityTimeline = ({
  recentActivitiesTimeline,
  onViewAllClick
}: RecentActivityTimelineProps) => {
  const { t } = useTranslation()

  return (
    <Card className="border-glass-border glass-card bg-white dark:bg-slate-900/30 rounded-border-radius p-5 sm:p-6">
      <div className="flex items-center justify-between border-b border-glass-border pb-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sky-50 dark:bg-sky-950/40 border border-sky-100/50 dark:border-sky-900/30 flex items-center justify-center text-sky-600 dark:text-sky-400">
            <History className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-black text-title-color dark:text-white tracking-tight">
              {t('recent_account_activity', { defaultValue: 'Recent Account Activity' })}
            </h3>
            <p className="text-base text-subtitle-color  font-medium mt-0.5">
              {t('recent_account_activity_desc', { defaultValue: 'A timeline of your recent account actions.' })}
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          className="h-8 px-4 rounded-lg border-glass-border text-xs font-bold text-subtitle-color dark:bg-transparent cursor-pointer"
          onClick={onViewAllClick}
        >
          {t('view_all_activity', { defaultValue: 'View All Activity' })}
        </Button>
      </div>

      {/* Responsive Horizontal timeline flow */}
      <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-6 md:gap-4 pt-4 pb-2">
        {recentActivitiesTimeline.length > 0 ? (
          recentActivitiesTimeline.map((item, index) => {
            const ActIcon = item.icon
            return (
              <div key={item.id} className="flex-1 flex flex-row md:flex-col items-center text-left md:text-center relative w-full">
                {/* Connector dotted line */}
                {index < recentActivitiesTimeline.length - 1 && (
                  <div className="hidden md:block absolute top-5 left-[calc(50%+20px)] right-[calc(-50%+20px)] h-0.5 border-t-2 border-dotted border-glass-border z-0" />
                )}

                {/* Node circle */}
                <div className={`relative z-10 w-10 h-10 rounded-full border flex items-center justify-center shrink-0 shadow-sm ${item.colorClass}`}>
                  <ActIcon className="w-4.5 h-4.5" />
                </div>

                {/* Details content */}
                <div className="ml-4 md:ml-0 md:mt-3">
                  <p className="text-sm font-extrabold text-title-color dark:text-white leading-tight">
                    {item.title}
                  </p>
                  <p className="text-xs text-subtitle-color  font-semibold mt-1">
                    {item.time}
                  </p>
                </div>
              </div>
            )
          })
        ) : (
          <div className="text-center py-6 w-full text-subtitle-color  font-bold text-xs">
            {t('no_recent_activity', { defaultValue: 'No recent account activity recorded.' })}
          </div>
        )}
      </div>
    </Card>
  )
}
