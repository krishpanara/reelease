'use client'

import { useTranslation } from 'react-i18next'
import UpcomingPostsList from './UpcomingPostsList'
import ContentOverviewChart from './ContentOverviewChart'
import MonthlySummaryChart from './MonthlySummaryChart'
import {
  getContentOverviewByPlatform,
  getMonthlySummaryStats,
  getUpcomingPosts,
} from '@/utils/calendarHelpers'
import { CalendarSidebarProps } from '@/types/socialMedia'



const CalendarSidebar = ({ view, posts, weekPosts, selectedDate, onPostClick }: CalendarSidebarProps) => {
  const { t } = useTranslation()
  const upcoming = getUpcomingPosts(posts, 5)
  const overviewData = getContentOverviewByPlatform(weekPosts)
  const monthlyStats = getMonthlySummaryStats(posts, selectedDate)

  return (
    <aside className="w-full 2xl:w-[320px] shrink-0">
      <div className="grid grid-cols-1 sm:grid-cols-2 2xl:grid-cols-1 gap-4">
        <div className="glass-card rounded-border-radius border border-glass-border p-5 space-y-4 dark:bg-white/3 bg-white h-fit">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-foreground">
              {t('upcoming_posts', { defaultValue: 'Upcoming Posts' })}
            </h3>
          </div>
          <UpcomingPostsList posts={upcoming} onPostClick={onPostClick} />
        </div>

        {view === 'week' ? (
          <div className="glass-card rounded-border-radius border border-glass-border p-5 space-y-4 dark:bg-white/3 bg-white">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-foreground">
                {t('content_overview', { defaultValue: 'Content Overview' })}
              </h3>
              <span className="text-xs font-bold text-subtitle-color">
                {t('this_week', { defaultValue: 'This Week' })}
              </span>
            </div>
            <ContentOverviewChart data={overviewData} />
          </div>
        ) : (
          <div className="bg-white rounded-border-radius border border-glass-border p-5 space-y-4 dark:bg-white/3">
            <h3 className="text-sm font-bold text-foreground">
              {t('monthly_summary', { defaultValue: 'Monthly Summary' })}
            </h3>
            <MonthlySummaryChart
              total={monthlyStats.total}
              changePct={monthlyStats.changePct}
              engagementRate={monthlyStats.engagementRate}
              engagementChangePct={monthlyStats.engagementChangePct}
              dailyCounts={monthlyStats.dailyCounts}
              prevMonthLabel={monthlyStats.prevMonthLabel}
            />
          </div>
        )}
      </div>
    </aside>
  )
}

export default CalendarSidebar
