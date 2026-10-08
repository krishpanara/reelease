'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import { Heart, MessageCircle, Repeat2, Send, ThumbsUp, Share, MoreHorizontal, Globe, Play, Home, Search, Camera, Compass, User, Plus, Volume2, Maximize2, MoreVertical, Video, ChevronLeft, Music } from 'lucide-react'
import { XIcon as Twitter } from '@/components/ui/XIcon'
import { FacebookIcon } from '@/components/ui/FacebookIcon'
import { InstagramIcon } from '@/components/ui/InstagramIcon'
import { LinkedInIcon } from '@/components/ui/LinkedInIcon'
import { YouTubeIcon } from '@/components/ui/YouTubeIcon'
import Image from 'next/image'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Pagination } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'
import { NetworkPreviewProps } from '@/types/socialMedia'
import { ThreadsIcon } from '@/components/ui/threadsIcon'

function PlatformAvatarFallback({ platform }: { platform?: string }) {
  const p = platform?.toLowerCase()
  if (p === 'instagram') return <InstagramIcon filled={true} className="w-4 h-4" />
  if (p === 'linkedin') return <LinkedInIcon filled={true} className="w-4 h-4" />
  if (p === 'twitter' || p === 'x') return <Twitter filled={true} className="w-4 h-4" />
  if (p === 'facebook') return <FacebookIcon filled={true} className="w-4 h-4" />
  if (p === 'youtube') return <YouTubeIcon filled={true} className="w-4 h-4" />
  if (p === 'threads') return <ThreadsIcon filled={true} className="w-4 h-4 text-white" />
  return <span className="text-[10px]">👤</span>
}

const getFullMediaUrl = (path: string) => {
  if (!path) return ''
  return path.startsWith('http')
    ? path
    : `${process.env.NEXT_PUBLIC_STORAGE_URL || ''}/${path.replace(/^\//, '')}`
}

const renderCaptionWithHashtags = (captionText: string, platform: string) => {
  if (!captionText) return 'Your caption will appear here...'

  // Regex to find hashtags: # followed by alphanumeric characters
  const hashtagRegex = /#(\w+)/g
  const parts = captionText.split(hashtagRegex)

  if (parts.length === 1) return captionText

  // Find matches
  const matches = Array.from(captionText.matchAll(hashtagRegex))
  let matchIndex = 0

  return parts.map((part, index) => {
    // Every odd index is a hashtag match
    if (index % 2 === 1) {
      const tag = part
      let url = '#'
      if (platform === 'instagram') {
        url = `https://www.instagram.com/explore/tags/${tag}/`
      } else if (platform === 'facebook') {
        url = `https://www.facebook.com/hashtag/${tag}`
      } else if (platform === 'linkedin') {
        url = `https://www.linkedin.com/feed/hashtag/?keywords=${tag}`
      } else if (platform === 'twitter') {
        url = `https://twitter.com/hashtag/${tag}`
      } else if (platform === 'youtube') {
        url = `https://www.youtube.com/hashtag/${tag}`
      } else if (platform === 'threads') {
        url = `https://www.threads.com/tag/${tag}`
      }

      return (
        <a
          key={index}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-400 hover:underline font-semibold break-all whitesapce-normal "
          onClick={(e) => e.stopPropagation()}
        >
          #{tag}
        </a>
      )
    }
    return part
  })
}

function MusicSticker({ musicName }: { musicName: string }) {
  return (
    <div className="absolute bottom-20 left-4 right-4 bg-black/70 backdrop-blur-md border border-white/10 rounded-2xl p-3.5 flex items-center gap-3 animate-bounce  z-20 max-w-[250px] mx-auto">
      <div className="w-8 h-8 rounded-xl bg-primary/20 flex items-center justify-center shrink-0 animate-spin-slow">
        <span className="text-sm">🎵</span>
      </div>
      <div className="overflow-hidden flex-1">
        <p className="text-[8px] text-muted-foreground font-black uppercase tracking-widest">Audio Track</p>
        <p className="text-[11px] font-bold text-white truncate animate-pulse">{musicName}</p>
      </div>
    </div>
  )
}

function StoryOverlay({
  text,
  color,
  bg,
  size,
  position,
}: {
  text: string
  color: string
  bg: string
  size: string
  position: string
}) {
  if (!text) return null

  const sizeClasses = size === 'sm' ? 'text-xs' : size === 'lg' ? 'text-xl' : 'text-sm'

  let posClasses = ''
  if (position === 'top') {
    posClasses = 'top-14 left-4 right-4 text-center'
  } else if (position === 'bottom') {
    posClasses = 'bottom-14 left-4 right-4 text-center'
  } else if (position === 'top-left' || position === 'top_left' || position === 'top left') {
    posClasses = 'top-14 left-4 text-left max-w-[70%]'
  } else if (position === 'top-right' || position === 'top_right' || position === 'top right') {
    posClasses = 'top-14 right-4 text-right max-w-[70%] ml-auto'
  } else if (position === 'bottom-left' || position === 'bottom_left' || position === 'bottom left') {
    posClasses = 'bottom-14 left-4 text-left max-w-[70%]'
  } else if (position === 'bottom-right' || position === 'bottom_right' || position === 'bottom right') {
    posClasses = 'bottom-14 right-4 text-right max-w-[70%] ml-auto'
  } else {
    posClasses = 'top-1/2 -translate-y-1/2 left-4 right-4 text-center'
  }

  return (
    <div
      className={cn('absolute z-10 p-2.5 rounded-xl  pointer-events-none select-none', posClasses)}
      style={{ color: color, backgroundColor: bg }}
    >
      <p className={cn('font-black uppercase tracking-wide ', sizeClasses)}>{text}</p>
    </div>
  )
}

