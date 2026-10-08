'use client'

import { connectorAngles, platformNodes } from '@/data/socialMedia'
import { cn } from '@/lib/utils'
import { ChannelPreviewPlaceholderProps } from '@/types/socialMedia'
import { Facebook, Instagram, Music2, Share2, X, SquarePen, Info } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useTranslation } from 'react-i18next'

const getPlatformIconStyle = (id: string) => {
  switch (id.toLowerCase()) {
    case 'facebook':
      return { colorClass: 'text-[#1877F2]', sizeClass: 'w-6 h-6' }
    case 'instagram':
      return { colorClass: 'text-[#E1306C]', sizeClass: 'w-6 h-6' }
    case 'linkedin':
      return { colorClass: 'text-[#0A66C2]', sizeClass: 'w-6 h-6' }
    case 'youtube':
      return { colorClass: 'text-[#FF0000]', sizeClass: 'w-6 h-6' }
    case 'twitter':
    case 'x':
      return { colorClass: 'text-black dark:text-white', sizeClass: 'w-6 h-6' }
    case 'threads':
      return { colorClass: 'text-black dark:text-white', sizeClass: 'w-6 h-6' }
    default:
      return { colorClass: 'text-foreground', sizeClass: 'w-6 h-6' }
  }
}

export function ChannelPreviewPlaceholder({ message }: ChannelPreviewPlaceholderProps) {
  const { t } = useTranslation()

  return (
    <div className="flex flex-col items-center justify-center  text-center">
      <div className="relative mx-auto h-[236px] w-[260px]">
        {/* orbit ring */}
        <div className="pointer-events-none absolute left-1/2 top-1/2 size-[178px] -translate-x-1/2 -translate-y-1/2 rounded-full " />

        {/* dashed connectors */}
        <div className="absolute left-1/2 top-1/2 z-0 size-0">
          {connectorAngles.map((deg) => (
            <span
              key={deg}
              className="absolute left-0 top-0 block h-0 w-[105px] origin-left border-t border-dashed border-glass-border"
              style={{ transform: `rotate(${deg}deg)` }}
              aria-hidden
            />
          ))}
        </div>

        {/* center glow */}
        <div className="pointer-events-none absolute left-1/2 top-1/2 z-10 size-[120px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(59,130,246,0.45)_0%,rgba(99,102,241,0.18)_45%,transparent_70%)]" />

        {/* center hub — SquarePen to match reference image */}
        <div className="absolute left-1/2 top-1/2 z-20 flex size-[68px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-gradient-to-br from-sky-400 via-blue-500 to-violet-600 ">
          <SquarePen className="size-6 text-white" strokeWidth={2} />
        </div>

        {/* platform nodes */}
        {platformNodes.map(({ id, angle, Icon, iconClassName }) => {
          const angleInRadians = (angle * Math.PI) / 180
          const left = `calc(50% + ${105 * Math.cos(angleInRadians)}px)`
          const top = `calc(50% + ${105 * Math.sin(angleInRadians)}px)`
          const config = getPlatformIconStyle(id)

          return (
            <div
              key={id}
              className="absolute z-10 flex size-12 items-center justify-center rounded-full border border-slate-100 dark:border-white/10 bg-white dark:bg-white/5 shadow-sm cursor-pointer hover:scale-110 hover:shadow-md transition-all duration-300"
              style={{
                left,
                top,
                transform: 'translate(-50%, -50%)',
              }}
            >
              <Icon className={cn(config.colorClass, config.sizeClass)} filled={true} strokeWidth={1.8} />
            </div>
          )
        })}
      </div>

      <div className="mt-8 max-w-[280px] space-y-1">
        <p className="text-sm font-semibold text-foreground dark:text-white leading-relaxed">
          {t('preview_how_post_looks', { defaultValue: 'Preview how your post will look on each channel' })}
        </p>
        <p className="text-xs text-subtitle-color font-medium">
          {t('select_channel_to_preview', { defaultValue: 'Select a channel to preview' })}
        </p>
      </div>


    </div>
  )
}
