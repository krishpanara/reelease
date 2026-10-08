'use client'

import { Button } from '@/components/ui/button'
import Input from '@/components/ui/input'
import Label from '@/components/ui/label'
import { InlineImageUploadProps } from '@/types'
import { getMediaUrl } from '@/utils'
import { Image as ImageIcon, Upload, X } from 'lucide-react'
import Image from 'next/image'
import { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

const InlineImageUpload = ({ label, currentUrl, onFileSelect, onRemove }: InlineImageUploadProps) => {
  const { t } = useTranslation()
  const [preview, setPreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const displayUrl = preview || (currentUrl ? getMediaUrl(currentUrl) : null)

  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium text-foreground/60 ml-1">{label}</Label>
      <div
        className="relative h-40 rounded-border-radius-inner glass-dark-card border border-dashed border-black/30 dark:border-white/30 hover:border-primary/50 bg-accent/5 flex items-center justify-center cursor-pointer overflow-hidden transition-all group/image"
        onClick={() => fileInputRef.current?.click()}
      >
        {displayUrl ? (
          <>
            <Image
              src={displayUrl}
              alt={label}
              width={100}
              height={100}
              unoptimized
              className="w-full h-full object-contain p-4 transition-transform duration-500 group-hover/image:scale-105"
            />
            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover/image:opacity-100 flex items-center justify-center transition-opacity backdrop-blur-[2px]">
              <div className="p-2 rounded-full bg-black/60 border border-glass-border">
                <Upload className="w-4 h-4 text-white" />
              </div>
            </div>
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute top-3 right-3 h-5 w-5 rounded-full shadow-2xl border-2 border-background/20 opacity-0 group-hover/image:opacity-100 transition-all hover:scale-110 active:scale-90"
              onClick={(e) => {
                e.stopPropagation()
                setPreview(null)
                onRemove()
                if (fileInputRef.current) fileInputRef.current.value = ''
              }}
            >
              <X className="w-3 h-3" />
            </Button>
          </>
        ) : (
          <div className="flex flex-col items-center gap-2 text-primary/50 transition-all duration-500">
            <div className={`p-4 rounded-full bg-accent/10 dark:bg-light-color border border-primary/30 scale-110 transition-all duration-500`}>
              <ImageIcon className="w-6 h-6" />
            </div>
            <span className="text-sm font-medium text-muted-foreground">{t('click_to_upload')}</span>
          </div>
        )}
        <Input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) {
              onFileSelect(file)
              const reader = new FileReader()
              reader.onloadend = () => setPreview(reader.result as string)
              reader.readAsDataURL(file)
            }
          }}
        />
      </div>
    </div>
  )
}

export default InlineImageUpload
