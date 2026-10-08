'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import { MediaViewModalProps } from '@/types'
import { formatDate } from '@/utils'
import { AlertCircle, Calendar, Clock, Copy, Download, ImageIcon, Loader2, Save, Trash2, Zap } from 'lucide-react'
import Image from 'next/image'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { copyToClipboard } from '@/utils/clipboard'

export const MediaViewModal: React.FC<MediaViewModalProps> = ({
  isOpen,
  onClose,
  title,
  status,
  mediaUrl,
  isVideo = false,
  isLoadingMedia = false,
  errorMessage,
  prompt,
  creditsUsed,
  createdAt,
  description,
  onDownload,
  onDelete,
  isDeleting = false,
  onSaveToMedia,
  isSavingToMedia = false,
  customBadges
}) => {
  const { t } = useTranslation()
  const [copied, setCopied] = useState(false)

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!prompt) return
    copyToClipboard(prompt)
    setCopied(true)
    toast.success(t('prompt_copied', { defaultValue: 'Prompt copied to clipboard!' }))
    setTimeout(() => setCopied(false), 2000)
  }

  const isCompleted = !isLoadingMedia && !errorMessage

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-2xl! max-w-[calc(100%-2rem)]! overflow-hidden p-6! rounded-border-radius! border border-glass-border backdrop-blur-xl text-title-color dark:text-white">
        {/* Header Block */}
        <DialogHeader className="border-b border-glass-border pb-4 flex flex-row items-center justify-between space-y-0">
          <div className="space-y-1 min-w-0 flex-1">
            <DialogTitle className="text-xl font-bold text-title-color dark:text-white flex items-center gap-2 truncate">
              {title}
            </DialogTitle>
            <div className="flex flex-wrap items-center gap-2 mt-1">
              {status && (
                <Badge className={cn('px-2.5 py-0.5 text-[10px] font-bold rounded-md border shadow-2xl', status.color)}>
                  {status.label}
                </Badge>
              )}
              {customBadges}
              {typeof creditsUsed === 'number' && (
                <div className="flex items-center gap-1 text-amber-500 text-xs font-semibold">
                  <Zap className="w-3 h-3 text-amber-500 fill-amber-500" />
                  <span>{creditsUsed} {t('credits', { defaultValue: 'credits' })}</span>
                </div>
              )}
            </div>
          </div>
        </DialogHeader>

        {/* Content Body */}
        <div className="py-4 space-y-5 overflow-y-auto max-h-[70vh] no-scrollbar">
          {/* Main Media Player / Container */}
          <div className="relative w-full aspect-video bg-black/5 dark:bg-black/60 rounded-xl overflow-hidden border border-glass-border flex items-center justify-center">
            {isLoadingMedia ? (
              <div className="flex flex-col items-center justify-center text-subtitle-color/40 dark:text-white/40 gap-3">
                <div className="relative">
                  <div className="w-12 h-12 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
                  <Clock className="absolute inset-0 m-auto w-5 h-5 text-primary animate-pulse" />
                </div>
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-widest">
                  {t('loading', { defaultValue: 'Loading...' })}
                </span>
              </div>
            ) : errorMessage ? (
              <div className="flex flex-col items-center justify-center text-rose-500 gap-3">
                <div className="w-12 h-12 rounded-full bg-rose-500/10 flex items-center justify-center border border-rose-500/20">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <span className="text-xs font-medium uppercase tracking-widest">{t('failed', { defaultValue: 'Failed' })}</span>
              </div>
            ) : mediaUrl ? (
              isVideo ? (
                <video
                  src={mediaUrl}
                  className="w-full h-full object-contain"
                  controls
                  autoPlay
                  muted
                  loop
                  playsInline
                />
              ) : (
                <>
                  <Image
                    src={mediaUrl}
                    alt="Blurred background"
                    fill
                    unoptimized
                    className="object-cover blur-md scale-110 dark:opacity-60 select-none pointer-events-none"
                  />
                  <Image
                    width={600}
                    height={400}
                    unoptimized
                    src={mediaUrl}
                    alt={title}
                    className="relative z-10 w-full h-full object-contain"
                  />
                </>
              )
            ) : (
              <div className="flex flex-col items-center justify-center text-subtitle-color/40 dark:text-white/40 gap-3">
                <ImageIcon className="w-12 h-12 text-muted-foreground" />
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-widest">
                  {t('no_media', { defaultValue: 'No Media' })}
                </span>
              </div>
            )}
          </div>

          {/* Action buttons inside the modal */}
          {isCompleted && (onDownload || onSaveToMedia || onDelete) && (
            <div className="flex items-center justify-end gap-2 border-b border-glass-border pb-4">
              {onSaveToMedia && (
                <Button
                  onClick={onSaveToMedia}
                  disabled={isSavingToMedia}
                  className="px-4 h-9 rounded-lg bg-black/5 dark:bg-white/5 border border-glass-border text-title-color dark:text-white hover:bg-black/10 dark:hover:bg-white/10 gap-2 text-xs font-semibold disabled:opacity-50"
                >
                  {isSavingToMedia ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {t('save_to_media_library', { defaultValue: 'Save to Media Library' })}
                </Button>
              )}
              {onDownload && (
                <Button
                  onClick={onDownload}
                  className="px-4 h-9 rounded-lg bg-black/5 dark:bg-white/5 border border-glass-border text-title-color dark:text-white hover:bg-black/10 dark:hover:bg-white/10 gap-2 text-xs font-semibold"
                >
                  <Download className="w-4 h-4" />
                  {t('download_media', { defaultValue: 'Download Media' })}
                </Button>
              )}
              {onDelete && (
                <Button
                  onClick={onDelete}
                  disabled={isDeleting}
                  className="px-4 h-9 rounded-lg bg-rose-500/10 dark:bg-rose-500/20 border border-rose-500/20 dark:border-rose-500/30 text-rose-500 dark:text-rose-350 hover:bg-rose-500/20 dark:hover:bg-rose-500/30 gap-2 text-xs font-semibold disabled:opacity-50"
                >
                  <Trash2 className="w-4 h-4" />
                  {t('delete', { defaultValue: 'Delete' })}
                </Button>
              )}
            </div>
          )}

          {/* Error Message for Failed Task */}
          {errorMessage && (
            <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-4">
              <h4 className="text-sm font-bold text-rose-500 mb-1">
                {t('error_message', { defaultValue: 'Error Message' })}
              </h4>
              <p className="text-xs text-rose-400 select-text whitespace-pre-wrap">
                {errorMessage}
              </p>
            </div>
          )}

          {/* Description Section */}
          {description && (
            <div className="space-y-2">
              <h4 className="text-sm font-bold text-title-color dark:text-white/90">
                {t('description', { defaultValue: 'Description' })}
              </h4>
              <div className="bg-black/3 dark:bg-white/5 rounded-xl p-4 border border-glass-border">
                <p className="text-sm leading-relaxed text-subtitle-color dark:text-white/80 select-text whitespace-pre-wrap">
                  {description}
                </p>
              </div>
            </div>
          )}

          {/* Prompt Section */}
          {prompt && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-title-color dark:text-white/90">
                  {t('prompt', { defaultValue: 'Prompt' })}
                </h4>
                <Button
                  onClick={handleCopy}
                  variant="ghost"
                  size="sm"
                  className="h-8 px-3 rounded-lg text-subtitle-color dark:text-white/70 hover:text-title-color dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 gap-1.5 text-xs font-semibold"
                >
                  <Copy className="w-3.5 h-3.5" />
                  {copied ? t('copied', { defaultValue: 'Copied' }) : t('copy', { defaultValue: 'Copy' })}
                </Button>
              </div>
              <div className="bg-black/3 dark:bg-white/5 rounded-xl p-4 border border-glass-border">
                <p className="text-sm leading-relaxed text-subtitle-color dark:text-white/80 select-text whitespace-pre-wrap">
                  {prompt}
                </p>
              </div>
            </div>
          )}

          {/* Footer Timestamp Details */}
          {createdAt && (
            <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-glass-border">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                <span>{formatDate(createdAt)}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                <span>
                  {new Date(createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
