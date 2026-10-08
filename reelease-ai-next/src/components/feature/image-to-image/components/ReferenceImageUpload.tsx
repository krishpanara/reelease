'use client'

import { Button } from '@/components/ui/button'
import { ImageIcon, Plus, X } from 'lucide-react'
import { getMediaUrl } from '@/utils'
import Label from '@/components/ui/label'
import { useTranslation } from 'react-i18next'
import Image from 'next/image'
import { ReferenceImageUploadProps } from '@/types/components/features'

export function ReferenceImageUpload({
  selectedAttachments,
  setSelectedAttachments,
  setIsMediaPickerOpen,
}: ReferenceImageUploadProps) {
  const { t } = useTranslation()
  const removeImage = (index: number) => {
    setSelectedAttachments(prev => prev.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-4">
      <div className="space-y-4">
        {/* Add Image Button - Medium Sized */}
        {selectedAttachments.length < 8 && (
          <div
            onClick={() => setIsMediaPickerOpen(true)}
            className="group relative h-32 w-full rounded-border-radius border-2 border-dashed border-border dark:border-white/10 bg-foreground/3 dark:bg-white/3 border-primary/50 bg-primary/5 transition-all flex flex-col items-center justify-center cursor-pointer overflow-hidden"
          >
            <div className="flex items-center gap-3 text-foreground/50 dark:text-white/60 text-primary transition-colors">
              <div className="w-10 h-10 rounded-full bg-foreground/8 dark:bg-white/10 bg-primary/10 flex items-center justify-center">
                <Plus className="w-5 h-5" />
              </div>
              <div className="text-left">
                <span className="text-sm font-bold block">
                  {t('add_reference_image', { defaultValue: 'Add Reference' })}
                </span>
                <span className="text-xs opacity-80 block">
                  {t('upload_or_select', { defaultValue: 'Upload from library or PC' })}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Grid of Selected Images */}
        {selectedAttachments.length > 0 && (
          <div className="max-h-[280px] overflow-y-auto pr-1 custom-scrollbar">
            <div className="grid grid-cols-4 gap-3">
              {selectedAttachments.map((attachment, index) => (
                <div
                  key={`${attachment.id || (attachment as any)._id}-${index}`}
                  className="group relative aspect-video rounded-2xl border border-border dark:border-white/10 overflow-hidden bg-foreground/5 dark:bg-black/40"
                >
                  <Image
                    src={getMediaUrl(attachment.file_path)}
                    alt={`Reference ${index + 1}`}
                    fill
                    unoptimized
                    className="object-cover object-top transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-between p-2">
                    <Button
                      variant="destructive"
                      size="icon"
                      className="h-7 w-7 rounded-lg bg-red-500/80 hover:bg-red-500 ml-auto"
                      onClick={(e) => {
                        e.stopPropagation()
                        removeImage(index)
                      }}
                    >
                      <X className="w-3.5 h-3.5 text-white" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {selectedAttachments.length === 0 && (
          <div className="py-8 px-4 rounded-border-radius border-2 border-dashed border-border/40 dark:border-white/5 bg-foreground/3 dark:bg-black/10 flex flex-col items-center justify-center text-center">
            <ImageIcon className="w-8 h-8 text-foreground/25 dark:text-white/30 mb-3" />
            <p className="text-sm text-foreground/40 dark:text-white/30">
              {t('no_images_selected', {
                defaultValue: 'No reference images selected. Add up to 8 images to guide the AI.',
              })}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
