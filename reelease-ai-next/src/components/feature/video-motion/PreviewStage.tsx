'use client'

import { Button } from '@/components/ui/button'
import { PreviewStageProps } from '@/types/components/features'
import { getMediaUrl } from '@/utils'
import { Download, Loader2, Maximize2, Play, Save } from 'lucide-react'
import { useTranslation } from 'react-i18next'



export const PreviewStage = ({
  isGenerating,
  resultVideo,
  isSaving,
  onSave,
  onDownload,
}: PreviewStageProps) => {
  const { t } = useTranslation()

  return (
    <div className="border-glass-border dark:bg-white/3 rounded-border-radius glass-card relative h-full overflow-hidden flex flex-col group">
      {isGenerating ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-md z-20">
          <div className="relative">
            <Loader2 className="w-12 h-12 text-primary animate-spin" />
            <div className="absolute inset-0 blur-xl bg-primary/20 animate-pulse" />
          </div>
          <p className="mt-4 text-xs font-bold text-primary uppercase tracking-[0.2em]">
            {t('processing_motion', { defaultValue: 'Processing Motion' })}...
          </p>
        </div>
      ) : resultVideo ? (
        <video
          src={getMediaUrl(resultVideo)}
          className="absolute inset-0 w-full h-full object-contain bg-black"
          controls
          autoPlay
          loop
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-foreground/5 dark:bg-white/5 flex items-center justify-center group-hover:bg-primary/10 group-hover:text-primary transition-transform cursor-pointer">
            <Play className="w-6 h-6 text-muted-foreground"/>
          </div>
        </div>
      )}

      {resultVideo && !isGenerating && (
        <div className="absolute top-6 right-6 flex gap-2 z-30">
          <Button
            size="sm"
            onClick={onSave}
            disabled={isSaving}
            className="bg-black/60 backdrop-blur-md border border-white/10 hover:bg-emerald-500/20 hover:border-emerald-500/40 text-white gap-2 rounded-xl h-10"
          >
            {isSaving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
            {t('save', { defaultValue: 'Save' })}
          </Button>
          <Button
            size="sm"
            onClick={onDownload}
            className="bg-black/60 backdrop-blur-md border border-white/10 hover:bg-primary/20 hover:border-primary/40 text-white gap-2 rounded-xl h-10"
          >
            <Download className="w-3 h-3" />
            {t('download', { defaultValue: 'Download' })}
          </Button>
        </div>
      )}

      <div className="absolute bottom-6 right-6 p-2 rounded-xl bg-black/40 border border-white/10 dark:bg-white/20 text-white/40 hover:text-white cursor-pointer transition-colors z-10">
        <Maximize2 className="w-5 h-5" />
      </div>
    </div>
  )
}
