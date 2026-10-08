import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Input from '@/components/ui/input'
import { BrandColorsProps } from '@/types'
import { Palette, Plus, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { PRESET_PALETTES } from '../data/brandingData'

export const BrandColors = ({
  primaryColor,
  secondaryColor,
  accents,
  onChangePrimary,
  onChangeSecondary,
  onChangeAccents
}: BrandColorsProps) => {
  const { t } = useTranslation()

  const handleApplyPreset = (preset: typeof PRESET_PALETTES[0]) => {
    onChangePrimary(preset.primary)
    onChangeSecondary(preset.secondary)
    onChangeAccents(preset.accents)
  }

  const handleAddAccent = () => {
    if (accents.length >= 8) return
    const newColor = '#6366F1'
    onChangeAccents([...accents, newColor])
  }

  const handleRemoveAccent = (idx: number) => {
    onChangeAccents(accents.filter((_, i) => i !== idx))
  }

  const handleUpdateAccent = (idx: number, val: string) => {
    const updated = [...accents]
    updated[idx] = val
    onChangeAccents(updated)
  }

  return (
    <Card className="border-glass-border glass-card bg-white dark:bg-slate-900/40 rounded-border-radius">
      <CardHeader className="p-4 sm:p-5 border-b border-glass-border">
        <div className="flex gap-2">
          <div className="text-primary p-1.5 w-10 h-10 flex justify-center items-center rounded-lg bg-primary/10 shrink-0">
            <Palette className="w-5 h-5 text-primary" />
          </div>
          <div className="space-y-1">
            <CardTitle className="text-base font-bold text-title-color">
              {t('brand_colors_title', { defaultValue: 'Brand Colors & Palettes' })}
            </CardTitle>
            <CardDescription className="text-sm text-subtitle-color">
              {t('brand_colors_desc', { defaultValue: 'Configure your logo and application theme presets.' })}
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 sm:p-5 space-y-5">
        {/* Preset selections */}
        <div>
          <label className="text-sm font-semibold text-subtitle-color block mb-2">
            {t('color_presets', { defaultValue: 'Preset Themes' })}
          </label>
          <div className="flex flex-wrap gap-2">
            {PRESET_PALETTES.map((preset) => (
              <Button
                key={preset.name}
                type="button"
                onClick={() => handleApplyPreset(preset)}
                variant="ghost"
                className="px-3 py-1.5 rounded-lg border border-glass-border  text-xs font-semibold text-subtitle-color flex items-center gap-2 cursor-pointer transition-all h-auto!"
              >
                <div className="flex items-center -space-x-1 shrink-0">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: preset.primary }} />
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: preset.secondary }} />
                </div>
                {preset.name}
              </Button>
            ))}
          </div>

        </div>

        {/* Brand inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-subtitle-color block mb-1">
              {t('primary_color', { defaultValue: 'Primary Color' })}
            </label>
            <div className="flex items-center gap-2.5">
              <Input
                type="color"
                value={primaryColor}
                onChange={(e) => onChangePrimary(e.target.value)}
                className="w-10! h-10! rounded-xl! border-glass-border! bg-transparent! cursor-pointer shrink-0 p-0! color-swatch-rounded-10"
              />

              <Input
                value={primaryColor}
                onChange={(e) => onChangePrimary(e.target.value)}
                className="h-10 bg-black/3 dark:bg-white/3 border-glass-border text-subtitle-color text-xs font-mono rounded-lg"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-subtitle-color block mb-1">
              {t('secondary_color', { defaultValue: 'Secondary Color' })}
            </label>
            <div className="flex items-center gap-2.5">
              <Input
                type="color"
                value={secondaryColor}
                onChange={(e) => onChangeSecondary(e.target.value)}
                className="w-10! h-10! rounded-xl! border-glass-border! bg-transparent! cursor-pointer shrink-0 p-0! color-swatch-rounded-10"
              />

              <Input
                value={secondaryColor}
                onChange={(e) => onChangeSecondary(e.target.value)}
                className="h-10 bg-black/3 dark:bg-white/3 border-glass-border text-subtitle-color text-xs font-mono rounded-lg"
              />
            </div>
          </div>
        </div>

        {/* Accent Palette */}
        <div className="space-y-2 pt-2 border-t border-glass-border">
          <label className="text-xs font-semibold text-subtitle-color block">
            {t('accent_palette', { defaultValue: 'Accent Palette' })}
          </label>
          <div className="flex flex-wrap items-center gap-3">
            {accents.map((color, idx) => (
              <div key={idx} className="relative group flex items-center justify-center">
                <Input
                  type="color"
                  value={color}
                  onChange={(e) => handleUpdateAccent(idx, e.target.value)}
                  className="w-8! h-8! rounded-full! border-glass-border! bg-transparent! cursor-pointer shrink-0 p-0! color-swatch-rounded-full"
                  style={{ backgroundColor: color }}
                />

                <Button
                  type="button"
                  onClick={() => handleRemoveAccent(idx)}
                  variant="ghost"
                  className="absolute -top-1 -right-1 bg-destructive! text-white! rounded-full! w-4! h-4! p-0! flex items-center justify-center hover:scale-105 cursor-pointer shadow opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive!"
                >
                  <X className="w-2! h-2!" />
                </Button>
              </div>
            ))}

            {accents.length < 8 && (
              <Button
                type="button"
                onClick={handleAddAccent}
                variant="ghost"
                className="w-8! h-8! p-0! rounded-full! border border-dashed border-glass-border flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:border-slate-400 cursor-pointer transition-all hover:bg-transparent!"
                title={t('add_accent_color', { defaultValue: 'Add Accent Color' })}
              >
                <Plus className="w-4 h-4" />
              </Button>
            )}
          </div>

        </div>
      </CardContent>
    </Card>
  )
}
