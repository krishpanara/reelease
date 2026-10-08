'use client'

import { Button } from '@/components/ui/button'
import { socialMediaPlatformIcons } from '@/data/socialMedia'
import { SocialPostReviewModalProps } from '@/types/socialMedia'
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { formatDate, getMediaUrl } from '@/utils'
import { AlertTriangle, Clock, ExternalLink, Instagram, Share2, X, ShieldCheck, User } from 'lucide-react'
import { NetworkPreview } from '../publish/NetworkPreview'

export function SocialPostReviewModal({ post, t, onClose, getPostLink }: SocialPostReviewModalProps) {

  if (!post) return null

  const postUrl = getPostLink(post)
  const isStory = post.content_type === 'story'
  const profileUrl = post.platform === 'instagram'
    ? `https://instagram.com/${post.account?.account_username || post.account?.account_name}`
    : post.platform === 'facebook'
      ? `https://facebook.com/${post.account?.account_username || post.account?.account_name}`
      : post.platform === 'linkedin'
        ? `https://linkedin.com`
        : post.platform === 'youtube'
          ? `https://www.youtube.com/watch?v=${post.post_id}`
          : post.platform === 'threads'
            ? `https://www.threads.com/@${post.account?.account_username || post.account?.account_name}/post/${post.post_id}/`
            : `https://twitter.com/${post.account?.account_username || post.account?.account_name}`

  const targetUrl = isStory ? profileUrl : postUrl

  return (
    <Dialog open={!!post} onOpenChange={(open) => { if (!open) onClose() }}>
      <DialogContent className="lg:max-w-4xl max-w-[95vw]  border border-glass-border rounded-3xl overflow-hidden shadow-2xl flex flex-col [&>button]:hidden bg-white dark:bg-light-body duration-300">
        {/* Header */}
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between  border-b border-glass-border pb-4 gap-4 shrink-0 relative">

          <Button
            variant="outline"
            size="icon"
            onClick={onClose}
            className="sm:hidden absolute top-4 right-4 border-none! bg-white dark:bg-light-body hover:bg-black/5 dark:hover:bg-white/5 h-8 w-8 rounded-full flex items-center justify-center z-10"
          >
            <X className="w-4 h-4" />
          </Button>

          <div className="flex items-center gap-3 sm:gap-5 w-full sm:w-auto flex-1 min-w-0 pr-8 sm:pr-0">
            {/* Platform Icon Box */}
            <div className="w-12 h-12 rounded-full border border-glass-border shadow-sm flex items-center justify-center bg-white dark:bg-white/5 shrink-0 [&>svg]:w-6 [&>svg]:h-6 ">
              {socialMediaPlatformIcons[post.platform] || <Instagram className="text-pink-500" />}
            </div>

            {/* Text Details */}
            <div className="space-y-1 sm:space-y-1.5 min-w-0 flex-1">
              <div className="inline-flex items-center gap-1 sm:gap-1.5 px-2 py-0.5 sm:px-2.5 rounded-full bg-primary/10 border border-primary/20 text-primary w-fit">
                <ShieldCheck className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                <span className="text-[8px] sm:text-[10px] font-bold uppercase tracking-wider">
                  {t('preview_post', { defaultValue: 'Social Post Review' })}
                </span>
              </div>
              <DialogTitle asChild>
                <h3 className="text-base sm:text-lg leading-tight font-bold! capitalize! text-foreground truncate">
                  {post.platform} Post Overview
                </h3>
              </DialogTitle>
              <DialogDescription asChild>
                <div className="flex items-center gap-1.5 sm:gap-2 text-xs font-medium truncate pt-0.5">
      
                  <span className="truncate text-subtitle-color">
                    {post.account?.account_name} &bull; <span className="text-primary">@{post.account?.account_username || post.account?.account_name}</span>
                  </span>
                </div>
              </DialogDescription>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto mt-2 sm:mt-0">
            {/* View Post Button */}
            {post.status === 'published' && targetUrl ? (
              <a
                href={targetUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto"
              >
                <Button className="w-full sm:w-auto rounded-xl primary-btn text-white! font-bold h-10 p-0 sm:px-4 hover:scale-105 transition-all flex items-center justify-center gap-2 text-sm">
                  <ExternalLink className="w-4 h-4 shrink-0" />
                  <span>
                    {isStory
                      ? t('view_story_button', { defaultValue: 'View Story' })
                      : t('view_post_button', { defaultValue: 'View Post' })}
                  </span>
                </Button>
              </a>
            ) : (
              <Button
                disabled
                className="w-full sm:w-auto rounded-xl primary-btn text-white! border border-white/10 h-10 p-0 sm:px-4 flex items-center justify-center gap-2 text-sm"
              >
                <ExternalLink className="w-4 h-4 shrink-0" />
                <span>
                  {post.status === 'scheduled'
                    ? t('scheduled_post_btn', { defaultValue: 'Scheduled' })
                    : t('unavailable', { defaultValue: 'Unavailable' })}
                </span>
              </Button>
            )}

            <Button
              variant="outline"
              size="icon"
              onClick={onClose}
              className="hidden sm:flex border-none! bg-transparent hover:bg-black/5 dark:hover:bg-white/5 h-10 w-10 rounded-full items-center justify-center"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Modal Body Container */}
        <div className="flex-1 overflow-y-auto sm:p-6 p-4 no-scrollbar">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
            {/* Left side: Premium Authentic Network Preview with Swiper support */}
            <div className="lg:col-span-7">
              <NetworkPreview
                account={post.account}
                caption={post.caption}
                mediaList={post.media_urls?.map((url: string) => ({
                  file_path: url,
                  mime_type: url.toLowerCase().endsWith('.mp4') ? 'video/mp4' : 'image/jpeg',
                }))}
                activeTab={isStory ? 'story' : 'feed'}
                storyText={post.storyText || ''}
                storyTextColor={post.storyTextColor || '#ffffff'}
                storyTextBg={post.storyTextBg || 'rgba(0,0,0,0.6)'}
                storyTextSize={post.storyTextSize || 'md'}
                storyTextPosition={post.storyTextPosition || 'center'}
                selectedMusic={post.selectedMusic ? { name: post.selectedMusic, url: '' } : null}
                contentType={post.content_type}
              />
            </div>

            {/* Right side: Detailed Metadata card info */}
            <div className="lg:col-span-5 space-y-4 sm:space-y-6">
              {/* Status Banner */}
              <div
                className={`p-4 rounded-2xl border flex items-start gap-3 ${post.status === 'published'
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                  : post.status === 'failed'
                    ? 'bg-red-500/10 border-red-500/20 text-red-400'
                    : post.status === 'scheduled'
                      ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400'
                      : 'bg-black/3 dark:bg-white/5 border-glass-border text-muted-foreground'
                  }`}
              >
                {post.status === 'failed' ? (
                  <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                ) : post.status === 'scheduled' ? (
                  <Clock className="w-5 h-5 shrink-0 mt-0.5 animate-pulse" />
                ) : (
                  <Share2 className="w-5 h-5 shrink-0 mt-0.5" />
                )}
                <div className="space-y-1 min-w-0">
                  <h4 className="text-xs font-bold uppercase tracking-wider">
                    {t('publishing_status', { defaultValue: 'Publishing Status' })}
                  </h4>
                  <p className="text-sm font-semibold capitalize">{t(post.status || 'pending')}</p>
                  {post.error_message && (
                    <p className="text-xs mt-1 opacity-90 break-words leading-relaxed">
                      {post.error_message}
                    </p>
                  )}
                </div>
              </div>

              {/* Meta Details Card */}
              <div className="rounded-2xl border border-glass-border  p-4 sm:p-5 space-y-4 ">
                <h4 className="text-sm font-black text-primary border-b border-glass-border pb-2">{t('meta_information', { defaultValue: 'Metadata Information' })}</h4>

                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <span className="text-sm text-muted-foreground font-black block">{t('platform', { defaultValue: 'Platform' })}</span>
                    <span className="text-sm font-semibold text-foreground capitalize">{post.platform}</span>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground font-black block">{t('format', { defaultValue: 'Format' })}</span>
                    <span className="text-sm font-bold text-foreground capitalize">
                      {post.platform === 'youtube' && (post.content_type === 'reel' || post.content_type === 'shorts')
                        ? t('shorts', { defaultValue: 'Shorts' })
                        : post.platform === 'youtube' && (post.content_type === 'post' || post.content_type === 'videos')
                          ? t('videos', { defaultValue: 'Videos' })
                          : post.content_type || 'Feed Post'}
                    </span>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground font-black block">{t('created_date', { defaultValue: 'Created At' })}</span>
                    <span className="text-sm font-semibold text-foreground">{formatDate(post.created_at)}</span>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground font-black block">
                      {post.status === 'scheduled' ? t('scheduled_at_label', { defaultValue: 'Scheduled At' }) : t('published_at_label', { defaultValue: 'Published At' })}
                    </span>
                    <span className="text-sm font-semibold text-foreground">
                      {post.scheduled_at ? formatDate(post.scheduled_at) : post.published_at ? formatDate(post.published_at) : 'N/A'}
                    </span>
                  </div>
                </div>

                <div className="border-t border-glass-border pt-4 space-y-2">
                  <span className="text-sm text-muted-foreground font-black block">{t('media_files', { defaultValue: 'Media Attachments' })}</span>
                  <p className="text-xs text-foreground">
                    {post.media_urls?.length || 0} {t('files_selected', { defaultValue: 'attached media files.' })}
                  </p>
                  {post.media_urls && post.media_urls.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {post.media_urls.map((url: string, index: number) => (
                        <a
                          key={index}
                          href={getMediaUrl(url)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-primary hover:underline bg-primary/10 border border-primary/20 px-2.5 py-0.5 rounded-lg"
                        >
                          {t('file')} #{index + 1}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
