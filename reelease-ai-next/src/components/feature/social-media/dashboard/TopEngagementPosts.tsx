'use client'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ROUTES } from '@/constants/routes'
import { platformColors, platformIcons } from '@/data/socialMedia'
import { TopEngagementPostsProps } from '@/types/socialMedia'
import { getMediaUrl } from '@/utils'
import { ArrowRight, ArrowUpRight, ExternalLink, Heart, MessageCircle, TrendingUp } from 'lucide-react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useTranslation } from 'react-i18next'
import { Skeleton } from '@/components/ui/skeleton'

export const TopEngagementPosts = ({ posts, isLoading }: TopEngagementPostsProps) => {
  const { t } = useTranslation()
  const router = useRouter()

  const formatCount = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return String(num)
  }

  return (
    <Card className="p-px rounded-border-radius dark:bg-white/3! border-none glass-card overflow-hidden h-full">
      <div className="p-4 sm:p-5 pb-2 sm:pb-3 h-full flex flex-col">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 flex justify-center items-center rounded-[9px] bg-pink-500 shrink-0">
              <TrendingUp className="w-5.5 h-5.5 text-white!" />
            </div>
            <div>
              <h3 className="sm:text-xl text-lg mb-0 font-extrabold text-title-color dark:text-white tracking-tight flex items-center gap-2">
                {t('top_engagement_posts', { defaultValue: 'Top Engagement Posts' })}
              </h3>
              <p className="text-base text-subtitle-color">
                {t('your_top_performing_posts', { defaultValue: 'Your top performing content' })}
              </p>
            </div>
          </div>
          <button
            onClick={() => router.push(ROUTES.SOCIAL_MEDIA.ACTIVITY)}
            className="text-sm font-semibold text-primary hover:text-primary/80 transition-colors border border-glass-border px-3 py-0.5 rounded-xl w-full sm:w-auto text-center mt-2 sm:mt-0!"
          >
            {t('see_all', { defaultValue: 'See all' })}
          </button>
        </div>

        {isLoading ? (
          <div className="space-y-2.5 sm:space-y-3 mb-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="flex items-start gap-2 sm:gap-3 p-2 sm:p-2.5 rounded-border-radius bg-subcard dark:bg-white/2 border border-glass-border animate-pulse"
              >
                {/* Thumbnail placeholder */}
                <Skeleton className="rounded-xl w-[52px] h-[52px] shrink-0" />

                {/* Content placeholder */}
                <div className="flex-1 min-w-0 space-y-2">
                  <Skeleton className="h-4 w-3/4 rounded" />
                  <div className="flex items-center gap-1.5 mt-1">
                    <Skeleton className="h-3 w-16 rounded" />
                  </div>

                  {/* Engagement indicators */}
                  <div className="flex items-center gap-3 mt-1.5">
                    <Skeleton className="h-3 w-10 rounded" />
                    <Skeleton className="h-3 w-10 rounded" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center py-8">
            <TrendingUp className="w-10 h-10 text-muted-foreground mb-2" />
            <p className="text-subtitle-color font-semibold text-lg">
              {t('no_engagement_data', { defaultValue: 'No engagement data yet' })}
            </p>
            <p className="text-base text-muted-foreground mt-1">
              {t('publish_to_see_engagement', { defaultValue: 'Publish content to see engagement metrics' })}
            </p>
          </div>
        ) : (
          <>
            <div className="flex-1 w-full flex flex-col justify-between ">
              <div className="space-y-2  overflow-auto max-h-[320px] no-scrollbar mb-2">
                {posts.map((post: any, index: number) => {
                  const IconComponent = platformIcons[post.platform] || TrendingUp
                  const color = platformColors[post.platform] || 'var(--pink)'
                  const accountUsername = post.account?.account_username || ''
                  const likes = post.likeCount || 0
                  const comments = post.commentCount || 0
                  const platformLabel = post.platform ? post.platform.charAt(0).toUpperCase() + post.platform.slice(1) : ''

                  return (
                    <div
                      key={post.id || post._id}
                      onClick={() => router.push(ROUTES.SOCIAL_MEDIA.ACTIVITY)}
                      className="flex items-start gap-3 p-4 rounded-border-radius bg-subcard dark:bg-white/2 border border-glass-border hover:border-primary/50! hover:bg-white dark:hover:bg-transparent transition-all duration-300 group relative cursor-pointer"
                    >
                      {/* Thumbnail */}
                      {post.media_urls?.[0] ? (
                        post.media_urls[0].toLowerCase().includes('.mp4') ? (
                          <video
                            src={getMediaUrl(post.media_urls[0])}
                            className="rounded-xl w-[52px] h-[52px] object-cover shrink-0 border border-black/5 dark:border-white/5 bg-black/20"
                            muted
                          />
                        ) : (
                          <Image
                            src={getMediaUrl(post.media_urls[0])}
                            alt=""
                            width={52}
                            height={52}
                            className="rounded-xl h-[52px] object-cover object-top shrink-0 border border-black/5 dark:border-white/5"
                            unoptimized
                          />
                        )
                      ) : (
                        <div
                          className="w-[52px] h-[52px] rounded-xl flex items-center justify-center shrink-0 border border-white/5"
                          style={{ backgroundColor: `${color}12` }}
                        >
                          <IconComponent className="w-5 h-5" style={{ color }} />
                        </div>
                      )}

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <p className="text-md font-bold text-title-color dark:text-white line-clamp-1 leading-snug">
                          {post.caption || t('no_caption', { defaultValue: 'No caption' })}
                        </p>
                        <div className="flex items-center gap-1.5 mt-1">
                          <IconComponent className="w-4 h-4 shrink-0" style={{ color }} />
                          <span className="text-sm text-subtitle-color capitalize">{platformLabel}</span>
                          {accountUsername && (
                            <>
                              <span className="text-3xs text-muted-foreground ">|</span>
                              <span className="text-sm text-muted-foreground truncate ">@{accountUsername}</span>
                            </>
                          )}
                        </div>

                        {/* Engagement stats inline */}
                        <div className="flex items-center gap-3 mt-1.5">
                          <div className="flex items-center gap-1 text-[12px] text-muted-foreground">
                            <Heart className="w-4 h-4 text-rose-400" />
                            <span className="font-medium text-subtitle-color">{formatCount(likes)}</span>
                          </div>
                          <div className="flex items-center gap-1 text-[12px] text-muted-foreground">
                            <MessageCircle className="w-4 h-4 text-blue-400" />
                            <span className="font-medium text-subtitle-color">{formatCount(comments)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* View All Analytics Link */}
              <div className="mt-auto pt-2  shrink-0 border-t border-glass-border">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push(ROUTES.SOCIAL_MEDIA.ANALYTICS)}
                  className="w-full gap-2 hover:bg-[unset]! rounded-xl text-xs font-semibold text-primary!"
                >
                  {t('view_all_analytics', { defaultValue: 'View All Analytics' })}
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </Card>
  )
}
