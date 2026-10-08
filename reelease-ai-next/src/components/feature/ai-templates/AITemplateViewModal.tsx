'use client'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { AITemplate } from '@/types'
import { getMediaUrl } from '@/utils'
import { Copy, X, Tag, Video, Image as ImageIcon } from 'lucide-react'
import Image from 'next/image'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { copyToClipboard } from '@/utils/clipboard'

interface AITemplateViewModalProps {
  isOpen: boolean
  onClose: () => void
  template: AITemplate | null
}

function getPreviewPath(template: AITemplate) {
  let previewPath = template.file_path
  if (!previewPath && template.attachment_id && typeof template.attachment_id === 'object') {
    previewPath = template.attachment_id.file_path
  }
  return getMediaUrl(previewPath || '') || null
}

function getIsVideo(previewPath: string | null, template: AITemplate) {
  if (!previewPath) return false
  if (previewPath.match(/\.(mp4|webm|ogg)$/i)) return true
  if (previewPath.startsWith('data:video')) return true
  if (template.attachment_id && typeof template.attachment_id === 'object' && template.attachment_id.file_type === 'video') return true
  return false
}

export function AITemplateViewModal({ isOpen, onClose, template }: AITemplateViewModalProps) {
  const { t } = useTranslation()
  const [copied, setCopied] = useState(false)

  if (!template) return null

  const previewPath = getPreviewPath(template)
  const isVideo = getIsVideo(previewPath, template)
  const categoryName = typeof template.category_id === 'object' ? template.category_id?.name : template.category_id

  const handleCopy = () => {
    copyToClipboard(template.prompt)
    setCopied(true)
    toast.success(t('prompt_copied', { defaultValue: 'Prompt copied to clipboard!' }))
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-2xl! max-w-[calc(100%-2rem)]! overflow-hidden p-6! rounded-border-radius! bg-white! dark:bg-slate-950/95! border border-border dark:border-white/10 backdrop-blur-xl text-title-color dark:text-white">
        <DialogHeader className="border-b border-border dark:border-white/10 pb-4 flex flex-row items-center justify-between space-y-0">
          <div className="space-y-1">
            <DialogTitle className="text-xl font-bold text-title-color dark:text-white flex items-center gap-2">
              {template.title}
            </DialogTitle>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-md bg-primary/10 text-primary">
                <Tag className="w-3 h-3" />
                {categoryName || t('uncategorized', { defaultValue: 'Uncategorized' })}
              </span>
            </div>
          </div>
        </DialogHeader>

        <div className="py-4 space-y-5 overflow-y-auto max-h-[70vh] no-scrollbar">
          {/* Media Container with contain fit */}
          <div className="relative w-full aspect-video bg-black/60 rounded-xl overflow-hidden border border-black/5 dark:border-white/5 flex items-center justify-center">
            {previewPath ? (
              isVideo ? (
                <div className="relative w-full h-full overflow-hidden rounded-xl">
                  <div className="absolute inset-0 pointer-events-none select-none overflow-hidden">
                    <video
                      src={previewPath}
                      className="w-full h-full object-cover blur-sm opacity-80 scale-110"
                      muted
                      playsInline
                    />
                    <div className="absolute inset-0 bg-black/10" />
                  </div>
                  <video
                    src={previewPath}
                    className="w-full h-full object-contain object-center rounded-xl relative z-10"
                    controls
                    autoPlay
                    muted
                    loop
                    playsInline
                  />
                </div>
              ) : (
                <div className="relative w-full h-full overflow-hidden rounded-xl">
                  <div className="absolute inset-0 pointer-events-none select-none overflow-hidden">
                    <Image
                      width={600}
                      height={400}
                      unoptimized
                      src={previewPath}
                      alt={template.title}
                      className="w-full h-full object-cover blur-sm opacity-80 scale-110"
                    />
                    <div className="absolute inset-0 bg-black/10" />
                  </div>
                  <Image
                    width={600}
                    height={400}
                    unoptimized
                    src={previewPath}
                    alt={template.title}
                    className="absolute inset-0 w-full h-full object-center rounded-xl object-contain z-10"
                  />
                </div>
              )
            ) : (
              <div className="flex flex-col items-center justify-center text-white/40 gap-2">
                <ImageIcon className="w-10 h-10" />
                <span className="text-xs">{t('no_preview_available', { defaultValue: 'No preview available' })}</span>
              </div>
            )}
          </div>

          {/* Prompt details section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-title-color dark:text-white/90">
                {t('prompt', { defaultValue: 'Prompt' })}
              </h4>
              <Button
                onClick={handleCopy}
                variant="ghost"
                size="sm"
                className="h-8 px-3 rounded-lg text-muted-foreground hover:text-title-color dark:text-white/70 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 gap-1.5 text-xs font-semibold"
              >
                <Copy className="w-3.5 h-3.5" />
                {copied ? t('copied', { defaultValue: 'Copied' }) : t('copy', { defaultValue: 'Copy' })}
              </Button>
            </div>
            <div className="bg-black/[0.03] dark:bg-white/5 rounded-xl p-4 border border-black/5 dark:border-white/5">
              <p className="text-sm leading-relaxed text-foreground/80 dark:text-white/80 select-text whitespace-pre-wrap">
                {template.prompt}
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
