'use client'

import Label from '@/components/ui/label'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { WatermarkLeftPanelProps } from '@/types/components/features'
import { Image as ImageIcon, Type } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { WatermarkImagePicker } from './WatermarkContentSource'
import { WatermarkTextInput } from './WatermarkTextInput'

export const WatermarkLeftPanel = ({
  watermarkType,
  text,
  selectedImage,
  textStyle,
  fontWeight,
  isItalic,
  isUnderline,
  textColor,
  fontFamily,
  onTypeChange,
  onTextChange,
  onTextStyleChange,
  onFontWeightChange,
  onItalicChange,
  onUnderlineChange,
  onTextColorChange,
  onFontFamilyChange,
  onOpenPicker,
  onClearImage,
  transparent = false,
}: WatermarkLeftPanelProps) => {
  const { t } = useTranslation()

  return (
    <div className={transparent ? 'h-full flex flex-col' : 'glass-card dark:bg-white/3 bg-white rounded-border-radius sm:p-6 p-4 space-y-8 h-full border border-glass-border relative overflow-y-auto overflow-x-hidden no-scrollbar flex flex-col lg:h-[700px]'}>
      {/* Subtle background glow */}
      <div className="absolute top-0 left-0 w-40 h-40 bg-primary/10 rounded-full blur-[80px] -z-10 -translate-x-1/2 -translate-y-1/2" />

      {/* Watermark Type Tabs */}
      <div className="space-y-5 shrink-0 flex flex-col items-center">
        {!transparent && (
          <Label className="text-sm font-black text-subtitle-color mb-2 text-center w-full">
            {t('content_source', { defaultValue: 'Content Source' })}
          </Label>
        )}
        <Tabs
          defaultValue="image"
          value={watermarkType}
          onValueChange={(v) => onTypeChange(v as 'image' | 'text')}
          className="w-full"
        >
          <TabsList className="flex w-full rounded-2xl dark:bg-white/3 p-1.5 border border-glass-border h-auto">
            <TabsTrigger
              value="image"
              className={`flex-1 rounded-border-radius data-[state=active]:text-white! bg-black/3 dark:bg-white/3 text-sm font-black py-2.5 transition-all duration-500 flex items-center justify-center gap-2 ${watermarkType === 'image' ? 'primary-btn' : ''}`}
            >
              <ImageIcon className="w-4 h-4" /> {t('image', { defaultValue: 'Image' })}
            </TabsTrigger>
            <TabsTrigger
              value="text"
              className={`flex-1 rounded-border-radius data-[state=active]:text-white! bg-black/3 dark:bg-white/3 text-sm font-black py-2.5 transition-all duration-500 flex items-center justify-center gap-2 ${watermarkType === 'text' ? 'primary-btn' : ''}`}
            >
              <Type className="w-4 h-4" /> {t('text', { defaultValue: 'Text' })}
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Content Source */}
      <div className="flex-1 overflow-y-auto no-scrollbar pr-1">
        {watermarkType === 'image' ? (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <WatermarkImagePicker
              selectedImage={selectedImage}
              onOpenPicker={onOpenPicker}
              onClearImage={onClearImage}
            />
          </div>
        ) : (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <WatermarkTextInput
              text={text}
              textStyle={textStyle}
              fontWeight={fontWeight}
              isItalic={isItalic}
              isUnderline={isUnderline}
              textColor={textColor}
              fontFamily={fontFamily}
              onTextChange={onTextChange}
              onTextStyleChange={onTextStyleChange}
              onFontWeightChange={onFontWeightChange}
              onItalicChange={onItalicChange}
              onUnderlineChange={onUnderlineChange}
              onTextColorChange={onTextColorChange}
              onFontFamilyChange={onFontFamilyChange}
            />
          </div>
        )}
      </div>
    </div>
  )
}
