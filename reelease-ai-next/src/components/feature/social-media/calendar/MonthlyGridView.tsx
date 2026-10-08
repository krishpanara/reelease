'use client'

import { platformIcons, platforms, weekdayLabelsFull, weekdayLabelsShort } from '@/data/socialMedia'
import { cn } from '@/lib/utils'
import { MonthlyGridViewProps } from '@/types/socialMedia'
import { getPostDisplayTitle, getPostPlatforms, getUniquePlatformsFromPosts } from '@/utils/calendarHelpers'
import { getLocalDateString, formatTime12 } from '@/utils/socialMedia'
import { Share2, Plus } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import Link from 'next/link'
import { ROUTES } from '@/constants/routes'



export function MonthlyGridView({
  monthDays,
  selectedDate,
  setSelectedDate,
  setView,
  postsByDate,
  setSelectedPost,
}: MonthlyGridViewProps) {
  const { t } = useTranslation()

  return (
    <div className="rounded-2xl border border-glass-border bg-[var(--calendar-surface)] dark:bg-white/3 overflow-hidden shadow-xl">
      <div className="overflow-x-auto custom-scrollbar">
        <div className="min-w-[1100px]">

          <div className="grid grid-cols-7 border-b border-glass-border">
            {weekdayLabelsFull.map((w, i) => (
              <div
                key={w + i}
                className="py-3 text-center text-[10px] font-black uppercase text-muted-foreground tracking-widest"
              >
                <span className="hidden sm:inline">{w}</span>
                <span className="sm:hidden">{weekdayLabelsShort[i]}</span>
              </div>
            ))}
          </div>

          <div
            className={cn(
              "grid grid-cols-7",
              monthDays.length <= 35 ? "grid-rows-5" : "grid-rows-6"
            )}
          >
            {monthDays.map((day, idx) => {
              const dayStr = getLocalDateString(day)
              const posts = postsByDate[dayStr] || []
              const uniquePlatforms = getUniquePlatformsFromPosts(posts)
              const isCurrentMonth = day.getMonth() === selectedDate.getMonth()
              const isToday = new Date().toDateString() === day.toDateString()

              return (
                <div
                  key={idx}
                  className={cn(
                    'group p-1.5 border border-[var(--calendar-grid-line)] space-y-1.5 max-h-[160px] overflow-auto custom-scrollbar relative z-10',
                    isCurrentMonth ? 'bg-transparent' : 'bg-black/10 opacity-40',
                    isToday && 'bg-primary/5 ring-1 ring-inset ring-primary/30',
                  )}
                >
                  <div className="flex items-start justify-between mb-2">
                    <span
                      className={cn(
                        'text-xs font-black w-7 h-7 flex items-center justify-center rounded-full',
                        isToday
                          ? 'bg-primary text-primary-foreground'
                          : isCurrentMonth
                            ? 'text-foreground'
                            : 'text-muted-foreground',
                      )}
                    >
                      {day.getDate()}
                    </span>
                    <Link
                      href={ROUTES.SOCIAL_MEDIA.COMPOSER}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1 bg-black/5 dark:bg-white/5 rounded-[3px] text-muted-foreground"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Plus className="w-4 h-4" strokeWidth={2.5} />
                    </Link>
                  </div>

                  {posts.length > 0 && (
                    <div className="flex flex-col gap-1.5 w-full overflow-hidden">
                      {posts.map((post, i) => {
                        const platformIds = getPostPlatforms(post)
                        const primaryPlatformId = platformIds[0] || 'facebook'
                        const platObj = platforms.find((p) => p.id === primaryPlatformId) || platforms[0]
                        const platformId = platObj?.id || 'facebook'
                        const IconComponent = platformIcons[platformId] || Share2
                        const title = getPostDisplayTitle(post)
                        const timeRaw = post.scheduled_at || post.published_at || post.created_at
                        const timeStr = timeRaw ? formatTime12(timeRaw).replace(/^0/, '') : ''

                        // Use platform-specific colors for the pill
                        const bgColor = platObj?.bgColor || 'bg-muted'
                        const borderColor = platObj?.borderColor || 'border-transparent'
                        const textColor = platObj?.color || 'text-foreground'

                        return (
                          <button
                            key={post.id || i}
                            onClick={(e) => {
                              e.stopPropagation()
                              setSelectedPost(post)
                            }}
                            className={cn(
                              "flex items-center justify-between w-full px-2 py-1 rounded-[4px] border text-[11px] font-semibold transition-all hover:brightness-95 dark:hover:brightness-110",
                              bgColor,
                              borderColor,
                              textColor
                            )}
                          >
                            <div className="flex items-center gap-1.5 min-w-0 flex-1">
                              <IconComponent className={cn("w-3.5 h-3.5 shrink-0", textColor)} />
                              <span className="truncate">{title}</span>
                            </div>
                            {timeStr && <span className="shrink-0 opacity-80 ml-1 text-[10px] font-medium tracking-wide">{timeStr}</span>}
                          </button>
                        )
                      })}

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