function getStoryBackgroundStyle(bgColor?: string) {
  if (!bgColor) return 'linear-gradient(to top right, rgba(88, 28, 135, 0.6), rgba(30, 58, 138, 0.6))'
  if (bgColor === 'sunset') return 'linear-gradient(to top right,  f43f5e, #f97316)'
  if (bgColor === 'indigo') return 'linear-gradient(to top right, #1e1b4b, #4f46e5)'
  if (bgColor === 'violet') return 'linear-gradient(to top right, #7c3aed, #db2777)'
  if (bgColor === 'emerald') return 'linear-gradient(to top right, #064e3b, #059669)'
  return bgColor // Hex color
}

function StoryPreview({
  account,
  mediaList,
  storyText,
  storyTextColor,
  storyTextBg,
  storyTextSize,
  storyTextPosition,
  storyBgColor,
  selectedMusic,
  platformStyle,
}: any) {
  const items = mediaList?.length ? mediaList : []
  const hasMedia = items.length > 0
  const firstItem = items[0]
  const isVideo = firstItem?.mime_type?.startsWith('video/') || firstItem?.file_path?.includes('.mp4')

  return (
    <div
      className={cn(
        'rounded-2xl overflow-hidden bg-black border border-white/10 text-white w-full aspect-[4/5] relative flex flex-col justify-between  transition-all duration-500',
        platformStyle?.border,
        platformStyle?.bg,
        platformStyle?.glow,
      )}
    >
      {/* Top Progress Indicators */}
      <div className="absolute top-2 left-2 right-2 flex gap-1 z-20">
        <div className="h-0.5 flex-1 bg-white rounded-full"></div>
        <div className="h-0.5 flex-1 bg-white/30 rounded-full"></div>
      </div>

      {/* Profile Header */}
      <div className="absolute top-4 left-3 right-3 flex items-center gap-2 z-20">
        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 p-[1.5px]">
          <Avatar className="w-full h-full">
            <AvatarImage src={account?.profile_picture} />
            <AvatarFallback className=" text-white flex items-center justify-center">
              <PlatformAvatarFallback platform={account?.platform} />
            </AvatarFallback>
          </Avatar>
        </div>
        <div>
          <p className="text-sm font-bold ">{account?.account_name || 'Your Account'}</p>
          <p className="text-[10px] text-white/60 ">Sponsored</p>
        </div>
      </div>

      {/* Media Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60 z-0">
        {hasMedia ? (
          isVideo ? (
            <video
              src={getFullMediaUrl(firstItem.file_path)}
              className="w-full h-full object-cover"
              muted
              autoPlay
              loop
              playsInline
            />
          ) : (
            <Image
              src={getFullMediaUrl(firstItem.file_path)}
              alt="preview"
              fill
              unoptimized
              className="object-cover"
            />
          )
        ) : (
          <div
            className="w-full h-full flex flex-col items-center justify-center sm:p-6 p-4 text-center transition-all duration-500"
            style={{ background: getStoryBackgroundStyle(storyBgColor) }}
          >
            <span className="text-3xl mb-2 animate-pulse">✨</span>
            <p className="text-[10px] text-white/40">Story media will fill the screen</p>
          </div>
        )}
      </div>

      {/* Story Overlay Custom text */}
      <StoryOverlay
        text={storyText}
        color={storyTextColor}
        bg={storyTextBg}
        size={storyTextSize}
        position={storyTextPosition}
      />

      {/* Music Sticker Overlay */}
      {selectedMusic && <MusicSticker musicName={selectedMusic.name} />}
    </div>
  )
}

