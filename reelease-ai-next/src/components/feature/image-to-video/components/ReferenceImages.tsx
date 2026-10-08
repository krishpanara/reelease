'use client'

import { Button } from '@/components/ui/button'
import Input from '@/components/ui/input'
import Label from '@/components/ui/label'
import { Textarea } from '@/components/ui/textArea'
import { ReferenceImagesProps } from '@/types/components/features'
import { getMediaUrl } from '@/utils'
import { Clock, Film, ImagesIcon, Plus, Trash2, X } from 'lucide-react'
import Image from 'next/image'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

export function ReferenceImages({
  isMultiShot,
  shots,
  setShots,
  startAttachment,
  endAttachment,
  setStartAttachment,
  setEndAttachment,
  onOpenPicker
}: ReferenceImagesProps) {
  const { t } = useTranslation()

  const addShot = () => {
    const lastShot = shots[shots.length - 1]
    if (shots.length >= 4) return

    if (!lastShot.image || !lastShot.prompt.trim()) {
      toast.error(t('please_fill_current_shot', { defaultValue: 'Please complete the current shot (image and prompt) before adding another' }))
      return
    }

    setShots(prev => [...prev, { image: null, prompt: '', duration: 3 }])
  }

  const removeShot = (index: number) => {
    if (shots.length <= 1) return
    setShots(prev => prev.filter((_, i) => i !== index))
  }

  const updateShot = (index: number, data: any) => {
    setShots(prev => {
      const newShots = [...prev]
      newShots[index] = { ...newShots[index], ...data }
      return newShots
    })
  }

  if (isMultiShot) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Label className="text-base font-medium text-title-color dark:text-white flex items-center gap-2">
            <Film className="w-5 h-5 text-primary" />
            {t('video_shots', { defaultValue: 'Video Shots' })}
            <span className="text-[10px] text-foreground/40 dark:text-white/30 ml-2">({shots.length}/4)</span>
          </Label>
        </div>

        <div className="space-y-4 sm:space-y-6">
          {shots.map((shot, index) => (
            <div key={index} className="relative group rounded-border-radius border border-glass-border dark:border-white/10 p-4 sm:p-6 space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="flex items-center justify-between mb-1 sm:mb-2">
                <span className="text-base font-bold text-primary tracking-[1px]">Shot {index + 1}</span>
                {shots.length > 1 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-colors"
                    onClick={() => removeShot(index)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 sm:gap-6">
                {/* Shot Image */}
                <div className="sm:col-span-4 lg:col-span-3">
                  <div
                    onClick={() => onOpenPicker('shot', index)}
                    className={`relative aspect-square rounded-xl dark:bg-white/3 border-glass-border border-2 border-dashed transition-all flex flex-col items-center justify-center cursor-pointer overflow-hidden group/img ${shot.image ? 'border-primary/50 bg-primary/5' : 'border-border/30 dark:border-white/10 bg-foreground/5 dark:bg-black/40 hover:border-primary/30'
                      }`}
                  >
                    {shot.image ? (
                      <Image
                        src={getMediaUrl(shot.image.file_path)}
                        width={100}
                        height={100}
                        unoptimized
                        alt={`Shot ${index + 1}`}
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover/img:scale-110"
                      />
                    ) : (
                      <div className="flex flex-col items-center gap-2 text-foreground/30 dark:text-white/40 group-hover/img:text-primary transition-colors">
                        <div className='w-10 h-10 rounded-full group bg-foreground/8 dark:bg-white/10 bg-black/10 group-hover:bg-primary/10 flex items-center justify-center'>
                          <Plus className="w-5 h-5 " />
                        </div>
                        <span className="text-sm text-foreground/40 dark:text-white/40 group-hover:text-primary transition-colors">{t('image')}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Shot Details */}
                <div className="sm:col-span-8 lg:col-span-9 space-y-4">
                  <div className="space-y-2 flex flex-col">
                    <Label className="text-sm font-medium text-foreground/40 text-subtitle-color dark:text-white/80 px-1">{t('shot_prompt', { defaultValue: 'Shot Prompt' })}</Label>
                    <Textarea
                      value={shot.prompt}
                      onChange={(e) => updateShot(index, { prompt: e.target.value })}
                      placeholder={t('describe_this_shot', { defaultValue: 'Describe this scene...' })}
                      className="w-full h-20 border-glass-border border dark:border-white/10 rounded-border-radius p-3 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-primary/30 transition-all  dark:text-white/80 dark:placeholder:dark:text-white/40"
                    />
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex-1 space-y-2">
                      <Label className="text-sm font-medium text-foreground/40 text-subtitle-color dark:text-white/80  px-1 flex items-center gap-2">
                        <Clock className="w-3 h-3" />
                        {t('duration')}
                      </Label>
                      <div className="flex items-center gap-3 p-2 px-3 rounded-radius border-glass-border border dark:bg-white/3">
                        <Input
                          type="range"
                          min="1"
                          max="10"
                          value={shot.duration}
                          onChange={(e) => updateShot(index, { duration: parseInt(e.target.value) })}
                          className="flex-1 accent-primary h-1.5"
                        />
                        <span className="text-xs font-bold text-primary w-8 text-right">{shot.duration}s</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {shots.length < 4 && (
          <Button
            onClick={addShot}
            disabled={!shots[shots.length - 1].image || !shots[shots.length - 1].prompt.trim()}
            className="h-12 rounded-radius border-glass-border border-2 border-dashed cursor-pointer  bg-foreground/5 dark:bg-white/3 hover:bg-foreground/10 hover:border-primary/30 text-foreground/40 hover:text-primary transition-all gap-2 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-border/30 dark:disabled:hover:border-white/10 disabled:hover:text-foreground/40 dark:disabled:hover:text-white/40 justify-end"
          >
            <Plus className="w-5 h-5 sm:w-5 sm:h-5" />
            <span className="text-xs sm:text-sm font-bold dark:text-white">{t('add_another_shot', { defaultValue: 'Add Another Shot' })}</span>
          </Button>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <Label className="text-base font-bold flex items-center gap-2 text-foreground dark:text-white/90">
        <ImagesIcon className="w-4 h-4 text-primary" />
        {t('source_images', { defaultValue: 'Source Images' })}
      </Label>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        {/* Start Image Slot */}
        <div className="space-y-3">
          <Label className="text-sm font-semibold text-title-color flex items-center gap-2 pl-2">
            {t('start_image', { defaultValue: 'Start Image' })}
          </Label>
          <div
            onClick={() => onOpenPicker('start')}
            className={`relative aspect-video rounded-border-radius border-2 border-dashed transition-all flex flex-col items-center justify-center cursor-pointer overflow-hidden group ${startAttachment
              ? 'border-primary/50 bg-primary/5'
              : 'border-glass-border dark:border-white/10 bg-foreground/5 dark:bg-white/3 hover:border-primary/30 dark:hover:bg-white/3'
              }`}
          >
            {startAttachment ? (
              <>
                <Image
                  src={getMediaUrl(startAttachment.file_path)}
                  width={100}
                  height={100}
                  unoptimized
                  alt="Start Reference"
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Button
                    variant="destructive"
                    size="sm"
                    className="h-8 rounded-full gap-2 px-4 shadow-xl"
                    onClick={(e) => {
                      e.stopPropagation()
                      setStartAttachment(null)
                    }}
                  >
                    <X className="w-4 h-4" /> {t('remove')}
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center gap-2 text-subtitle-color p-4 text-center">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-foreground/5 dark:bg-white/5 flex items-center justify-center mb-1 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                  <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <span className="text-sm font-bold text-subtitle-color">
                  {t('select_start', { defaultValue: 'Select Start Image' })}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* End Image Slot */}
        <div className="space-y-3">
          <Label className="text-sm font-semibold text-title-color flex items-center gap-2 pl-2">
            {t('end_image', { defaultValue: 'End Image (Optional)' })}
          </Label>
          <div
            onClick={() => onOpenPicker('end')}
            className={`relative aspect-video rounded-border-radius border-2  border-dashed transition-all flex flex-col items-center justify-center cursor-pointer overflow-hidden group ${endAttachment
              ? 'border-primary/50 bg-primary/5'
              : 'border-glass-border dark:border-white/10 bg-foreground/5 dark:bg-white/3 hover:border-primary/30  dark:hover:bg-white/3'
              }`}
          >
            {endAttachment ? (
              <>
                <Image
                  src={getMediaUrl(endAttachment.file_path)}
                  width={100}
                  height={100}
                  unoptimized
                  alt="End Reference"
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Button
                    variant="destructive"
                    size="sm"
                    className="h-8 rounded-full gap-2 px-4 shadow-xl"
                    onClick={(e) => {
                      e.stopPropagation()
                      setEndAttachment(null)
                    }}
                  >
                    <X className="w-4 h-4" /> {t('remove')}
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center gap-2 text-subtitle-color p-4 text-center">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-foreground/5 dark:bg-white/5 flex items-center justify-center mb-1 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                  <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <span className="text-sm font-bold text-subtitle-color">{t('select_end', { defaultValue: 'Select End Image' })}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
