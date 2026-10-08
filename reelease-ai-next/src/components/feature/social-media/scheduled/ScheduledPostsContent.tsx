'use client'

import { DeleteConfirmationModal } from '@/components/reusable/DeleteConfirmationModal'
import { PageHeader } from '@/components/reusable/PageHeader'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ROUTES } from '@/constants/routes'
import { socialPublishApi, useDeletePostMutation, useGetPostHistoryQuery } from '@/redux/api/socialPublishApi'
import { useAppDispatch, useAppSelector } from '@/redux/hooks'
import { socket } from '@/services/socketSetup'
import { formatDate, getMediaUrl } from '@/utils'
import {
  CalendarClock, Clock, Edit3, Plus, Share2,
  Trash2
} from 'lucide-react'
import { FacebookIcon as Facebook } from '@/components/ui/FacebookIcon'
import { InstagramIcon as Instagram } from '@/components/ui/InstagramIcon'
import { LinkedInIcon as Linkedin } from '@/components/ui/LinkedInIcon'
import { ThreadsIcon } from '@/components/ui/threadsIcon'
import { XIcon as Twitter } from '@/components/ui/XIcon'
import { YouTubeIcon as Youtube } from '@/components/ui/YouTubeIcon'
import Image from 'next/image'
import Link from 'next/link'
import SafeImage from '@/components/ui/SafeImage'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'
import { Navigation, Pagination } from 'swiper/modules'
import { Swiper, SwiperSlide } from 'swiper/react'
import { CountdownResult } from '@/types/socialMedia'


function getCountdown(scheduledAt: string): CountdownResult {
  const now = new Date().getTime()
  const target = new Date(scheduledAt).getTime()
  const diff = target - now
  if (diff <= 0) return null

  const isMoreThan24Hours = diff >= 24 * 60 * 60 * 1000

  if (isMoreThan24Hours) {
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hrs = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    return { days, hrs, mins, isMoreThan24Hours: true }
  } else {
    const hrs = Math.floor(diff / (1000 * 60 * 60))
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    const secs = Math.floor((diff % (1000 * 60)) / 1000)
    return { hrs, mins, secs, isMoreThan24Hours: false }
  }
}

function CountdownTimer({ scheduledAt }: { scheduledAt: string }) {
  const [countdown, setCountdown] = useState<CountdownResult>(getCountdown(scheduledAt))
  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown(getCountdown(scheduledAt))
    }, 1000)
    return () => clearInterval(interval)
  }, [scheduledAt])
  if (!countdown) return <span className="text-emerald-400 font-bold text-xs">Publishing soon...</span>

  if (countdown.isMoreThan24Hours) {
    return (
      <div className="flex items-center gap-1 font-mono text-xs font-bold">
        <span className="dark:bg-yellow-500/10 bg-yellow-700/10 dark:text-yellow-500 text-yellow-600 px-1.5 py-0.5 rounded-md border border-yellow-500/20">
          {String(countdown.days).padStart(2, '0')}d
        </span>
        <span className="text-muted-foreground/30">:</span>
        <span className="dark:bg-yellow-500/10 bg-yellow-700/10 dark:text-yellow-500 text-yellow-600 px-1.5 py-0.5 rounded-md border border-yellow-500/20">
          {String(countdown.hrs).padStart(2, '0')}h
        </span>
        <span className="text-muted-foreground/30">:</span>
        <span className="dark:bg-yellow-500/10 bg-yellow-700/10 dark:text-yellow-500 text-yellow-600 px-1.5 py-0.5 rounded-md border border-yellow-500/20">
          {String(countdown.mins).padStart(2, '0')}m
        </span>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-1 font-mono text-xs font-bold">
      <span className="dark:bg-yellow-500/10 bg-yellow-700/10 dark:text-yellow-500 text-yellow-600 px-1.5 py-0.5 rounded-md border border-yellow-500/20">
        {String(countdown.hrs).padStart(2, '0')}h
      </span>
      <span className="text-muted-foreground/30">:</span>
      <span className="dark:bg-yellow-500/10 bg-yellow-700/10 dark:text-yellow-500 text-yellow-600 px-1.5 py-0.5 rounded-md border border-yellow-500/20">
        {String(countdown.mins).padStart(2, '0')}m
      </span>
      <span className="text-muted-foreground/30">:</span>
      <span className="dark:bg-yellow-500/10 bg-yellow-700/10 dark:text-yellow-500 text-yellow-600 px-1.5 py-0.5 rounded-md border border-yellow-500/20">
        {String(countdown.secs).padStart(2, '0')}s
      </span>
    </div>
  )
}

