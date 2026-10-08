'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { TextToVideoOutputProps } from '@/types/components/features'
import { Download, Film, ImageIcon, Loader2, Save } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export function TextToVideoOutput({
  isGenerating,
  resultVideo,
  isSaving,
  handleSaveToMedia,
  handleDownload,
}: TextToVideoOutputProps) {
  const { t } = useTranslation()

  return (
    <Card className="glass-card border-border dark:border-white/10 overflow-hidden rounded-border-radius backdrop-blur-xl h-full flex flex-col min-h-125">
      <div className="sm:p-6 p-4 pb-4 border-b border-border/30 dark:border-white/5 flex items-center justify-between">
        <div className="text-base font-bold flex items-center gap-2 text-foreground dark:text-white/90">
          <ImageIcon className="w-4 h-4 text-primary" />
          {t('generation_result', { defaultValue: 'Generation Result' })}
        </div>
        {resultVideo && (
          <div className="flex gap-2">
            <Button
              onClick={handleSaveToMedia}
              disabled={isSaving}
              size="sm"
              variant="ghost"
              className="h-8 rounded-lg text-foreground/40 dark:text-white/40 hover:text-primary hover:bg-primary/10"
            >
              {isSaving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
            </Button>
            <Button
              onClick={handleDownload}
              size="sm"
              variant="ghost"
              className="h-8 rounded-lg text-foreground/40 dark:text-white/40 hover:text-primary hover:bg-primary/10"
            >
              <Download className="w-3 h-3" />
            </Button>
          </div>
        )}
      </div>
      <CardContent className="p-8 flex-1 flex flex-col justify-center items-center relative">
        {isGenerating && !resultVideo ? (
          <div className="flex flex-col items-center gap-8 py-20">
            <div className="relative w-32 h-32">
              <div className="absolute inset-0 rounded-full border-4 border-primary/10" />
              <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin" />
              <div className="absolute inset-0 m-auto flex items-center justify-center">
                <Film className="w-10 h-10 text-primary animate-pulse" />
              </div>
            </div>
            <div className="text-center space-y-2">
              <p className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-400 animate-pulse">
                {t('crafting_video', { defaultValue: 'Crafting your video masterpiece...' })}
              </p>
              <p className="text-sm text-muted-foreground italic opacity-60">
                {t('this_may_take_a_moment', { defaultValue: 'This may take a minute or two depending on complexity' })}
              </p>
            </div>
          </div>
        ) : resultVideo ? (
          <div className="w-full h-full relative group animate-in fade-in zoom-in-95 duration-500">
            <div className="relative aspect-video w-full rounded-border-radius overflow-hidden shadow-2xl border border-border dark:border-white/10 bg-foreground/5 dark:bg-black/20">
              <video
                src={`${process.env.NEXT_PUBLIC_STORAGE_URL || ''}/${resultVideo}`}
                className="w-full h-full object-contain"
                controls
                autoPlay
              />
              <div className="absolute inset-0 bg-black/60 opacity-0 rounded-radius group-hover:opacity-100 transition-all duration-300 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 backdrop-blur-md p-4">
                <Button
                  onClick={handleSaveToMedia}
                  disabled={isSaving}
                  className="gap-3 rounded-radius h-12  bg-primary! text-black font-bold hover:scale-105 transition-all"
                >
                  {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                  {t('save_to_library', { defaultValue: 'Save to Library' })}
                </Button>
                <Button
                  onClick={handleDownload}
                  className="w-12 h-12 rounded-radius bg-primary! text-black flex items-center justify-center hover:scale-105 transition-all"
                >
                  <Download className="w-5 h-5 sm:w-6 sm:h-6" />
                  <span className="sm:hidden font-bold">{t('download', { defaultValue: 'Download' })}</span>
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center space-y-6 max-w-70">
            <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto border border-border/20 dark:border-white/5">
              <Film className="w-10 h-10 text-primary" />
            </div>
            <div className="space-y-2">
              <p className="text-xl font-bold text-foreground dark:text-white/90">
                {t('ready_to_create', { defaultValue: 'Ready to Create?' })}
              </p>
              <p className="text-base text-foreground/50 dark:text-white/30 leading-relaxed font-medium">
                {t('video_appear_here', {
                  defaultValue: 'Your generated video will appear here once the generation is complete.',
                })}
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
