import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { aiVideoTools, videoGenerationOptions } from '@/data/features'
import { cn } from '@/lib/utils'
import { VideoGenerationOptionsProps } from '@/types/components/features'
import {
  Clock,
  Layout,
  Volume2,
  VolumeX,
  Zap
} from 'lucide-react'
import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'

export const VideoGenerationOptions = ({
  aspectRatio,
  setAspectRatio,
  duration,
  setDuration,
  mode,
  setMode,
  sound,
  setSound,
  hideDuration = false,
}: VideoGenerationOptionsProps) => {
  const { t } = useTranslation()
  const aspectRatioContainerRef = useRef<HTMLDivElement>(null)
  const modeContainerRef = useRef<HTMLDivElement>(null)

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

  useEffect(() => {
    if (!modeContainerRef.current) return
    const activeButton = modeContainerRef.current.querySelector('[data-active="true"]')
    if (activeButton) {
      activeButton.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center',
      })
    }
  }, [mode])

  return (
    <div className="space-y-6">
      <div className={`grid grid-cols-1 gap-6 ${hideDuration ? 'md:grid-cols-1' : 'md:grid-cols-2'}`}>
        {/* Aspect Ratio */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <div className="text-sm font-bold flex items-center gap-2 text-foreground dark:text-white/90">
              <Layout className="w-5 h-5 text-primary" />
              {t('aspect_ratio', { defaultValue: 'Aspect Ratio' })}
            </div>
            <span className="text-xs uppercase tracking-wider">
              {aspectRatio}
            </span>
          </div>

          <div className="overflow-x-auto no-scrollbar py-1">
            <div ref={aspectRatioContainerRef} className="flex sm:grid sm:grid-cols-3 gap-3 w-max sm:w-full min-w-full">
              {aiVideoTools.map((option) => (
                <Button
                  key={option.value}
                  data-active={aspectRatio === option.value ? 'true' : 'false'}
                  onClick={() => setAspectRatio(option.value)}
                  className={`group/btn h-12 rounded-xl border px-2 py-px text-xs font-semibold flex items-center justify-center gap-2 transition-all shrink-0 w-28 sm:w-auto ${aspectRatio === option.value
                    ? 'text-primary dark:text-primary border-primary shadow-[0_0_15px_rgba(167,139,250,0.15)] font-bold'
                    : 'bg-foreground/5 dark:bg-white/4 border-border  hover:bg-foreground/10 dark:hover:bg-white/10 hover:border-border/50 dark:hover:border-white/10'
                    }`}
                >
                  {aspectRatio === option.value && (
                    <div className="absolute inset-0" />
                  )}
                  <option.icon
                    className={`w-4 h-4 sm:w-5! sm:h-5! transition-transform duration-300 group-hover/btn:scale-110 ${aspectRatio === option.value ? 'text-primary' : 'text-foreground/40 dark:text-white/40'}`}
                  />
                  <span
                    className={`sm:text-xs text-xs font-bold  tracking-tighter transition-colors ${aspectRatio === option.value ? 'text-primary ' : 'text-foreground/40 dark:text-white/40'}`}
                  >
                    {option.label}
                  </span>
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Duration */}
        {!hideDuration && (
          <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <div className="text-sm font-bold flex items-center gap-2 text-foreground dark:text-white/90">
                <Clock className="w-5 h-5 text-primary" />
                {t('duration', { defaultValue: 'Duration' })}
              </div>
              <div className="px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-black tracking-widest border border-primary/20">
                {duration}s
              </div>
            </div>
            <div className="p-5 rounded-border-radius border border-glass-border dark:bg-white/3 flex flex-col gap-5">
              <Slider
                value={[duration]}
                onValueChange={(vals) => setDuration(vals[0])}
                min={3}
                max={15}
                step={1}
                className="cursor-pointer"
              />
              <div className="flex justify-between px-1">
                <span className="text-[12px] font-semibold text-foreground/40 dark:text-white/40">3s</span>
                <span className="text-[12px] font-semibold text-foreground/40 dark:text-white/40">15s</span>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-4">
        {/* Mode */}
        <div className="space-y-4">
          <div className="text-sm font-bold flex items-center gap-2 text-foreground dark:text-white/90 px-1">
            <Zap className="w-4 h-4 text-primary" />
            {t('mode', { defaultValue: 'Mode' })}
          </div>
          <div className="overflow-x-auto no-scrollbar py-1">
            <div ref={modeContainerRef} className="flex gap-2 w-max sm:w-full min-w-full">
              {videoGenerationOptions.map((option) => (
                <Button
                  key={option.value}
                  data-active={mode === option.value ? 'true' : 'false'}
                  onClick={() => setMode(option.value)}
                  className={`relative flex-1 shrink-0 w-28 sm:w-auto h-12! dark:bg-white/5 rounded-radius transition-all duration-300 flex items-center justify-center gap-2 border font-bold text-[12px] overflow-hidden dark:bg-white/5 ${mode === option.value
                    ? ' border-primary text-primary shadow-[0_0_20px_rgba(167,139,250,0.1)]'
                    : 'bg-black/3!  border-border/30 dark:border-white/5 text-foreground/40 dark:text-white/40 hover:bg-foreground/10 dark:hover:bg-white/10'
                    }`}
                >
                  {mode === option.value && (
                    <div className="absolute inset-0 text-primary" />
                  )}
                  <option.icon
                    className={cn(
                      'w-4 sm:w-5 h-4 sm:h-5 transition-all',
                      mode === option.value ? 'text-primary scale-110' : 'text-foreground/40 dark:text-white/40',
                    )}
                  />
                  <span className="relative z-10 font-semibold">{option.label}</span>
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Sound Toggle */}
        <div className="space-y-4">
          <div className="text-sm font-bold flex items-center gap-2 text-title-color px-1">
            <Volume2 className="w-5 h-5 text-primary" />
            {t('sound', { defaultValue: 'Sound' })}
          </div>
          <div className="h-12 px-5 rounded-border-radius border border-glass-border dark:border-white/10 flex items-center justify-between transition-all   group">
            <div className="flex items-center gap-2">
              {sound ? <Volume2 className="w-4 h-4 text-primary" /> : <VolumeX className="w-4 h-4 text-foreground/40 dark:text-white/40" />}
              <span
                className={`text-[10px] font-bold uppercase tracking-widest transition-colors ${sound ? 'text-primary' : 'text-foreground/40 dark:text-white/40'}`}
              >
                {sound ? 'On' : 'Off'}
              </span>
            </div>
            <Switch
              checked={sound}
              onCheckedChange={setSound}
              className="data-[state=checked]:bg-primary transition-all scale-110"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
