import { Button } from '@/components/ui/button'
import Label from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textArea'
import { watermarkFontFamilies, watermarkFontWeights, watermarkTextColors, watermarkTextStyles } from '@/data/watermark'
import { cn } from '@/lib/utils'
import { WatermarkTextInputProps } from '@/types/components/features'
import { AlignLeft, Italic, Underline } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export const WatermarkTextInput = ({
  text,
  textStyle,
  fontWeight,
  textColor,
  fontFamily,
  isItalic,
  isUnderline,
  onTextChange,
  onTextStyleChange,
  onFontWeightChange,
  onItalicChange,
  onUnderlineChange,
  onTextColorChange,
  onFontFamilyChange,
}: WatermarkTextInputProps) => {
  const { t } = useTranslation()

  return (
    <div className="space-y-6 pt-3">
      {/* Text Input */}
      <div className="space-y-4">
        <div className="flex items-center justify-between pl-1">
          <Label className="text-sm font-black text-subtitle-color">
            {t('watermark_identity', { defaultValue: 'Watermark Identity' })}
          </Label>
          <div className="flex items-center gap-1.5 opacity-50">

            <span className="text-3xs ">{text.length}/40</span>
          </div>
        </div>
        <div className="relative group">
          <Textarea
            value={text}
            onChange={(e) => onTextChange(e.target.value.slice(0, 40))}
            className="w-full min-h-[100px] bg-black/3 dark:bg-white/3 border border-glass-border rounded-border-radius p-5 text-sm font-bold focus:outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all placeholder:text-muted-foreground/30 resize-none group-hover:border-glass-border"
            placeholder={t('enter_watermark_text', { defaultValue: 'Example: @brandname or Confidential' })}
          />
        </div>
      </div>

      {/* Font Configuration */}
      <div className="space-y-5 pt-3">
        <Label className="text-sm font-black text-subtitle-color">
          {t('typography', { defaultValue: 'Typography' })}
        </Label>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2 flex flex-col mb-2">
            <Select value={fontFamily} onValueChange={onFontFamilyChange}>
              <SelectTrigger className="h-12 w-full rounded-2xl border-glass-border/50 bg-black/3 dark:bg-white/3  transition-all text-xs font-bold">
                <SelectValue placeholder="Font Family" />
              </SelectTrigger>
              <SelectContent className="rounded-2xl border-glass-border p-1">
                {watermarkFontFamilies.map((ff) => (
                  <SelectItem
                    key={ff.value}
                    value={ff.value}
                    className="text-xs rounded-xl py-2.5 focus:bg-primary/5 focus:text-primary"
                  >
                    {ff.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Select value={fontWeight} onValueChange={onFontWeightChange}>
              <SelectTrigger className="h-12 w-full rounded-2xl border-glass-border/50 bg-black/3 dark:bg-white/3 transition-all text-xs font-bold">
                <SelectValue placeholder="Font Weight" />
              </SelectTrigger>
              <SelectContent className="rounded-2xl border-glass-border p-1">
                {watermarkFontWeights.map((fw) => (
                  <SelectItem
                    key={fw.value}
                    value={fw.value}
                    className="text-xs rounded-xl py-2.5 focus:bg-primary/5 focus:text-primary"
                  >
                    {fw.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Style & Formatting Toolbar */}
        <div className="grid grid-cols-2 gap-4">
          <Select value={textStyle} onValueChange={onTextStyleChange}>
            <SelectTrigger className="h-12 w-full rounded-2xl border-glass-border/50 bg-black/3 dark:bg-white/3 transition-all text-xs font-bold">
              <SelectValue placeholder="Text Style" />
            </SelectTrigger>
            <SelectContent className="rounded-2xl border-glass-border p-1">
              {watermarkTextStyles.map((ts) => (
                <SelectItem
                  key={ts.value}
                  value={ts.value}
                  className="text-xs rounded-xl py-2.5 focus:bg-primary/5 focus:text-primary"
                >
                  {ts.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex items-center gap-2 p-1.5 bg-black/3 dark:bg-white/3 border border-glass-border rounded-2xl h-12">
            <Button
              onClick={() => onItalicChange(!isItalic)}
              className={cn(
                'flex-1 p-0! w-[unset]! bg-[unset]! h-full flex items-center justify-center rounded-border-radius transition-all duration-300',
                isItalic ? 'bg-primary! text-white!' : 'dark:hover:bg-white/5! hover:bg-black/3! text-subtitle-color!',
              )}
            >
              <Italic className="w-4 h-4" />
            </Button>
            <Button
              onClick={() => onUnderlineChange(!isUnderline)}
              className={cn(
                'flex-1 p-0! w-[unset]! bg-[unset]! h-full flex items-center justify-center rounded-border-radius transition-all duration-300',
                isUnderline ? 'bg-primary! text-white!' : 'dark:hover:bg-white/5! hover:bg-black/3! text-subtitle-color!',
              )}
            >
              <Underline className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Color Palette */}
      <div className="space-y-4 pt-3">
        <Label className="text-sm font-black text-subtitle-color">
          {t('visual_theme', { defaultValue: 'Visual Theme' })}
        </Label>
        <div className="grid grid-cols-6 gap-3">
          {watermarkTextColors.map((color) => (
            <Button
              key={color.value}
              onClick={() => onTextColorChange(color.value)}
              className={cn(
                'group p-0! relative aspect-square rounded-full flex items-center justify-center transition-all duration-500',
                textColor === color.value ? 'border-2 border-primary' : 'border-transparent hover:scale-105',
              )}
              title={color.label}
            >
              <div
                className={cn(
                  'w-full h-full rounded-full border shadow-2xl transition-all duration-500',
                  color.css,
                  textColor === color.value
                    ? ''
                    : 'border-white/10',
                )}
              />
              {textColor === color.value && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary animate-ping" />
                </div>
              )}
            </Button>
          ))}
        </div>
      </div>
    </div>
  )
}