export default function ScheduledPostsContent() {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const router = useRouter()
  const { user } = useAppSelector((state) => state.auth)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const { data: historyData, isLoading, refetch } = useGetPostHistoryQuery({
    page: 1,
    limit: 100,
    status: 'scheduled',
  })

  // Real-time updates via socket
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
    return () => { socket.off(eventName, handlePostUpdate) }
  }, [user, dispatch, refetch])

  const [deletePost] = useDeletePostMutation()

  const scheduledPosts = (historyData?.data || []).filter((p: any) =>
    p.status === 'scheduled' || (p.status === 'pending' && p.scheduled_at)
  ).sort((a: any, b: any) =>
    new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime()
  )

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

  const PlatformBadge = ({ platform }: { platform: string }) => {
    const normPlatform = (platform || '').toLowerCase()
    return (
      <div className="w-5 h-5 flex items-center justify-center shrink-0 rounded-full bg-white dark:bg-zinc-950 border border-white dark:border-zinc-950 shadow-sm p-[1.5px] overflow-hidden">
        {normPlatform === 'facebook' ? (
          <Facebook filled={true} className="w-full h-full" />
        ) : normPlatform === 'instagram' ? (
          <Instagram filled={true} className="w-full h-full" />
        ) : normPlatform === 'linkedin' ? (
          <Linkedin filled={true} className="w-full h-full" />
        ) : normPlatform === 'youtube' ? (
          <Youtube filled={true} className="w-full h-full" />
        ) : normPlatform === 'twitter' || normPlatform === 'x' ? (
          <Twitter filled={true} className="w-full h-full" />
        ) : (
          <ThreadsIcon filled={true} className="w-full h-full text-black dark:text-white" />
        )}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 px-1">
      <PageHeader
        icon={<CalendarClock className="w-6 h-6 text-primary animate-pulse" />}
        title={t('scheduled_posts')}
        subtitle={t('scheduled_posts_desc', { defaultValue: 'Manage your scheduled posts' })}
        showBackButton={false}
        endContent={
          <Button
            variant="outline"
            onClick={() => router.push(ROUTES.SOCIAL_MEDIA.COMPOSER)}
            className="flex w-full sm:w-auto items-center justify-center gap-2 px-4 py-2 rounded-xl primary-btn text-white! text-sm font-medium hover:bg-white/10 transition-all h-auto"
          >
            {t('new_post', { defaultValue: 'Add New Post' })}
            <Plus className="w-4 h-4" />
          </Button>
        }
      />

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-6 gap-6">
        <div className="glass-card rounded-border-radius hover-gradient-border border border-glass-border bg-white dark:bg-white/3 p-5 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <CalendarClock className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-2xl font-black text-title-color dark:text-white">{scheduledPosts.length}</p>
            <p className="text-sm text-muted-foreground">{t('total_scheduled', { defaultValue: 'Total Scheduled' })}</p>
          </div>
        </div>
        <div className="glass-card rounded-border-radius hover-gradient-border border border-glass-border bg-white dark:bg-white/3 p-5 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
            <Clock className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <p className="text-2xl font-black text-title-color dark:text-white">
              {scheduledPosts.filter((p: any) => new Date(p.scheduled_at) > new Date()).length}
            </p>
            <p className="text-sm text-muted-foreground">{t('upcoming', { defaultValue: 'Upcoming' })}</p>
          </div>
        </div>
        <div className="glass-card rounded-border-radius hover-gradient-border border border-glass-border bg-white dark:bg-white/3 p-5 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Share2 className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-2xl font-black text-title-color dark:text-white">{new Set(scheduledPosts.map((p: any) => p.platform)).size}</p>
            <p className="text-sm text-muted-foreground">{t('platforms', { defaultValue: 'Platforms' })}</p>
          </div>
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-[380px] rounded-2xl bg-black/3 dark:bg-white/3 border border-glass-border animate-pulse" />
          ))}
        </div>
      ) : scheduledPosts.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center py-24 border  border-glass-border rounded-3xl bg-white dark:bg-white/3">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-5 ring-2 ring-primary/20">
            <CalendarClock className="w-10 h-10 text-primary" />
          </div>
          <h3 className="text-xl font-black text-title-color dark:text-white mb-2">
            {t('no_scheduled_posts', { defaultValue: 'No Scheduled Posts' })}
          </h3>
          <p className="text-sm text-muted-foreground max-w-xs mb-6">
            {t('no_scheduled_desc', {
              defaultValue: 'Schedule your first post to see it here. Posts will auto-publish at your chosen time.',
            })}
          </p>
          <Link href="/social-media/composer">
            <Button className="gap-2 primary-btn text-white! font-bold rounded-xl">
              <Plus className="w-4 h-4" />
              {t('schedule_post', { defaultValue: 'Schedule a Post' })}
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
          {/* Swiper styles once at grid parent level */}
          <style>{`
            .sched-swiper .swiper-button-next,
            .sched-swiper .swiper-button-prev {
              color: white !important;
              transform: scale(0.45);
              background: transparent;
              border-radius: 50%;
              width: 40px;
              height: 40px;
              opacity: 0;
              transition: opacity 0.3s;
              margin-top: -20px;
            }
            .sched-swiper:hover .swiper-button-next,
            .sched-swiper:hover .swiper-button-prev { opacity: 1; }
            .sched-swiper .swiper-pagination-bullet {
              background: rgba(255,255,255,0.5);
              width: 5px; height: 5px;
            }
            .sched-swiper .swiper-pagination-bullet-active { background: white; }
          `}</style>

          {scheduledPosts.map((post: any) => {
            const hasMedia = post.media_urls && post.media_urls.length > 0
            return (
              <div
                key={post.id || post._id}
                className="group flex flex-col rounded-border-radius border border-glass-border bg-white dark:bg-white/3 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300"
              >
                {/* 1. Countdown Header */}
                <div className="flex items-center justify-between px-5 py-3.5 border-b border-glass-border bg-slate-50/50 dark:bg-white/1">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-500 animate-pulse" />
                    <span className="text-xs font-bold text-amber-600 dark:text-amber-500">Scheduled</span>
                  </div>
                  <CountdownTimer scheduledAt={post.scheduled_at} />
                </div>

                {/* Card Body */}
                <div className="p-5 flex flex-col gap-4 flex-1">
                  {/* Media Preview (only if media exists) - FIRST */}
                  {hasMedia ? (
                    <div className="relative h-48 rounded-border-radius-inner  border overflow-hidden bg-black/5 dark:bg-white/3 border border-glass-border shadow-inner">
                      <Swiper
                        modules={[Navigation, Pagination]}
                        navigation
                        pagination={{ clickable: true }}
                        className="w-full h-full sched-swiper"
                        style={{ height: '100%' }}
                      >
                        {post.media_urls.map((url: string, idx: number) => {
                          const isVid = url.includes('.mp4')
                          return (
                            <SwiperSlide key={idx} style={{ height: '100%' }}>
                              <div className="relative w-full h-full">
                                {isVid ? (
                                  <video
                                    src={getMediaUrl(url)}
                                    className="w-full h-full object-cover"
                                    muted
                                    playsInline
                                    onMouseEnter={(e) => e.currentTarget.play().catch(() => { })}
                                    onMouseLeave={(e) => {
                                      e.currentTarget.pause()
                                      e.currentTarget.currentTime = 0
                                    }}
                                  />
                                ) : (
                                  <Image src={getMediaUrl(url) || ''} alt="" fill unoptimized className="object-cover hover:scale-105 transition-all duration-300" />
                                )}
                              </div>
                            </SwiperSlide>
                          )
                        })}
                      </Swiper>
                    </div>
                  ) : (
                    <div className="w-full h-48 flex flex-col items-center justify-center text-title-color dark:text-white border border-glass-border rounded-2xl bg-black/5 dark:bg-white/3">
                      <Share2 className="w-8 h-8 text-subtitle-color" />
                      <span className="text-xs text-subtitle-color mt-2">Text only</span>
                    </div>
                  )}

                  {/* Account Info Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        {post.account?.profile_picture ? (
                          <div className="relative w-10 h-10 rounded-full overflow-hidden border border-glass-border shadow-sm">
                            <SafeImage
                              src={post.account.profile_picture}
                              fallbackName={post.account.account_name || 'U'}
                              alt=""
                              fill
                              className="object-cover"
                              referrerPolicy="no-referrer"
                              unoptimized
                            />
                          </div>
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center border border-glass-border">
                            <Share2 className="w-5 h-5 text-primary" />
                          </div>
                        )}
                        {/* Overlay platform badge */}
                        <div className="absolute -bottom-1 -right-1">
                          <PlatformBadge platform={post.platform} />
                        </div>
                      </div>
                      <div className="flex flex-col text-left">
                        <h4 className="font-bold text-sm text-title-color dark:text-zinc-100 leading-tight">
                          {post.account?.account_name || 'Unknown'}
                        </h4>
                      </div>
                    </div>
                    <div>
                      <Badge className="text-[12px] bg-primary/10 text-primary border-primary/20 capitalize px-1.5">
                        {post.status}
                      </Badge>
                    </div>
                  </div>

                  {/* Caption block */}
                  <div className="rounded-border-radius-inner bg-subcard dark:bg-white/3  border border-glass-border p-2 text-left flex-1">
                    <span className="text-xs font-medium text-primary  mb-1.5 block">
                      {t('caption', { defaultValue: 'Caption' })}
                    </span>
                    <p className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed font-normal line-clamp-3">
                      {post.caption || 'No caption'}
                    </p>
                  </div>

                  {/* Date & Time Row */}
                  <div className="flex items-center justify-between text-slate-600 dark:text-zinc-400 border-b border-glass-border pb-4 mt-auto">
                    <div className="flex items-center gap-2">
                      <CalendarClock className="w-4 h-4 shrink-0 text-primary" />
                      <span className="text-xs font-medium text-muted-foreground">{formatDate(post.scheduled_at)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 shrink-0 text-primary" />
                      <span className="text-xs font-medium text-muted-foreground">
                        {new Date(post.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>

                  {/* Media Count & Actions Footer */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-subtitle-color">
                      {post.media_urls?.length || 0} {t('media', { defaultValue: 'media' })}
                    </span>
                    <div className="flex items-center gap-2.5">
                      {/* Edit Button */}
                      <Link href={`/social-media/composer?postId=${post.id || post._id}`}>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500 hover:text-white rounded-full flex items-center justify-center transition-all duration-200"
                          title="Edit post"
                        >
                          <Edit3 className="w-4 h-4" />
                        </Button>
                      </Link>

                      {/* Delete Button */}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 bg-rose-500/10 text-rose-600 hover:bg-rose-500 hover:text-white rounded-full flex items-center justify-center transition-all duration-200"
                        onClick={() => setDeleteId(post.id || post._id)}
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <DeleteConfirmationModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        // isDeleting={isDeleting}
        title={t('delete_post', { defaultValue: 'Delete Scheduled Post' })}
        description={t('delete_post_desc', {
          defaultValue: 'Are you sure you want to delete this scheduled post? This action cannot be undone.',
        })}
      />
    </div>
  )
}
