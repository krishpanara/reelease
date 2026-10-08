'use client'

import { useEffect, useRef } from 'react'
import { AISwitch } from '@/components/feature/ai-common/AISwitch'
import { AspectRatioBox } from '@/components/feature/ai-common/AspectRatioBox'
import { Button } from '@/components/ui/button'
import Input from '@/components/ui/input'
import { Slider } from '@/components/ui/slider'
import { catalogueAspectRatios } from '@/data/ecommerceCatalogue'
import { cn } from '@/lib/utils'
import { CatalogueVideoSettingsProps } from '@/types/ecommerceCatalogue'
import { useTranslation } from 'react-i18next'

export function CatalogueVideoSettings({
  stepNumber = 4,
  title,
  description,
  duration,
  aspectRatio,
  sound,
  addWatermark,
  addBackgroundMusicToggle,
  customMusicUrl,
  onDurationChange,
  onAspectRatioChange,
  onSoundChange,
  onAddWatermarkChange,
  onAddBackgroundMusicToggleChange,
  onCustomMusicUrlChange,
}: CatalogueVideoSettingsProps) {
  const { t } = useTranslation()
  const aspectRatioContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!aspectRatioContainerRef.current) return
    const activeButton = aspectRatioContainerRef.current.querySelector('[data-active="true"]')
    if (activeButton) {
      activeButton.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center',
      })
    }
  }, [aspectRatio])

  return (
    <div className="dark:bg-white/3 bg-white border border-glass-border rounded-border-radius p-4 sm:p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <span className="flex items-center justify-center w-8 h-8 rounded-full primary-btn text-white font-bold text-base shrink-0">
          {stepNumber}
        </span>
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">{title}</h3>
          <p className="text-sm text-subtitle-color mt-0.5">{description}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 items-start">
        {/* Duration */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-title">{t('duration', { defaultValue: 'Duration' })}</h4>
            <span className="text-xs font-bold text-primary bg-primary/10 px-2 rounded-full">{duration}s</span>
          </div>
          <Slider
            value={[duration]}
            onValueChange={(v) => onDurationChange(v[0])}
            min={3}
            max={30}
            step={1}
            className="py-2"
          />
          <div className="flex justify-between text-xs text-slate-600 dark:text-white/80">
            <span>3s</span>
            <span>30s</span>
          </div>
        </div>

        {/* Aspect Ratio */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-title">{t('aspect_ratio', { defaultValue: 'Aspect Ratio' })}</h4>
          <div className="overflow-x-auto no-scrollbar py-1">
            <div ref={aspectRatioContainerRef} className="flex sm:grid sm:grid-cols-3 gap-2 border border-glass-border p-2 rounded-xl w-max sm:w-full min-w-full">
              {catalogueAspectRatios.map((ar) => (
                <Button
                  key={ar}
                  type="button"
                  data-active={aspectRatio === ar ? 'true' : 'false'}
                  onClick={() => onAspectRatioChange(ar)}
                  className={cn(
                    'group/btn h-12 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all shrink-0 w-28 sm:w-auto justify-center',
                    aspectRatio === ar
                      ? 'text-white! primary-btn font-bold'
                      : 'bg-black/3! dark:bg-white/3! text-title-color!',
                  )}
                >
                  <AspectRatioBox ratio={ar} />
                  {ar}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Sound Toggle */}
      <div className="pt-5 border-t border-glass-border">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-title">
                {t('enable_sound', { defaultValue: 'Enable Sound' })}
              </span>
            </div>
            <AISwitch checked={sound} onChange={onSoundChange} />
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-title">
              {t('add_watermark', { defaultValue: 'Add Watermark' })}
            </span>
            <AISwitch checked={addWatermark} onChange={onAddWatermarkChange} />
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-title">
              {t('add_music', { defaultValue: 'Add Background Music' })}
            </span>
            <AISwitch checked={addBackgroundMusicToggle} onChange={onAddBackgroundMusicToggleChange} />
          </div>

          {addBackgroundMusicToggle && (
            <div className="space-y-3 pt-2">
              <h4 className="text-sm font-semibold text-title">{t('music_url', { defaultValue: 'Music URL' })}</h4>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <span className="text-[10px] font-bold text-slate-400">URL</span>
                </div>
                <Input
                  type="url"
                  value={customMusicUrl}
                  onChange={(e) => onCustomMusicUrlChange(e.target.value)}
                  placeholder="Or paste a direct audio URL (.mp3, .wav)"
                  className="w-full h-10 pl-10 border   border-glass-border rounded-xl text-xs  outline-hidden placeholder:text-slate-400 focus:border-purple-500/50"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
