import React, { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { LogoDesignerProps } from '@/types/settings'
import { LogoDesignConfig } from '@/types/components/branding'
import { DESIGNER_SYMBOLS, FONT_FAMILIES } from '../data/brandingData'
import { LogoEditorCard } from './LogoEditorCard'
import { LogoPreviewCard } from './LogoPreviewCard'

export const LogoDesigner = ({
  primaryColor,
  secondaryColor,
  onApplyLogo,
  isSaving,
  onDesignChange
}: LogoDesignerProps) => {
  const { t } = useTranslation()
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const customFileRef = useRef<HTMLInputElement | null>(null)

  const handleCustomSymbolUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const base64 = event.target?.result as string
      setConfig(prev => ({
        ...prev,
        symbolId: 'custom',
        customSymbolUrl: base64
      }))
    }
    reader.readAsDataURL(file)
  }

  // Default configuration for the logo design
  const [config, setConfig] = useState<LogoDesignConfig>({
    symbolId: 'sleek_r',
    text: 'Social Ominfinitive',
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

  // Selected target key for applying designed logo
  const [targetKey, setTargetKey] = useState<string>('logo_dark')

  // Validation warning state
  const [validationWarning, setValidationWarning] = useState<string | null>(null)

  // Track color changes from props to sync designer colors
  useEffect(() => {
    setConfig(prev => ({
      ...prev,
      iconColor: primaryColor,
      gradientColor: secondaryColor
    }))
  }, [primaryColor, secondaryColor])

  const activeSymbol = DESIGNER_SYMBOLS.find(s => s.id === config.symbolId) || DESIGNER_SYMBOLS[0]

  // Construct SVG XML markup for rendering
  const getSvgMarkup = (width: number, height: number, forExport = false) => {
    const bgFill = config.bgType === 'dark' ? '#0F172A' : config.bgType === 'light' ? '#FFFFFF' : 'none'
    const rx = config.borderRadius * (width / 512) // Scale border radius

    // Create the icon's SVG path content scaled and translated to center
    // For viewport 24x24
    let iconContent = ''
    if (config.symbolId === 'custom' && config.customSymbolUrl) {
      iconContent = `<image href="${config.customSymbolUrl}" width="24" height="24" />`
    } else {
      const iconStroke = config.gradientEnabled ? 'url(#logoGradient)' : config.iconColor
      iconContent = activeSymbol.svgContent.replace(/currentColor/g, iconStroke)
    }

    // Layout dimensions & placements (coordinate math)
    const isHorizontal = config.layout === 'horizontal'
    const isVertical = config.layout === 'vertical'
    const isIconOnly = config.layout === 'icon-only'
    const isTextOnly = config.layout === 'text-only'

    const textFill = config.textGradientEnabled ? 'url(#logoGradient)' : config.textColor

    let contentHtml = ''

    if (isIconOnly) {
      // Scale icon to fill most of the square, e.g., 85% of width/height
      const baseSize = width * 0.85
      const sizeMultiplier = config.iconSize / 120 // 0 to 1
      const size = baseSize * (0.4 + sizeMultiplier * 0.6) // ranges from 40% to 100% of baseSize
      const scale = size / 24
      const x = (width - size) / 2
      const y = (height - size) / 2
      contentHtml = `
        <g transform="translate(${x}, ${y}) scale(${scale})">
          ${iconContent}
        </g>
      `
    } else if (isTextOnly) {
      const fontCls = FONT_FAMILIES.find(f => f.id === config.fontFamily)?.name || 'sans-serif'
      const baseFontSize = width * 0.15
      const sizeMultiplier = config.fontSize / 80
      const scaledFontSize = baseFontSize * (0.5 + sizeMultiplier * 1.5)

      const maxAvailableWidth = width - (config.padding * 2 * (width / 512))
      const maxAvailableHeight = height - (config.padding * 2 * (height / 512))

      const textWidthEst = scaledFontSize * config.text.length * 0.6
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
          font-weight="${config.fontWeight}"
        >
          ${config.text}
        </text>
      `
    } else if (isHorizontal) {
      const fontCls = FONT_FAMILIES.find(f => f.id === config.fontFamily)?.name || 'sans-serif'

      const baseIconSize = width * 0.25 // 128px for 512px canvas
      const iconSizeMultiplier = config.iconSize / 120
      const iconSize = baseIconSize * (0.5 + iconSizeMultiplier * 0.8) // 64px to 166px

      const baseFontSize = width * 0.12 // 61px for 512px canvas
      const fontSizeMultiplier = config.fontSize / 80
      const scaledFontSize = baseFontSize * (0.5 + fontSizeMultiplier * 1.2) // 30px to 104px

      const gap = 32 * (width / 512)
      const totalWidthEst = iconSize + gap + (scaledFontSize * config.text.length * 0.6)

      let finalScale = 1
      const maxAvailableWidth = width - (config.padding * 2 * (width / 512))
      if (totalWidthEst > maxAvailableWidth) {
        finalScale = maxAvailableWidth / totalWidthEst
      }

      const maxAvailableHeight = height - (config.padding * 2 * (height / 512))
      const totalHeightEst = Math.max(iconSize, scaledFontSize)
      if (totalHeightEst * finalScale > maxAvailableHeight) {
        finalScale = Math.min(finalScale, maxAvailableHeight / totalHeightEst)
      }

      const finalIconSize = iconSize * finalScale
      const finalFontSize = scaledFontSize * finalScale
      const finalGap = gap * finalScale
      const finalTotalWidth = (iconSize + gap) * finalScale + (scaledFontSize * config.text.length * 0.6) * finalScale // estimate

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
          font-weight="${config.fontWeight}"
        >
          ${config.text}
        </text>
      `
    } else if (isVertical) {
      const fontCls = FONT_FAMILIES.find(f => f.id === config.fontFamily)?.name || 'sans-serif'

      const baseIconSize = width * 0.35 // 180px for 512px canvas
      const iconSizeMultiplier = config.iconSize / 120
      const iconSize = baseIconSize * (0.5 + iconSizeMultiplier * 0.8) // 90px to 234px

      const baseFontSize = width * 0.12 // 61px for 512px canvas
      const fontSizeMultiplier = config.fontSize / 80
      const scaledFontSize = baseFontSize * (0.5 + fontSizeMultiplier * 1.2) // 30px to 104px

      const gap = 48 * (width / 512)
      const totalHeightEst = iconSize + gap + scaledFontSize

      let finalScale = 1
      const maxAvailableHeight = height - (config.padding * 2 * (height / 512))
      if (totalHeightEst > maxAvailableHeight) {
        finalScale = maxAvailableHeight / totalHeightEst
      }

      const maxAvailableWidth = width - (config.padding * 2 * (width / 512))
      const textWidthEst = scaledFontSize * config.text.length * 0.6
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
          font-weight="${config.fontWeight}"
        >
          ${config.text}
        </text>
      `
    }

    // Wrap in full SVG document with gradient definitions
    return `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
        <defs>
          <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="${config.iconColor}" />
            <stop offset="100%" stop-color="${config.gradientColor}" />
          </linearGradient>
        </defs>
        ${!forExport && bgFill !== 'none' ? `<rect width="100%" height="100%" fill="${bgFill}" rx="${rx}" />` : ''}
        ${contentHtml}
      </svg>
    `
  }

  // Draw serialized SVG markup to canvas context
  const drawToCanvas = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, 512, 512)

    // Render background if not transparent
    if (config.bgType !== 'transparent') {
      ctx.fillStyle = config.bgType === 'dark' ? '#0F172A' : '#FFFFFF'

      // Draw rounded rectangle
      ctx.beginPath()
      const x = 0
      const y = 0
      const w = 512
      const h = 512
      const r = config.borderRadius
      ctx.moveTo(x + r, y)
      ctx.arcTo(x + w, y, x + w, y + h, r)
      ctx.arcTo(x + w, y + h, x, y + h, r)
      ctx.arcTo(x, y + h, x, y, r)
      ctx.arcTo(x, y, x + w, y, r)
      ctx.closePath()
      ctx.fill()
    }

    // Get SVG XML string for canvas export (exclude rect background as it is manually drawn above)
    const svgString = getSvgMarkup(512, 512, true)

    // Create image blob for canvas drawing
    const img = new Image()
    const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' })
    const URL = window.URL || window.webkitURL || window
    const blobURL = URL.createObjectURL(svgBlob)

    img.onload = () => {
      ctx.drawImage(img, 0, 0)
      URL.revokeObjectURL(blobURL)

      // Notify parent component about current dynamic design changes
      if (onDesignChange) {
        onDesignChange(canvas.toDataURL('image/png'), targetKey)
      }
    }
    img.src = blobURL
  }

  // Draw to canvas whenever options change
  useEffect(() => {
    drawToCanvas()

    // Validate size restrictions for Favicon
    if (targetKey === 'favicon') {
      if (config.layout !== 'icon-only') {
        setValidationWarning(t('favicon_validation_warning', { defaultValue: 'Favicons require square icon-only layouts for proper tab rendering.' }))
      } else {
        setValidationWarning(null)
      }
    } else {
      setValidationWarning(null)
    }
  }, [config, targetKey])

  const handleApply = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], `${targetKey}.png`, { type: 'image/png' })
        onApplyLogo(targetKey, file)
      }
    }, 'image/png')
  }

  const handleDownload = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const link = document.createElement('a')
    link.download = `${config.text.toLowerCase().replace(/\s+/g, '_')}_logo.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Offscreen Canvas for exporting PNG */}
      <canvas ref={canvasRef} width={512} height={512} className="hidden" />

      {/* Editor controls column */}
      <div className="lg:col-span-8 space-y-6">
        <LogoEditorCard
          config={config}
          setConfig={setConfig}
          primaryColor={primaryColor}
          secondaryColor={secondaryColor}
          customFileRef={customFileRef}
          handleCustomSymbolUpload={handleCustomSymbolUpload}
          validationWarning={validationWarning}
        />
      </div>

      {/* Preview and Apply column */}
      <div className="lg:col-span-4 h-full">
        <LogoPreviewCard
          config={config}
          targetKey={targetKey}
          setTargetKey={setTargetKey}
          onApply={handleApply}
          onDownload={handleDownload}
          getSvgMarkup={getSvgMarkup}
        />
      </div>
    </div>
  )
}
