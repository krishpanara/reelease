'use client'

import { NoDataFound } from '@/components/reusable/NoDataFound'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatDistanceToNow } from 'date-fns'
import { Share2, Clock, Facebook, Instagram, ImagePlus, Linkedin, Youtube, ArrowRight } from 'lucide-react'
import { XIcon as Twitter } from '@/components/ui/XIcon'
import { useTranslation } from 'react-i18next'
import { getResolvedImageUrl } from '@/utils/image'
import Image from 'next/image'
import { ThreadsIcon } from '@/components/ui/threadsIcon'
import { ROUTES } from '@/constants/routes'
import { useRouter } from 'next/navigation'

export const RecentSocialActivity = ({ activities }: { activities: any[] }) => {
  const { t } = useTranslation()
  const router = useRouter()

  const displayActivities = activities

  const getPlatformIcon = (platform: string) => {
    switch (platform?.toLowerCase()) {
      case 'facebook': return <Facebook className="w-3.5 h-3.5" />
      case 'instagram': return <Instagram className="w-3.5 h-3.5" />
      case 'linkedin': return <Linkedin className="w-3.5 h-3.5" />
      case 'twitter': return <Twitter className="w-3.5 h-3.5" />
      case 'youtube': return <Youtube className="w-3.5 h-3.5" />
      case 'threads': return <ThreadsIcon className="w-3.5 h-3.5" />
      default: return <Share2 className="w-3.5 h-3.5" />
    }
  }

  const getPlatformColors = (platform: string) => {
    switch (platform?.toLowerCase()) {
      case 'facebook': return 'bg-primary/10 text-primary! border-primary/30!'
      case 'instagram': return 'bg-rose-500/10 text-rose-500! border-rose-500/30!'
      case 'linkedin': return 'bg-blue-700/10 dark:bg-blue-500/10! dark:text-blue-500!  text-blue-700! border-blue-700/30!'
      case 'twitter': return 'bg-sky-500/10 text-sky-500! border-sky-500/30!'
      case 'youtube': return 'bg-red-500/10 text-red-500! border-red-500/30!'
      case 'threads': return 'bg-black/10 dark:bg-white/10 text-black! dark:text-white! border-black/20! dark:border-white/20!'
      default: return 'bg-primary/10 text-primary border-primary/20'
    }
  }

  return (
    <Card className="p-px rounded-border-radius border-none glass-card glass-dark-card shadow-none overflow-hidden w-full h-full transition-all duration-300 dark:bg-white/3">
      <div className="p-4 sm:p-6 pb-2 sm:pb-3 h-full flex flex-col">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 flex justify-center items-center rounded-[9px] bg-primary shrink-0">
              <ImagePlus className="text-white! w-5.5 h-5.5" />
            </div>
            <div>
              <h3 className="sm:text-xl text-lg mb-0 font-extrabold text-title-color dark:text-white tracking-tight flex items-center gap-2">
                {t('recent_social_activity', { defaultValue: 'Recent Social Activity' })}
              </h3>
              <p className="text-xs sm:text-base font-medium text-subtitle-color leading-tight">
                {t('latest_published_posts', { defaultValue: 'Your recently published posts' })}
              </p>
            </div>
          </div>
          <button
            onClick={() => router.push(ROUTES.MEMBERS)}
            className="text-sm font-semibold text-primary hover:text-primary/80 transition-colors border border-glass-border px-3 py-0.5 rounded-xl w-full sm:w-auto text-center mt-2 sm:mt-0"
          >
            {t('see_all', { defaultValue: 'See all' })}
          </button>
        </div>

        {/* Activity List — always shows max 3 */}
        <div className="flex flex-col gap-2  overflow-y-auto no-scrollbar max-h-[300px] ">
          {displayActivities.length > 0 ? (
            displayActivities.map((activity) => (
              <div
                onClick={() => router.push(ROUTES.SOCIAL_MEDIA.ACTIVITY)}
                key={activity._id || activity.id}
                className="flex flex-row items-center gap-3! p-3 sm:p-3.5 bg-subcard dark:bg-white/3 rounded-border-radius-inner border border-glass-border hover:border-primary/40  hover:bg-transparent transition-all duration-300 group cursor-pointer"
              >
                {/* Thumbnail */}
                <div className="relative w-11 h-11 sm:w-12 sm:h-12 shrink-0 rounded-lg overflow-hidden border border-glass-border">
                  {activity.media_urls?.[0] ? (
                    activity.media_urls[0].toLowerCase().includes('.mp4') ? (
                      <video
                        src={getResolvedImageUrl(activity.media_urls[0])}
                        className="w-full h-full object-cover object-top"
                        muted
                        playsInline
                      />
                    ) : (
                      <Image
                        src={getResolvedImageUrl(activity.media_urls[0])}
                        alt=""
                        fill
                        className="object-cover object-top transition-transform duration-500 "
                        unoptimized
                      />
                    )
                  ) : (
                    <div className="w-full h-full bg-primary/10 flex items-center justify-center">
                      <Share2 className="w-4 h-4 text-primary/60" />
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold line-clamp-1 text-title-color dark:text-white leading-snug">
                    {activity.caption ||
                      activity.content ||
                      (activity.content_type
                        ? `${activity.platform} ${activity.content_type}`
                        : t('no_content', { defaultValue: 'No content' }))}
                  </p>
                  {activity.post_url && (
                    <a
                      href={activity.post_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-primary hover:underline mt-0.5 inline-flex items-center gap-1"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Share2 className="w-2.5 h-2.5" />
                      {t('view_post', { defaultValue: 'View Post' })}
                    </a>
                  )}
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                    <Clock className="h-3 w-3 shrink-0" />
                    <span className="truncate">
                      {activity.published_at
                        ? formatDistanceToNow(new Date(activity.published_at), { addSuffix: true })
                        : t('recently', { defaultValue: 'Recently' })}
                    </span>
                  </div>
                </div>

                {/* Platform Badge */}
                <Badge className={`${getPlatformColors(activity.platform)} text-3xs border-none! capitalize font-medium py-1 px-2 flex items-center gap-1 shrink-0 whitespace-nowrap`}>
                  {getPlatformIcon(activity.platform)}
                  <span className="hidden sm:inline">{activity.platform || t('social', { defaultValue: 'Social' })}</span>
                </Badge>
              </div>
            ))
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <NoDataFound icon={Share2} height="h-full" />
            </div>
          )}
        </div>
        <div className="mt-2 pt-3 sm:pt-4 border-t border-glass-border shrink-0 flex justify-center">
          <button
            onClick={() => router.push(ROUTES.SOCIAL_MEDIA.ACTIVITY)}
            className="text-[14px] font-semibold text-primary hover:text-primary/80 transition-colors inline-flex items-center gap-1.5"
          >
            {t('view_all_Activities', { defaultValue: 'View All Activities' })}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </Card>
  )
}
