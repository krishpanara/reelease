'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { TextToImageOutputProps } from '@/types/components/features'
import { Download, Image as ImageIcon, Loader2, Save, Wand2 } from 'lucide-react'
import Image from 'next/image'
import { useTranslation } from 'react-i18next'

export function TextToImageOutput({
  isGenerating,
  resultImage,
  isSaving,
  handleSaveToMedia,
  handleDownload,
}: TextToImageOutputProps) {
  const { t } = useTranslation()

  return (
    <Card className="glass-card dark:border-white/10 border-border overflow-hidden rounded-border-radius h-full flex flex-col min-h-[300px] sm:min-h-125">
      <div className="p-4 border-b dark:border-white/5 border-border flex items-center justify-between">
        <div className="text-base font-medium flex items-center gap-2 text-title-color dark:text-white/90">
          <ImageIcon className="w-4 h-4 text-primary" />
          {t('generation_result', { defaultValue: 'Generation Result' })}
        </div>
      </div>
      <CardContent className="p-6 sm:p-8 flex-1 flex flex-col justify-center items-center relative">
        {isGenerating && !resultImage ? (
          <div className="flex flex-col items-center gap-6 py-10">
            <div className="relative w-20 h-20 sm:w-24 sm:h-24">
              <div className="absolute inset-0 rounded-full border-4 border-primary/20" />
              <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin" />
              <Wand2 className="absolute inset-0 m-auto w-6 h-6 sm:w-8 sm:h-8 text-primary animate-pulse" />
            </div>
            <p className="text-base sm:text-lg font-bold text-primary animate-pulse tracking-tight text-center">
              {t('crafting_masterpiece', { defaultValue: 'Crafting your masterpiece...' })}
            </p>
          </div>
        ) : resultImage ? (
          <div className="w-full h-full relative group animate-in fade-in zoom-in-95 duration-500 flex items-center justify-center">
            <div className="relative aspect-square w-full max-w-lg rounded-border-radius overflow-hidden shadow-2xl dark:border dark:border-white/10 border border-border dark:bg-black/20 bg-black/5">
              <a href={`${process.env.NEXT_PUBLIC_STORAGE_URL || ''}/${resultImage}`} target="_blank" rel="noopener noreferrer" className="block w-full h-full relative cursor-pointer">
                <Image
                  src={`${process.env.NEXT_PUBLIC_STORAGE_URL || ''}/${resultImage}`}
                  alt="Generated AI result"
                  fill
                  unoptimized
                  className="object-contain"
                />
              </a>
              <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center gap-2 z-10">
                <Button
                  onClick={handleSaveToMedia}
                  disabled={isSaving}
                  className="gap-2 rounded-xl primary-btn h-9 px-4 text-black font-bold text-xs hover:scale-105 transition-all"
                >
                  {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  <span className="hidden sm:inline">{t('save_to_library', { defaultValue: 'Save to Library' })}</span>
                </Button>
                <Button
                  onClick={handleDownload}
                  className="rounded-full h-10 w-10 p-0! bg-black/30 border border-white/30 text-white hover:bg-black/40 hover:text-white backdrop-blur-3xl flex items-center justify-center hover:scale-105 transition-all"
                >
                  <Download className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center space-y-6 max-w-70 py-10">
            <div className="w-20 h-20 sm:w-24 sm:h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto ">
              <ImageIcon className="w-8 h-8 sm:w-10 sm:h-10 text-primary" />
            </div>
            <div className="space-y-2">
              <p className="text-lg sm:text-xl font-bold text-title-color dark:text-white/90">
                {t('ready_to_create', { defaultValue: 'Ready to Create?' })}
              </p>
              <p className="text-xs sm:text-sm text-subtitle-color dark:text-white/50 leading-relaxed font-medium">
                {t('image_appear_here', {
                  defaultValue: 'Your generated image will appear here once the generation is complete.',
                })}
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
