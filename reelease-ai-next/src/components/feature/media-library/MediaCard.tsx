'use client'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { usePermission } from '@/hooks/usePermission'
import { cn } from '@/lib/utils'
import { MediaCardProps } from '@/types'
import { formatBytes } from '@/utils'
import { getResolvedImageUrl } from '@/utils/image'
import { Check, Copy, Edit2, Eye, File, FileText, Image as ImageIcon, Share2, Trash2, Video, Music } from 'lucide-react'
import Image from 'next/image'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { useGetPublicSettingsQuery } from '@/redux/api/adminSettingApi'
import { copyToClipboard } from '@/utils/clipboard'

const MediaCard = ({
  attachment,
  onDelete,
  isSelected,
  onSelect,
  selectionMode,
  onView,
  onEdit,
  hideActions,
}: MediaCardProps) => {
  const { t } = useTranslation()
  const { isAdmin } = usePermission()
  const { data: settingsData } = useGetPublicSettingsQuery({})
  const settings = settingsData?.settings

  const [copied, setCopied] = React.useState(false)

  const isUserAdmin = isAdmin()

  // Restriction: Regular users cannot delete/modify admin-uploaded media
  const isUploadedByAdmin = ['ADMIN', 'SUPER_ADMIN'].includes((attachment as any).uploader_role || '')
  const canModify = isUserAdmin || !isUploadedByAdmin

  const isImage = attachment.mime_type?.startsWith('image/')
  const isVideo = attachment.mime_type?.startsWith('video/')
  const isAudio = attachment.mime_type?.startsWith('audio/') || attachment.file_type === 'audio'
  const fileUrl = attachment.file_path?.startsWith('http')
    ? attachment.file_path
    : `/${attachment.file_path?.replace(/^\//, '')}`

  const getIcon = () => {
    if (isImage) return <ImageIcon className="w-8 h-8" />
    if (isVideo) return <Video className="w-8 h-8" />
    if (isAudio) return <Music className="w-8 h-8 text-teal-400" />
    if (attachment.mime_type?.includes('pdf')) return <FileText className="w-8 h-8" />
    return <File className="w-8 h-8" />
  }

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation()
    const resolvedUrl = getResolvedImageUrl(attachment.file_path)
    copyToClipboard(resolvedUrl)
    setCopied(true)
    toast.success(t('url_copied', { defaultValue: 'URL copied to clipboard' }))
    setTimeout(() => setCopied(false), 2000)
  }

  const videoRef = React.useRef<HTMLVideoElement>(null)

  const handleMouseEnter = () => {
    if (isVideo && videoRef.current) {
      videoRef.current.play().catch(() => { })
    }
  }

  const handleMouseLeave = () => {
    if (isVideo && videoRef.current) {
      videoRef.current.pause()
      videoRef.current.currentTime = 0
    }
  }

  return (
    <div
      className={cn(
        'group relative overflow-hidden rounded-border-radius glass-card p-3 dark:bg-white/3 bg-white cursor-pointer',
        isSelected ? '!border-primary ring-1 ring-primary shadow-primary/20' : 'border-glass-border',
        selectionMode && 'cursor-pointer',
      )}
      onClick={() => {
        if (selectionMode && onSelect) {
          onSelect(!isSelected)
        }
      }}
    >
      {/* Selection Checkbox - Hidden if hideActions is true or if user cannot modify */}
      {(selectionMode || isSelected) && !hideActions && (
        <div className="absolute top-6 left-6 z-20">
          <Checkbox
            checked={isSelected}
            onCheckedChange={(checked) => onSelect?.(checked === true)}
            className="w-5 h-5 data-[state=checked]:bg-primary"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      <div
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="aspect-square bg-black/3 border dark:bg-white/5 relative flex items-center rounded-border-radius  justify-center hover-gradient-border overflow-hidden"
      >
        {isImage ? (
          <Image
            src={`${process.env.NEXT_PUBLIC_STORAGE_URL}${fileUrl}`}
            alt={attachment.name}
            fill
            unoptimized
            className="object-cover rounded-border-radius transition-transform duration-700 group-hover:scale-95"
          />
        ) : isVideo ? (
          <video
            ref={videoRef}
            src={`${process.env.NEXT_PUBLIC_STORAGE_URL}${fileUrl}`}
            className="w-full h-full object-cover rounded-border-radius transition-transform duration-700 group-hover:scale-95"
            muted
            playsInline
            preload="metadata"
          />
        ) : (
          <div className="text-primary/40 group-hover:text-primary transition-colors duration-500">{getIcon()}</div>
        )}

        {/* Overlay Actions - Hidden in Selection Mode or if hideActions is true */}
        {!selectionMode && !hideActions && (
          <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2">
            <Button
              size="icon"
              variant="secondary"
              className="w-10 h-10 rounded-full bg-black/50 text-white hover:bg-black/40 hover:text-white backdrop-blur-md flex items-center justify-center transition-all duration-300"
              onClick={(e) => {
                e.stopPropagation()
                onView?.(fileUrl)
              }}
              title={t('view')}
            >
              <Eye className="w-4 h-4" />
            </Button>

            <Button
              size="icon"
              variant="secondary"
              className="w-10 h-10 rounded-full bg-black/50 text-white hover:bg-black/40 hover:text-white backdrop-blur-md flex items-center justify-center transition-all duration-300"
              onClick={handleCopy}
              title={t('copy_url', { defaultValue: 'Copy URL' })}
            >
              {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
            </Button>

            {canModify && (
              <>
                <Button
                  size="icon"
                  variant="secondary"
                  className="w-10 h-10 rounded-full bg-black/50   text-white hover:bg-black/40 hover:text-white backdrop-blur-md flex items-center justify-center transition-all duration-300"
                  onClick={(e) => {
                    e.stopPropagation()
                    onEdit?.(attachment)
                  }}
                  title={t('edit')}
                >
                  <Edit2 className="w-4 h-4" />
                </Button>

                <Button
                  size="icon"
                  variant="destructive"
                  className="w-10 h-10 rounded-full bg-black/50   text-white hover:bg-black/40 hover:text-white backdrop-blur-md flex items-center justify-center transition-all duration-300"
                  onClick={(e) => {
                    e.stopPropagation()
                    onDelete?.(attachment._id || attachment.id)
                  }}
                  title={t('delete')}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </>
            )}
          </div>
        )}
      </div>

      <div className="space-y-1 mt-2">
        <h3 className="text-sm font-medium truncate pr-6" title={attachment.name}>
          {attachment.name}
        </h3>
        <div className="flex items-center justify-between text-xs text-muted-foreground uppercase tracking-wider font-semibold">
          <span>{attachment.mime_type?.split('/')[1] || 'FILE'}</span>
          <span>{formatBytes(attachment.file_size)}</span>
        </div>
      </div>
    </div>
  )
}

export default MediaCard
