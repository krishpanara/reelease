'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { ROUTES } from '@/constants/routes'
import { platformIcons } from '@/data/socialMedia'
import { UpcomingPostsProps } from '@/types/socialMedia'
import { format } from 'date-fns'
import { Calendar, CalendarClock, Clock, Plus, ArrowRight } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useTranslation } from 'react-i18next'
import { Skeleton } from '@/components/ui/skeleton'
import Link from 'next/link'

import { FacebookIcon } from '@/components/ui/FacebookIcon'
import { InstagramIcon } from '@/components/ui/InstagramIcon'
import { LinkedInIcon } from '@/components/ui/LinkedInIcon'
import { YouTubeIcon } from '@/components/ui/YouTubeIcon'
import { ThreadsIcon } from '@/components/ui/threadsIcon'
import { TikTokIcon } from '@/components/ui/TikTokIcon'
import { XIcon as Twitter } from '@/components/ui/XIcon'

const platformFilledIcons: Record<string, React.ComponentType<any>> = {
  facebook: FacebookIcon,
  instagram: InstagramIcon,
  linkedin: LinkedInIcon,
  twitter: Twitter,
  x: Twitter,
  youtube: YouTubeIcon,
  threads: ThreadsIcon,
  tiktok: TikTokIcon,
}

