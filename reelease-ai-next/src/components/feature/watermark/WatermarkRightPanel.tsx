'use client'

import Label from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { watermarkBlendModes, watermarkPositions } from '@/data/watermark'
import { cn } from '@/lib/utils'
import { WatermarkRightPanelProps } from '@/types/components/features'
import { CornerUpLeft, Settings2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { SliderRow } from './SliderRow'
import { Button } from '@/components/ui/button'

export const WatermarkRightPanel = ({
  opacity,
  scale,
  rotation,
  padding,
  blendMode,
  tiling,
  position,
  onOpacityChange,
  onScaleChange,
  onRotationChange,
  onPaddingChange,
  onBlendModeChange,
  onTilingChange,
  onPositionChange,
  transparent = false,
  hideHeader = false,
}: WatermarkRightPanelProps) => {
  const { t } = useTranslation()

  return (
    <div className={transparent ? 'h-full flex flex-col space-y-8 overflow-y-auto no-scrollbar' : 'glass-card rounded-border-radius dark:bg-white/3 sm:p-6 p-4 space-y-8 h-full border border-glass-border relative overflow-y-auto overflow-x-hidden no-scrollbar flex flex-col lg:h-[700px] bg-white dark:bg-white/3 '}>
      {/* Decorative corner accent */}
      <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-primary/10 rounded-full blur-[80px] -z-10" />

      {!hideHeader && (
        <div className="flex items-center gap-3 pb-4 mb-3 border-b border-glass-border shrink-0">
          <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
            <Settings2 className="w-4 h-4 text-primary" />
          </div>
          <h3 className="text-sm font-black text-title-color dark:text-white">
            {t('refine_overlay', { defaultValue: 'Refine Overlay' })}
          </h3>
        </div>
      )}

      {/* Position Grid */}
      <div
        className={cn(
          'space-y-4 transition-all duration-300 shrink-0',
          tiling ? 'opacity-30 pointer-events-none' : 'opacity-100',
        )}
      >
        <Label className="text-sm font-black text-subtitle-color mb-2">
          {t('anchor_point', { defaultValue: 'Anchor Point' })}
        </Label>
        <div className="grid grid-cols-3 gap-2.5 w-full max-w-[250px]  mx-auto p-3 bg-black/3 dark:bg-white/3 rounded-border-radius border border-glass-border">
          {watermarkPositions.map((pos) => (
            <Button
              key={pos}
              onClick={() => onPositionChange(pos)}
              className={cn(
                'aspect-square h-auto p-0 rounded-border-radius-inner border flex items-center justify-center transition-all duration-300 w-full',
                position === pos
                  ? 'border-primary bg-primary/10 shadow-[0_0_15px_rgba(var(--primary),0.3)] text-primary scale-105'
                  : 'border-glass-border/50 bg-transparent hover:bg-muted/50 hover:border-primary/30 text-muted-foreground hover:text-title-color dark:hover:text-white',
              )}
            >
              {pos === 'center' ? (
                <div className={cn("w-2 h-2 rounded-full", position === pos ? "bg-primary!" : "bg-primary! group-hover/pos:bg-primary")} />
              ) : (
                <CornerUpLeft
                  className={cn(
                    'w-4 h-4 transition-transform duration-500 text-subtitle-color',
                    pos.includes('top-right') && 'rotate-90',
                    pos.includes('bottom-right') && 'rotate-180',
                    pos.includes('bottom-left') && '-rotate-90',
                    pos.includes('center-') && 'opacity-0',
                    pos.includes('-center') && 'opacity-0',
                  )}
                />
              )}
            </Button>
          ))}
        </div>
      </div>

      {/* Sliders Area */}
      <div className="space-y-7 shrink-0">
        <SliderRow label={t('opacity', { defaultValue: 'Opacity' })} value={opacity[0]}>
          <Slider value={opacity} onValueChange={onOpacityChange} max={100} min={5} step={1} className="py-2" />
        </SliderRow>

        <SliderRow label={t('scale', { defaultValue: 'Scale' })} value={scale[0]}>
          <Slider value={scale} onValueChange={onScaleChange} max={100} min={5} step={1} className="py-2" />
        </SliderRow>

        <SliderRow label={t('rotation', { defaultValue: 'Rotation' })} value={rotation[0]} unit="°">
          <Slider value={rotation} onValueChange={onRotationChange} max={180} min={-180} step={5} className="py-2" />
        </SliderRow>

        <div className={cn('transition-all duration-500', tiling ? 'hidden' : 'block')}>
          <SliderRow label={t('edge_inset', { defaultValue: 'Edge Inset' })} value={padding[0]}>
            <Slider value={padding} onValueChange={onPaddingChange} max={40} min={0} step={1} className="py-2" />
          </SliderRow>
        </div>

        {/* Blend Mode */}
        <div className="space-y-3">
          <Label className="text-sm font-black text-subtitle-color">
            {t('blending_logic', { defaultValue: 'Blending Logic' })}
          </Label>
          <Select value={blendMode} onValueChange={onBlendModeChange}>
            <SelectTrigger className="h-12 w-full rounded-2xl border-glass-border bg-black/3 dark:bg-white/3 text-xs font-bold transition-all focus:ring-primary/20">
              <SelectValue placeholder="Normal" />
            </SelectTrigger>
            <SelectContent className="border-glass-border rounded-2xl p-1">
              {watermarkBlendModes.map(({ value, label }) => (
                <SelectItem key={value} value={value} className="text-xs rounded-xl focus:bg-primary/5 focus:text-primary transition-colors cursor-pointer py-2.5">
                  {t(value, { defaultValue: label })}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Tiling Toggle - Enhanced */}
      <div className="shrink-0">
        <div className={cn(
          "flex items-center justify-between p-5 rounded-border-radius border transition-all duration-500",
          tiling
            ? "bg-primary/10 border-primary"
            : "bg-black/3 dark:bg-white/3 border-glass-border hover:border-primary/50"
        )}>
          <div className="space-y-1">
            <Label className={cn(
              "text-sm font-black  cursor-pointer",
              tiling ? "text-black dark:text-white" : "text-title-color dark:text-white"
            )}>
              {t('pattern_mode', { defaultValue: 'Pattern Mode' })}
            </Label>
            <p className={cn(
              "text-[12px] leading-tight font-medium",
              tiling ? "text-black/70 dark:text-subtitle-color" : "text-muted-foreground"
            )}>
              {t('tiling_desc', { defaultValue: 'Cover entire canvas with repeated watermark units' })}
            </p>
          </div>
          <Switch
            checked={tiling}
            onCheckedChange={onTilingChange}
            className={cn(
              "data-[state=checked]:bg-primary data-[state=unchecked]:bg-white",
              tiling ? "border-primary" : ""
            )}
          />
        </div>
      </div>
    </div>
  )
}
