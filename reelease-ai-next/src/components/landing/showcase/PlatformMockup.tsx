'use client'

import { Button } from '@/components/ui/button'
import { Feature } from '@/types/landing'
import { getResolvedImageUrl } from '@/utils/image'
import { motion } from 'framer-motion'
import {
  Bookmark,
  Facebook,
  Heart,
  Image as ImageIcon,
  Instagram,
  Linkedin,
  MessageCircle,
  MessageSquare,
  MoreHorizontal,
  Music2,
  Play,
  Send,
  Share2,
  Sparkles,
  ThumbsDown,
  ThumbsUp,
  Youtube,
} from 'lucide-react'
import Image from 'next/image'
import { XIcon as Twitter } from '@/components/ui/XIcon'
import { ThreadsIcon } from '@/components/ui/threadsIcon'
import { Autoplay, Pagination } from 'swiper/modules'
import { Swiper, SwiperSlide } from 'swiper/react'

export function PlatformMockup({
  activeTab,
  currentContent,
}: any) {
  return (
    <div className="flex-1 relative w-full flex justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 40 }}
        whileInView={{ opacity: 1, scale: 1, y: 0 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-[340px]"
      >
        {/* Phone Frame */}
        <div className="relative p-3 rounded-[3rem] bg-[#1A1D27] border-[6px] border-[#2A2E3D] shadow-2xl aspect-[9/16] overflow-hidden">
          {/* Notch */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-[#2A2E3D] rounded-b-2xl z-50 flex items-center justify-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-black/40" />
            <div className="w-10 h-1 bg-black/40 rounded-full" />
          </div>

          <div className="h-full w-full rounded-[2.2rem] bg-black overflow-hidden relative">
            <Swiper
              direction="vertical"
              autoplay={{ delay: 3000, disableOnInteraction: false }}
              modules={[Autoplay, Pagination]}
              className="h-full w-full"
              pagination={{ clickable: true, dynamicBullets: true }}
            >
              {activeTab === 'instagram' && (
                <>
                  <SwiperSlide>
                    <InstagramStory feature={currentContent?.features?.[0]} />
                  </SwiperSlide>
                  <SwiperSlide>
                    <InstagramReel feature={currentContent?.features?.[1]} />
                  </SwiperSlide>
                  <SwiperSlide>
                    <InstagramPost feature={currentContent?.features?.[2]} />
                  </SwiperSlide>
                </>
              )}
              {activeTab === 'facebook' && (
                <>
                  <SwiperSlide>
                    <FacebookStory feature={currentContent?.features?.[0]} />
                  </SwiperSlide>
                  <SwiperSlide>
                    <FacebookReel feature={currentContent?.features?.[1]} />
                  </SwiperSlide>
                  <SwiperSlide>
                    <FacebookPost feature={currentContent?.features?.[2]} />
                  </SwiperSlide>
                </>
              )}
              {activeTab === 'linkedin' && (
                <>
                  <SwiperSlide>
                    <LinkedInPost feature={currentContent?.features?.[0]} />
                  </SwiperSlide>
                  <SwiperSlide>
                    <LinkedInArticle feature={currentContent?.features?.[1]} />
                  </SwiperSlide>
                  <SwiperSlide>
                    <LinkedInProfile feature={currentContent?.features?.[2]} />
                  </SwiperSlide>
                </>
              )}
              {activeTab === 'twitter' && (
                <>
                  <SwiperSlide>
                    <TwitterPost feature={currentContent?.features?.[0]} />
                  </SwiperSlide>
                  <SwiperSlide>
                    <TwitterThread feature={currentContent?.features?.[1]} />
                  </SwiperSlide>
                  <SwiperSlide>
                    <TwitterProfile feature={currentContent?.features?.[2]} />
                  </SwiperSlide>
                </>
              )}
              {activeTab === 'youtube' && (
                <>
                  <SwiperSlide>
                    <YouTubeShorts feature={currentContent?.features?.[0]} />
                  </SwiperSlide>
                  <SwiperSlide>
                    <YouTubeVideo feature={currentContent?.features?.[1]} />
                  </SwiperSlide>
                  <SwiperSlide>
                    <YouTubeChannel feature={currentContent?.features?.[2]} />
                  </SwiperSlide>
                </>
              )}
              {activeTab === 'threads' && (
                <>
                  <SwiperSlide>
                    <ThreadsPost feature={currentContent?.features?.[0]} />
                  </SwiperSlide>
                  <SwiperSlide>
                    <ThreadsThread feature={currentContent?.features?.[1]} />
                  </SwiperSlide>
                  <SwiperSlide>
                    <ThreadsProfile feature={currentContent?.features?.[2]} />
                  </SwiperSlide>
                </>
              )}
            </Swiper>
          </div>
        </div>

        {/* Floating Icons */}
        <FloatingIcons activeTab={activeTab} />
      </motion.div>

      {/* Background Glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-secondary/10 rounded-full blur-[120px] -z-10" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-primary/5 rounded-full blur-[100px] -z-10 animate-pulse" />
    </div>
  )
}

function InstagramStory({ feature }: any) {
  const bgImg = getResolvedImageUrl(feature?.image_id?.file_path || feature?.image_id, '/images/landing/story.png')
  return (
    <div
      className="h-full w-full bg-gradient-to-b from-[#833ab4] via-[#fd1d1d] to-[#fcb045] bg-cover bg-center relative p-6 flex flex-col"
      style={{ backgroundImage: `url(${bgImg})` }}
    >
      <div className="flex gap-1 mb-4 mt-6">
        <div className="h-1 flex-1 bg-white/40 rounded-full overflow-hidden">
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: '0%' }}
            transition={{ duration: 3, ease: 'linear' }}
            className="h-full bg-white"
          />
        </div>
        <div className="h-1 flex-1 bg-white/20 rounded-full" />
      </div>
      <div className="flex items-center gap-3 mb-10">
        <div className="w-8 h-8 rounded-full border-2 border-white p-0.5">
          <div className="w-full h-full rounded-full bg-white/20" />
        </div>
        <div className="h-2 w-20 bg-white/40 rounded-full" />
      </div>
      <div className="mt-auto flex items-center gap-4">
        <div className="flex-1 h-10 rounded-full border border-white/40 bg-white/10 backdrop-blur-md px-4 flex items-center">
          <span className="text-[10px] text-white/60 font-medium">Send message</span>
        </div>
        <Heart className="w-6 h-6 text-white" />
        <Send className="w-6 h-6 text-white" />
      </div>
    </div>
  )
}

function InstagramReel({ feature }: any) {
  const bgImg = getResolvedImageUrl(feature?.image_id?.file_path || feature?.image_id, '/images/landing/reels.png')
  return (
    <div className="h-full w-full bg-black relative">
      <div
        className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40 p-6 flex flex-col bg-cover bg-center"
        style={{ backgroundImage: `url(${bgImg})` }}
      >
        <div className="flex justify-between items-center mt-6">
          <span className="text-white font-bold text-lg">Reels</span>
          <ImageIcon className="w-6 h-6 text-white" />
        </div>
        <div className="mt-auto flex items-end justify-between">
          <div className="flex-1 pb-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-yellow-400 to-purple-600" />
              <span className="text-white text-xs font-bold">username</span>
              <Button className="px-2 py-0.5 border border-white rounded-md text-[10px] text-white font-bold">
                Follow
              </Button>
            </div>
            <div className="h-2 w-48 bg-white/20 rounded-full mb-2" />
            <div className="flex items-center gap-2">
              <Music2 className="w-3 h-3 text-white" />
              <div className="h-1.5 w-24 bg-white/20 rounded-full" />
            </div>
          </div>
          <div className="flex flex-col items-center gap-6 pb-4">
            <div className="flex flex-col items-center gap-1">
              <Heart className="w-7 h-7 text-white" />
              <span className="text-[10px] text-white font-medium">124K</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <MessageCircle className="w-7 h-7 text-white" />
              <span className="text-[10px] text-white font-medium">1.2K</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <Send className="w-7 h-7 text-white" />
            </div>
            <MoreHorizontal className="w-7 h-7 text-white" />
            <div className="w-7 h-7 rounded-md border-2 border-white overflow-hidden">
              <div className="w-full h-full bg-white/20" />
            </div>
          </div>
        </div>
      </div>
      <div className="h-full w-full flex items-center justify-center">
        <div className="w-20 h-20 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center">
          <Play className="w-10 h-10 text-white" fill="white" />
        </div>
      </div>
    </div>
  )
}

function InstagramPost({ feature }: any) {
  const imgUrl = getResolvedImageUrl(feature?.image_id?.file_path || feature?.image_id, '/images/landing/post.png')
  return (
    <div className="h-full w-full flex flex-col bg-black">
      <div className="px-4 py-4 border-b border-white/5 flex items-center justify-between mt-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600 p-[1.5px]">
            <div className="w-full h-full rounded-full bg-black border border-black overflow-hidden">
              <div className="w-full h-full bg-secondary/20 flex items-center justify-center">
                <Instagram className="w-4 h-4 text-secondary" />
              </div>
            </div>
          </div>
          <div className="h-2 w-20 bg-white/20 rounded-full" />
        </div>
        <MoreHorizontal className="w-4 h-4 text-white/40" />
      </div>
      <div className="flex-1 overflow-y-auto no-scrollbar">
        <div className="aspect-square bg-gradient-to-br from-[#2D3436] to-[#000000] relative flex items-center justify-center overflow-hidden">
          <Sparkles className="absolute top-4 right-4 w-6 h-6 text-secondary/40 animate-pulse" />
          <div className="text-center p-6">
            <div className="w-16 h-16 rounded-3xl bg-secondary/20 flex items-center justify-center mx-auto mb-4 border border-secondary/30">
              <ImageIcon className="w-8 h-8 text-secondary" />
            </div>
            <div className="h-2 w-32 bg-white/10 rounded-full mx-auto mb-2" />
            <div className="h-2 w-24 bg-white/10 rounded-full mx-auto" />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent">
            <Image
              src={imgUrl}
              alt={'POST'}
              fill
              unoptimized
              className="object-cover transform group-hover:scale-105 transition-transform duration-1000"
            />
          </div>
        </div>
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <Heart className="w-6 h-6 text-white" />
              <MessageCircle className="w-6 h-6 text-white" />
              <Send className="w-6 h-6 text-white" />
            </div>
            <Bookmark className="w-6 h-6 text-white" />
          </div>
          <div className="h-2 w-24 bg-white/20 rounded-full mb-3" />
          <div className="space-y-2">
            <div className="h-2 w-full bg-white/10 rounded-full" />
            <div className="h-2 w-3/4 bg-white/10 rounded-full" />
          </div>
        </div>
      </div>
      <div className="p-4 border-t border-white/5 flex justify-between items-center bg-black/80 backdrop-blur-md mt-auto">
        <ImageIcon className="w-6 h-6 text-white" />
        <ImageIcon className="w-6 h-6 text-white/40" />
        <div className="w-6 h-6 rounded-md border-2 border-white/40" />
        <ImageIcon className="w-6 h-6 text-white/40" />
        <div className="w-6 h-6 rounded-full bg-white/20" />
      </div>
    </div>
  )
}

function FacebookStory({ feature }: any) {
  const bgImg = getResolvedImageUrl(feature?.image_id?.file_path || feature?.image_id, '/images/landing/f-story.png')
  return (
    <div
      className="h-full w-full bg-cover bg-center relative p-6 flex flex-col"
      style={{ backgroundImage: `url(${bgImg})` }}
    >
      <div className="flex gap-1 mb-4 mt-6">
        <div className="h-1 flex-1 bg-white/40 rounded-full overflow-hidden">
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: '0%' }}
            transition={{ duration: 3, ease: 'linear' }}
            className="h-full bg-white"
          />
        </div>
      </div>
      <div className="flex items-center gap-3 mb-10">
        <div className="w-10 h-10 rounded-full border-2 border-white overflow-hidden bg-white/20">
          <Facebook className="w-full h-full text-white" fill="white" />
        </div>
        <div>
          <div className="h-2 w-24 bg-white/40 rounded-full mb-1" />
          <div className="h-1.5 w-12 bg-white/20 rounded-full" />
        </div>
      </div>
      <div className="mt-auto flex items-center gap-4">
        <div className="flex-1 h-12 rounded-full border border-white/40 bg-white/10 backdrop-blur-md px-4 flex items-center">
          <span className="text-[10px] text-white/80 font-medium italic">Write a comment...</span>
        </div>
        <div className="flex gap-3">
          <ThumbsUp className="w-6 h-6 text-white" fill="white" />
          <Heart className="w-6 h-6 text-white" fill="white" />
          <Share2 className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  )
}

function FacebookReel({ feature }: any) {
  const bgImg = getResolvedImageUrl(feature?.image_id?.file_path || feature?.image_id, '/images/landing/f-reels.png')
  return (
    <div className="h-full w-full bg-cover bg-center relative" style={{ backgroundImage: `url(${bgImg})` }}>
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent p-6 flex flex-col">
        <div className="flex items-center gap-2 mt-6">
          <Facebook className="w-8 h-8 text-facebook" fill="#1877F2" />
          <span className="text-white font-bold">Reels</span>
        </div>
        <div className="mt-auto flex justify-between items-end pb-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-facebook flex items-center justify-center shadow-lg">
                <Facebook className="w-6 h-6 text-white" fill="white" />
              </div>
              <span className="text-white font-bold shadow-sm">Page Name</span>
            </div>
            <div className="h-3 w-56 bg-white/20 rounded-full mb-3" />
            <div className="flex items-center gap-2">
              <div className="h-4 w-20 bg-facebook/40 rounded-full flex items-center px-2 gap-1">
                <Music2 className="w-2.5 h-2.5 text-facebook" />
                <div className="h-1 w-10 bg-facebook/40 rounded-full" />
              </div>
            </div>
          </div>
          <div className="flex flex-col items-center gap-7">
            <div className="flex flex-col items-center gap-1">
              <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center">
                <ThumbsUp className="w-6 h-6 text-white" fill="white" />
              </div>
              <span className="text-[10px] text-white font-bold">45K</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-white" />
              </div>
              <span className="text-[10px] text-white font-bold">2K</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center">
                <Share2 className="w-6 h-6 text-white" />
              </div>
            </div>
            <MoreHorizontal className="w-6 h-6 text-white" />
          </div>
        </div>
      </div>
      <div className="h-full w-full flex items-center justify-center">
        <Play className="w-16 h-16 text-facebook/60 animate-pulse" fill="#1877F2" />
      </div>
    </div>
  )
}

function FacebookPost({ feature }: any) {
  const bgImg = getResolvedImageUrl(feature?.image_id?.file_path || feature?.image_id, '/images/landing/f-post.png')
  return (
    <div className="h-full w-full flex flex-col bg-[#18191A]">
      <div className="px-4 py-4 border-b border-white/5 flex items-center justify-between mt-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-facebook flex items-center justify-center">
            <Facebook className="w-6 h-6 text-white" fill="white" />
          </div>
          <div>
            <div className="h-2.5 w-24 bg-white/20 rounded-full mb-1.5" />
            <div className="h-2 w-16 bg-white/10 rounded-full" />
          </div>
        </div>
        <MoreHorizontal className="w-5 h-5 text-white/40" />
      </div>
      <div className="flex-1 overflow-y-auto no-scrollbar">
        <div className="p-4">
          <div className="h-2 w-full bg-white/10 rounded-full mb-2" />
          <div className="h-2 w-5/6 bg-white/10 rounded-full mb-4" />
        </div>
        <div
          className="h-64 bg-cover bg-center relative flex items-center justify-center border-y border-white/5"
          style={{ backgroundImage: `url(${bgImg})` }}
        >
          <div className="h-3 w-40 bg-white/10 rounded-full mx-auto" />
        </div>
        <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center -space-x-1">
            <div className="w-5 h-5 rounded-full bg-facebook flex items-center justify-center ring-2 ring-[#18191A]">
              <ThumbsUp className="w-3 h-3 text-white" fill="white" />
            </div>
            <div className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center ring-2 ring-[#18191A]">
              <Heart className="w-3 h-3 text-white" fill="white" />
            </div>
          </div>
          <div className="h-2 w-16 bg-white/10 rounded-full" />
        </div>
        <div className="px-2 py-1 flex justify-around">
          <Button variant="ghost" className="flex items-center gap-2 px-3 py-2 text-white/40">
            <ThumbsUp className="w-5 h-5" />
            <span className="text-xs font-semibold">Like</span>
          </Button>
          <Button variant="ghost" className="flex items-center gap-2 px-3 py-2 text-white/40">
            <MessageSquare className="w-5 h-5" />
            <span className="text-xs font-semibold">Comment</span>
          </Button>
          <Button variant="ghost" className="flex items-center gap-2 px-3 py-2 text-white/40">
            <Share2 className="w-5 h-5" />
            <span className="text-xs font-semibold">Share</span>
          </Button>
        </div>
      </div>
    </div>
  )
}

function FloatingIcons({ activeTab }: any) {
  return (
    <>
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -top-12 -right-8 w-20 h-20 rounded-border-radius-inner bg-gradient-to-br from-white/10 to-transparent border border-white/20 backdrop-blur-xl flex items-center justify-center shadow-2xl z-20"
      >
        {activeTab === 'instagram' && <Instagram className="w-10 h-10 text-[#E1306C]" />}
        {activeTab === 'facebook' && <Facebook className="w-10 h-10 text-[#1877F2]" />}
        {activeTab === 'linkedin' && <Linkedin className="w-10 h-10 text-[#0A66C2]" />}
        {activeTab === 'twitter' && <Twitter className="w-10 h-10 text-[#1DA1F2]" />}
        {activeTab === 'youtube' && <Youtube className="w-10 h-10 text-[#FF0000]" />}
        {activeTab === 'threads' && <ThreadsIcon className="w-10 h-10 text-white" />}
      </motion.div>

      <motion.div
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        className="absolute -bottom-8 -left-12 w-24 h-24 rounded-border-radius-inner bg-gradient-to-br from-white/10 to-transparent border border-white/20 backdrop-blur-xl flex items-center justify-center shadow-2xl z-20"
      >
        <Sparkles className="w-12 h-12 text-secondary" />
      </motion.div>
    </>
  )
}

function LinkedInPost({ feature }: any) {
  const imgUrl = getResolvedImageUrl(feature?.image_id?.file_path || feature?.image_id, '/images/landing/post.png')
  return (
    <div className="h-full w-full flex flex-col bg-[#1D2226] text-white">
      <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between mt-6">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-full bg-[#0A66C2] flex items-center justify-center">
            <Linkedin className="w-5 h-5 text-white" />
          </div>
          <div className="text-left">
            <div className="h-2 w-24 bg-white/20 rounded-full mb-1" />
            <div className="h-1.5 w-16 bg-white/10 rounded-full" />
          </div>
        </div>
        <MoreHorizontal className="w-5 h-5 text-white/40" />
      </div>
      <div className="flex-1 overflow-y-auto no-scrollbar p-4 text-left">
        <div className="h-2 w-full bg-white/10 rounded-full mb-2" />
        <div className="h-2 w-4/5 bg-white/10 rounded-full mb-4" />
        <div className="relative aspect-square w-full rounded-lg bg-black/40 overflow-hidden mb-4 border border-white/5">
          <Image
            src={imgUrl}
            alt={'LinkedIn Post'}
            fill
            unoptimized
            className="object-cover"
          />
        </div>
        <div className="flex justify-between items-center text-[10px] text-white/40 pb-2 border-b border-white/5">
          <span>👍 42 Likes</span>
          <span>5 comments</span>
        </div>
        <div className="flex justify-between pt-2">
          <div className="flex items-center gap-1 text-white/60 text-[10px]">
            <ThumbsUp className="w-3.5 h-3.5" />
            <span>Like</span>
          </div>
          <div className="flex items-center gap-1 text-white/60 text-[10px]">
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Comment</span>
          </div>
          <div className="flex items-center gap-1 text-white/60 text-[10px]">
            <Share2 className="w-3.5 h-3.5" />
            <span>Share</span>
          </div>
        </div>
      </div>
    </div>
  )
}

function LinkedInArticle({ feature }: any) {
  const imgUrl = getResolvedImageUrl(feature?.image_id?.file_path || feature?.image_id, '/images/landing/post.png')
  return (
    <div className="h-full w-full flex flex-col bg-[#1D2226] text-white">
      <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between mt-6">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-full bg-[#0A66C2] flex items-center justify-center">
            <Linkedin className="w-5 h-5 text-white" />
          </div>
          <span className="text-xs font-bold">Article Preview</span>
        </div>
      </div>
      <div className="flex-1 p-4 flex flex-col justify-between text-left">
        <div>
          <div className="text-[10px] text-[#0A66C2] font-semibold mb-1">PUBLISHED ARTICLE</div>
          <h4 className="text-sm font-bold text-white mb-2 leading-tight">Creating the Next Wave of Intelligent Solutions</h4>
          <p className="text-xs text-white/60 line-clamp-3 mb-4">Discover how automation and generative systems are altering the baseline for development efficiency.</p>
        </div>
        <div className="relative h-32 w-full rounded-lg bg-black/40 overflow-hidden mb-4 border border-white/5">
          <Image
            src={imgUrl}
            alt={'LinkedIn Article'}
            fill
            unoptimized
            className="object-cover"
          />
        </div>
        <div className="text-[10px] text-white/40">Read time: 4 min read • Published by Author</div>
      </div>
    </div>
  )
}

function LinkedInProfile({ feature }: any) {
  return (
    <div className="h-full w-full flex flex-col bg-[#1D2226] text-white text-left">
      <div className="relative h-20 bg-gradient-to-r from-[#0A66C2] to-[#0077B5] mt-6">
        <div className="absolute -bottom-8 left-4 w-16 h-16 rounded-full border-4 border-[#1D2226] bg-[#2A2E3D] overflow-hidden">
          <div className="w-full h-full bg-[#0A66C2] flex items-center justify-center text-white font-bold">RA</div>
        </div>
      </div>
      <div className="mt-10 px-4 flex-1">
        <h4 className="text-base font-bold">Reelease AI</h4>
        <p className="text-xs text-white/80">Automating Next-Gen Content Creation and Deployment</p>
        <p className="text-[10px] text-white/40 mt-1">San Francisco, CA • 10,000+ followers</p>
        <div className="flex gap-2 mt-4">
          <Button className="flex-1 bg-[#0A66C2] hover:bg-[#0A66C2]/80 text-white text-xs h-8 rounded-full font-bold">Follow</Button>
          <Button variant="outline" className="flex-1 border-white/20 hover:bg-white/5 text-white text-xs h-8 rounded-full font-bold">Visit Website</Button>
        </div>
        <div className="mt-6 border-t border-white/5 pt-4">
          <div className="h-2 w-20 bg-white/20 rounded-full mb-2" />
          <div className="h-2 w-full bg-white/10 rounded-full mb-1" />
          <div className="h-2 w-5/6 bg-white/10 rounded-full" />
        </div>
      </div>
    </div>
  )
}

function TwitterPost({ feature }: any) {
  const imgUrl = getResolvedImageUrl(feature?.image_id?.file_path || feature?.image_id, '/images/landing/post.png')
  return (
    <div className="h-full w-full flex flex-col bg-[#15202B] text-white text-left p-4">
      <div className="flex items-center gap-3 mt-6">
        <div className="w-10 h-10 rounded-full bg-[#1DA1F2] flex items-center justify-center font-bold text-white">
          RA
        </div>
        <div>
          <div className="flex items-center gap-1">
            <span className="text-xs font-bold">Reelease AI</span>
            <span className="text-[10px] text-white/60">@reelease_ai</span>
          </div>
          <div className="h-1.5 w-16 bg-white/20 rounded-full mt-1" />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto no-scrollbar mt-3">
        <p className="text-xs text-white/90 mb-3 leading-relaxed">
          {feature?.description || "Supercharge your brand's presence with AI-generated content that actually converts. Build a loyal following today! 🚀"}
        </p>
        <div className="relative aspect-video w-full rounded-xl bg-black/40 overflow-hidden border border-white/10 mb-3">
          <Image
            src={imgUrl}
            alt="Tweet Image"
            fill
            unoptimized
            className="object-cover"
          />
        </div>
        <div className="flex justify-between items-center text-[10px] text-white/40 border-y border-white/10 py-2">
          <span>10:24 AM · Jun 12, 2026</span>
          <span>· <strong className="text-white">45.2K</strong> Views</span>
        </div>
        <div className="flex justify-between items-center text-white/60 text-[10px] pt-2 px-2">
          <span className="flex items-center gap-1">💬 12</span>
          <span className="flex items-center gap-1">🔁 45</span>
          <span className="flex items-center gap-1 text-red-500">❤️ 284</span>
          <span className="flex items-center gap-1">🔖 8</span>
        </div>
      </div>
    </div>
  )
}

function TwitterThread({ feature }: any) {
  return (
    <div className="h-full w-full flex flex-col bg-[#15202B] text-white text-left p-4">
      <div className="flex items-center gap-2 mt-6">
        <span className="text-xs font-bold text-[#1DA1F2]">Thread Builder</span>
      </div>
      <div className="flex-1 overflow-y-auto no-scrollbar mt-3 space-y-4">
        <div className="flex gap-3">
          <div className="flex flex-col items-center">
            <div className="w-8 h-8 rounded-full bg-[#1DA1F2] flex items-center justify-center font-bold text-[10px] text-white">
              RA
            </div>
            <div className="w-[2px] flex-1 bg-white/20 my-1" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-1">
              <span className="text-[11px] font-bold">Reelease AI</span>
              <span className="text-[9px] text-white/60">@reelease_ai · 1/3</span>
            </div>
            <p className="text-[11px] text-white/90 mt-1">
              {feature?.title || "How to scale your business with AI content automation in 2026? 🧵"}
            </p>
            <p className="text-[10px] text-white/70 mt-1">Here is a step-by-step breakdown of how to build a content engine that runs on autopilot...</p>
          </div>
        </div>

        <div className="flex gap-3">
          <div className="flex flex-col items-center">
            <div className="w-8 h-8 rounded-full bg-[#1DA1F2] flex items-center justify-center font-bold text-[10px] text-white">
              RA
            </div>
            <div className="w-[2px] flex-1 bg-white/20 my-1" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-1">
              <span className="text-[11px] font-bold">Reelease AI</span>
              <span className="text-[9px] text-white/60">@reelease_ai · 2/3</span>
            </div>
            <p className="text-[11px] text-white/90 mt-1">
              1. Standardize your templates. Instead of starting from scratch every single time, use AI models tailored to your brand's voice.
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <div className="flex flex-col items-center">
            <div className="w-8 h-8 rounded-full bg-[#1DA1F2] flex items-center justify-center font-bold text-[10px] text-white">
              RA
            </div>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-1">
              <span className="text-[11px] font-bold">Reelease AI</span>
              <span className="text-[9px] text-white/60">@reelease_ai · 3/3</span>
            </div>
            <p className="text-[11px] text-white/90 mt-1">
              2. Automate scheduling. Post consistently across LinkedIn, Twitter, and Instagram using our unified calendar. Click the link to start today! 👇
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

function TwitterProfile({ feature }: any) {
  return (
    <div className="h-full w-full bg-[#15202B] text-white flex flex-col text-left">
      <div className="relative h-20 bg-gradient-to-r from-[#1DA1F2] to-[#0D8ECF] mt-6">
        <div className="absolute -bottom-8 left-4 w-16 h-16 rounded-full border-4 border-[#15202B] bg-[#1DA1F2] overflow-hidden flex items-center justify-center font-bold text-white text-lg">
          RA
        </div>
      </div>
      <div className="mt-10 px-4 flex-1">
        <div className="flex justify-between items-start">
          <div>
            <h4 className="text-sm font-bold">Reelease AI</h4>
            <p className="text-[10px] text-white/60">@reelease_ai</p>
          </div>
          <Button className="bg-white hover:bg-white/90 text-black text-[10px] h-7 px-3 rounded-full font-bold">Follow</Button>
        </div>
        <p className="text-[11px] text-white/90 mt-3 leading-relaxed">
          AI-powered content scheduling and generation. Connect your social channels and grow automated presence.
        </p>
        <div className="flex gap-4 mt-3 text-[10px] text-white/60">
          <span>📍 San Francisco, CA</span>
          <span>🔗 reelease.ai</span>
        </div>
        <div className="flex gap-3 mt-3 text-[11px]">
          <span><strong className="text-white">142</strong> Following</span>
          <span><strong className="text-white">52.8K</strong> Followers</span>
        </div>
        <div className="mt-4 border-t border-white/10 pt-3 flex justify-between text-[10px] text-white/40 font-semibold">
          <span className="text-white border-b-2 border-[#1DA1F2] pb-2 px-1">Posts</span>
          <span className="pb-2 px-1">Replies</span>
          <span className="pb-2 px-1">Media</span>
          <span className="pb-2 px-1">Likes</span>
        </div>
        <div className="mt-3 flex gap-3">
          <div className="w-6 h-6 rounded-full bg-[#1DA1F2] flex items-center justify-center font-bold text-[8px]">RA</div>
          <div className="flex-1">
            <div className="h-1.5 w-16 bg-white/20 rounded-full mb-1" />
            <div className="h-1.5 w-full bg-white/10 rounded-full mb-1" />
            <div className="h-1.5 w-3/4 bg-white/10 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  )
}

function YouTubeShorts({ feature }: any) {
  const bgImg = getResolvedImageUrl(feature?.image_id?.file_path || feature?.image_id, '/images/landing/reels.png')
  return (
    <div className="h-full w-full bg-black relative">
      <div
        className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-black/30 p-6 flex flex-col bg-cover bg-center"
        style={{ backgroundImage: `url(${bgImg})` }}
      >
        <div className="flex items-center gap-2 mt-6 bg-transparent justify-start">
          <Youtube className="w-6 h-6 text-red-600 animate-pulse" />
          <span className="text-white font-bold text-sm">Shorts</span>
        </div>
        <div className="mt-auto flex items-end justify-between">
          <div className="flex-1 pb-4 text-left">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 rounded-full bg-red-600 flex items-center justify-center text-[10px] font-bold text-white">RA</div>
              <span className="text-white text-[11px] font-bold">@ReeleaseAI</span>
              <button className="bg-red-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-full">Subscribe</button>
            </div>
            <p className="text-white text-xs mb-2 line-clamp-2">Creating cinematic text-to-video with AI! 🎥🔥</p>
          </div>
          <div className="flex flex-col items-center gap-4 pb-4">
            <div className="flex flex-col items-center">
              <ThumbsUp className="w-5.5 h-5.5 text-white" />
              <span className="text-[9px] text-white font-medium mt-1">12K</span>
            </div>
            <div className="flex flex-col items-center">
              <ThumbsDown className="w-5.5 h-5.5 text-white" />
              <span className="text-[9px] text-white font-medium mt-1">Dislike</span>
            </div>
            <div className="flex flex-col items-center">
              <MessageSquare className="w-5.5 h-5.5 text-white" />
              <span className="text-[9px] text-white font-medium mt-1">320</span>
            </div>
            <div className="flex flex-col items-center">
              <Share2 className="w-5.5 h-5.5 text-white" />
              <span className="text-[9px] text-white font-medium mt-1">Share</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function YouTubeVideo({ feature }: any) {
  const imgUrl = getResolvedImageUrl(feature?.image_id?.file_path || feature?.image_id, '/images/landing/post.png')
  return (
    <div className="h-full w-full flex flex-col bg-[#0F0F0F] text-white text-left">
      <div className="relative w-full aspect-video bg-black mt-6 flex items-center justify-center overflow-hidden">
        <Image src={imgUrl} alt="YouTube Video" fill unoptimized className="object-cover" />
        <div className="absolute inset-x-0 bottom-0 h-1 bg-red-600" />
        <div className="absolute inset-0 flex items-center justify-center">
          <Play className="w-10 h-10 text-white bg-black/60 p-2 rounded-full" fill="white" />
        </div>
      </div>
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <h4 className="text-xs font-bold text-white leading-tight mb-2 line-clamp-2">Generate Viral Shorts & Video Outlines In Minutes</h4>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 rounded-full bg-red-600 flex items-center justify-center text-[10px] font-bold text-white">RA</div>
            <div>
              <span className="text-[10px] font-bold block">Reelease AI</span>
              <span className="text-[8px] text-white/60">50K subscribers</span>
            </div>
            <button className="ml-auto bg-white text-black text-[9px] font-bold px-2 py-1 rounded-full">Subscribe</button>
          </div>
        </div>
        <div className="bg-white/5 rounded-xl p-3 border border-white/5">
          <div className="text-[9px] text-white/80 font-semibold mb-1">Description Preview</div>
          <p className="text-[9px] text-white/60 line-clamp-2">In this tutorial, we will show you how to generate structured outlines and fully written scripts for YouTube videos...</p>
        </div>
      </div>
    </div>
  )
}

function YouTubeChannel({ feature }: any) {
  return (
    <div className="h-full w-full bg-[#0F0F0F] text-white flex flex-col text-left">
      <div className="h-16 bg-gradient-to-r from-red-600 to-red-800 relative mt-6 animate-pulse">
        <div className="absolute inset-0 flex items-center justify-center font-bold text-xs tracking-wider bg-black/10">REELEASE AI</div>
      </div>
      <div className="p-4 flex-1">
        <div className="flex gap-2 items-center mb-3">
          <div className="w-10 h-10 rounded-full bg-red-600 flex items-center justify-center text-xs font-bold text-white">RA</div>
          <div>
            <h4 className="text-xs font-bold">Reelease AI</h4>
            <span className="text-[8px] text-white/40">@ReeleaseAI • 50K subs • 120 videos</span>
          </div>
        </div>
        <button className="w-full bg-white text-black text-[10px] font-bold h-7 rounded-full mb-3">Subscribe</button>
        <div className="flex border-b border-white/10 pb-1.5 mb-3 text-[10px] font-medium">
          <span className="border-b-2 border-white pb-1.5 px-2">Home</span>
          <span className="text-white/40 pb-1.5 px-2">Videos</span>
          <span className="text-white/40 pb-1.5 px-2">Shorts</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="flex flex-col gap-1">
            <div className="aspect-video bg-neutral-900 rounded-md border border-white/5" />
            <span className="text-[9px] font-medium line-clamp-2">How to build a SaaS</span>
          </div>
          <div className="flex flex-col gap-1">
            <div className="aspect-video bg-neutral-900 rounded-md border border-white/5" />
            <span className="text-[9px] font-medium line-clamp-2">AI video generation</span>
          </div>
        </div>
      </div>
    </div>
  )
}

function ThreadsPost({ feature }: any) {
  const imgUrl = getResolvedImageUrl(feature?.image_id?.file_path || feature?.image_id, '/images/landing/post.png')
  return (
    <div className="h-full w-full flex flex-col bg-[#101010] text-[#F3F5F7] text-left p-4">
      <div className="flex items-center justify-between mt-6">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-[#2A2E3D] flex items-center justify-center border border-white/10 text-xs font-bold">
            RA
          </div>
          <div>
            <div className="flex items-center gap-1">
              <span className="text-xs font-bold hover:underline cursor-pointer">reelease_ai</span>
              <span className="text-[10px] text-neutral-500">2h</span>
            </div>
            <div className="h-1.5 w-12 bg-white/10 rounded-full mt-1" />
          </div>
        </div>
        <MoreHorizontal className="w-5 h-5 text-neutral-500 hover:text-white cursor-pointer" />
      </div>
      <div className="flex-1 overflow-y-auto no-scrollbar mt-3">
        <p className="text-xs text-[#F3F5F7]/90 mb-3 leading-relaxed">
          {feature?.description || "Simplify your social media workflow. With Reelease AI, draft, schedule, and preview posts across all major platforms from a single intuitive dashboard. 🚀"}
        </p>
        <div className="relative aspect-video w-full rounded-xl bg-black/40 overflow-hidden border border-white/10 mb-3">
          <Image
            src={imgUrl}
            alt="Threads Image"
            fill
            unoptimized
            className="object-cover"
          />
        </div>
        <div className="flex items-center gap-4 text-neutral-400 py-2">
          <Heart className="w-5 h-5 hover:text-red-500 cursor-pointer transition-colors" />
          <MessageCircle className="w-5 h-5 hover:text-white cursor-pointer transition-colors" />
          <svg className="w-5 h-5 hover:text-white cursor-pointer transition-colors" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7.5L22 10m0 0l-3 2.5M22 10H8.5c-2.5 0-4.5 2-4.5 4.5V19m0-11.5L1 10m0 0l3 2.5M1 10h13.5c2.5 0 4.5 2 4.5 4.5V19" />
          </svg>
          <Send className="w-5 h-5 hover:text-white cursor-pointer transition-colors" />
        </div>
        <div className="flex items-center gap-2 text-[10px] text-neutral-500 mt-1">
          <span>142 replies</span>
          <span>•</span>
          <span>1,248 likes</span>
        </div>
      </div>
    </div>
  )
}

function ThreadsThread({ feature }: any) {
  return (
    <div className="h-full w-full flex flex-col bg-[#101010] text-[#F3F5F7] text-left p-4">
      <div className="flex items-center gap-2 mt-6">
        <span className="text-xs font-bold text-neutral-400">Thread Preview</span>
      </div>
      <div className="flex-1 overflow-y-auto no-scrollbar mt-3 space-y-4">
        {/* Post 1 */}
        <div className="flex gap-3">
          <div className="flex flex-col items-center">
            <div className="w-8 h-8 rounded-full bg-[#2A2E3D] flex items-center justify-center text-[10px] font-bold border border-white/10">
              RA
            </div>
            <div className="w-[1.5px] flex-1 bg-neutral-800 my-1" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-1">
              <span className="text-[11px] font-bold">reelease_ai</span>
              <span className="text-[9px] text-neutral-500">1/3</span>
            </div>
            <p className="text-[11px] text-neutral-200 mt-1 leading-relaxed">
              {feature?.title || "Say goodbye to manual posting. Automate your Threads content pipeline using templates tailored to your target audience. 🧵"}
            </p>
          </div>
        </div>

        {/* Post 2 */}
        <div className="flex gap-3">
          <div className="flex flex-col items-center">
            <div className="w-8 h-8 rounded-full bg-[#2A2E3D] flex items-center justify-center text-[10px] font-bold border border-white/10">
              RA
            </div>
            <div className="w-[1.5px] flex-1 bg-neutral-800 my-1" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-1">
              <span className="text-[11px] font-bold">reelease_ai</span>
              <span className="text-[9px] text-neutral-500">2/3</span>
            </div>
            <p className="text-[11px] text-neutral-200 mt-1 leading-relaxed">
              Our AI analyzes trending topics and keywords, dynamically generating engaging text drafts and eye-catching carousel ideas.
            </p>
          </div>
        </div>

        {/* Post 3 */}
        <div className="flex gap-3">
          <div className="flex flex-col items-center">
            <div className="w-8 h-8 rounded-full bg-[#2A2E3D] flex items-center justify-center text-[10px] font-bold border border-white/10">
              RA
            </div>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-1">
              <span className="text-[11px] font-bold">reelease_ai</span>
              <span className="text-[9px] text-neutral-500">3/3</span>
            </div>
            <p className="text-[11px] text-neutral-200 mt-1 leading-relaxed">
              Unlock organic growth on Meta's fastest growing network today. Try it out now! 👇
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

function ThreadsProfile({ feature }: any) {
  return (
    <div className="h-full w-full bg-[#101010] text-[#F3F5F7] flex flex-col text-left p-4">
      <div className="mt-6 flex justify-between items-start">
        <div>
          <h4 className="text-lg font-extrabold text-white">Reelease AI</h4>
          <div className="flex items-center gap-1.5 mt-1">
            <span className="text-xs text-neutral-300">reelease_ai</span>
            <span className="text-[9px] bg-neutral-800 text-neutral-400 px-1.5 py-0.5 rounded-full font-medium">threads.com</span>
          </div>
        </div>
        <div className="w-14 h-14 rounded-full bg-[#2A2E3D] flex items-center justify-center text-lg font-bold border border-white/10">
          RA
        </div>
      </div>
      <div className="mt-4 flex-1">
        <p className="text-xs text-neutral-200 leading-relaxed">
          AI-powered content scheduling and generation. Connect your social channels and grow automated presence.
        </p>
        <div className="flex items-center gap-2 mt-4 text-[11px] text-neutral-500">
          <div className="flex -space-x-1">
            <div className="w-4 h-4 rounded-full bg-blue-500 ring-2 ring-[#101010]" />
            <div className="w-4 h-4 rounded-full bg-purple-500 ring-2 ring-[#101010]" />
          </div>
          <span>52.8K followers</span>
          <span>•</span>
          <span className="hover:underline cursor-pointer">reelease.ai</span>
        </div>
        <div className="flex gap-2.5 mt-5">
          <Button className="flex-1 bg-white hover:bg-neutral-200 text-black text-xs h-9 rounded-xl font-bold transition-all">Follow</Button>
          <Button variant="outline" className="flex-1 border-neutral-800 hover:bg-white/5 text-white text-xs h-9 rounded-xl font-bold transition-all">Mention</Button>
        </div>
        <div className="mt-6 border-b border-neutral-900 flex justify-around text-xs text-neutral-400 font-semibold">
          <span className="text-white border-b-2 border-white pb-3 px-4">Threads</span>
          <span className="pb-3 px-4">Replies</span>
          <span className="pb-3 px-4">Reposts</span>
        </div>
      </div>
    </div>
  )
}
