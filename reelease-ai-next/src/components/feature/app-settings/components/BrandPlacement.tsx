import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { BrandPlacementProps } from '@/types'
import { getMediaUrl } from '@/utils'
import { cn } from '@/lib/utils'
import {
  ChevronDown,
  ChevronUp,
  HelpCircle,
  ShieldCheck,
  Upload,
  Trash2,
  Edit,
  Image as ImageIcon
} from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

export const BrandPlacement = ({
  files,
  settings,
  onFileSelect,
  keysToShow
}: BrandPlacementProps) => {
  const { t } = useTranslation()
  const [openSection, setOpenSection] = useState<string | null>(keysToShow ? keysToShow[0] : 'logo_dark')

  const toggleSection = (key: string) => {
    setOpenSection(openSection === key ? null : key)
  }

  const placements = [
    {
      key: 'logo_dark',
      label: t('dark_logo_label', { defaultValue: 'Dark Mode Logo' }),
      desc: t('dark_logo_desc', { defaultValue: 'Main logo displayed on dark layouts like the auth portal and primary workspace panels.' }),
      useCase: t('dark_logo_usecase', { defaultValue: 'Used in authentication cards and core header components when dark mode is enabled.' }),
      url: settings.logo_dark_url
    },
    {
      key: 'logo_light',
      label: t('light_logo_label', { defaultValue: 'Light Mode Logo' }),
      desc: t('light_logo_desc', { defaultValue: 'Main logo displayed on light layout components and external share interfaces.' }),
      useCase: t('light_logo_usecase', { defaultValue: 'Shown in guest views, invoices, and standard headers when in light mode.' }),
      url: settings.logo_light_url
    },
    {
      key: 'sidebar_logo',
      label: t('sidebar_dark_logo', { defaultValue: 'Sidebar Dark Logo' }),
      desc: t('sidebar_logo_desc', { defaultValue: 'Compact logo used for condensed navigation sidebars on dark mode screens.' }),
      useCase: t('sidebar_logo_usecase', { defaultValue: 'Placed at the top-left of the sidebar when navigation panel is expanded or collapsed.' }),
      url: settings.sidebar_logo_url
    },
    {
      key: 'sidebar_light_logo',
      label: t('sidebar_light_logo_label', { defaultValue: 'Sidebar Light Logo' }),
      desc: t('sidebar_light_logo_desc', { defaultValue: 'Compact logo used for condensed navigation sidebars on light mode screens.' }),
      useCase: t('sidebar_light_logo_usecase', { defaultValue: 'Placed at the top-left of the light sidebar panels.' }),
      url: settings.sidebar_light_logo_url
    },
    {
      key: 'favicon',
      label: t('favicon_label', { defaultValue: 'Favicon Icon' }),
      desc: t('favicon_desc', { defaultValue: 'Small browser tab icon displaying your brand next to the page title.' }),
      useCase: t('favicon_usecase', { defaultValue: 'Appears in search tabs, address bar, bookmarks, and mobile shortcut icons.' }),
      url: settings.favicon_url
    }
  ].filter(p => !keysToShow || keysToShow.includes(p.key))

  return (
    <Card className="border-glass-border glass-card dark:bg-white/3 rounded-border-radius">
      <CardHeader className="p-4 sm:p-5 pb-3 border-b border-glass-border">
        <div className="flex gap-2">
          <div className="text-primary p-1.5 w-10 h-10 flex justify-center items-center rounded-lg bg-primary/10 shrink-0">
            <ShieldCheck className="w-5 h-5 text-primary" />
          </div>
          <div className="space-y-1">
            <CardTitle className="text-base font-bold text-title-color">
              {t('brand_placement_title', { defaultValue: 'Brand Placement' })}
            </CardTitle>
            <CardDescription className="text-sm text-subtitle-color">
              {t('brand_placement_desc', { defaultValue: 'Choose where and how your assets will be used.' })}
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 sm:p-5 space-y-3">
        {placements.map((item) => {
          const isOpen = openSection === item.key
          const fileVal = files[item.key]
          const activeUrl = fileVal === 'null'
            ? null
            : (fileVal instanceof File
              ? URL.createObjectURL(fileVal as File)
              : (item.url ? getMediaUrl(item.url) : null))

          return (
            <div
              key={item.key}
              className="bg-black/3 dark:bg-white/3 border border-glass-border rounded-border-radius-inner overflow-hidden transition-all duration-300"
            >
              <Button
                type="button"
                onClick={() => toggleSection(item.key)}
                variant="ghost"
                className="w-full! h-auto! p-4 flex items-center justify-between text-left cursor-pointer hover:bg-slate-100/50! dark:hover:bg-slate-900/20! rounded-none!"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-slate-100 dark:bg-slate-900 border border-glass-border flex items-center justify-center overflow-hidden shrink-0">
                    {activeUrl ? (
                      <img src={activeUrl} alt={item.label} className="object-contain max-w-full max-h-full p-1" />
                    ) : (
                      <HelpCircle className="w-5 h-5 text-slate-400 dark:text-slate-500" />
                    )}
                  </div>
                  <div className="flex flex-col justify-center">
                    <span className="text-xs font-bold text-title-color block text-left rtl:text-right">{item.label}</span>
                    <span className="text-xs text-subtitle-color font-medium block truncate max-w-[200px] sm:max-w-[280px] text-left rtl:text-right">
                      {item.desc}
                    </span>
                  </div>
                </div>
                {isOpen ? (
                  <ChevronUp className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                )}
              </Button>

              {isOpen && (
                <div className="p-4 pt-0 border-t border-glass-border text-xs leading-relaxed text-subtitle-color space-y-4">
                  {/* File Input */}
                  <input
                    type="file"
                    id={`input-${item.key}`}
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) onFileSelect?.(item.key, file)
                    }}
                  />

                  {/* Logo Preview Container */}
                  <div className="space-y-2 pt-3">
                    <span className="font-semibold text-subtitle-color text-xs block">
                      {t('logo_preview', { defaultValue: 'Logo Preview & Editing:' })}
                    </span>

                    <div
                      onClick={() => {
                        const fileInput = document.getElementById(`input-${item.key}`)
                        if (fileInput) (fileInput as HTMLInputElement).click()
                      }}
                      className={cn(
                        "w-full h-36 rounded-xl flex items-center justify-center border border-dashed border-glass-border cursor-pointer relative overflow-hidden group/preview shadow-inner",
                        (item.key === 'logo_dark' || item.key === 'sidebar_logo')
                          ? "bg-slate-900 border-white/20"
                          : "bg-slate-100 dark:bg-slate-950/20 border-slate-300"
                      )}
                    >
                      {/* Grid background pattern */}
                      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(148,163,184,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.05)_1px,transparent_1px)] bg-[size:12px_12px] opacity-100" />

                      {activeUrl ? (
                        <img
                          src={activeUrl}
                          alt={item.label}
                          className={cn(
                            "object-contain max-w-[85%] max-h-[75%] relative z-10 transition-transform duration-300 group-hover/preview:scale-105",
                            item.key === 'favicon' ? 'w-12 h-12' : 'w-auto'
                          )}
                        />
                      ) : (
                        <div className="flex flex-col items-center gap-1.5 text-slate-400 dark:text-slate-500 relative z-10">
                          <ImageIcon className="w-8 h-8 opacity-60" />
                          <span className="text-[10px] font-semibold">{t('no_logo_uploaded', { defaultValue: 'No logo uploaded' })}</span>
                        </div>
                      )}

                      {/* Click overlay */}
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/preview:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center gap-1 z-20">
                        <Upload className="w-5 h-5 text-white" />
                        <span className="text-base text-white font-bold">
                          {activeUrl ? t('click_to_change', { defaultValue: 'Click to Change' }) : t('click_to_upload', { defaultValue: 'Click to Upload' })}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions Row */}
                  <div className="flex items-center gap-2 pt-1">
                    <Button
                      type="button"
                      onClick={() => {
                        const fileInput = document.getElementById(`input-${item.key}`)
                        if (fileInput) (fileInput as HTMLInputElement).click()
                      }}
                      className="h-8 rounded-lg bg-primary/10! hover:bg-primary/20! text-primary! border border-primary/20! px-3 text-2xs font-bold gap-1 cursor-pointer transition-all"
                    >
                      <Edit className="w-4 h-4" />
                      {activeUrl ? t('edit_logo', { defaultValue: 'Change Logo' }) : t('upload_logo', { defaultValue: 'Upload Logo' })}
                    </Button>

                    {activeUrl && (
                      <Button
                        type="button"
                        onClick={() => onFileSelect?.(item.key, null)}
                        className="h-8 rounded-lg bg-red-500/10! hover:bg-red-500/20! text-red-500! border border-red-500/20! px-3 text-2xs font-bold gap-1 cursor-pointer transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                        {t('remove_logo', { defaultValue: 'Remove' })}
                      </Button>
                    )}
                  </div>

                  <div className="pt-2 font-semibold text-subtitle-color text-xs">
                    {t('placement_usecase', { defaultValue: 'Platform Use Case:' })}
                  </div>
                  <div className="text-xs text-subtitle-color font-medium">{item.useCase}</div>

                  <div className="flex items-center gap-2 pt-1">
                    <span className={cn("inline-block w-2 h-2 rounded-full", activeUrl ? "bg-emerald-500" : "bg-amber-500")} />
                    <span className="text-xs text-subtitle-color font-medium">
                      {activeUrl ? t('status_assigned', { defaultValue: 'Asset Active & Assigned' }) : t('status_pending', { defaultValue: 'Pending Asset Assignment' })}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