function MediaRenderer({
  mediaList,
  media,
  aspect,
  objectFit = 'cover',
}: {
  mediaList?: any[]
  media?: any
  aspect?: string
  objectFit?: 'cover' | 'contain'
}) {
  const items = mediaList?.length ? mediaList : media ? [media] : []

  if (items.length === 0) {
    return (
      <div
        className={cn(
          'relative w-full flex flex-col items-center justify-center text-center sm:p-6 p-4 bg-subcard dark:bg-white/3! border border-glass-border',
          aspect,
        )}
      >
        <div className="w-16 h-16 rounded-3xl bg-white/5 border glass-border dark:bg-white/3! flex items-center justify-center mb-4  backdrop-blur-md z-10">
          <Heart className="w-8 h-8 text-primary opacity-60" />
        </div>
        <p className="text-base font-black text-title-color z-10">No Media Selected</p>
        <p className="text-sm text-subtitle-color mt-1 z-10 leading-relaxed">
          Choose a beautiful image or video from your media library to preview it here live.
        </p>
      </div>
    )
  }

  if (items.length === 1) {
    const item = items[0]
    const isVideo = item?.mime_type?.startsWith('video/') || item?.file_path?.includes('.mp4')

    return (
      <div className={cn('relative bg-black/60 overflow-hidden', aspect)}>
        {isVideo ? (
          <video
            src={getFullMediaUrl(item.file_path)}
            className={cn('w-full h-full', objectFit === 'cover' ? 'object-cover' : 'object-contain')}
            muted
            autoPlay
            loop
            playsInline
          />
        ) : (
          <Image
            src={getFullMediaUrl(item.file_path)}
            alt="preview"
            fill
            unoptimized
            className={objectFit === 'cover' ? 'object-cover' : 'object-contain'}
          />
        )}
      </div>
    )
  }

  return (
    <div className={cn('relative bg-black/60 overflow-hidden', aspect)}>
      <style>{`
        .network-preview-swiper .swiper-button-next,
        .network-preview-swiper .swiper-button-prev {
          color: white !important;
          transform: scale(0.5);
          background: transparent;
          border-radius: 50%;
          width: 40px;
          height: 40px;
        }
        .network-preview-swiper .swiper-pagination-bullet {
          background: rgba(255, 255, 255, 0.5);
        }
        .network-preview-swiper .swiper-pagination-bullet-active {
          background: white;
        }
      `}</style>
      <Swiper
        modules={[Navigation, Pagination]}
        navigation
        pagination={{ clickable: true }}
        className="w-full h-full network-preview-swiper"
      >
        {items.map((item, idx) => {
          const isVideo = item?.mime_type?.startsWith('video/') || item?.file_path?.includes('.mp4')

          return (
            <SwiperSlide key={idx} className="relative w-full h-full">
              {isVideo ? (
                <video
                  src={getFullMediaUrl(item.file_path)}
                  className={cn('w-full h-full', objectFit === 'cover' ? 'object-cover' : 'object-contain')}
                  muted
                  autoPlay
                  loop
                  playsInline
                />
              ) : (
                <Image
                  src={getFullMediaUrl(item.file_path)}
                  alt="preview"
                  fill
                  unoptimized
                  className={objectFit === 'cover' ? 'object-cover' : 'object-contain'}
                />
              )}
            </SwiperSlide>
          )
        })}
      </Swiper>
    </div>
  )
}

