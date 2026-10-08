'use client'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { WeeklyPlannerViewProps } from '@/types/socialMedia'
import { getLocalDateString } from '@/utils/socialMedia'
import { Plus } from 'lucide-react'
import Link from 'next/link'
import { useTranslation } from 'react-i18next'
import WeeklyTimeSlotPost from './WeeklyTimeSlotPost'


export function WeeklyPlannerView({
  weekDays,
  postsByDate,
  setSelectedPost,
}: WeeklyPlannerViewProps) {
  const { t } = useTranslation()
  const now = new Date()

  return (
    <div className="rounded-2xl border border-glass-border bg-[var(--calendar-surface)] dark:bg-white/3 overflow-hidden shadow-xl flex flex-col" style={{ height: 'calc(100vh - 200px)' }}>
      {/* Horizontal scroll wrapper */}
      <div className="overflow-x-auto custom-scrollbar flex-1 flex flex-col min-h-0">
        <div className="min-w-[1100px] flex flex-col flex-1 min-h-0">
          {/* Day headers - sticky */}
          <div className="grid grid-cols-7 border-b border-[var(--calendar-grid-line)] bg-[var(--calendar-header-bg)] dark:bg-white/3 sticky top-0 z-20 shrink-0">
            {weekDays.map((day, idx) => {
              const isToday = day.toDateString() === now.toDateString()
              const weekday = day.toLocaleDateString('default', { weekday: 'short' }).toUpperCase()
              const month = day.toLocaleDateString('default', { month: 'short' })

              return (
                <div
                  key={idx}
                  className={cn(
                    'px-2 py-4 text-center border-l border-[var(--calendar-grid-line)] first:border-l-0',
                    isToday && 'bg-[var(--calendar-header-highlight)]',
                  )}
                >
                  {isToday ? (
                    <>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#3b82f6]">
                        {weekday}
                      </p>
                      <div className="mt-1.5 flex items-center justify-center gap-1.5">
                        <span className="inline-flex h-8 min-w-8 items-center justify-center rounded-full bg-[#3b82f6] px-2 text-sm font-bold text-white">
                          {day.getDate()}
                        </span>
                        <span className="text-sm font-semibold text-[var(--calendar-heading)]">{month}</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--calendar-label)]">
                        {weekday}
                      </p>
                      <p className="mt-1 text-sm font-semibold text-[var(--calendar-heading)]">
                        {day.getDate()} {month}
                      </p>
                    </>
                  )}
                </div>
              )
            })}
          </div>

          {/* Day columns with posts (scrollable) and create button (sticky bottom) */}
          <div className="grid grid-cols-7 flex-1 min-h-0">
            {weekDays.map((day, idx) => {
              const dayStr = getLocalDateString(day)
              const posts = postsByDate[dayStr] || []
              const isToday = day.toDateString() === now.toDateString()
              const dayStart = new Date(day.getFullYear(), day.getMonth(), day.getDate())
              const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
              const isPast = dayStart.getTime() < todayStart.getTime()

              return (
                <div
                  key={idx}
                  className={cn(
                    'border-l border-[var(--calendar-grid-line)] first:border-l-0 flex flex-col min-h-0',
                    isToday && 'bg-primary/3',
                  )}
                >
                  {/* Scrollable posts area */}
                  <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar p-2 space-y-2">
                    {posts.map((post) => (
                      <WeeklyTimeSlotPost
                        key={post._id || post.id}
                        post={post}
                        onClick={() => setSelectedPost(post)}
                      />
                    ))}
                  </div>

                  {/* Static create button at bottom */}
                  {!isPast && (
                    <div className="shrink-0 p-2 pt-0 ">
                      <Button
                        asChild
                        variant="ghost"
                        className="w-full h-8 border border-[var(--calendar-grid-line)] hover:border-primary/50 hover:bg-primary/5 hover:text-primary transition-all rounded-lg text-muted-foreground"
                      >
                        <Link href={`/social-media/composer?date=${dayStr}`}>
                          <Plus className="w-3.5 h-3.5" />
                          <span className="text-[11px] font-semibold ml-1">Create</span>
                        </Link>
                      </Button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
