import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FileIcon, Upload, CheckCircle2, AlertCircle, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import Input from '@/components/ui/input'
import { BrandAssetsTabsProps } from '@/types'

export const BrandAssetsTabs = ({
  faviconUrl,
  appIconUrl,
  emailLogoUrl,
  onFileSelect,
  isUpdating
}: BrandAssetsTabsProps) => {
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState<'favicon' | 'app_icon' | 'email_logo'>('favicon')
  const [validationResult, setValidationResult] = useState<{ status: 'idle' | 'success' | 'error'; message: string }>({
    status: 'idle',
    message: ''
  })

  const fileInputRef = React.useRef<HTMLInputElement | null>(null)

  const tabConfig = {
    favicon: {
      key: 'favicon',
      label: 'Favicon',
      desc: 'Browser tab icon representing the website identity.',
      sizes: ['16x16px', '32x32px', '48x48px'],
      accept: '.ico,.png,.svg',
      maxSize: 1024 * 500, // 500KB
      maxSizeLabel: '500KB',
      currentUrl: faviconUrl
    },
    app_icon: {
      key: 'app_icon',
      label: 'App Icon',
      desc: 'Home screen shortcut icon for mobile platforms.',
      sizes: ['120x120px', '180x180px', '512x512px'],
      accept: '.png,.jpg,.jpeg',
      maxSize: 1024 * 1024 * 2, // 2MB
      maxSizeLabel: '2MB',
      currentUrl: appIconUrl
    },
    email_logo: {
      key: 'email_logo',
      label: 'Email Logo',
      desc: 'Horizontal logo attached to transaction emails and updates.',
      sizes: ['300x80px', '600x200px'],
      accept: '.png,.jpg,.jpeg,.gif',
      maxSize: 1024 * 1024 * 1.5, // 1.5MB
      maxSizeLabel: '1.5MB',
      currentUrl: emailLogoUrl
    }
  }

  const currentTab = tabConfig[activeTab]

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Load image offscreen to validate dimensions if image format
    if (file.type.startsWith('image/')) {
      const img = new Image()
      img.onload = () => {
        setValidationResult({
          status: 'success',
          message: t('logo_validated', {
            name: file.name,
            w: img.width,
            h: img.height,
            defaultValue: `File "${file.name}" (${img.width}x${img.height}px) validated successfully.`
          })
        })
        onFileSelect(currentTab.key, file)
      }
      img.onerror = () => {
        setValidationResult({
          status: 'error',
          message: t('invalid_image_format', { defaultValue: 'Invalid or corrupt image format.' })
        })
        onFileSelect(currentTab.key, null)
      }
      img.src = URL.createObjectURL(file)
    } else {
      // Non-image file (e.g. .ico)
      setValidationResult({
        status: 'success',
        message: t('file_accepted', { name: file.name, defaultValue: `File "${file.name}" accepted.` })
      })
      onFileSelect(currentTab.key, file)
    }
  }

  const handleClear = () => {
    onFileSelect(currentTab.key, null)
    setValidationResult({ status: 'idle', message: '' })
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  return (
    <Card className="border-glass-border glass-card bg-white dark:bg-slate-900/40 rounded-border-radius">
      <CardHeader className="p-4 sm:p-5 pb-3 border-b border-glass-border">
        <div className="flex gap-2">
          <div className="text-primary p-1.5 w-10 h-10 flex justify-center items-center rounded-lg bg-primary/10 shrink-0">
            <FileIcon className="w-5 h-5 text-primary" />
          </div>
          <div className="space-y-1">
            <CardTitle className="text-base font-bold text-title-color">
              {t('brand_assets_title', { defaultValue: 'Brand Assets & Icons' })}
            </CardTitle>
            <CardDescription className="text-sm text-subtitle-color">
              {t('brand_assets_desc', { defaultValue: 'Configure specialized icons and favicons for other platform placements.' })}
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 sm:p-5 space-y-4">
        {/* Tabs picker */}
        <div className="flex border-b border-glass-border pb-1">
          {(['favicon', 'app_icon', 'email_logo'] as const).map((tab) => (
            <Button
              key={tab}
              onClick={() => {
                setActiveTab(tab)
                setValidationResult({ status: 'idle', message: '' })
              }}
              variant="ghost"
              className={cn(
                'px-4 py-2 text-xs font-bold transition-all relative border-b-2 mb-[-3px] cursor-pointer rounded-none! h-auto! hover:bg-transparent!',
                activeTab === tab
                  ? 'border-primary text-primary hover:text-primary!'
                  : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              )}
            >
              {tabConfig[tab].label}
            </Button>
          ))}

        </div>

        {/* Tab content body */}
        <div className="space-y-4">
          <p className="text-xs font-medium text-subtitle-color">
            {currentTab.desc}
          </p>

          {/* Size circles display */}
          <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-950/40 border border-glass-border rounded-xl p-4">
            {currentTab.sizes.map((size) => (
              <div key={size} className="flex flex-col items-center gap-1.5">
                <div
                  className="rounded-lg bg-slate-100 dark:bg-slate-900 border border-glass-border flex items-center justify-center overflow-hidden shadow-inner shrink-0"
                  style={{
                    width: size.includes('16x16') ? 32 : size.includes('32x32') ? 40 : 48,
                    height: size.includes('16x16') ? 32 : size.includes('32x32') ? 40 : 48
                  }}
                >
                  {currentTab.currentUrl ? (
                    <img src={currentTab.currentUrl} alt={currentTab.label} className="object-contain max-w-full max-h-full" />
                  ) : (
                    <span className="text-[10px] text-slate-500 dark:text-slate-650 font-bold font-mono">
                      {size.split('x')[0]}
                    </span>
                  )}
                </div>
                <span className="text-[9px] text-slate-400 dark:text-slate-500 font-bold font-mono">{size}</span>
              </div>
            ))}
          </div>

          {/* Upload Box */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-glass-border hover:border-primary/50 bg-slate-50 dark:bg-slate-950/20 hover:bg-slate-100/50 dark:hover:bg-slate-950/40 rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300"
          >
            <Input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept={currentTab.accept}
              className="hidden"
              disabled={isUpdating}
            />


            <Upload className="w-8 h-8 text-primary/70 mb-3" />
            <span className="text-xs font-bold text-slate-705 dark:text-slate-300">
              {t('click_to_upload_asset', { label: currentTab.label, defaultValue: `Upload ${currentTab.label}` })}
            </span>
            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium mt-1">
              {t('upload_asset_requirements', {
                exts: currentTab.accept.replace(/\./g, ' ').toUpperCase(),
                defaultValue: `Accepts ${currentTab.accept.replace(/\./g, ' ').toUpperCase()}`
              })}
            </span>
          </div>

          {/* Validation Result Messages */}
          {validationResult.status !== 'idle' && (
            <div
              className={cn(
                'border p-3.5 rounded-xl flex items-start gap-3 text-xs leading-normal',
                validationResult.status === 'success'
                  ? 'bg-emerald-550/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                  : 'bg-red-500/10 border-red-500/20 text-red-500 dark:text-red-400'
              )}
            >
              {validationResult.status === 'success' ? (
                <CheckCircle2 className="w-4.5 h-4.5 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4.5 h-4.5 shrink-0 mt-0.5" />
              )}
              <div className="flex-1 flex justify-between items-center">
                <span>{validationResult.message}</span>
                <Button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleClear()
                  }}
                  variant="ghost"
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-1 h-auto! w-auto! hover:bg-transparent!"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>

              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
