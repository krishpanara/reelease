import React from 'react'
import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import Label from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { LogoPreviewCardProps } from '@/types/components/branding'
import { Check, Download, Image as ImageIcon } from 'lucide-react'
import DOMPurify from 'dompurify'

export const LogoPreviewCard = ({
  config,
  targetKey,
  setTargetKey,
  onApply,
  onDownload,
  getSvgMarkup
}: LogoPreviewCardProps) => {
  const { t } = useTranslation()

  return (
    <Card className="border-glass-border glass-card bg-white dark:bg-slate-900/40 rounded-border-radius">
      <CardHeader className="p-4 sm:p-5 border-b border-glass-border">
        <CardTitle className="text-base font-bold flex items-center gap-2 text-slate-800 dark:text-white">
          <ImageIcon className="w-4 h-4 text-primary" />
          {t('designer_preview', { defaultValue: 'Real-time Preview' })}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 sm:p-5 flex flex-col items-center space-y-6">
        {/* Visual preview box */}
        <div className="w-full 2xl:min-h-[400px] xl:min-h-[300px] lg:min-h-[200px] min-h-[100px] border border-glass-border rounded-2xl flex items-center justify-center p-6 relative overflow-hidden bg-subcard-color shadow-inner group">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:16px_16px] opacity-40 dark:opacity-20" />
          <div
            className={cn(
              "w-full max-w-[280px] shadow-lg flex items-center justify-center relative z-10 transition-all duration-300 [&>svg]:w-full [&>svg]:h-full",
              (config.layout === 'horizontal' || config.layout === 'text-only') ? 'aspect-[4/1]' : (config.layout === 'vertical' ? 'aspect-[4/5]' : 'aspect-square')
            )}
            style={{
              backgroundColor: config.bgType === 'dark' ? '#0F172A' : config.bgType === 'light' ? '#FFFFFF' : 'transparent',
              borderRadius: `${config.borderRadius}px`,
              border: config.bgType === 'transparent' ? '1px dashed rgba(0,0,0,0.15)' : 'none'
            }}
            dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(
                getSvgMarkup(
                  280,
                  (config.layout === 'horizontal' || config.layout === 'text-only') ? 70 : (config.layout === 'vertical' ? 350 : 280),
                ),
                { USE_PROFILES: { svg: true } }
              )
            }}
          />
        </div>

        {/* Apply selector */}
        <div className="w-full space-y-5">
          <div>
            <Label className="text-sm font-semibold text-subtitle-color block mb-1.5">
              {t('assign_logo_to', { defaultValue: 'Assign Brand Asset' })}
            </Label>
            <Select
              value={targetKey}
              onValueChange={(val) => setTargetKey(val)}
            >
              <SelectTrigger className="w-full h-10 px-3 bg-slate-50 dark:bg-slate-950/40 border border-glass-border text-slate-900 dark:text-white rounded-lg text-xs cursor-pointer focus:outline-none">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="logo_dark">{t('dark_logo_label', { defaultValue: 'Dark Mode Logo' })}</SelectItem>
                <SelectItem value="logo_light">{t('light_logo_label', { defaultValue: 'Light Mode Logo' })}</SelectItem>
                <SelectItem value="sidebar_logo">{t('sidebar_dark_logo', { defaultValue: 'Sidebar Dark Logo' })}</SelectItem>
                <SelectItem value="sidebar_light_logo">{t('sidebar_light_logo_label', { defaultValue: 'Sidebar Light Logo' })}</SelectItem>
                <SelectItem value="favicon">{t('favicon_label', { defaultValue: 'Favicon Icon' })}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2 w-full">
            <Button
              onClick={onApply}
              variant="default"
              className="flex-1 h-10 rounded-xl primary-btn text-white dark:text-white text-xs font-bold gap-1.5 cursor-pointer shadow-md"
            >
              <Check className="w-4 h-4" />
              {t('apply_logo', { defaultValue: 'Apply Logo' })}
            </Button>
            <Button
              onClick={onDownload}
              variant="outline"
              className="h-10 w-10 p-0! rounded-xl border-glass-border bg-slate-50  dark:bg-transparent dark:hover:bg-white/10 text-slate-700 dark:text-white cursor-pointer"
              title={t('download_png', { defaultValue: 'Download PNG' })}
            >
              <Download className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
