'use client'

import { Button } from '@/components/ui/button'
import { platformsConfig } from '@/data/socialMedia'
import { cn } from '@/lib/utils'
import { PlatformAccentText } from './PlatformAccentText'
import { formatUpcomingLabel, getPostDisplayTitle, getPostPlatforms } from '@/utils/calendarHelpers'
import { getMediaUrl } from '@/utils'
import { Share2 } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useTranslation } from 'react-i18next'
import { UpcomingPostsListProps } from '@/types/socialMedia'



const UpcomingPostsList = ({ posts, onPostClick, viewAllHref = '/social-media/scheduled' }: UpcomingPostsListProps) => {
  const { t } = useTranslation()

  if (posts.length === 0) {
    return (
      <p className="text-sm text-subtitle-color text-center py-8">
        {t('no_upcoming_posts', { defaultValue: 'No upcoming scheduled posts.' })}
      </p>
    )
  }

  return (
    <div className="divide-y divide-[var(--calendar-divider)]">
      {posts.map((post) => {
        const platformIds = getPostPlatforms(post)
        const thumb = post.media_urls?.[0]

        return (
          <button
            key={post._id || post.id}
            type="button"
            onClick={() => onPostClick(post)}
            className="w-full flex items-center gap-3 py-3 first:pt-0 last:pb-0 hover:opacity-90 transition-opacity text-left group"
          >
            <div className="relative w-12 h-12 rounded-lg overflow-hidden shrink-0 bg-black/5 dark:bg-black/30 border border-[var(--calendar-thumb-border)]">
              {thumb ? (
                thumb.toLowerCase().includes('.mp4') ? (
                  <video
                    src={getMediaUrl(thumb) || ''}
                    className="absolute inset-0 w-full h-full object-cover"
                    muted
                    playsInline
                    autoPlay
                    loop
                  />
                ) : (
                  <Image src={getMediaUrl(thumb) || ''} alt="" fill className="object-cover" unoptimized />
                )
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Share2 className="w-4 h-4 text-[var(--calendar-empty-icon)]" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0 space-y-0.5">
              <div className="flex items-center gap-1.5 flex-wrap">
                <PlatformAccentText post={post} className="text-[13px]">
                  {formatUpcomingLabel(post, t)}
                </PlatformAccentText>
                {platformIds.map((platformId) => {
                  const platformCfg = platformsConfig.find((p) => p.id === platformId)
                  const PlatformIcon = platformCfg?.icon || Share2
                  return (
                    <span
                      key={platformId}
                      className={cn(
                        'w-4 h-4 rounded-full flex items-center justify-center shrink-0',
                        platformCfg?.bg || 'bg-muted',
                      )}
                    >
                      <PlatformIcon className={cn("w-2.5 h-2.5", platformId === 'threads' ? "text-black dark:text-white" : "text-white")} />
                    </span>
                  )
                })}
              </div>
              <p className="text-[12px] font-medium text-[var(--calendar-post-title)] truncate">
                {getPostDisplayTitle(post)}
              </p>
            </div>
          </button>
        )
      })}
      <Button asChild variant="ghost" className="w-full primary-btn hover:text-white! text-white text-xs font-bold  mt-4">
        <Link href={viewAllHref}>{t('view_all', { defaultValue: 'View all' })}</Link>
      </Button>
    </div>
  )
}

export default UpcomingPostsList
