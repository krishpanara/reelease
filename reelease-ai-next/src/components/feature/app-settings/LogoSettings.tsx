'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import Spinner from '@/components/reusable/Spinner'
import { Button } from '@/components/ui/button'
import { useGetAdminSettingsQuery, useUpdateAdminSettingsMutation } from '@/redux/api/adminSettingApi'
import { ApiError } from '@/types'
import { Loader2, Save, Sparkles, Info, Palette, UploadCloud, Eye, Monitor, Menu, X } from 'lucide-react'
import { getMediaUrl } from '@/utils'
import { AnimatePresence, motion } from 'framer-motion'
// Components & Data
import { DESIGNER_SYMBOLS, FONT_FAMILIES } from './data/brandingData'
import { LogoEditorCard } from './components/LogoEditorCard'
import { LogoPreviewCard } from './components/LogoPreviewCard'
import { BrandColors } from './components/BrandColors'
import { BrandPlacement } from './components/BrandPlacement'
import { LivePreview } from './components/LivePreview'
import { LogoDesignConfig } from '@/types/components/branding'

const DEFAULT_PRIMARY_COLOR = '#6366F1'
const DEFAULT_SECONDARY_COLOR = '#22D3EE'

const TABS = [
  {
    id: 'designer',
    labelKey: 'logo_designer_title',
    defaultLabel: 'Logo Designer',
    descKey: 'logo_designer_desc',
    defaultDesc: 'Interactive logo editor',
    icon: Sparkles,
  },
  {
    id: 'colors',
    labelKey: 'brand_colors_title',
    defaultLabel: 'Brand Colors',
    descKey: 'brand_colors_desc',
    defaultDesc: 'Manage colors & theme',
    icon: Palette,
  },
  {
    id: 'uploads_core',
    labelKey: 'core_logos_title',
    defaultLabel: 'Core Workspace Logos',
    descKey: 'core_logos_desc',
    defaultDesc: 'Upload main platform logos',
    icon: UploadCloud,
  },
  {
    id: 'uploads_nav',
    labelKey: 'nav_icons_title',
    defaultLabel: 'Sidebar & Browser Icons',
    descKey: 'nav_icons_desc',
    defaultDesc: 'Upload sidebar & browser icons',
    icon: Eye,
  },
  {
    id: 'preview',
    labelKey: 'live_preview_title',
    defaultLabel: 'Live Preview Simulator',
    descKey: 'live_preview_desc',
    defaultDesc: 'Interactive workspace simulation',
    icon: Monitor,
  },
]
const DEFAULT_ACCENT_COLORS = ['#818CF8', '#A5B4FC', '#C7D2FE', '#E0E7FF']

const isColorEqual = (c1?: string | null, c2?: string | null) => {
  if (!c1 || !c2) return c1 === c2
  return c1.toLowerCase() === c2.toLowerCase()
}

const isAccentColorsEqual = (arr1: string[], arr2String?: string | null) => {
  if (!arr2String) return false
  try {
    const arr2 = JSON.parse(arr2String)
    if (!Array.isArray(arr2)) return false
    if (arr1.length !== arr2.length) return false
    return arr1.every((c, i) => c.toLowerCase() === arr2[i]?.toLowerCase())
  } catch (e) {
    return false
  }
}

