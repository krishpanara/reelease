'use client'

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { CatalogueVideoPlayerProps } from '@/types/ecommerceCatalogue'
import { getMediaUrl, normalizeUploadPath } from '@/utils'
import { Check, Copy } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { copyToClipboard } from '@/utils/clipboard'

export function CatalogueVideoPlayer({ videoUrl, prompt, onClose }: CatalogueVideoPlayerProps) {
  const resolvedUrl = videoUrl ? getMediaUrl(normalizeUploadPath(videoUrl)) : null
  const { t } = useTranslation()
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    if (!prompt) return
    copyToClipboard(prompt)
    setCopied(true)
    toast.success(t('prompt_copied', { defaultValue: 'Prompt copied to clipboard!' }))
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Dialog open={!!videoUrl} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl! w-[calc(100%-2rem)]! rounded-2xl! bg-black/95! border border-white/10! [&_svg]:text-white! p-6!">
        <DialogHeader className="sr-only">
          <DialogTitle>Catalogue Video Showcase</DialogTitle>
          <DialogDescription>Viewing generated product video showcase</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-white/10 bg-black shadow-2xl flex items-center justify-center">
            {resolvedUrl ? (
              <video
                src={resolvedUrl}
                className="w-full h-full object-contain"
                controls
                autoPlay
                playsInline
              />
            ) : (
              <div className="text-white/50 text-sm">No video url provided</div>
            )}
          </div>

          {prompt && (
            <div className="px-4 py-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm space-y-1">
              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">
                  {t('prompt', { defaultValue: 'Prompt' })}
                </p>
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                  type="button"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-green-450!" />
                      <span className="text-green-450!">{t('copied', { defaultValue: 'Copied' })}</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>{t('copy', { defaultValue: 'Copy' })}</span>
                    </>
                  )}
                </button>
              </div>
              <p className="text-sm text-white/80 italic leading-relaxed">&ldquo;{prompt}&rdquo;</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}


