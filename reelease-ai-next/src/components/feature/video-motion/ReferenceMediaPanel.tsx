'use client'

import { ReferenceMediaPanelProps } from '@/types/components/features'
import { getMediaUrl } from '@/utils'
import { Film, Plus, Video } from 'lucide-react'
import Image from 'next/image'
import { useTranslation } from 'react-i18next'

export const ReferenceMediaPanel = ({
  selectedVideo,
  selectedImage,
  onOpenPicker,
}: ReferenceMediaPanelProps) => {
  const { t } = useTranslation()

  return (
    <aside className="lg:col-span-3 flex flex-col gap-6 order-1 lg:order-1 min-w-0 overflow-hidden">
      {/* Reference Video Card */}
      <div className="glass-card border-glass-border bg-white dark:bg-white/3 p-5 rounded-border-radius space-y-4">
        <div className="text-base font-bold flex items-center gap-2 text-foreground dark:text-white/90">
          <Video className="w-5 h-5 text-primary" />
          {t('reference_video')}
        </div>
        <div
          onClick={() => onOpenPicker('video')}
          className="relative h-50 w-full rounded-border-radius border-2 border-dashed transition-all flex flex-col items-center justify-center cursor-pointer overflow-hidden group border-glass-border dark:bg-white/3 bg-foreground/5 hover:border-primary/30 dark:hover:bg-white/3"
        >
          {selectedVideo ? (
            <video
              src={getMediaUrl(selectedVideo.file_path)}
              className="absolute inset-0 w-full h-full object-cover"
              muted
              loop
              autoPlay
            />
          ) : (
            <>
              <div className='w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-foreground/5 dark:bg-white/5 flex items-center justify-center mb-1 text-subtitle-color group-hover:bg-primary/10 group-hover:text-primary transition-colors'>
                <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <span className="mt-3 text-base font-bold text-subtitle-color">{t('select_source')}</span>
            </>
          )}
        </div>
      </div>

      {/* Reference Image Card */}
      <div className="glass-card border border-glass-border dark:bg-white/3 bg-white p-5 rounded-border-radius space-y-4">
        <div className="text-base font-bold flex items-center gap-2 text-foreground dark:text-white/90">
          <Film className="w-5 h-5 text-primary" />
          {t('reference_image')}
        </div>
        <div
          onClick={() => onOpenPicker('image')}
          className="relative h-50 w-full rounded-border-radius border-2 border-dashed border-glass-border transition-all flex flex-col dark:bg-white/3 items-center justify-center cursor-pointer overflow-hidden group  dark:border-white/10 bg-foreground/5  hover:border-primary/30 dark:hover:bg-white/3"
        >
          {selectedImage ? (
            <Image
              src={getMediaUrl(selectedImage.file_path)}
              width={50}
              height={50}
              unoptimized
              className="absolute inset-0 w-full h-full object-cover"
              alt="image"
            />
          ) : (
            <>
              <div className='w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-foreground/5 dark:bg-white/5 flex items-center justify-center mb-1 text-subtitle-color group-hover:bg-primary/10 group-hover:text-primary transition-colors'>
                <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <span className="mt-3 text-[14px] font-bold text-subtitle-color">{t('drop_file')}</span>
            </>
          )}
        </div>
      </div>
    </aside>
  )
}
