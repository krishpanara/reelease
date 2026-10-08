'use client'

import { Button } from '@/components/ui/button'
import { WeeklyPostCardProps } from '@/types/socialMedia'
import { getMediaUrl } from '@/utils'
import { formatTime12, getPostStats, getPostTitle } from '@/utils/socialMedia'
import { AlertTriangle, BarChart3, Clock, Edit3, Eye, Facebook, Instagram, Linkedin, Share2, Trash2, Youtube } from 'lucide-react'
import { XIcon as Twitter } from '@/components/ui/XIcon'
import Image from 'next/image'
import Link from 'next/link'
import { ThreadsIcon } from '@/components/ui/threadsIcon'
import { cn } from '@/utils/cn'

export function WeeklyPostCard({
  post,
  setSelectedPost,
  setDeleteId,
  getPostLink,
}: WeeklyPostCardProps) {
  
  const isPostScheduled = post.status === 'scheduled' || (post.status === 'pending' && post.scheduled_at)
  const postTimeStr = formatTime12(post.scheduled_at || post.published_at || post.created_at)
  const title = getPostTitle(post)
  const postUrl = getPostLink(post)
  const stats = getPostStats(post)
  
  const platform = post.platform?.toLowerCase()
  let platformLabel = 'SOCIAL'
  let PlatformIcon = Share2
  let platformBg = 'bg-white/5'
  
  if (platform === 'facebook') {
    platformLabel = 'FACEBOOK'
    PlatformIcon = Facebook
    platformBg = 'bg-[#1877F2]'
  } else if (platform === 'instagram') {
    platformLabel = 'INSTAGRAM'
    PlatformIcon = Instagram
    platformBg = 'bg-gradient-to-tr from-[#FFB700] via-[#FF006B] to-[#AD00FF]'
  } else if (platform === 'twitter' || platform === 'x') {
    platformLabel = 'X / TWITTER'
    PlatformIcon = Twitter
    platformBg = 'bg-black border border-white/20'
  } else if (platform === 'linkedin') {
    platformLabel = 'LINKEDIN'
    PlatformIcon = Linkedin
    platformBg = 'bg-[#0A66C2]'
  } else if (platform === 'youtube') {
    platformLabel = 'YOUTUBE'
    PlatformIcon = Youtube
    platformBg = 'bg-[#FF0000]'
  } else if (platform === 'threads') {
    platformLabel = 'THREADS'
    PlatformIcon = ThreadsIcon
    platformBg = 'bg-white dark:bg-black border border-black/10 dark:border-white/20'
  }

  return (
    <div className="w-72 shrink-0 lg:w-[calc((100%-72px)/4)] lg:min-w-[calc((100%-72px)/4)] rounded-3xl border border-glass-border bg-white dark:bg-[#0B0D11]/60 overflow-hidden shadow-lg hover:border-primary/30 transition-all duration-300 flex flex-col group relative min-h-[350px]">
      {/* Card Media Header */}
      <div className="relative h-40 w-full bg-black/5 dark:bg-black/40 overflow-hidden shrink-0">
        {post.media_urls && post.media_urls.length > 0 ? (
          post.media_urls[0].toLowerCase().includes('.mp4') ? (
            <video
              src={getMediaUrl(post.media_urls[0]) || ''}
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              muted
              playsInline
              autoPlay
              loop
            />
          ) : (
            <Image
              src={getMediaUrl(post.media_urls[0]) || ''}
              alt=""
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              unoptimized
            />
          )
        ) : (
          <div className="absolute inset-0 bg-gradient-to-tr from-black/5 dark:from-[#0B0D11] via-primary/5 to-black/3 dark:to-white/5 flex items-center justify-center">
            <Share2 className="w-10 h-10 text-white/10" />
          </div>
        )}

        {/* Platform Badge Overlay */}
        <div className="absolute top-3 left-3 bg-white/80 dark:bg-black/60 backdrop-blur-md border border-glass-border px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider text-foreground dark:text-white flex items-center gap-1.5 shadow-md">
          <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center shrink-0 ${platformBg}`}>
            <PlatformIcon className={cn("w-2.5 h-2.5", platform === 'threads' ? "text-black dark:text-white" : "text-white")} />
          </div>
          <span>{platformLabel}</span>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-2">
          {/* Badge & Time */}
          <div className="flex items-center justify-between">
            <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${
              post.status === 'published' 
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                : post.status === 'failed' 
                ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
            }`}>
              {post.status === 'pending' || post.status === 'scheduled' ? 'Scheduled' : post.status}
            </span>

            <span className="text-[10px] text-muted-foreground font-bold flex items-center gap-1">
              <Clock className="w-3 h-3 text-muted-foreground/60" />
              {postTimeStr}
            </span>
          </div>

          {/* Title */}
          <h4 
            onClick={() => setSelectedPost(post)}
            className="text-sm font-bold text-foreground hover:text-primary transition-all cursor-pointer line-clamp-1 leading-snug"
          >
            {title}
          </h4>

          {/* Excerpt */}
          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed italic">
            {post.caption || 'No caption description entered.'}
          </p>
        </div>

        {/* Footer row */}
        <div className="flex items-center justify-between pt-3 border-t border-glass-border mt-auto">
          {/* Left actions / meta */}
          <div className="text-[10px] text-muted-foreground font-semibold">
            {post.status === 'published' ? (
              <div className="flex items-center gap-2">
                <span>👁️ {stats.views}</span>
                <span>❤️ {stats.likes}</span>
              </div>
            ) : post.status === 'failed' ? (
              <span className="text-red-400 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" /> Error
              </span>
            ) : (
              <span className="text-yellow-400/80 italic font-bold text-[9px] uppercase tracking-wider">
                Waiting for approval
              </span>
            )}
          </div>

          {/* Right actions buttons */}
          <div className="flex items-center gap-1">
            {post.status === 'published' && postUrl && (
              <a
                href={postUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-[9px] font-black uppercase tracking-wider text-primary hover:underline bg-primary/10 border border-primary/20 px-2.5 py-1 rounded-lg transition-all no-underline"
              >
                <span>View Analytics</span>
                <BarChart3 className="w-2.5 h-2.5" />
              </a>
            )}

            {isPostScheduled && post.status !== 'deleted' && (
              <Link
                href={`/social-media/composer?postId=${post._id || post.id}`}
                className="p-1.5 text-yellow-400 hover:text-yellow-300 hover:bg-yellow-500/10 rounded-lg transition-all"
                title="Edit Post"
              >
                <Edit3 className="w-3.5 h-3.5" />
              </Link>
            )}

            <Button
              onClick={() => setSelectedPost(post)}
              className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5 rounded-lg transition-all bg-transparent hover:bg-transparent h-auto w-auto"
              title="Quick Preview"
            >
              <Eye className="w-3.5 h-3.5" />
            </Button>

            <Button
              onClick={() => setDeleteId(post._id || post.id)}
              className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-all bg-transparent hover:bg-transparent h-auto w-auto"
              title="Delete Post"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>

      </div>
    </div>
  )
}
