'use client'

import { ImageIcon, Plus } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import MediaCard from './MediaCard'
import { ExtendedMediaGridProps } from '@/types/mediaLibrary'

const MediaGrid = ({
  attachments,
  onDelete,
  onEdit,
  selectedIds,
  onSelect,
  selectionMode,
  onUpload,
  onView,
}: ExtendedMediaGridProps) => {
  const { t } = useTranslation()

  if (attachments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-100 bg-white/30 dark:bg-white/3 backdrop-blur-md border border-dashed border-glass-border rounded-2xl sm:p-12 p-4 text-center animate-fade-in">
        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6 ring-8 ring-primary/5">
          <ImageIcon className="w-10 h-10 text-primary" />
        </div>
        <h3 className="text-xl font-semibold mb-2">{t('no_media_found', { defaultValue: 'No media found' })}</h3>
        <p className="text-muted-foreground max-w-sm mx-auto">
          {t('no_results_description', { defaultValue: "We couldn't find any media assets in your library." })}
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
      {attachments.map((attachment) => (
        <MediaCard
          key={attachment._id || attachment.id}
          attachment={attachment}
          onDelete={onDelete}
          isSelected={selectedIds.includes(attachment._id || attachment.id)}
          onSelect={(selected) => onSelect(attachment._id || attachment.id, selected)}
          selectionMode={selectionMode}
          onView={onView}
          onEdit={onEdit}
        />
      ))}

      {onUpload && (
        <div
          onClick={onUpload}
          className="aspect-square rounded-border-radius border-2 border-dashed border-glass-border hover:border-primary/50 bg-background/20 hover:bg-primary/5 transition-all duration-300 flex flex-col items-center justify-center gap-3 cursor-pointer group"
        >
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Plus className="w-6 h-6 text-primary" />
          </div>
          <span className="text-sm font-medium text-muted-foreground group-hover:text-primary transition-colors">
            {t('upload_new', { defaultValue: 'Upload New' })}
          </span>
        </div>
      )}
    </div>
  )
}

export default MediaGrid
