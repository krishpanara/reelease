'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ThreadsIcon } from '@/components/ui/threadsIcon'
import { XIcon as Twitter } from '@/components/ui/XIcon'
import { SocialPostCardProps } from '@/types/socialMedia'
import { formatDateTime, getMediaUrl } from '@/utils'
import {
  Edit,
  Edit2,
  Edit3,
  ExternalLink,
  Eye,
  ImagePlay,
  Share2,
  Trash2,
  Video,
} from 'lucide-react'
import { FacebookIcon as Facebook } from '@/components/ui/FacebookIcon'
import { InstagramIcon as Instagram } from '@/components/ui/InstagramIcon'
import { LinkedInIcon as Linkedin } from '@/components/ui/LinkedInIcon'
import { YouTubeIcon as Youtube } from '@/components/ui/YouTubeIcon'
import Image from 'next/image'
import Link from 'next/link'
import SafeImage from '@/components/ui/SafeImage'
import { Navigation, Pagination } from 'swiper/modules'
import { Swiper, SwiperSlide } from 'swiper/react'

export function SocialPostCard({ post, t, getPostLink, onViewDetails, onDelete }: SocialPostCardProps) {
  const isDraft = post.status === 'draft'
  const isScheduled = !isDraft && (post.status === 'scheduled' || (post.status === 'pending' && post.scheduled_at))
  const postUrl = getPostLink(post)
  const isStory = post.content_type === 'story'

  // For stories, link to the profile page where stories are visible (same logic as SocialPostReviewModal)
  const profileUrl =
    post.platform === 'instagram'
      ? `https://instagram.com/${post.account?.account_username || post.account?.account_name}`
      : post.platform === 'facebook'
        ? `https://facebook.com/${post.account?.account_username || post.account?.account_name}`
        : post.platform === 'linkedin'
          ? `https://linkedin.com`
          : post.platform === 'youtube'
            ? `https://www.youtube.com/watch?v=${post.post_id}`
            : post.platform === 'threads'
              ? `https://www.threads.com/@${post.account?.account_username || post.account?.account_name}`
              : `https://twitter.com/${post.account?.account_username || post.account?.account_name}`

  const targetUrl = isStory ? profileUrl : postUrl

  let displayStatus = post.status
  if (isScheduled) displayStatus = 'scheduled'

  let badgeStyles = 'capitalize rounded-full px-3 py-1 text-xs font-bold border-none '
  if (displayStatus === 'published') badgeStyles += 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500'
  else if (displayStatus === 'failed') badgeStyles += 'bg-red-50 dark:bg-red-500/10 text-red-500'
  else if (displayStatus === 'scheduled')
    badgeStyles += 'bg-yellow-50 dark:bg-yellow-500/10 text-yellow-600 dark:text-yellow-500'
  else if (displayStatus === 'deleted') badgeStyles += 'bg-red-50 dark:bg-red-500/10 text-red-500'
  else if (isDraft) badgeStyles += 'bg-cyan-50 dark:bg-cyan-500/10 text-cyan-600 dark:text-cyan-400'
  else badgeStyles += 'bg-gray-100 dark:bg-white/10 text-gray-500 dark:text-gray-400'

  const accountInfo = post.account || (post.accountIds && post.accountIds[0])
  const platformName = post.platform || accountInfo?.platform || 'facebook'

  return (
    <div className="flex flex-col justify-between rounded-border-radius border border-glass-border bg-white dark:bg-white/3 overflow-hidden hover:border-primary/30 transition-all duration-300 group glass-card relative">
      <div className="sm:p-5 p-4 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              {accountInfo?.profile_picture ? (
                <div className="relative w-10 h-10 rounded-full overflow-hidden border border-white/10">
                  <SafeImage
                    src={accountInfo.profile_picture}
                    fallbackName={accountInfo?.account_name || accountInfo?.account_username || 'U'}
                    alt=""
                    fill
                    className="object-cover object-top"
                    referrerPolicy="no-referrer"
                    unoptimized
                  />
                </div>
              ) : (
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <ImagePlay className="w-5 h-5 text-primary" />
                </div>
              )}
              <div className="absolute -bottom-1 -right-1 w-5 h-5 z-10 flex items-center justify-center rounded-full bg-white dark:bg-zinc-950 border border-white dark:border-zinc-950 shadow-sm p-[1.5px] overflow-hidden">
                {platformName === 'facebook' ? (
                  <Facebook filled={true} className="w-full h-full" />
                ) : platformName === 'instagram' ? (
                  <Instagram filled={true} className="w-full h-full" />
                ) : platformName === 'linkedin' ? (
                  <Linkedin filled={true} className="w-full h-full" />
                ) : platformName === 'youtube' ? (
                  <Youtube filled={true} className="w-full h-full" />
                ) : platformName === 'twitter' || platformName === 'x' ? (
                  <Twitter filled={true} className="w-full h-full" />
                ) : (
                  <ThreadsIcon filled={true} className="w-full h-full text-black dark:text-white" />
                )}
              </div>
            </div>
            <div className="flex flex-col justify-center">
              <span className="text-sm font-bold text-title-color dark:text-white line-clamp-1 leading-tight mb-0.5">
                {accountInfo?.account_name || accountInfo?.account_username || 'Draft Post'}
              </span>
              <span className="text-xs text-subtitle-color font-medium capitalize">
                {platformName === 'youtube' &&
                  (post.content_type === 'reel' ||
                    post.content_type === 'shorts' ||
                    (post.contentTypes && (post.contentTypes[0] === 'reel' || post.contentTypes[0] === 'shorts')))
                  ? t('shorts', { defaultValue: 'Shorts' })
                  : platformName === 'youtube' &&
                    (post.content_type === 'post' ||
                      post.content_type === 'videos' ||
                      (post.contentTypes && (post.contentTypes[0] === 'post' || post.contentTypes[0] === 'videos')))
                    ? t('videos', { defaultValue: 'Videos' })
                    : t(post.content_type || (post.contentTypes && post.contentTypes[0]) || 'post', {
                      defaultValue: post.content_type || (post.contentTypes && post.contentTypes[0]) || 'Post',
                    })}
              </span>
            </div>
          </div>

          <Badge className={badgeStyles}>
            {t(displayStatus || 'pending', { defaultValue: displayStatus || 'pending' })}
          </Badge>
        </div>
        <div className="relative aspect-video rounded-border-radius overflow-hidden border border-glass-border bg-subcard dark:bg-white/3 flex items-center justify-center">
          {(post.media_urls && post.media_urls.length > 0) || (post.attachmentIds && post.attachmentIds.length > 0) ? (
            <Swiper
              modules={[Navigation, Pagination]}
              navigation
              pagination={{ clickable: true }}
              className="w-full activity-swiper"
              style={{ height: '100%', position: 'absolute', inset: 0 }}
            >
              {(post.media_urls || [])
                .concat((post.attachmentIds || []).map((att: any) => att.file_path))
                .map((mediaUrl: string, idx: number) => {
                  const isVid = mediaUrl.includes('.mp4')
                  return (
                    <SwiperSlide key={idx} style={{ height: '100%', position: 'relative' }}>
                      {isVid ? (
                        <div className="relative w-full h-full group/video">
                          <video
                            src={getMediaUrl(mediaUrl)}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover/video:scale-105"
                            muted
                            playsInline
                            onMouseEnter={(e) => e.currentTarget.play().catch(() => { })}
                            onMouseLeave={(e) => {
                              e.currentTarget.pause()
                              e.currentTarget.currentTime = 0
                            }}
                          />
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center pointer-events-none group-hover/video:opacity-0 transition-opacity duration-300">
                            <Video className="w-8 h-8 text-white/60" />
                          </div>
                        </div>
                      ) : (
                        <div className="relative w-full h-full overflow-hidden">
                          {/* Blurred background image */}
                          <div className="absolute inset-0 pointer-events-none select-none overflow-hidden">
                            <Image
                              src={getMediaUrl(mediaUrl) || ''}
                              alt=""
                              fill
                              className="object-cover blur-sm opacity-80 scale-110"
                              unoptimized
                            />
                            <div className="absolute inset-0 bg-black/10" />
                          </div>
                          {/* Contain foreground image */}
                          <Image
                            src={getMediaUrl(mediaUrl) || ''}
                            alt=""
                            fill
                            className="object-contain transition-transform duration-700 relative z-10"
                            unoptimized
                          />
                        </div>
                      )}
                    </SwiperSlide>
                  )
                })}
            </Swiper>
          ) : (
            <div className="flex flex-col items-center justify-center gap-1.5 p-4 text-center">
              <Share2 className="w-8 h-8 text-title-color/60 dark:text-white" />
              <span className="text-xs text-muted-foreground">
                {t('text_only_post', { defaultValue: 'Text only post' })}
              </span>
            </div>
          )}
        </div>

        <p className="text-md text-title-color font-bold line-clamp-2 leading-relaxed">
          {post.caption || t('no_caption', { defaultValue: 'No caption content' })}
        </p>
      </div>

      {/* Actions footer */}
      <div className="flex items-center justify-between sm:px-5 px-4 py-3 mt-2 border-t border-glass-border">
        <span className="text-xs text-subtitle-color font-medium">
          {isDraft
            ? `${t('updated_at', { defaultValue: 'Updated' })}: ${formatDateTime(post.updated_at || post.created_at)}`
            : isScheduled
              ? `${formatDateTime(post.scheduled_at)}`
              : formatDateTime(post.published_at || post.created_at)}
        </span>

        <div className="flex items-center gap-2">
          {/* View details */}
          {!isDraft && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full bg-blue-50 hover:bg-blue-100 text-blue-500! dark:bg-blue-500/10 dark:hover:bg-blue-500/20"
              onClick={() => onViewDetails(post)}
              title={t('view_details', { defaultValue: 'View Details' })}
            >
              <Eye className="w-4 h-4" />
            </Button>
          )}

          {/* View Live Post */}
          {!isDraft && post.status === 'published' && targetUrl && (
            <a href={targetUrl} target="_blank" rel="noopener noreferrer">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full bg-blue-50 hover:bg-blue-100 text-blue-500! dark:bg-blue-500/10 dark:hover:bg-blue-500/20"
                title={
                  isStory
                    ? t('view_live_story', { defaultValue: 'View Live Story' })
                    : t('view_live_post', { defaultValue: 'View Live Post' })
                }
              >
                <ExternalLink className="w-4 h-4" />
              </Button>
            </a>
          )}

          {/* Edit Scheduled Post */}
          {isScheduled && post.status !== 'deleted' && (
            <Link href={`/social-media/composer?postId=${post.id || post._id}`}>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full bg-blue-50 hover:bg-blue-100 text-blue-500! dark:bg-blue-500/10 dark:hover:bg-blue-500/20"
                title={t('edit_scheduled_post', { defaultValue: 'Edit Scheduled Post' })}
              >
                <Edit2 className="w-4 h-4" />
              </Button>
            </Link>
          )}

          {/* Edit Draft Post */}
          {isDraft && (
            <Link href={`/social-media/composer?draftId=${post.id || post._id}`}>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full bg-cyan-50 hover:bg-cyan-100 text-cyan-600! dark:bg-cyan-500/10 dark:hover:bg-cyan-500/20"
                title={t('edit_draft', { defaultValue: 'Edit Draft' })}
              >
                <Edit3 className="w-4 h-4" />
              </Button>
            </Link>
          )}

          {/* Delete */}
          {post.status !== 'deleted' && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full bg-red-50 hover:bg-red-100 text-red-500! dark:bg-red-500/10 dark:hover:bg-red-500/20"
              onClick={() => onDelete(post.id || post._id)}
              title={t('delete', { defaultValue: 'Delete' })}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