const LogoSettings = () => {
  const { t } = useTranslation()
  const { data: settingsData, isLoading: isFetching } = useGetAdminSettingsQuery(undefined)
  const [updateSettings, { isLoading: isUpdating }] = useUpdateAdminSettingsMutation()

  const [files, setFiles] = useState<Record<string, File | 'null' | null>>({})
  const [liveLogo, setLiveLogo] = useState<{ url: string; target: string } | null>(null)
  const [saveVersion, setSaveVersion] = useState(0)
  const [activeTab, setActiveTab] = useState('designer')
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Brand colors local state (initialized from settings or defaults)
  const [primaryColor, setPrimaryColor] = useState<string>(DEFAULT_PRIMARY_COLOR)
  const [secondaryColor, setSecondaryColor] = useState<string>(DEFAULT_SECONDARY_COLOR)
  const [accents, setAccents] = useState<string[]>(DEFAULT_ACCENT_COLORS)

  const settings = settingsData?.settings || {}

  // Sync colors from settings if available
  useEffect(() => {
    if (settings.primary_color) {
      setPrimaryColor(settings.primary_color)
    }
    if (settings.secondary_color) {
      setSecondaryColor(settings.secondary_color)
    }
    if (settings.accent_colors) {
      try {
        const parsed = JSON.parse(settings.accent_colors)
        if (Array.isArray(parsed)) {
          setAccents(parsed)
        }
      } catch (e) {
        // Fallback or ignore
      }
    }
  }, [settingsData])

  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const customFileRef = useRef<HTMLInputElement | null>(null)

  const [logoConfig, setLogoConfig] = useState<LogoDesignConfig>({
    symbolId: 'sleek_r',
    text: 'ReelEase AI',
    fontFamily: 'outfit',
    fontWeight: '800',
    fontSize: 32,
    textColor: '#FFFFFF',
    textGradientEnabled: false,
    iconSize: 48,
    iconColor: primaryColor,
    gradientEnabled: true,
    gradientColor: secondaryColor,
    layout: 'horizontal',
    bgType: 'dark',
    borderRadius: 12,
    padding: 24
  })

  const [targetKey, setTargetKey] = useState<string>('logo_dark')
  const [validationWarning, setValidationWarning] = useState<string | null>(null)

  useEffect(() => {
    setLogoConfig(prev => ({
      ...prev,
      iconColor: primaryColor,
      gradientColor: secondaryColor
    }))
  }, [primaryColor, secondaryColor])

  const activeSymbol = DESIGNER_SYMBOLS.find(s => s.id === logoConfig.symbolId) || DESIGNER_SYMBOLS[0]

  const getSvgMarkup = (width: number, height: number, forExport = false) => {
    const bgFill = logoConfig.bgType === 'dark' ? '#0F172A' : logoConfig.bgType === 'light' ? '#FFFFFF' : 'none'
    const rx = logoConfig.borderRadius * (width / 512)

    let iconContent = ''
    if (logoConfig.symbolId === 'custom' && logoConfig.customSymbolUrl) {
      iconContent = `<image href="${logoConfig.customSymbolUrl}" width="24" height="24" />`
    } else {
      const iconStroke = logoConfig.gradientEnabled ? 'url(#logoGradient)' : logoConfig.iconColor
      iconContent = activeSymbol.svgContent.replace(/currentColor/g, iconStroke)
    }

    const isHorizontal = logoConfig.layout === 'horizontal'
    const isVertical = logoConfig.layout === 'vertical'
    const isIconOnly = logoConfig.layout === 'icon-only'
    const isTextOnly = logoConfig.layout === 'text-only'

    const textFill = logoConfig.textGradientEnabled ? 'url(#logoGradient)' : logoConfig.textColor

    let contentHtml = ''

    if (isIconOnly) {
      const baseSize = width * 0.85
      const sizeMultiplier = logoConfig.iconSize / 120
      const size = baseSize * (0.4 + sizeMultiplier * 0.6)
      const scale = size / 24
      const x = (width - size) / 2
      const y = (height - size) / 2
      contentHtml = `
        <g transform="translate(${x}, ${y}) scale(${scale})">
          ${iconContent}
        </g>
      `
    } else if (isTextOnly) {
      const fontCls = FONT_FAMILIES.find(f => f.id === logoConfig.fontFamily)?.name || 'sans-serif'
      const baseFontSize = width * 0.15
      const sizeMultiplier = logoConfig.fontSize / 80
      const scaledFontSize = baseFontSize * (0.5 + sizeMultiplier * 1.5)

      const maxAvailableWidth = width - (logoConfig.padding * 2 * (width / 512))
      const maxAvailableHeight = height - (logoConfig.padding * 2 * (height / 512))

      const textWidthEst = scaledFontSize * logoConfig.text.length * 0.6
      let finalScale = 1

      if (textWidthEst > maxAvailableWidth) {
        finalScale = maxAvailableWidth / textWidthEst
      }
      if (scaledFontSize * finalScale > maxAvailableHeight) {
        finalScale = Math.min(finalScale, maxAvailableHeight / scaledFontSize)
      }

      contentHtml = `
        <text 
          x="50%" 
          y="50%" 
          dominant-baseline="middle" 
          text-anchor="middle" 
          fill="${textFill}" 
          font-family="${fontCls}" 
          font-size="${scaledFontSize * finalScale}" 
          font-weight="${logoConfig.fontWeight}"
        >
          ${logoConfig.text}
        </text>
      `
    } else if (isHorizontal) {
      const fontCls = FONT_FAMILIES.find(f => f.id === logoConfig.fontFamily)?.name || 'sans-serif'

      const baseIconSize = width * 0.25
      const iconSizeMultiplier = logoConfig.iconSize / 120
      const iconSize = baseIconSize * (0.5 + iconSizeMultiplier * 0.8)

      const baseFontSize = width * 0.12
      const fontSizeMultiplier = logoConfig.fontSize / 80
      const scaledFontSize = baseFontSize * (0.5 + fontSizeMultiplier * 1.2)

      const gap = 32 * (width / 512)
      const totalWidthEst = iconSize + gap + (scaledFontSize * logoConfig.text.length * 0.6)

      let finalScale = 1
      const maxAvailableWidth = width - (logoConfig.padding * 2 * (width / 512))
      if (totalWidthEst > maxAvailableWidth) {
        finalScale = maxAvailableWidth / totalWidthEst
      }

      const maxAvailableHeight = height - (logoConfig.padding * 2 * (height / 512))
      const totalHeightEst = Math.max(iconSize, scaledFontSize)
      if (totalHeightEst * finalScale > maxAvailableHeight) {
        finalScale = Math.min(finalScale, maxAvailableHeight / totalHeightEst)
      }

      const finalIconSize = iconSize * finalScale
      const finalFontSize = scaledFontSize * finalScale
      const finalGap = gap * finalScale
      const finalTotalWidth = (iconSize + gap) * finalScale + (scaledFontSize * logoConfig.text.length * 0.6) * finalScale

      const startX = (width - finalTotalWidth) / 2
      const centerY = height / 2
      const iconScale = finalIconSize / 24

      contentHtml = `
        <g transform="translate(${startX}, ${centerY - finalIconSize / 2}) scale(${iconScale})">
          ${iconContent}
        </g>
        <text 
          x="${startX + finalIconSize + finalGap}" 
          y="${centerY}" 
          dominant-baseline="middle" 
          fill="${textFill}" 
          font-family="${fontCls}" 
          font-size="${finalFontSize}" 
          font-weight="${logoConfig.fontWeight}"
        >
          ${logoConfig.text}
        </text>
      `
    } else if (isVertical) {
      const fontCls = FONT_FAMILIES.find(f => f.id === logoConfig.fontFamily)?.name || 'sans-serif'

      const baseIconSize = width * 0.35
      const iconSizeMultiplier = logoConfig.iconSize / 120
      const iconSize = baseIconSize * (0.5 + iconSizeMultiplier * 0.8)

      const baseFontSize = width * 0.12
      const fontSizeMultiplier = logoConfig.fontSize / 80
      const scaledFontSize = baseFontSize * (0.5 + fontSizeMultiplier * 1.2)

      const gap = 48 * (width / 512)
      const totalHeightEst = iconSize + gap + scaledFontSize

      let finalScale = 1
      const maxAvailableHeight = height - (logoConfig.padding * 2 * (width / 512))
      if (totalHeightEst > maxAvailableHeight) {
        finalScale = maxAvailableHeight / totalHeightEst
      }

      const maxAvailableWidth = width - (logoConfig.padding * 2 * (width / 512))
      const textWidthEst = scaledFontSize * logoConfig.text.length * 0.6
      const totalWidthEst = Math.max(iconSize, textWidthEst)

      if (totalWidthEst * finalScale > maxAvailableWidth) {
        finalScale = Math.min(finalScale, maxAvailableWidth / totalWidthEst)
      }

      const finalIconSize = iconSize * finalScale
      const finalFontSize = scaledFontSize * finalScale
      const finalGap = gap * finalScale
      const finalTotalHeight = finalIconSize + finalGap + finalFontSize

      const startY = (height - finalTotalHeight) / 2
      const centerX = width / 2
      const iconScale = finalIconSize / 24

      contentHtml = `
        <g transform="translate(${centerX - finalIconSize / 2}, ${startY}) scale(${iconScale})">
          ${iconContent}
        </g>
        <text 
          x="${centerX}" 
          y="${startY + finalIconSize + finalGap + finalFontSize / 2}" 
          dominant-baseline="middle" 
          text-anchor="middle" 
          fill="${textFill}" 
          font-family="${fontCls}" 
          font-size="${finalFontSize}" 
          font-weight="${logoConfig.fontWeight}"
        >
          ${logoConfig.text}
        </text>
      `
    }

    return `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
        <defs>
          <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="${logoConfig.iconColor}" />
            <stop offset="100%" stop-color="${logoConfig.gradientColor}" />
          </linearGradient>
        </defs>
        ${!forExport && bgFill !== 'none' ? `<rect width="100%" height="100%" fill="${bgFill}" rx="${rx}" />` : ''}
        ${contentHtml}
      </svg>
    `
  }

  const handleCustomSymbolUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const base64 = event.target?.result as string
      setLogoConfig(prev => ({
        ...prev,
        symbolId: 'custom',
        customSymbolUrl: base64
      }))
    }
    reader.readAsDataURL(file)
  }

  const drawToCanvas = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.clearRect(0, 0, 512, 512)

    if (logoConfig.bgType !== 'transparent') {
      ctx.fillStyle = logoConfig.bgType === 'dark' ? '#0F172A' : '#FFFFFF'

      ctx.beginPath()
      const x = 0
      const y = 0
      const w = 512
      const h = 512
      const r = logoConfig.borderRadius
      ctx.moveTo(x + r, y)
      ctx.arcTo(x + w, y, x + w, y + h, r)
      ctx.arcTo(x + w, y + h, x, y + h, r)
      ctx.arcTo(x, y + h, x, y, r)
      ctx.arcTo(x, y, x + w, y, r)
      ctx.closePath()
      ctx.fill()
    }

    const svgString = getSvgMarkup(512, 512, true)

    const img = new Image()
    const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' })
    const URLObj = window.URL || window.webkitURL || window
    const blobURL = URLObj.createObjectURL(svgBlob)

    img.onload = () => {
      ctx.drawImage(img, 0, 0)
      URLObj.revokeObjectURL(blobURL)

      const pngUrl = canvas.toDataURL('image/png')
      if (liveLogo?.url !== pngUrl) {
        setLiveLogo({ url: pngUrl, target: targetKey })
      }
    }
    img.src = blobURL
  }

  useEffect(() => {
    drawToCanvas()

    if (targetKey === 'favicon') {
      if (logoConfig.layout !== 'icon-only') {
        setValidationWarning(t('favicon_validation_warning', { defaultValue: 'Favicons require square icon-only layouts for proper tab rendering.' }))
      } else {
        setValidationWarning(null)
      }
    } else {
      setValidationWarning(null)
    }
  }, [logoConfig, targetKey])

  const handleApplyLogoDesigner = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], `${targetKey}.png`, { type: 'image/png' })
        handleFileSelect(targetKey, file)
      }
    }, 'image/png')
  }

  const handleDownloadLogoDesigner = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const link = document.createElement('a')
    link.download = `${logoConfig.text.toLowerCase().replace(/\s+/g, '_')}_logo.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
  }

  const handleFileSelect = (key: string, file: File | null) => {
    setFiles((prev) => ({ ...prev, [key]: file || 'null' }))
    if (file) {
      toast.success(
        t('asset_added_to_queue', {
          key: key.replace('_', ' ').toUpperCase(),
          defaultValue: `Added ${key.replace('_', ' ')} logo to upload queue.`
        })
      )
    }
  }

  const handleApplyLogo = (key: string, file: File) => {
    handleFileSelect(key, file)
  }

  const handleRemove = (key: string) => {
    setFiles((prev) => ({ ...prev, [key]: 'null' }))
  }

  const onSubmit = async () => {
    try {
      const formData = new FormData()

      // Append files to upload
      Object.entries(files).forEach(([key, value]) => {
        if (value === 'null') {
          formData.append(key, 'null')
        } else if (value instanceof File) {
          formData.append(key, value)
        }
      })

      // Also append branding colors to form data if supported
      formData.append('primary_color', primaryColor)
      formData.append('secondary_color', secondaryColor)
      formData.append('accent_colors', JSON.stringify(accents))

      const res = await updateSettings(formData).unwrap()

      toast.success(
        res.message || t('logos_updated_successfully', { defaultValue: 'Brand branding updated successfully' })
      )
      setFiles({})
      setSaveVersion((v) => v + 1)
    } catch (error) {
      const apiError = error as ApiError
      toast.error(apiError?.data?.message || t('failed_to_update_logos', { defaultValue: 'Failed to update brand logos' }))
    }
  }

  if (isFetching) {
    return <Spinner className="h-auto py-20" size="md" />
  }

  const hasChanges = Object.keys(files).length > 0 ||
    !isColorEqual(primaryColor, settings.primary_color || DEFAULT_PRIMARY_COLOR) ||
    !isColorEqual(secondaryColor, settings.secondary_color || DEFAULT_SECONDARY_COLOR) ||
    !isAccentColorsEqual(accents, settings.accent_colors || JSON.stringify(DEFAULT_ACCENT_COLORS))

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-5 duration-700">
      {/* Offscreen Canvas for exporting PNG */}
      <canvas ref={canvasRef} width={512} height={512} className="hidden" />

      <div className="grid grid-cols-1 2xl:grid-cols-12 gap-5">
        {/* Sidebar on the Left */}
        <div className="hidden 2xl:block 2xl:col-span-3">
          <div className="sticky top-4">
            <div className="flex flex-col gap-4">
              {TABS.map((tab) => (
                <Button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-none sm:h-18! h-12 justify-start w-full flex items-start gap-3 p-4 rounded-[12px]! text-left rtl:text-right group whitespace-normal ${activeTab === tab.id
                    ? 'primary-btn text-white! scale-100 z-10'
                    : 'border border-glass-border text-subtitle-color hover:border-primary/50 bg-white! dark:bg-white/3!'
                    }`}
                >
                  <div
                    className={`p-2  rounded-radius transition-colors ${activeTab === tab.id ? 'bg-black/10' : 'dark:bg-white/3 bg-black/3 group-hover:bg-primary/10'
                      }`}
                  >
                    <tab.icon
                      className={`w-6 h-6 ${activeTab === tab.id ? 'text-white' : 'text-primary'}`}
                    />
                  </div>
                  <div className="flex flex-col gap-1 ">
                    <span
                      className={`block font-bold text-xs tracking-normal leading-[16px] ${activeTab === tab.id ? 'text-white' : 'text-title-color'}`}
                    >
                      {t(tab.labelKey, { defaultValue: tab.defaultLabel })}
                    </span>
                    <span
                      className={`block text-xs font-medium truncate line-clamp-1 max-w-[100%] ${activeTab === tab.id ? 'text-white' : 'text-subtitle-color '
                        }`}
                    >
                      {t(tab.descKey, { defaultValue: tab.defaultDesc })}
                    </span>
                  </div>
                </Button>
              ))}
            </div>
          </div>
        </div>



        <div className="2xl:col-span-9 space-y-6">
          <div className="2xl:hidden relative z-[100]">
            <Button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              variant="outline"
              className="flex items-center gap-2 border-glass-border bg-white! dark:bg-white/3! text-title-color hover:border-primary/50 transition-all rounded-[12px]!"
            >
              <Menu className="w-4 h-4" />
              {t('open_settings_menu', { defaultValue: 'Settings Menu' })}
            </Button>

            <AnimatePresence>
              {isMobileMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="absolute top-full mt-2 left-0 w-[300px] bg-light-body shadow-xl border border-glass-border rounded-border-radius p-3 z-[101]"
                >
                  <div className="flex flex-col gap-2">
                    {TABS.map((tab) => (
                      <Button
                        key={tab.id}
                        onClick={() => {
                          setActiveTab(tab.id)
                          setIsMobileMenuOpen(false)
                        }}
                        className={`h-auto justify-start w-full flex items-start gap-3 p-3 rounded-[12px]! text-left rtl:text-right group whitespace-normal ${activeTab === tab.id
                          ? 'primary-btn text-white! scale-100 z-10'
                          : 'border border-transparent text-subtitle-color hover:bg-black/5 dark:hover:bg-white/5 bg-transparent!'
                          }`}
                      >
                        <div
                          className={`p-2 rounded-radius transition-colors ${activeTab === tab.id ? 'bg-black/10' : 'dark:bg-white/3 bg-black/3 group-hover:bg-primary/10'
                            }`}
                        >
                          <tab.icon className={`w-5 h-5 ${activeTab === tab.id ? 'text-white' : 'text-primary'}`} />
                        </div>
                        <div className="flex flex-col">
                          <span className={`block font-bold text-xs tracking-normal leading-[16px] ${activeTab === tab.id ? 'text-white' : 'text-title-color'}`}>
                            {t(tab.labelKey, { defaultValue: tab.defaultLabel })}
                          </span>
                          <span className={`block text-xs font-medium line-clamp-1 ${activeTab === tab.id ? 'text-white/80' : 'text-subtitle-color'}`}>
                            {t(tab.descKey, { defaultValue: tab.defaultDesc })}
                          </span>
                        </div>
                      </Button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-6 animate-in fade-in duration-300"
            >
              {activeTab === 'designer' && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Left Column: Editor controls */}
                  <div className="lg:col-span-8 space-y-6">
                    <LogoEditorCard
                      config={logoConfig}
                      setConfig={setLogoConfig}
                      primaryColor={primaryColor}
                      secondaryColor={secondaryColor}
                      customFileRef={customFileRef}
                      handleCustomSymbolUpload={handleCustomSymbolUpload}
                      validationWarning={validationWarning}
                    />
                  </div>

                  {/* Right Column: Preview and Apply */}
                  <div className="lg:col-span-4 h-full">
                    <LogoPreviewCard
                      config={logoConfig}
                      targetKey={targetKey}
                      setTargetKey={setTargetKey}
                      onApply={handleApplyLogoDesigner}
                      onDownload={handleDownloadLogoDesigner}
                      getSvgMarkup={getSvgMarkup}
                    />
                  </div>
                </div>
              )}

              {activeTab === 'colors' && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Left Column: Brand Colors */}
                  <div className="lg:col-span-8 space-y-6">
                    <BrandColors
                      primaryColor={primaryColor}
                      secondaryColor={secondaryColor}
                      accents={accents}
                      onChangePrimary={setPrimaryColor}
                      onChangeSecondary={setSecondaryColor}
                      onChangeAccents={setAccents}
                    />
                  </div>

                  {/* Right Column: Real-time Preview card */}
                  <div className="lg:col-span-4 h-full">
                    <LogoPreviewCard
                      config={logoConfig}
                      targetKey={targetKey}
                      setTargetKey={setTargetKey}
                      onApply={handleApplyLogoDesigner}
                      onDownload={handleDownloadLogoDesigner}
                      getSvgMarkup={getSvgMarkup}
                    />
                  </div>
                </div>
              )}

              {activeTab === 'uploads_core' && (
                <BrandPlacement
                  files={files}
                  settings={settings}
                  onFileSelect={handleFileSelect}
                  keysToShow={['logo_dark', 'logo_light']}
                />
              )}

              {activeTab === 'uploads_nav' && (
                <BrandPlacement
                  files={files}
                  settings={settings}
                  onFileSelect={handleFileSelect}
                  keysToShow={['sidebar_logo', 'sidebar_light_logo', 'favicon']}
                />
              )}

              {activeTab === 'preview' && (
                <LivePreview
                  primaryColor={primaryColor}
                  secondaryColor={secondaryColor}
                  logoDarkUrl={settings.logo_dark_url}
                  logoLightUrl={settings.logo_light_url}
                  sidebarLogoDarkUrl={settings.sidebar_logo_url}
                  sidebarLogoLightUrl={settings.sidebar_light_logo_url}
                  liveLogo={liveLogo}
                  logoConfig={logoConfig}
                />
              )}
            </motion.div>
          </AnimatePresence>

          {/* Pro Tip Warning banner at bottom */}
          <div className="bg-primary/5 rounded-border-radius-inner border border-primary/20 p-4 flex items-start gap-3 text-xs leading-normal text-primary">
            <Info className="w-5 h-5 text-primary shrink-0 mt-0.5" />
            <div>
              <span className="font-extrabold block text-primary mb-0.5">
                {t('pro_tip_title', { defaultValue: 'Pro Tip' })}
              </span>
              <span>
                {t('pro_tip_desc', {
                  defaultValue: 'Use high contrast colors and logos for the best visibility across all devices and themes. We recommend testing your brand on both light and dark modes.'
                })}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Button at bottom */}
      <div className="flex justify-end pt-4 border-t border-glass-border">
        <Button
          onClick={onSubmit}
          disabled={isUpdating || !hasChanges}
          variant="premium"
          className="h-10 px-6 font-bold text-xs text-white! primary-btn cursor-pointer transition-all "
        >
          {isUpdating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              {t('saving', { defaultValue: 'Saving...' })}
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              {t('save_changes', { defaultValue: 'Save Changes' })}
            </>
          )}
        </Button>
      </div>
    </div>
  )
}

export default LogoSettings