export const UpcomingPosts = ({ posts, isLoading }: UpcomingPostsProps) => {
  const { t } = useTranslation()
  const router = useRouter()
  const [filter, setFilter] = useState<'today' | 'tomorrow' | 'dayAfter'>('today')

  const now = new Date()

  // Timeframe calculation
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999)

  const startOfTomorrow = new Date(startOfToday)
  startOfTomorrow.setDate(startOfToday.getDate() + 1)
  const endOfTomorrow = new Date(endOfToday)
  endOfTomorrow.setDate(endOfToday.getDate() + 1)

  const startOfDayAfterTomorrow = new Date(startOfToday)
  startOfDayAfterTomorrow.setDate(startOfToday.getDate() + 2)
  const endOfDayAfterTomorrow = new Date(endOfToday)
  endOfDayAfterTomorrow.setDate(endOfToday.getDate() + 2)

  // Filter posts
  const filteredPosts = posts
    .filter((post: any) => {
      const dateVal = post.scheduled_at || post.published_at || post.created_at
      if (!dateVal) return false
      const postDate = new Date(dateVal)

      if (filter === 'today') {
        return postDate >= startOfToday && postDate <= endOfToday
      }
      if (filter === 'tomorrow') {
        return postDate >= startOfTomorrow && postDate <= endOfTomorrow
      }
      if (filter === 'dayAfter') {
        return postDate >= startOfDayAfterTomorrow && postDate <= endOfDayAfterTomorrow
      }
      return true
    })
    .sort((a: any, b: any) => {
      const aDate = new Date(a.scheduled_at || a.published_at || a.created_at).getTime()
      const bDate = new Date(b.scheduled_at || b.published_at || b.created_at).getTime()
      return aDate - bDate
    })

  // Count posts for each day
  const todayCount = posts.filter((post: any) => {
    const dateVal = post.scheduled_at || post.published_at || post.created_at
    if (!dateVal) return false
    const postDate = new Date(dateVal)
    return postDate >= startOfToday && postDate <= endOfToday
  }).length

  const tomorrowCount = posts.filter((post: any) => {
    const dateVal = post.scheduled_at || post.published_at || post.created_at
    if (!dateVal) return false
    const postDate = new Date(dateVal)
    return postDate >= startOfTomorrow && postDate <= endOfTomorrow
  }).length

  const dayAfterCount = posts.filter((post: any) => {
    const dateVal = post.scheduled_at || post.published_at || post.created_at
    if (!dateVal) return false
    const postDate = new Date(dateVal)
    return postDate >= startOfDayAfterTomorrow && postDate <= endOfDayAfterTomorrow
  }).length

  const displayNames: Record<string, string> = {
    facebook: 'Facebook',
    instagram: 'Instagram',
    linkedin: 'LinkedIn',
    twitter: 'Twitter',
    x: 'Twitter',
    youtube: 'YouTube',
    threads: 'Threads',
    tiktok: 'TikTok',
  }

  return (
    <Card className="p-px rounded-border-radius dark:bg-white/3! border-none glass-card overflow-hidden h-full">
      <div className="p-4 sm:p-5 h-full flex flex-col">
        {/* Header Row */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 flex justify-center items-center rounded-[9px] bg-amber-500 shrink-0">
              <CalendarClock className="w-5.5 h-5.5 text-white!" />
            </div>
            <div>
              <h3 className="sm:text-xl text-lg mb-0 font-extrabold text-title-color dark:text-white tracking-tight flex items-center gap-2">
                {t('scheduled_posts', { defaultValue: 'Scheduled Posts' })}
              </h3>
              <p className="text-base text-subtitle-color">
                {t('scheduled_content', { defaultValue: 'Your scheduled content' })}
              </p>
            </div>
          </div>
          <Button
            onClick={() => router.push(ROUTES.SOCIAL_MEDIA.CALENDAR)}
            variant="outline"
            className="gap-2 bg-transparent border border-primary/50! text-primary transition-all rounded-xl text-xs font-semibold h-9 px-4 shrink-0 w-full sm:w-auto justify-center mt-2 sm:mt-0"
          >
            <Calendar className="w-3.5 h-3.5" />
            {t('view_calendar', { defaultValue: 'View Calendar' })}
          </Button>
        </div>

        {/* Tabs Container */}
        <div className="flex gap-2 mb-5 pb-5 border-b border-slate-100 dark:border-white/5 w-full">
          {[
            { id: 'today', label: t('today', { defaultValue: 'Today' }), date: startOfToday, count: todayCount },
            { id: 'tomorrow', label: t('tomorrow', { defaultValue: 'Tomorrow' }), date: startOfTomorrow, count: tomorrowCount },
            { id: 'dayAfter', label: t('day_after_tomorrow', { defaultValue: 'Day After' }), date: startOfDayAfterTomorrow, count: dayAfterCount },
          ].map((tab) => {
            const isActive = filter === tab.id
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFilter(tab.id as any)}
                className={cn(
                  "flex-1 flex flex-col items-center justify-center py-2.5 px-3 rounded-border-radius-inner transition-all duration-300 border text-center cursor-pointer select-none outline-none relative",
                  isActive
                    ? "bg-primary/15 border-primary text-primary font-extrabold shadow-sm"
                    : "bg-slate-100/50 dark:bg-white/3 border-glass-border text-subtitle-color hover:border-slate-300/80 dark:hover:border-white/15 hover:text-title-color dark:hover:text-white font-semibold"
                )}
              >
                <div className="flex items-center gap-1.5 justify-center w-full">
                  <span className="text-4xs sm:text-3xs text-title-color truncate">
                    {tab.label}
                  </span>
                </div>
                <span className="text-sm sm:text-base font-black mt-0.5 text-title-color">
                  {format(tab.date, 'MMM d')}
                </span>
              </button>
            )
          })}
        </div>

        {/* Dynamic Timeline list */}
        {isLoading ? (
          <div className="relative space-y-4 py-2 flex-1">
            <div className="absolute left-[108px] top-2 bottom-2 w-[1.5px] bg-slate-200 dark:bg-white/10 animate-pulse" />
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-4">
                {/* Left time skeleton */}
                <div className="w-20 flex flex-col items-end justify-center gap-1 shrink-0">
                  {filter !== 'today' && (
                    <Skeleton className="h-3 w-8 rounded" />
                  )}
                  <Skeleton className="h-4 w-12 rounded" />
                </div>
                {/* Dot */}
                <div className="w-6 flex items-center justify-center shrink-0 relative z-10">
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-zinc-700 border-2 border-white dark:border-[#0f172a]" />
                </div>
                {/* Card */}
                <div className="flex-1 flex items-center justify-between p-3.5 rounded-xl bg-slate-50/50 dark:bg-white/1 border border-glass-border">
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-1/3 rounded" />
                    <Skeleton className="h-3 w-1/2 rounded" />
                  </div>
                  <Skeleton className="w-8 h-8 rounded-lg shrink-0 ml-3" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center py-8">
            <div className="p-3 rounded-full bg-amber-400/5 mb-3">
              <CalendarClock className="w-7 h-7 text-amber-400/50" />
            </div>
            <p className="text-base font-semibold text-subtitle-color mb-1">
              {t('no_posts_for_filter', { defaultValue: 'No scheduled posts' })}
            </p>
            <p className="text-xs text-muted-foreground mb-4 max-w-[220px]">
              {t('no_posts_filter_desc', {
                defaultValue: 'Schedule content or select another filter to view posts.',
              })}
            </p>
            <Button
              onClick={() => router.push(ROUTES.SOCIAL_MEDIA.COMPOSER)}
              className="gap-2 primary-btn rounded-xl text-white! text-xs font-semibold h-9 px-4"
            >
              <Plus className="w-3.5 h-3.5" />
              {t('create_new_post', { defaultValue: 'Create New Post' })}
            </Button>
          </div>
        ) : (
          <div className="relative overflow-auto max-h-[335px] w-full no-scrollbar pr-1 flex-1">
            <div className="relative space-y-4">
              {/* Vertical connector line */}
              <div className="absolute left-[108px] top-2 bottom-2 w-[1.5px] bg-slate-200 dark:bg-white/10" />

              {filteredPosts.map((post: any) => {
                const dateVal = post.scheduled_at || post.published_at || post.created_at
                const IconComponent = platformFilledIcons[post.platform?.toLowerCase()] || platformIcons[post.platform] || CalendarClock
                const platformLower = (post.platform || '').toLowerCase()
                const platformName = displayNames[platformLower] || post.platform || 'Platform'
                const contentType = post.content_type || 'Post'
                const postTitle = `${platformName} ${contentType.charAt(0).toUpperCase() + contentType.slice(1)}`

                return (
                  <div
                    key={post.id || post._id}
                    className="flex items-center gap-4 group/item"
                  >
                    {/* Left: Scheduled Time */}
                    <div className="w-20 text-right text-xs sm:text-sm font-semibold text-slate-500 dark:text-zinc-400 shrink-0 flex flex-col justify-center gap-0.5">
                      {filter !== 'today' && dateVal && (
                        <span className="text-[10px] text-slate-400 dark:text-zinc-500 uppercase tracking-wider block font-bold leading-none">
                          {format(new Date(dateVal), 'MMM d')}
                        </span>
                      )}
                      <span className="leading-none">
                        {dateVal ? format(new Date(dateVal), 'hh:mm a') : '00:00'}
                      </span>
                    </div>

                    {/* Dot */}
                    <div className="w-6 flex items-center justify-center shrink-0 relative z-10">
                      <div className="w-2 h-2 rounded-full bg-slate-300 dark:bg-zinc-700 border-2 border-white dark:border-[#0f172a] group-hover/item:bg-primary group-hover/item:border-primary transition-all duration-300" />
                    </div>

                    {/* Right Card */}
                    <div className="flex-1 flex items-center justify-between p-3.5 rounded-xl bg-slate-50/50 dark:bg-white/1 hover:bg-slate-100 dark:hover:bg-white/3 border border-transparent hover:border-glass-border transition-all duration-300 min-w-0">
                      <div className="min-w-0 flex-1">
                        <h4 className="text-sm font-bold text-title-color dark:text-white truncate">
                          {postTitle}
                        </h4>
                        <p className="text-xs text-subtitle-color dark:text-zinc-400 truncate mt-0.5">
                          {post.caption || t('no_caption', { defaultValue: 'No caption' })}
                        </p>
                      </div>

                      <div className="ml-3 shrink-0">
                        {IconComponent && (
                          <IconComponent size={32} filled={true} className="shrink-0" />
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Footer Link */}
        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-white/5 flex justify-center">
          <Link
            href={ROUTES.SOCIAL_MEDIA.SCHEDULED}
            className="flex items-center gap-2 text-primary hover:text-primary/80 font-bold text-sm transition-all group/all"
          >
            {t('view_all_scheduled_posts', { defaultValue: 'View All Scheduled Posts' })}
            <ArrowRight className="w-4 h-4 transition-transform group-hover/all:translate-x-1" />
          </Link>
        </div>
      </div>
    </Card>
  )
}
