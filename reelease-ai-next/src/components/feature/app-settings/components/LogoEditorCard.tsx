import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Input from '@/components/ui/input'
import Label from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { cn } from '@/lib/utils'
import { LogoBackgroundType, LogoEditorCardProps, LogoLayout } from '@/types/components/branding'
import { AlertTriangle, Sparkles, Type, Upload } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { DESIGNER_SYMBOLS, FONT_FAMILIES } from '../data/brandingData'

export const LogoEditorCard = ({
  config,
  setConfig,
  primaryColor,
  secondaryColor,
  customFileRef,
  handleCustomSymbolUpload,
  validationWarning
}: LogoEditorCardProps) => {
  const { t } = useTranslation()

  return (
    <Card className="border-glass-border glass-card bg-white dark:bg-slate-900/40 rounded-border-radius">
      <CardHeader className="p-4 sm:p-5 border-b border-glass-border">
        <div className="flex gap-2">
          <div className="text-primary p-1.5 w-10 h-10 flex justify-center items-center rounded-lg bg-primary/10 shrink-0">
            <Sparkles className="w-5 h-5 text-primary" />
          </div>
          <div className="space-y-1">
            <CardTitle className="text-md font-bold text-title-color mb-0!">
              {t('logo_designer_title', { defaultValue: 'Interactive Logo Design' })}
            </CardTitle>
            <CardDescription className="text-sm text-subtitle-color">
              {t('logo_designer_subtitle', { defaultValue: 'Choose shapes, adjust colors, and build your branding asset.' })}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 sm:p-5 space-y-5">
        {/* Shapes selection */}
        <div>
          <Label className="text-xs font-semibold text-title-color block mb-2">
            {t('select_symbol_shape', { defaultValue: 'Select Logo Symbol' })}
          </Label>
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-2.5">
            {DESIGNER_SYMBOLS.map((symbol) => {
              const IconComponent = symbol.icon
              return (
                <Button
                  key={symbol.id}
                  type="button"
                  onClick={() => setConfig(prev => ({ ...prev, symbolId: symbol.id }))}
                  variant="ghost"
                  className={cn(
                    'w-full! aspect-square p-2! rounded-border-radius-inner border-glass-border flex items-center justify-center border transition-all duration-300 cursor-pointer h-auto!',
                    config.symbolId === symbol.id
                      ? 'border-primary bg-primary/10! text-primary! scale-105 hover:bg-primary/10!'
                      : 'border-glass-border bg-subcard dark:bg-white/3'
                  )}
                  title={symbol.name}
                >
                  <IconComponent className="sm:w-7! w-5! sm:h-7! h-5!" strokeWidth={1.4} />
                </Button>
              )
            })}

            <Button
              type="button"
              onClick={() => customFileRef.current?.click()}
              variant="ghost"
              className={cn(
                'w-full! aspect-square rounded-border-radius-inner flex flex-col items-center justify-center border transition-all duration-300 cursor-pointer relative h-auto!',
                config.symbolId === 'custom'
                  ? 'border-primary bg-primary/10! text-primary! scale-105 hover:bg-primary/10!'
                  : 'border-glass-border bg-subcard dark:bg-white/3! text-subtitle-color'
              )}
              title={t('upload_custom_symbol', { defaultValue: 'Upload Custom Symbol' })}
            >
              <Input
                type="file"
                ref={customFileRef}
                onChange={handleCustomSymbolUpload}
                accept="image/*"
                className="hidden"
              />

              {config.symbolId === 'custom' && config.customSymbolUrl ? (
                <img src={config.customSymbolUrl} alt="Custom" className="w-8 h-8 object-contain rounded-md" />
              ) : (
                <>
                  <Upload className="w-6 h-6 mb-1" />
                  <span className="text-3xs mt-0! text-subtitle-color">{t('custom_symbol', { defaultValue: 'Custom' })}</span>
                </>
              )}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {/* Text settings */}
          <div className="space-y-4">
            <div className="space-y-1">
              <Label className="text-xs font-semibold text-title-color block mb-2">
                {t('brand_text', { defaultValue: 'Brand Text' })}
              </Label>
              <div className="relative">
                <Type className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-550 dark:text-slate-500" />
                <Input
                  value={config.text}
                  onChange={(e) => setConfig(prev => ({ ...prev, text: e.target.value }))}
                  className="pl-9 h-10 bg-slate-50 dark:bg-slate-950/40 border-glass-border text-slate-900 dark:text-white rounded-lg text-xs"
                  placeholder={t('enter_brand_name', { defaultValue: 'Enter brand name' })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-semibold text-title-color block mb-1">
                  {t('font_family', { defaultValue: 'Font Family' })}
                </Label>
                <Select
                  value={config.fontFamily}
                  onValueChange={(val) => setConfig(prev => ({ ...prev, fontFamily: val }))}
                >
                  <SelectTrigger className="w-full h-10 px-3 bg-slate-50 dark:bg-slate-950/40 border border-glass-border text-slate-900 dark:text-white rounded-lg text-xs cursor-pointer focus:outline-none">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {FONT_FAMILIES.map(font => (
                      <SelectItem key={font.id} value={font.id}>
                        {font.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs font-semibold text-title-color block mb-1">
                  {t('font_weight', { defaultValue: 'Font Weight' })}
                </Label>
                <Select
                  value={config.fontWeight}
                  onValueChange={(val) => setConfig(prev => ({ ...prev, fontWeight: val }))}
                >
                  <SelectTrigger className="w-full h-10 px-3 bg-slate-50 dark:bg-slate-950/40 border border-glass-border text-slate-900 dark:text-white rounded-lg text-xs cursor-pointer focus:outline-none">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="300">{t('light', { defaultValue: 'Light' })}</SelectItem>
                    <SelectItem value="500">{t('medium', { defaultValue: 'Medium' })}</SelectItem>
                    <SelectItem value="700">{t('bold', { defaultValue: 'Bold' })}</SelectItem>
                    <SelectItem value="800">{t('extra_bold', { defaultValue: 'Extra Bold' })}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Layout and background style */}
          <div className="space-y-4">
            <div>
              <Label className="text-xs font-semibold text-title-color block mb-2">
                {t('logo_layout', { defaultValue: 'Layout Style' })}
              </Label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 border border-glass-border p-2 sm:rounded-full rounded-md " >
                {(['horizontal', 'vertical', 'icon-only', 'text-only'] as LogoLayout[]).map((layout) => (
                  <Button
                    key={layout}
                    type="button"
                    onClick={() => setConfig(prev => ({ ...prev, layout }))}
                    variant="ghost"
                    className={cn(
                      'h-10! rounded-lg! font-semibold  capitalize cursor-pointer transition-all w-auto!',
                      config.layout === layout
                        ? 'primary-btn text-white!'
                        : 'bg-black/3 dark:bg-white/3 '
                    )}
                  >
                    {t(layout.replace('-', '_'), { defaultValue: layout.replace('-', ' ') })}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <Label className="text-xs font-semibold text-title-color block mb-1">
                {t('logo_background', { defaultValue: 'Logo Canvas Background' })}
              </Label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 border border-glass-border p-2 sm:rounded-full rounded-md">
                {(['transparent', 'dark', 'light'] as LogoBackgroundType[]).map((bgType) => (
                  <Button
                    key={bgType}
                    type="button"
                    onClick={() => setConfig(prev => ({ ...prev, bgType }))}
                    variant="ghost"
                    className={cn(
                      'h-10! rounded-lg! font-semibold  capitalize cursor-pointer transition-all w-auto!',
                      config.bgType === bgType
                        ? 'primary-btn text-white!'
                        : 'bg-black/3 dark:bg-white/3 '
                    )}
                  >
                    {t(bgType, { defaultValue: bgType })}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Range adjustments */}
        <div className="space-y-4 pt-[15px] border-t border-glass-border">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <Label className="text-xs font-semibold text-title-color">
                  {t('icon_size', { defaultValue: 'Icon Size' })}
                </Label>
                <span className="text-3xs font-mono text-primary bg-primary/10 px-2 py-0.5 rounded-md">{config.iconSize}px</span>
              </div>
              <Slider
                min={16}
                max={120}
                step={1}
                value={[config.iconSize]}
                onValueChange={(val) => setConfig(prev => ({ ...prev, iconSize: val[0] }))}
                className="w-full pt-1"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <Label className="text-xs font-semibold text-title-color">
                  {t('font_size', { defaultValue: 'Text Font Size' })}
                </Label>
                <span className="text-3xs font-mono text-primary bg-primary/10 px-2 py-0.5 rounded-md">{config.fontSize}px</span>
              </div>
              <Slider
                min={14}
                max={80}
                step={1}
                value={[config.fontSize]}
                onValueChange={(val) => setConfig(prev => ({ ...prev, fontSize: val[0] }))}
                className="w-full pt-1"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <Label className="text-xs font-semibold text-title-color">
                  {t('border_radius', { defaultValue: 'Canvas Roundnes' })}
                </Label>
                <span className="text-3xs font-mono text-primary bg-primary/10 px-2 py-0.5 rounded-md">{config.borderRadius}px</span>
              </div>
              <Slider
                min={0}
                max={64}
                step={1}
                disabled={config.bgType === 'transparent'}
                value={[config.borderRadius]}
                onValueChange={(val) => setConfig(prev => ({ ...prev, borderRadius: val[0] }))}
                className="w-full pt-1"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {/* Colors custom palette picker */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label className="text-xs font-semibold text-title-color">
                  {t('text_color_type', { defaultValue: 'Text Color Style' })}
                </Label>
                <div className="flex  p-0.5 rounded-lg border border-glass-border">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setConfig(prev => ({ ...prev, textGradientEnabled: false }))}
                    className={cn(
                      'px-2 py-1.5 rounded-md! text-2xs font-bold transition-all h-auto! w-auto!',
                      !config.textGradientEnabled
                        ? 'primary-btn text-white!'
                        : 'text-title-color bg-black/3 dark:bg-white/3'
                    )}
                  >
                    {t('solid_color', { defaultValue: 'Solid Color' })}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setConfig(prev => ({ ...prev, textGradientEnabled: true }))}
                    className={cn(
                      'px-2.5 py-1.5 rounded-md! text-2xs font-bold transition-all h-auto! w-auto!',
                      config.textGradientEnabled
                        ? 'primary-btn text-white!'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-transparent!'
                    )}
                  >
                    {t('gradient', { defaultValue: 'Gradient' })}
                  </Button>
                </div>
              </div>

              {!config.textGradientEnabled ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Input
                      type="color"
                      value={config.textColor}
                      onChange={(e) => setConfig(prev => ({ ...prev, textColor: e.target.value }))}
                      className="w-8! h-8! rounded-full! border-glass-border! bg-transparent! cursor-pointer shrink-0 p-0! color-swatch-rounded-full"
                    />

                    <Input
                      value={config.textColor}
                      onChange={(e) => setConfig(prev => ({ ...prev, textColor: e.target.value }))}
                      className="h-8 bg-slate-50 dark:bg-slate-950/40 border-glass-border text-slate-900 dark:text-white text-[10px] font-mono rounded"
                    />
                  </div>

                  {/* Brand presets */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <span className="text-xs text-subtitle-color font-normal">{t('quick_colors', { defaultValue: 'Quick Colors:' })}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setConfig(prev => ({ ...prev, textColor: primaryColor }))}
                      className="h-9! px-2! text-2xs font-semibold rounded border border-glass-border bg-black/3 dark:bg-white/3"
                      title="Primary Brand Color"
                    >
                      <div className="w-2 h-2 rounded-full  shrink-0" style={{ backgroundColor: primaryColor }} />
                      {t('primary', { defaultValue: 'Primary' })}
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setConfig(prev => ({ ...prev, textColor: secondaryColor }))}
                      className="h-9! px-2! text-2xs font-semibold rounded border border-glass-border bg-black/3 dark:bg-white/3"
                      title="Secondary Brand Color"
                    >
                      <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: secondaryColor }} />
                      {t('secondary', { defaultValue: 'Secondary' })}
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setConfig(prev => ({ ...prev, textColor: '#FFFFFF' }))}
                      className="h-9! px-2! text-2xs font-semibold rounded border border-glass-border "
                    >
                      {t('white', { defaultValue: 'White' })}
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setConfig(prev => ({ ...prev, textColor: '#0F172A' }))}
                      className=" h-9! px-2! text-2xs font-semibold rounded border border-glass-border "
                    >
                      {t('dark', { defaultValue: 'Dark' })}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-xs text-subtitle-color bg-black/3 dark:bg-white/3 p-2.5 rounded-border-radius-inner border border-dashed border-glass-border">
                  {t('text_gradient_enabled_desc', { defaultValue: 'Text is now using the Brand Palette gradient (Primary to Secondary Color).' })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Validation warnings box */}
        {validationWarning && (
          <div className="bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-550 text-[11px] p-3 rounded-lg flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{validationWarning}</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
