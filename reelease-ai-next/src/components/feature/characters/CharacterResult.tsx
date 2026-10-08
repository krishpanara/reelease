'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Sparkles, Loader2, Save, Download, Image as ImageIcon } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Character, CharacterResultProps } from '@/types/character'
import Image from 'next/image'

export const CharacterResult: React.FC<CharacterResultProps> = ({
  isGenerating,
  resultImage,
  currentCharacter,
  isSaving,
  onSaveToMedia,
  onDownload,
}) => {
  const { t } = useTranslation()

  return (
    <Card className="lg:col-span-2 dark:bg-white/3 bg-white h-full flex flex-col">
      <CardHeader>
        <CardTitle>{t('generation_result', { defaultValue: 'Generation Result' })}</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col justify-center w-full">
        {isGenerating && !resultImage ? (
          <div className="flex flex-col items-center justify-center gap-6 py-20 h-full">
            <div className="relative w-24 h-24">
              <div className="absolute inset-0 rounded-full border-4 border-primary/20" />
              <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin" />
              <Sparkles className="absolute inset-0 m-auto w-8 h-8 text-primary animate-pulse" />
            </div>
            <p className="text-lg font-bold text-primary animate-pulse tracking-tight text-center">
              {t('creating_character')}
            </p>
            <p className="text-sm text-muted-foreground text-center">{t('creating_character_subtext')}</p>
          </div>
        ) : resultImage ? (
          <div className="space-y-4 w-full h-full flex flex-col justify-center">
            <div className="relative w-full h-[350px] sm:h-[450px] lg:h-[550px] xl:h-[650px] bg-black/5 dark:bg-white/5 rounded-xl overflow-hidden group">
              <Image
                unoptimized
                src={`${process.env.NEXT_PUBLIC_STORAGE_URL || ''}/${resultImage}`}
                alt={currentCharacter?.name || 'Generated Character'}
                width={500}
                height={500}
                className="w-full h-full object-contain"
              />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center gap-2 backdrop-blur-md p-4">
                <Button
                  onClick={onSaveToMedia}
                  disabled={isSaving}
                  className="gap-2 h-10 w-10 p-0! rounded-full bg-black/30 border border-white/30 text-white hover:bg-black/40 hover:text-white backdrop-blur-3xl flex items-center justify-center font-bold"
                >
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}

                </Button>
                <Button
                  onClick={onDownload}
                  className="gap-2 h-10 w-10 p-0! rounded-full bg-black/30 border border-white/30 text-white hover:bg-black/40 hover:text-white backdrop-blur-3xl flex items-center justify-center font-bold"
                >
                  <Download className="w-4 h-4" />
                </Button>
              </div>
            </div>
            {currentCharacter && (
              <div className="space-y-2 mt-4">
                <h3 className="font-semibold text-xl break-all whitespace-normal line-clamp-2">
                  {currentCharacter.name}
                </h3>
                {currentCharacter.description && (
                  <p className="text-base text-muted-foreground break-all whitespace-normal line-clamp-2">
                    {currentCharacter.description}
                  </p>
                )}
                <div className="flex flex-wrap gap-2">
                  <span className="px-2 py-1 bg-primary/20 text-primary font-medium text-xs rounded-full">
                    {currentCharacter.style}
                  </span>
                  <span className="px-2 py-1 bg-secondary text-white font-medium text-xs rounded-full">
                    {currentCharacter.resolution}
                  </span>
                  {currentCharacter.provider && (
                    <span className="px-2 py-1 bg-muted text-muted-foreground font-medium text-xs rounded-full">
                      {currentCharacter.provider}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center flex flex-col items-center justify-center py-20 text-muted-foreground h-full min-h-[300px]">
            <ImageIcon className="w-20 h-20 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">{t('ready_to_create',{defaultValue:'Ready to Create?'})}</p>
            <p className="text-sm">{t('character_appear_here',{defaultValue:'Your generated character will appear here'})}</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
