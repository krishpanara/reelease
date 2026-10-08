'use client'

import { platformsConfig } from '@/data/socialMedia'
import { cn } from '@/lib/utils'
import { PlatformAccentText, usePostUsesInstagramGradient } from './PlatformAccentText'
import { getPostDisplayTitle, getPostPlatforms } from '@/utils/calendarHelpers'
import { getMediaUrl } from '@/utils'
import { formatTime12 } from '@/utils/socialMedia'
import { Share2 } from 'lucide-react'
import Image from 'next/image'
import { WeeklyTimeSlotPostProps } from '@/types/socialMedia'

function formatCalendarTime(dateVal: string | Date) {
  const formatted = formatTime12(dateVal)
  return formatted.replace(/^0/, '')
}

const WeeklyTimeSlotPost = ({ post, onClick }: WeeklyTimeSlotPostProps) => {
  const platformIds = getPostPlatforms(post)
  const useInstagramGradient = usePostUsesInstagramGradient(post)
  const timeStr = formatCalendarTime(post.scheduled_at || post.published_at || post.created_at)
  const title = getPostDisplayTitle(post)
  const thumb = post.media_urls?.[0]
  const primaryPlatform = platformIds[0]

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'relative w-full flex items-start gap-2 p-2 rounded-[12px] text-left overflow-hidden',
        'bg-[var(--calendar-post-bg)] border border-[var(--calendar-grid-line)]',
        'hover:brightness-[1.02] dark:hover:brightness-110 transition-all duration-200',
        !useInstagramGradient && primaryPlatform === 'facebook' && 'border-l-[3px] border-l-[#1877F2]',
        !useInstagramGradient && primaryPlatform === 'linkedin' && 'border-l-[3px] border-l-[#0A66C2]',
        !useInstagramGradient && primaryPlatform === 'twitter' && 'border-l-[3px] border-l-[#9b59b6]',
        !useInstagramGradient && platformIds[0] === 'youtube' && 'border-l-[3px] border-l-red-600',
        !useInstagramGradient && platformIds[0] === 'threads' && 'border-l-[3px] border-l-black/60',
        !useInstagramGradient &&
        !['facebook', 'linkedin', 'twitter', 'youtube', 'threads'].includes(primaryPlatform) &&
        'border-l-[3px] border-l-primary',
      )}
    >
      {useInstagramGradient && (
        <span
          className="absolute left-0 top-0 bottom-0 w-[3px] rounded-l-lg bg-gradient-to-b from-[#FFB700] via-[#FF006B] to-[#AD00FF]"
          aria-hidden
        />
      )}

      <div className="relative w-9 h-9 rounded-full overflow-hidden shrink-0 bg-black/5 dark:bg-black/30 border border-[var(--calendar-thumb-border)] ml-0.5">
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
            <Share2 className="w-3.5 h-3.5 text-[var(--calendar-empty-icon)]" />
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0 space-y-0.5 pt-0.5">
        <div className="flex items-center gap-1.5 min-w-0">
          <PlatformAccentText post={post} className="text-[13px] shrink-0">
            {timeStr}
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
        <p className="text-xs font-medium text-[var(--calendar-post-title)] line-clamp-2 leading-snug">
          {title}
        </p>
      </div>
    </button>
  )
}

export default WeeklyTimeSlotPost
