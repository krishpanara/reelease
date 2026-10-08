'use client'

import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { AITemplate, TemplateCardProps } from '@/types/components/aiTemplate'
import { getMediaUrl } from '@/utils'
import { Edit2, Image as ImageIcon, Sparkles, Tag, Trash2, Video } from 'lucide-react'
import Image from 'next/image'
import { useTranslation } from 'react-i18next'

function getPreviewPath(template: AITemplate) {
  let previewPath = template.file_path
  if (!previewPath && template.attachment_id && typeof template.attachment_id === 'object') {
    previewPath = template.attachment_id.file_path
  }
  return getMediaUrl(previewPath || '') || null
}

function getIsVideo(previewPath: string | null, template: AITemplate) {
  if (!previewPath) return false
  if (previewPath.match(/\.(mp4|webm|ogg)$/i)) return true
  if (previewPath.startsWith('data:video')) return true
  if (template.attachment_id && typeof template.attachment_id === 'object' && template.attachment_id.file_type === 'video') return true
  return false
}

export function TemplateCard({
  template,
  onEdit,
  onDelete,
  onStatusChange,
  onView,
  canUpdate = true,
  canDelete = true,
}: TemplateCardProps & { canUpdate?: boolean; canDelete?: boolean }) {
  const { t } = useTranslation()
  const previewPath = getPreviewPath(template)
  const isVideo = getIsVideo(previewPath, template)
  const categoryName = typeof template.category_id === 'object' ? template.category_id?.name : template.category_id

  return (
    <div className="group relative flex flex-col p-2 rounded-border-radius border border-border/40  bg-white dark:bg-white/3 glass-card overflow-hidden transition-all duration-500 hover:-translate-y-2 glass-dark-card h-full cursor-pointer">
      {/* Thumbnail */}
      <div
        onClick={() => onView?.(template)}
        className="relative flex-none aspect-[16/10]  rounded-border-radius overflow-hidden transition-all duration-500 cursor-pointer"
      >
        <div className="relative w-full h-full border border-glass-border rounded-border-radius-inner bg-black/4 overflow-hidden hover-gradient-border ">
          {previewPath ? (
            isVideo ? (
              <div className="relative w-full h-full overflow-hidden rounded-border-radius">
                <div className="absolute inset-0 pointer-events-none select-none overflow-hidden">
                  <video
                    src={previewPath}
                    className="w-full h-full object-cover blur-sm opacity-80 scale-110"
                    muted
                    playsInline
                  />
                  <div className="absolute inset-0 bg-black/10" />
                </div>
                <video
                  src={previewPath}
                  className="w-full h-full object-contain object-center rounded-border-radius! transition-transform duration-700 group-hover:scale-95 relative z-10"
                  muted
                  loop
                  playsInline
                  onMouseEnter={(e) => {
                    const video = e.currentTarget
                    video.play()
                    const container = video.parentElement
                    const bgVideo = container?.querySelector('video.object-cover') as HTMLVideoElement
                    if (bgVideo) bgVideo.play()
                  }}
                  onMouseLeave={(e) => {
                    const video = e.currentTarget
                    video.pause()
                    video.currentTime = 0
                    const container = video.parentElement
                    const bgVideo = container?.querySelector('video.object-cover') as HTMLVideoElement
                    if (bgVideo) {
                      bgVideo.pause()
                      bgVideo.currentTime = 0
                    }
                  }}
                />
              </div>
            ) : (
              <div className="relative w-full h-full overflow-hidden rounded-border-radius">
                <div className="absolute inset-0 pointer-events-none select-none overflow-hidden">
                  <Image
                    width={100}
                    height={100}
                    unoptimized
                    src={previewPath}
                    alt={template.title}
                    className="w-full h-full object-cover blur-sm opacity-80 scale-110"
                  />
                  <div className="absolute inset-0 bg-black/10" />
                </div>
                <Image
                  width={100}
                  height={100}
                  unoptimized
                  src={previewPath}
                  alt={template.title}
                  className="absolute inset-0 w-full h-full object-center rounded-border-radius object-contain transition-transform duration-700 group-hover:scale-95 z-10"
                />
              </div>
            )
          ) : (
            <div className="w-full h-full bg-primary/5 flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-muted-foreground/30" />
            </div>
          )}

          <div className="absolute inset-0 dark:bg-white/3 bg-black/3 opacity-60 transition-opacity duration-500 group-hover:opacity-80 pointer-events-none" />

          {/* Hover Actions Overlay */}
          {(canUpdate || canDelete) && (
            <div className="absolute inset-0 flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-all duration-300 scale-90 group-hover:scale-100 bg-black/20 z-10">
              {canUpdate && (
                <Button
                  onClick={(e) => {
                    e.stopPropagation()
                    onEdit(template)
                  }}
                  title={t('edit')}
                  variant="secondary"
                  size="icon"
                  className="h-10 w-10 rounded-full bg-black/30 border border-white/30 text-white hover:bg-black/40 hover:text-white backdrop-blur-3xl flex items-center justify-center"
                >
                  <Edit2 className="w-4 h-4" />
                </Button>
              )}
              {canDelete && (
                <Button
                  onClick={(e) => {
                    e.stopPropagation()
                    onDelete(template.id || template._id)
                  }}
                  title={t('delete')}
                  variant="destructive"
                  size="icon"
                  className="h-10 w-10 rounded-full bg-black/30 border border-white/30 text-white hover:bg-black/40 hover:text-white backdrop-blur-3xl flex items-center justify-center"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>
          )}

          {/* Media Type Icon */}
          <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-md text-white/90 p-1.5 rounded-lg shadow-sm z-10">
            {isVideo ? <Video className="w-3.5 h-3.5" /> : <ImageIcon className="w-3.5 h-3.5" />}
          </div>
        </div>
      </div>

      <div className="p-4 pb-2! flex flex-col flex-1 gap-3">
        {/* Title & Status */}
        <div className="flex items-start justify-between gap-2">
          <h3
            className="font-bold text-lg text-foreground line-clamp-1 flex-1 transition-colors capitalize!"
            title={template.title}
          >
            {template.title}
          </h3>
          {canUpdate && (
            <Switch
              checked={template.status}
              onCheckedChange={() => onStatusChange(template.id || template._id, template.status, template)}
              onClick={(e) => e.stopPropagation()}
              className="data-[state=checked]:bg-primary h-5 w-9 shrink-0 [&_span]:h-4 [&_span]:w-4 [&_span]:data-[state=checked]:translate-x-4 rtl:[&_span]:data-[state=checked]:-translate-x-4"
            />
          )}
        </div>

        {/* Category */}
        <div className="flex items-center gap-1.5">
          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-md bg-primary/10 text-primary">
            <Tag className="w-3 h-3" />
            {categoryName || t('uncategorized', { defaultValue: 'Uncategorized' })}
          </span>
        </div>

        {/* Prompt Preview */}
        <p
          onClick={() => onView?.(template)}
          className="text-sm text-foreground/70 leading-relaxed line-clamp-2 mt-1 flex-1 cursor-pointer hover:text-foreground/90 transition-colors"
        >
          {template.prompt}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 mt-auto border-t border-border/40">
          <span className="text-xs text-muted-foreground font-medium">
            {template.prompt.length} {t('characters', { defaultValue: 'characters' })}
          </span>
          {template.created_at && (
            <span className="text-xs text-muted-foreground font-medium">
              {new Date(template.created_at).toLocaleDateString()}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
