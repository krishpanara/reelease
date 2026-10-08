'use client'

import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Search,
  SlidersHorizontal,
  X,
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { DeleteConfirmationModal } from '@/components/reusable/DeleteConfirmationModal'
import { PageHeader } from '@/components/reusable/PageHeader'
import { Button } from '@/components/ui/button'
import Input from '@/components/ui/input'
import { socialPublishApi, useDeletePostMutation, useGetPostHistoryQuery } from '@/redux/api/socialPublishApi'
import { useAppDispatch, useAppSelector } from '@/redux/hooks'
import { socket } from '@/services/socketSetup'
import { CalendarPlatformId } from '@/utils/calendarHelpers'
import { getPostLocalDateStr, getLocalDateString } from '@/utils/socialMedia'
import { SocialPostReviewModal } from '../activity/SocialPostReviewModal'
import CalendarPlatformTabs from './CalendarPlatformTabs'
import { CalendarFiltersDrawer } from './CalendarFiltersDrawer'
import CalendarSidebar from './CalendarSidebar'
import { MonthlyGridView } from './MonthlyGridView'
import { WeeklyPlannerView } from './WeeklyPlannerView'

export default function SocialCalendarContent() {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const router = useRouter()
  const { user } = useAppSelector((state) => state.auth)

  const [mounted, setMounted] = useState(false)
  const [view, setView] = useState<'month' | 'week'>('week')
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [activePlatform, setActivePlatform] = useState<CalendarPlatformId>('all')

  const [search, setSearch] = useState('')
  const [selectedContentTypes, setSelectedContentTypes] = useState<string[]>([])
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [showFiltersPanel, setShowFiltersPanel] = useState(false)

  const [selectedPost, setSelectedPost] = useState<any | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  const { data: historyData, isLoading, refetch } = useGetPostHistoryQuery({
    page: 1,
    limit: 500,
  })

  useEffect(() => {
    if (!user) return
    const userId = user?._id || user?.id
    if (!userId) return
    const eventName = `social-post-${userId}`

    const handlePostUpdate = () => {
      dispatch(socialPublishApi.util.invalidateTags(['SocialPost']))
      refetch()
    }
    socket.on(eventName, handlePostUpdate)
    return () => {
      socket.off(eventName, handlePostUpdate)
    }
  }, [user, dispatch, refetch])

  const [deletePost, { isLoading: isDeleting }] = useDeletePostMutation()
  const allPosts = historyData?.data || []

  const handlePlatformTabChange = (platform: CalendarPlatformId) => {
    setActivePlatform(platform)
  }

  const filteredPosts = useMemo(() => {
    return allPosts.filter((post: any) => {
      if (activePlatform !== 'all') {
        const p = (post.platform || '').toLowerCase()
        const normalized = p === 'x' ? 'twitter' : p
        if (normalized !== activePlatform) return false
      }
      if (selectedContentTypes.length > 0 && !selectedContentTypes.includes(post.content_type?.toLowerCase())) {
        return false
      }
      if (selectedStatus !== 'all') {
        const isScheduled = post.status === 'scheduled' || (post.status === 'pending' && post.scheduled_at)
        if (selectedStatus === 'published' && post.status !== 'published') return false
        if (selectedStatus === 'pending' && post.status !== 'pending' && !isScheduled) return false
        if (selectedStatus === 'failed' && post.status !== 'failed') return false
      }
      if (search.trim()) {
        const q = search.toLowerCase()
        const captionMatch = post.caption?.toLowerCase().includes(q)
        const platformMatch = post.platform?.toLowerCase().includes(q)
        const typeMatch = post.content_type?.toLowerCase().includes(q)
        if (!captionMatch && !platformMatch && !typeMatch) return false
      }
      return true
    })
  }, [allPosts, activePlatform, selectedContentTypes, selectedStatus, search])

  const postsByDate = useMemo(() => {
    const groups: Record<string, any[]> = {}
    filteredPosts.forEach((post: any) => {
      const dateStr = getPostLocalDateStr(post)
      if (dateStr) {
        if (!groups[dateStr]) groups[dateStr] = []
        groups[dateStr].push(post)
      }
    })
    return groups
  }, [filteredPosts])

  const weekDays = useMemo(() => {
    const start = new Date(selectedDate)
    const day = start.getDay()
    const mondayOffset = day === 0 ? -6 : 1 - day
    const monday = new Date(start)
    monday.setDate(start.getDate() + mondayOffset)
    const days: Date[] = []
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday)
      d.setDate(monday.getDate() + i)
      days.push(d)
    }
    return days
  }, [selectedDate])

  const weekPosts = useMemo(() => {
    const weekDateStrs = weekDays.map((d) => getLocalDateString(d))
    return filteredPosts.filter((post: any) => {
      const dateStr = getPostLocalDateStr(post)
      return weekDateStrs.includes(dateStr)
    })
  }, [filteredPosts, weekDays])

  const monthDays = useMemo(() => {
    const year = selectedDate.getFullYear()
    const month = selectedDate.getMonth()
    const firstDay = new Date(year, month, 1)
    const startPadding = (firstDay.getDay() + 6) % 7
    const days: Date[] = []

    for (let i = startPadding; i > 0; i--) {
      days.push(new Date(year, month, 1 - i))
    }

    const totalDays = new Date(year, month + 1, 0).getDate()
    for (let i = 1; i <= totalDays; i++) {
      days.push(new Date(year, month, i))
    }

    const neededDays = days.length <= 35 ? 35 : 42
    const remaining = neededDays - days.length
    for (let i = 1; i <= remaining; i++) {
      days.push(new Date(year, month + 1, i))
    }
    return days
  }, [selectedDate])

  const currentMonthYearLabel = useMemo(() => {
    return selectedDate.toLocaleDateString('default', { month: 'long', year: 'numeric' })
  }, [selectedDate])

  const weekRangeLabel = useMemo(() => {
    if (weekDays.length < 7) return ''
    const start = weekDays[0]
    const end = weekDays[6]
    const opts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' }
    return `${start.toLocaleDateString('default', opts)} – ${end.toLocaleDateString('default', { ...opts, year: 'numeric' })}`
  }, [weekDays])

  const handlePrev = () => {
    const nextDate = new Date(selectedDate)
    if (view === 'week') {
      nextDate.setDate(selectedDate.getDate() - 7)
    } else {
      nextDate.setMonth(selectedDate.getMonth() - 1)
    }
    setSelectedDate(nextDate)
  }

  const handleNext = () => {
    const nextDate = new Date(selectedDate)
    if (view === 'week') {
      nextDate.setDate(selectedDate.getDate() + 7)
    } else {
      nextDate.setMonth(selectedDate.getMonth() + 1)
    }
    setSelectedDate(nextDate)
  }

  const handleToday = () => {
    setSelectedDate(new Date())
  }

  const toggleContentTypeFilter = (type: string) => {
    setSelectedContentTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type],
    )
  }

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      const res = await deletePost(deleteId).unwrap()
      toast.success(res?.message || t('post_deleted_successfully', { defaultValue: 'Post deleted successfully' }))
      setDeleteId(null)
    } catch (error: any) {
      toast.error(error.data?.message || t('failed_to_delete_post', { defaultValue: 'Failed to delete post' }))
    }
  }

  const getPostLink = (post: any) => {
    if (post.post_url) return post.post_url
    const postId = post.post_id || post.metadata?.postId || post.metadata?.id
    if (!postId || postId === 'PENDING') return null
    const platform = post.platform?.toLowerCase()
    if (platform === 'facebook') return `https://facebook.com/${postId}`
    if (platform === 'instagram') return `https://www.instagram.com/p/${postId}`
    if (platform === 'linkedin') return `https://www.linkedin.com/feed/update/urn:li:share:${postId}`
    if (platform === 'twitter' || platform === 'x') return `https://twitter.com/i/web/status/${postId}`
    if (platform === 'youtube') return `https://www.youtube.com/watch?v=${postId}`
    if (platform === 'threads') {
      const username = post.account?.account_username || post.account?.account_name
      return username ? `https://www.threads.com/@${username}/post/${postId}` : `https://www.threads.com/t/${postId}`
    }
    return null
  }

  const pageTitle =
    view === 'week'
      ? t('weekly_planner', { defaultValue: 'Weekly Planner' })
      : t('publishing_calendar', { defaultValue: 'Publishing Calendar' })

  const pageSubtitle =
    view === 'week'
      ? t('weekly_planner_desc', {
        defaultValue: 'Plan, organize and schedule your content across all platforms.',
      })
      : t('publishing_calendar_desc', {
        defaultValue: 'Plan, organize and schedule your content across all platforms.',
      })

  return (
    <div className="space-y-6 animate-in fade-in duration-700 relative">
      <PageHeader
        // icon={<Calendar className="w-6 h-6 text-primary animate-pulse" />}
        title={pageTitle}
        subtitle={pageSubtitle}
        showBackButton
        endContent={
          <Button
            asChild
            className="hidden sm:flex px-6 rounded-xl primary-btn text-white! text-xs font-bold gap-2 shrink-0"
          >
            <Link href="/social-media/composer">
              <Plus className="w-4 h-4" />
              {t('create_new_post', { defaultValue: 'Create New Post' })}
            </Link>
          </Button>
        }
      />

      <div className="flex flex-col lg:flex-row items-center justify-between gap-4 mt-2 ">
        {/* Left side: Search */}
        <div className="w-full flex-1">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-subtitle-color pointer-events-none" />
            <Input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('search_posts', { defaultValue: 'Search posts...' })}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-glass-border text-foreground placeholder:text-subtitle-color text-sm focus:outline-none focus:border-primary/45 transition-all"
            />
            {search && (
              <Button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-subtitle-color hover:text-foreground bg-transparent hover:bg-transparent h-auto p-0"
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Right side: View Toggle, Nav, Date, Filters */}
        <div className="flex flex-wrap items-center gap-2 lg:gap-3 w-full lg:w-auto justify-start lg:justify-end">
          {/* View toggle */}
          <div className="bg- white dark:bg-white/3 border border-glass-border p-1 rounded-xl h-10 flex items-center gap-1 text-xs shrink-0">
            <Button
              onClick={() => setView('month')}
              className={`px-4 py-1.5 rounded-lg border border-glass-border transition-all font-semibold h-full ${view === 'month'
                ? 'primary-btn text-white! border '
                : 'text-subtitle-color! hover:text-foreground bg-transparent'
                }`}
            >
              {t('month', { defaultValue: 'Month' })}
            </Button>
            <Button
              onClick={() => setView('week')}
              className={`px-4 py-1.5 rounded-lg border border-glass-border transition-all font-semibold h-full ${view === 'week'
                ? 'primary-btn text-white! border '
                : 'text-subtitle-color! hover:text-foreground bg-transparent'
                }`}
            >
              {t('week', { defaultValue: 'Week' })}
            </Button>
          </div>

          {/* Nav + date range */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="flex items-center bg-white dark:bg-white/5 border border-glass-border rounded-xl p-0.5 overflow-hidden h-10">
              <Button
                variant="ghost"
                size="icon"
                onClick={handlePrev}
                className="h-full w-8 text-subtitle-color hover:text-foreground hover:bg-white/5 rounded-lg"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                onClick={handleToday}
                className="h-full px-3 text-xs text-subtitle-color hover:text-foreground hover:bg-white/5 rounded-lg font-bold"
              >
                {t('today', { defaultValue: 'Today' })}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleNext}
                className="h-full w-8 text-subtitle-color hover:text-foreground hover:bg-white/5 rounded-lg"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>

            <span className="text-xs font-bold text-subtitle-color whitespace-nowrap hidden sm:inline-block min-w-[120px] text-center">
              {view === 'week' ? weekRangeLabel : currentMonthYearLabel}
            </span>
          </div>

          {/* Filters */}
          <div className="relative shrink-0">
            <Button
              variant="outline"
              onClick={() => setShowFiltersPanel(!showFiltersPanel)}
              className={`h-10 px-4 gap-2 rounded-xl text-xs font-bold border-glass-border ${showFiltersPanel || selectedStatus !== 'all' || selectedContentTypes.length > 0
                ? 'bg-primary/10 border-primary/30 text-primary'
                : 'bg-white dark:bg-white/3 text-foreground hover:bg-white/10'
                }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>{t('filters', { defaultValue: 'Filters' })}</span>
              {(selectedStatus !== 'all' || selectedContentTypes.length > 0) && (
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              )}
            </Button>
            <CalendarFiltersDrawer
              showFiltersPanel={showFiltersPanel}
              selectedContentTypes={selectedContentTypes}
              toggleContentTypeFilter={toggleContentTypeFilter}
              selectedStatus={selectedStatus}
              setSelectedStatus={setSelectedStatus}
            />
          </div>
        </div>

        {/* Date range on xs when not visible in toolbar */}
        <span className="text-xs font-bold text-subtitle-color sm:hidden whitespace-nowrap text-center w-full mt-2">
          {view === 'week' ? weekRangeLabel : currentMonthYearLabel}
        </span>
      </div>
      <CalendarPlatformTabs activePlatform={activePlatform} onPlatformChange={handlePlatformTabChange} />

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-28 space-y-4">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-subtitle-color font-semibold">
            {t('loading_calendar', { defaultValue: 'Loading your content calendar...' })}
          </p>
        </div>
      ) : (
        <div className="flex flex-col 2xl:flex-row gap-6 items-start">
          <div className="flex-1 min-w-0 w-full">
            {view === 'week' ? (
              <WeeklyPlannerView
                weekDays={weekDays}
                postsByDate={postsByDate}
                rowRefs={{ current: {} }}
                setSelectedPost={setSelectedPost}
                setDeleteId={setDeleteId}
                getPostLink={getPostLink}
                router={router}
              />
            ) : (
              <MonthlyGridView
                monthDays={monthDays}
                selectedDate={selectedDate}
                setSelectedDate={setSelectedDate}
                setView={setView}
                postsByDate={postsByDate}
                setSelectedPost={setSelectedPost}
              />
            )}
          </div>

          <CalendarSidebar
            view={view}
            posts={filteredPosts}
            weekPosts={weekPosts}
            selectedDate={selectedDate}
            onPostClick={setSelectedPost}
          />
        </div>
      )}

      {mounted &&
        createPortal(
          <Link href="/social-media/composer">
            <Button
              className="fixed bottom-6 right-6 w-14! h-14! p-0! primary-btn text-white! rounded-full flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-all z-[9999] border border-glass-border sm:hidden"
              title={t('create_new_post', { defaultValue: 'Create New Post' })}
            >
              <Plus className="w-7 h-7" />
            </Button>
          </Link>,
          document.body,
        )}

      {selectedPost &&
        mounted &&
        createPortal(
          <SocialPostReviewModal
            post={selectedPost}
            t={t}
            onClose={() => setSelectedPost(null)}
            getPostLink={getPostLink}
          />,
          document.body,
        )}

      <DeleteConfirmationModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        isLoading={isDeleting}
        title={t('delete_social_post', { defaultValue: 'Delete Social Post' })}
        description={t('delete_social_post_calendar_desc', {
          defaultValue:
            'Are you sure you want to delete this social post from your calendar history? This will attempt to delete it from the backend.',
        })}
      />
    </div>
  )
}