function ThreadsPreview({ account, caption, media, mediaList, selectedMusic, platformStyle }: NetworkPreviewProps) {
  return (
    <div
      className={cn(
        'rounded-2xl overflow-hidden bg-white dark:bg-black border border-gray-200 dark:border-white/10 text-title-color dark:text-white w-full relative transition-all duration-500 ',
        platformStyle?.border,
        platformStyle?.bg,
        platformStyle?.glow,
      )}
    >
      <div className="p-4">
        <div className="flex gap-3">
          <div className="flex flex-col items-center shrink-0">
            <Avatar className="w-9 h-9 border border-gray-200 dark:border-white/10">
              <AvatarImage src={account?.profile_picture} />
              <AvatarFallback className="bg-gray-100 dark:bg-white/10 text-title-color dark:text-white flex items-center justify-center">
                <PlatformAvatarFallback platform={account?.platform} />
              </AvatarFallback>
            </Avatar>
            <div className="w-[2px] grow bg-gray-200 dark:bg-white/10 my-2 rounded-full min-h-[20px]" />
            <div className="relative w-5 h-5">
              <div className="absolute top-0 left-0 w-3.5 h-3.5 rounded-full bg-gray-300 dark:bg-zinc-700 border border-white dark:border-zinc-950 flex items-center justify-center text-[6px]">👤</div>
              <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-gray-400 dark:bg-zinc-600 border border-white dark:border-zinc-950 flex items-center justify-center text-[5px]">👤</div>
            </div>
          </div>

          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="text-sm font-semibold hover:underline cursor-pointer truncate">{account?.account_name}</span>
                <svg className="w-3.5 h-3.5 text-blue-500 fill-current shrink-0" viewBox="0 0 24 24">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                </svg>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs text-zinc-500">Just now</span>
                <MoreHorizontal className="w-5 h-5 text-zinc-500 cursor-pointer" />
              </div>
            </div>

            <div className="text-sm leading-relaxed text-zinc-900 dark:text-zinc-100 whitespace-pre-wrap">
              {renderCaptionWithHashtags(caption, 'threads')}
            </div>

            {((mediaList && mediaList.length > 0) || media) && (
              <div className="rounded-xl overflow-hidden border border-gray-100 dark:border-white/5 relative mt-2">
                <MediaRenderer mediaList={mediaList} media={media} aspect="aspect-[4/5]" />
                {selectedMusic && <MusicSticker musicName={selectedMusic.name} />}
              </div>
            )}

            <div className="flex items-center gap-4 text-zinc-500 dark:text-zinc-400 pt-2 pb-1">
              <Heart className="w-[18px] h-[18px] hover:text-red-500 cursor-pointer transition-colors" />
              <MessageCircle className="w-[18px] h-[18px] hover:text-blue-500 cursor-pointer transition-colors" />
              <svg className="w-[18px] h-[18px] hover:text-green-500 cursor-pointer transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 1l4 4-4 4" />
                <path d="M3 11V9a4 4 0 0 1 4-4h14" />
                <path d="M7 23l-4-4 4-4" />
                <path d="M21 13v2a4 4 0 0 1-4 4H3" />
              </svg>
              <svg className="w-[18px] h-[18px] hover:text-blue-500 cursor-pointer transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </div>

            <div className="flex items-center gap-2 text-[11px] text-zinc-500 dark:text-zinc-500 font-medium">
              <span>0 replies</span>
              <span>·</span>
              <span>0 likes</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function ReelPreview({ account, caption, mediaList, selectedMusic, platformStyle }: any) {
  const items = mediaList?.length ? mediaList : []
  const hasMedia = items.length > 0
  const firstItem = items[0]
  const isVideo = firstItem?.mime_type?.startsWith('video/') || firstItem?.file_path?.includes('.mp4')

  return (
    <div
      className={cn(
        'rounded-2xl overflow-hidden bg-black border border-white/10 text-white w-full aspect-[9/16] relative flex flex-col justify-between transition-all duration-500 ',
        platformStyle?.border,
        platformStyle?.bg,
        platformStyle?.glow,
      )}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/70 z-0">
        {hasMedia ? (
          isVideo ? (
            <video
              src={getFullMediaUrl(firstItem.file_path)}
              className="w-full h-full object-cover"
              muted
              autoPlay
              loop
              playsInline
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-zinc-900">
              <Video className="w-10 h-10 text-zinc-500 mb-3 animate-pulse" />
              <p className="text-sm font-bold text-white">Video Required for Reels</p>
              <p className="text-xs text-zinc-500 mt-1">Reels support video content only. Please select a video file.</p>
            </div>
          )
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-zinc-900">
            <Video className="w-12 h-12 text-zinc-500 mb-4 animate-pulse" />
            <p className="text-sm font-bold text-white">No Reel Media Selected</p>
            <p className="text-xs text-zinc-500 mt-1">Choose a video from the library to preview your Reel live.</p>
          </div>
        )}
      </div>

      <div className="absolute top-4 left-3 right-3 flex items-center justify-between z-20 text-white">
        <ChevronLeft className="w-6 h-6 cursor-pointer" />
        <span className="text-sm font-bold tracking-wider">Reels</span>
        <svg className="w-6 h-6 cursor-pointer" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
          <circle cx="12" cy="13" r="4" />
        </svg>
      </div>

      <div className="absolute right-3 bottom-24 flex flex-col items-center gap-5 z-20 text-white ">
        <div className="flex flex-col items-center gap-1 cursor-pointer group">
          <Heart className="w-7 h-7 group-hover:scale-110 transition-transform" />
          <span className="text-[10px] font-semibold">0</span>
        </div>
        <div className="flex flex-col items-center gap-1 cursor-pointer group">
          <MessageCircle className="w-7 h-7 group-hover:scale-110 transition-transform" />
          <span className="text-[10px] font-semibold">0</span>
        </div>
        <div className="flex flex-col items-center gap-1 cursor-pointer group">
          <Send className="w-6 h-6 rotate-45 group-hover:scale-110 transition-transform" />
          <span className="text-[10px] font-semibold">Share</span>
        </div>
        <MoreHorizontal className="w-6 h-6 cursor-pointer" />
        <div className="w-7 h-7 rounded-full border border-white/50 bg-zinc-800 flex items-center justify-center overflow-hidden animate-spin duration-3000 mt-2">
          {account?.profile_picture ? (
            <img src={account.profile_picture} className="w-full h-full object-cover" alt="audio" />
          ) : (
            <Music className="w-3.5 h-3.5 text-white" />
          )}
        </div>
      </div>

      <div className="absolute left-3 right-16 bottom-4 z-20 text-white  space-y-2.5">
        <div className="flex items-center gap-2">
          <Avatar className="w-8 h-8 border border-white/20">
            <AvatarImage src={account?.profile_picture} />
            <AvatarFallback className="bg-zinc-800 text-white flex items-center justify-center">
              <PlatformAvatarFallback platform={account?.platform} />
            </AvatarFallback>
          </Avatar>
          <span className="text-sm font-bold truncate max-w-[120px]">{account?.account_name || 'Your Account'}</span>
          <span className="px-2 py-0.5 rounded border border-white/40 text-[9px] font-bold uppercase tracking-wider scale-90">Follow</span>
        </div>

        <p className="text-xs text-white/90 line-clamp-3 leading-relaxed">
          {renderCaptionWithHashtags(caption, account?.platform || 'instagram')}
        </p>

        <div className="flex items-center gap-1.5 text-[10px] text-white/80 bg-black/30 px-2.5 py-1 rounded-full w-fit max-w-full truncate">
          <Music className="w-3 h-3 animate-bounce" />
          <span className="truncate">{selectedMusic ? selectedMusic.name : `${account?.account_name || 'Original'} · Original Audio`}</span>
        </div>
      </div>
    </div>
  )
}

function InstagramPreview({ account, caption, media, mediaList, selectedMusic, platformStyle }: NetworkPreviewProps) {
  return (
    <div
      className={cn(
        'rounded-2xl overflow-hidden bg-subcard dark:bg-white/3! border border-gray-200 dark:border-white/10 text-title-color dark:text-white w-full relative transition-all duration-500',
        platformStyle?.border,
        platformStyle?.bg,
        platformStyle?.glow,
      )}
    >
      <div className="flex items-center gap-3 p-3">
        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 p-[2px]">
          <Avatar className="w-full h-full">
            <AvatarImage src={account?.profile_picture} />
            <AvatarFallback className="text-title-color dark:text-white flex items-center justify-center bg-white dark:bg-black">
              <PlatformAvatarFallback platform={account?.platform} />
            </AvatarFallback>
          </Avatar>
        </div>
        <div className="flex-1">
          <p className="text-sm text-title-color dark:text-white font-bold">{account?.account_name}</p>
          <p className="text-xs text-subtitle-color uppercase tracking-wider">Feed</p>
        </div>
        <MoreHorizontal className="w-4 h-4 text-subtitle-color" />
      </div>
      <div className="relative">
        <MediaRenderer mediaList={mediaList} media={media} aspect="aspect-[4/5]" />
        {selectedMusic && <MusicSticker musicName={selectedMusic.name} />}
      </div>
      <div className="p-3 space-y-2">
        <div className="flex items-center gap-4 text-title-color dark:text-white">
          <Heart className="w-5 h-5" />
          <MessageCircle className="w-5 h-5" />
          <Send className="w-5 h-5" />
        </div>
        <div className="text-xs leading-relaxed text-subtitle-color max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
          <span className="font-bold mr-1 text-title-color dark:text-white">{account?.account_name}</span>
          {renderCaptionWithHashtags(caption, 'instagram')}
        </div>
      </div>
    </div>
  )
}

function LinkedInPreview({ account, caption, media, mediaList, selectedMusic, platformStyle }: NetworkPreviewProps) {
  return (
    <div
      className={cn(
        'rounded-2xl overflow-hidden  bg-subcard dark:bg-white/3 border  border-glass-border text-title-color dark:text-white w-full relative transition-all duration-500',
        platformStyle?.border,
        platformStyle?.bg,
        platformStyle?.glow,
      )}
    >
      <div className="flex items-center gap-3 p-4">
        <Avatar className="w-10 h-10">
          <AvatarImage src={account?.profile_picture} />
          <AvatarFallback className="bg-primary dark:bg-blue-600/20 text-blue-500 dark:text-blue-300 flex items-center justify-center">
            <PlatformAvatarFallback platform={account?.platform} />
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <p className="text-sm font-bold">{account?.account_name}</p>
          <div className="flex items-center gap-1 text-xs text-subtitle-color">
            <span>Now</span>
            <span>·</span>
            <Globe className="w-3 h-3" />
          </div>
        </div>
        <MoreHorizontal className="w-4 h-4 text-subtitle-color" />
      </div>
      <div className="px-4 pb-3 text-sm leading-relaxed text-subtitle-color max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
        {renderCaptionWithHashtags(caption, 'linkedin')}
      </div>
      <div className="relative">
        <MediaRenderer mediaList={mediaList} media={media} aspect="aspect-[4/5]" />
        {selectedMusic && <MusicSticker musicName={selectedMusic.name} />}
      </div>
      <div className="flex flex-wrap items-center justify-between gap-4 px-4 py-3 border-t border-glass-border text-subtitle-color text-xs">
        <button className="flex items-center gap-1.5 hover:text-blue-500 transition-colors">
          <ThumbsUp className="w-4 h-4" />
          <span>Like</span>
        </button>
        <button className="flex items-center gap-1.5 hover:text-blue-500 transition-colors">
          <MessageCircle className="w-4 h-4" />
          <span>Comment</span>
        </button>
        <button className="flex items-center gap-1.5 hover:text-blue-500 transition-colors">
          <Repeat2 className="w-4 h-4" />
          <span>Repost</span>
        </button>
        <button className="flex items-center gap-1.5 hover:text-blue-500 transition-colors">
          <Send className="w-4 h-4" />
          <span>Send</span>
        </button>
      </div>
    </div>
  )
}

function TwitterPreview({ account, caption, media, mediaList, selectedMusic, platformStyle }: NetworkPreviewProps) {
  return (
    <div
      className={cn(
        'rounded-2xl overflow-hidden bg-white dark:bg-[#0f0f0f] border border-gray-200 dark:border-white/10 text-title-color dark:text-white w-full relative transition-all duration-500',
        platformStyle?.border,
        platformStyle?.bg,
        platformStyle?.glow,
      )}
    >
      <div className="p-4 space-y-3">
        <div className="flex gap-3">
          <Avatar className="w-9 h-9 shrink-0 border border-gray-200 dark:border-white/10">
            <AvatarImage src={account?.profile_picture} />
            <AvatarFallback className="bg-gray-100 dark:bg-white/10 text-title-color dark:text-white flex items-center justify-center">
              <PlatformAvatarFallback platform={account?.platform} />
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-[12px] font-bold">{account?.account_name}</span>
              <span className="text-[10px] text-subtitle-color">
                @{account?.account_name?.toLowerCase().replace(/\s/g, '_')}
              </span>
              <MoreHorizontal className="w-3.5 h-3.5 text-subtitle-color ml-auto" />
            </div>
            <div className="text-[11px] leading-relaxed text-subtitle-color max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
              {renderCaptionWithHashtags(caption, 'twitter')}
            </div>
            <div className="rounded-xl overflow-hidden relative">
              <MediaRenderer mediaList={mediaList} media={media} aspect="aspect-[4/5]" />
              {selectedMusic && <MusicSticker musicName={selectedMusic.name} />}
            </div>
            <div className="flex items-center gap-5 text-subtitle-color pt-1">
              <MessageCircle className="w-4 h-4 hover:text-blue-500 cursor-pointer transition-colors" />
              <Repeat2 className="w-4 h-4 hover:text-green-500 cursor-pointer transition-colors" />
              <Heart className="w-4 h-4 hover:text-pink-500 cursor-pointer transition-colors" />
              <Share className="w-4 h-4 hover:text-blue-500 cursor-pointer transition-colors" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function FacebookPreview({ account, caption, media, mediaList, selectedMusic, platformStyle }: NetworkPreviewProps) {
  return (
    <div
      className={cn(
        'rounded-2xl overflow-hidden bg-white dark:bg-[#1c1e21] border border-gray-200 dark:border-white/10 text-title-color dark:text-white w-full relative transition-all duration-500',
        platformStyle?.border,
        platformStyle?.bg,
        platformStyle?.glow,
      )}
    >
      <div className="flex items-center gap-3 p-4">
        <Avatar className="w-10 h-10">
          <AvatarImage src={account?.profile_picture} />
          <AvatarFallback className="bg-primary dark:bg-blue-600/20 text-blue-500 flex items-center justify-center">
            <PlatformAvatarFallback platform={account?.platform} />
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="text-md font-bold">{account?.account_name}</p>
          <div className="flex items-center gap-1 text-[12px] text-subtitle-color">
            <span>Just now</span>
            <span>·</span>
            <Globe className="w-2.5 h-2.5" />
          </div>
        </div>
        <MoreHorizontal className="w-4 h-4 text-subtitle-color ml-auto" />
      </div>
      <div className="px-4 pb-3 text-sm leading-relaxed text-subtitle-color max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
        {renderCaptionWithHashtags(caption, 'facebook')}
      </div>
      <div className="relative">
        <MediaRenderer mediaList={mediaList} media={media} aspect="aspect-[4/5]" />
        {selectedMusic && <MusicSticker musicName={selectedMusic.name} />}
      </div>
      <div className="flex flex-wrap items-center px-4 py-2.5 border-t border-gray-200 dark:border-white/5 gap-1 text-subtitle-color text-sm">
        <button className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg">
          <ThumbsUp className="w-4 h-4" />
          Like
        </button>
        <button className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg">
          <MessageCircle className="w-4 h-4" />
          Comment
        </button>
        <button className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg">
          <Share className="w-4 h-4" />
          Share
        </button>
      </div>
    </div>
  )
}

function YouTubePreview({ account, caption, media, mediaList, selectedMusic, platformStyle, contentType }: NetworkPreviewProps) {
  const isShorts = contentType === 'shorts' || contentType === 'reel'

  if (isShorts) {
    return (
      <div className="flex items-start justify-center gap-6 w-full py-4 select-none">
        {/* Shorts Player Container */}
        <div
          className={cn(
            'relative aspect-[9/16] w-full max-w-[320px] bg-black rounded-3xl overflow-hidden border border-white/10  flex flex-col justify-between group transition-all duration-500',
            platformStyle?.border,
            platformStyle?.glow,
          )}
        >
          {/* Video / Image Content */}
          <div className="absolute inset-0 z-0 flex items-center justify-center bg-black">
            <MediaRenderer mediaList={mediaList} media={media} aspect="h-full w-full" objectFit="contain" />
          </div>

          {/* Top Controls Overlay */}
          <div className="absolute top-0 left-0 right-0 p-3.5 flex justify-between items-center bg-linear-to-b from-black/60 to-transparent z-10">
            {/* Left controls: Play and Volume */}
            <div className="flex items-center gap-3 text-white">
              <Play className="w-4 h-4 fill-white cursor-pointer hover:scale-110 active:scale-95 transition-transform" />
              <Volume2 className="w-4 h-4 cursor-pointer hover:scale-110 active:scale-95 transition-transform" />
            </div>
            {/* Right controls: CC, Three dots, Fullscreen */}
            <div className="flex items-center gap-3 text-white">
              <span className="text-[10px] font-black border-2 border-white px-1 py-0.5 rounded leading-none select-none cursor-pointer hover:bg-white/10 transition-colors">CC</span>
              <MoreVertical className="w-4 h-4 cursor-pointer hover:scale-110 active:scale-95 transition-transform" />
              <Maximize2 className="w-4 h-4 cursor-pointer hover:scale-110 active:scale-95 transition-transform" />
            </div>
          </div>

          {/* Bottom Left Info Overlay */}
          <div className="absolute left-4 bottom-4 right-4 z-10 space-y-2 text-left bg-gradient-to-t from-black/80 via-black/40 to-transparent p-3 rounded-b-2xl">
            {/* Channel Info & Subscribe button */}
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full border border-white/20 bg-teal-600 flex items-center justify-center overflow-hidden">
                {account?.profile_picture ? (
                  <Image
                    src={getFullMediaUrl(account.profile_picture)}
                    alt=""
                    width={28}
                    height={28}
                    className="w-full h-full object-cover"
                    unoptimized
                  />
                ) : (
                  <span className="text-[10px] font-bold text-white uppercase">
                    {account?.account_name?.charAt(0) || 'P'}
                  </span>
                )}
              </div>
              <span className="text-xs font-bold tracking-wide  truncate max-w-[120px]">
                @{account?.account_name || 'YouTube Channel'}
              </span>
              <button className="px-2.5 py-0.5 bg-red-600 hover:bg-red-700 text-white rounded-full text-[9px] font-bold tracking-wider active:scale-95 transition-colors ">
                Subscribe
              </button>
            </div>

            {/* Description Caption / Title */}
            <div className="text-[10px] font-medium leading-relaxed  text-white/90 line-clamp-2">
              {renderCaptionWithHashtags(caption, 'youtube')}
            </div>

            {/* Sound/Audio Name */}
            {selectedMusic?.name && (
              <div className="flex items-center gap-1 text-[9px] font-bold  text-white/90 max-w-[150px] truncate bg-black/40 backdrop-blur-sm border border-white/5 px-2 py-0.5 rounded-full w-fit">
                <span>🎵</span>
                <span className="animate-pulse">{selectedMusic.name}</span>
              </div>
            )}
          </div>

          {/* Bottom progress/seeker line */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20 z-10">
            <div className="h-full bg-red-600 w-2/3" />
          </div>
        </div>

        {/* Right Actions Sidebar Column */}
        <div className="flex flex-col items-center gap-4.5 shrink-0 pt-6 text-white">
          {/* Like */}
          <div className="flex flex-col items-center">
            <button className="w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 flex items-center justify-center active:scale-95 transition-all text-white ">
              <ThumbsUp className="w-5 h-5 fill-white text-white" />
            </button>
            <span className="text-[10px] font-black mt-1">1</span>
          </div>

          {/* Dislike */}
          <div className="flex flex-col items-center">
            <button className="w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 flex items-center justify-center active:scale-95 transition-all text-white ">
              <ThumbsUp className="w-5 h-5 text-white rotate-180" />
            </button>
            <span className="text-[10px] font-black mt-1">Dislike</span>
          </div>

          {/* Comments */}
          <div className="flex flex-col items-center">
            <button className="w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 flex items-center justify-center active:scale-95 transition-all text-white ">
              <MessageCircle className="w-5 h-5 fill-white text-white" />
            </button>
            <span className="text-[10px] font-black mt-1">0</span>
          </div>

          {/* Share */}
          <div className="flex flex-col items-center">
            <button className="w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 flex items-center justify-center active:scale-95 transition-all text-white ">
              <Share className="w-5 h-5 fill-white text-white" />
            </button>
            <span className="text-[10px] font-black mt-1">Share</span>
          </div>

          {/* Remix */}
          <div className="flex flex-col items-center">
            <button className="w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 flex items-center justify-center active:scale-95 transition-all text-white ">
              <Repeat2 className="w-5 h-5 text-white" />
            </button>
            <span className="text-[10px] font-black mt-1">Remix</span>
          </div>

          {/* Profile Circle with Teal Background and "P" (or channel icon) */}
          <div className="mt-1">
            <div className="w-10 h-10 rounded-full border-2 border-white/10 bg-teal-700 flex items-center justify-center overflow-hidden  select-none">
              {account?.profile_picture ? (
                <Image
                  src={getFullMediaUrl(account.profile_picture)}
                  alt=""
                  width={40}
                  height={40}
                  className="w-full h-full object-cover"
                  unoptimized
                />
              ) : (
                <span className="text-sm font-black text-white uppercase">
                  {account?.account_name?.charAt(0) || 'P'}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      className={cn(
        'rounded-2xl overflow-hidden bg-white dark:bg-[#0f0f0f] border border-gray-200 dark:border-white/10 text-title-color dark:text-white w-full relative transition-all duration-500 ',
        platformStyle?.border,
        platformStyle?.bg,
        platformStyle?.glow,
      )}
    >
      {/* Video display area */}
      <div className="relative">
        <MediaRenderer mediaList={mediaList} media={media} aspect="aspect-video" />
        {selectedMusic && <MusicSticker musicName={selectedMusic.name} />}
      </div>

      {/* Video details */}
      <div className="p-4 space-y-3">
        {/* Title */}
        <h3 className="text-sm font-bold leading-snug line-clamp-2">
          {caption?.trim() ? caption.split('\n')[0] : 'YouTube Video Title'}
        </h3>

        <p className="text-[10px] text-subtitle-color">
          1.2K views • 2 hours ago
        </p>

        {/* Channel Info */}
        <div className="flex items-center justify-between py-1 border-y border-gray-100 dark:border-white/5">
          <div className="flex items-center gap-2.5">
            <Avatar className="w-8 h-8 border border-red-500/20">
              <AvatarImage src={account?.profile_picture} />
              <AvatarFallback className="bg-red-50 dark:bg-red-900/20 text-red-500 flex items-center justify-center font-bold">
                YT
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-[12px] font-bold">{account?.account_name || 'YouTube Channel'}</p>
              <p className="text-[9px] text-subtitle-color">10.5K subscribers</p>
            </div>
          </div>
          <button className="px-4 py-1.5 bg-black dark:bg-white text-white dark:text-black rounded-full text-xs font-bold hover:opacity-90 transition-opacity">
            Subscribe
          </button>
        </div>

        {/* Description/Caption details */}
        {caption?.trim() && caption.split('\n').length > 1 && (
          <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-white/5 text-[11px] text-subtitle-color leading-relaxed max-h-[100px] overflow-y-auto custom-scrollbar">
            {renderCaptionWithHashtags(caption, 'youtube')}
          </div>
        )}

        {/* Action buttons */}
        <div className="flex items-center gap-2 pt-1">
          <div className="flex items-center bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
            <button className="flex items-center gap-1.5 px-3 py-1.5 hover:bg-gray-200 dark:hover:bg-white/10 text-subtitle-color text-xs font-medium border-r border-gray-200 dark:border-white/5 transition-colors">
              <ThumbsUp className="w-3.5 h-3.5" />
              <span>156</span>
            </button>
            <button className="px-3 py-1.5 hover:bg-gray-200 dark:hover:bg-white/10 text-subtitle-color transition-colors">
              <ThumbsUp className="w-3.5 h-3.5 rotate-180" />
            </button>
          </div>
          <button className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-subtitle-color text-xs font-medium rounded-full transition-colors">
            <Share className="w-3.5 h-3.5" />
            <span>Share</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export function NetworkPreview({
  account,
  caption,
  media,
  mediaList,
  storyText,
  storyTextColor,
  storyTextBg,
  storyTextSize,
  storyTextPosition,
  storyBgColor,
  selectedMusic,
  activeTab,
  platformStyle,
  contentType,
}: NetworkPreviewProps) {
  const platform = account?.platform?.toLowerCase()

  if (platform === 'threads') {
    return (
      <ThreadsPreview
        account={account}
        caption={caption}
        media={media}
        mediaList={mediaList}
        selectedMusic={selectedMusic}
        platformStyle={platformStyle}
      />
    )
  }
  if (platform === 'linkedin') {
    return (
      <LinkedInPreview
        account={account}
        caption={caption}
        media={media}
        mediaList={mediaList}
        selectedMusic={selectedMusic}
        platformStyle={platformStyle}
      />
    )
  }
  if (platform === 'youtube') {
    return (
      <YouTubePreview
        account={account}
        caption={caption}
        media={media}
        mediaList={mediaList}
        selectedMusic={selectedMusic}
        platformStyle={platformStyle}
        contentType={contentType}
      />
    )
  }

  if (activeTab === 'story') {
    return (
      <StoryPreview
        account={account}
        mediaList={mediaList}
        storyText={storyText}
        storyTextColor={storyTextColor}
        storyTextBg={storyTextBg}
        storyTextSize={storyTextSize}
        storyTextPosition={storyTextPosition}
        storyBgColor={storyBgColor}
        selectedMusic={selectedMusic}
        platformStyle={platformStyle}
      />
    )
  }

  if (activeTab === 'reel') {
    return (
      <ReelPreview
        account={account}
        caption={caption}
        mediaList={mediaList}
        selectedMusic={selectedMusic}
        platformStyle={platformStyle}
      />
    )
  }

  if (platform === 'instagram')
    return (
      <InstagramPreview
        account={account}
        caption={caption}
        media={media}
        mediaList={mediaList}
        selectedMusic={selectedMusic}
        platformStyle={platformStyle}
      />
    )
  if (platform === 'twitter')
    return (
      <TwitterPreview
        account={account}
        caption={caption}
        media={media}
        mediaList={mediaList}
        selectedMusic={selectedMusic}
        platformStyle={platformStyle}
      />
    )
  if (platform === 'facebook')
    return (
      <FacebookPreview
        account={account}
        caption={caption}
        media={media}
        mediaList={mediaList}
        selectedMusic={selectedMusic}
        platformStyle={platformStyle}
      />
    )
  return (
    <InstagramPreview
      account={account}
      caption={caption}
      media={media}
      mediaList={mediaList}
      selectedMusic={selectedMusic}
      platformStyle={platformStyle}
    />
  )
}
