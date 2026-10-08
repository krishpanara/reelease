'use client'

import { Button } from '@/components/ui/button'
import Label from '@/components/ui/label'
import { WatermarkImagePickerProps } from '@/types/components/features'
import { Upload, X } from 'lucide-react'
import Image from 'next/image'
import { useTranslation } from 'react-i18next'

export const WatermarkImagePicker = ({
  selectedImage,
  onOpenPicker,
  onClearImage,
}: WatermarkImagePickerProps) => {
  const { t } = useTranslation()

  return (
    <div className="space-y-3">
      <Label className="text-sm font-bold text-subtitle-color ">
        {t('watermark_image', { defaultValue: 'Watermark Image' })}
      </Label>

      {selectedImage ? (
        <div className="relative border border-glass-border rounded-xl overflow-hidden bg-muted/30 group shadow-sm transition-all">
          <Image
            src={process.env.NEXT_PUBLIC_STORAGE_URL + '/'+selectedImage}
            alt="Selected watermark"
            width={500}
            height={500}
            unoptimized
            className="w-full h-36 object-contain p-3 transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-black/60 dark:bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center gap-3 backdrop-blur-[2px]">
            <Button
              onClick={onOpenPicker}
              className="text-xs font-bold primary-btn text-white! h-[unset]! px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors shadow-lg"
            >
              {t('change_image', { defaultValue: 'Change Image' })}
            </Button>
            <Button
              onClick={onClearImage}
              className="text-xs font-bold bg-destructive! text-white! h-[unset]! px-4 py-2 rounded-lg hover:bg-white/30 transition-colors flex items-center gap-1.5"
            >
              <X className="w-3.5 h-3.5" /> {t('remove', { defaultValue: 'Remove' })}
            </Button>
          </div>
        </div>
      ) : (
        <div
          onClick={onOpenPicker}
          className="border-2 border-dashed border-glass-border hover:border-primary/50 transition-all duration-300 rounded-border-radius sm:p-6 p-4 flex flex-col items-center justify-center cursor-pointer bg-muted/20 hover:bg-muted/40 group"
        >
          <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-primary/20 transition-all duration-300 shadow-[0_0_15px_rgba(var(--primary),0.1)] group-hover:shadow-[0_0_25px_rgba(var(--primary),0.2)]">
            <Upload className="w-6 h-6 text-primary" />
          </div>
          <div className="text-sm font-bold text-title-color dark:text-white mb-1.5 text-center">
            {t('choose_image_file', { defaultValue: 'Choose image file' })}
          </div>
          <div className="text-xs text-subtitle-color text-center leading-relaxed">
            {t('choose_image_desc', { defaultValue: 'Browse your media library and pick the image overlay.' })}
          </div>
        </div>
      )}
    </div>
  )
}
