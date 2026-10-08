'use client'

import { Button } from '@/components/ui/button'
import MediaPickerModal from '@/components/feature/media-library/MediaPickerModal'
import { Attachment } from '@/types'
import { Music2, Play, Trash2, Upload } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { MusicAttachmentPickerProps } from '@/types/components/features'



export function MusicAttachmentPicker({ selectedMusic, onSelect }: MusicAttachmentPickerProps) {
  const { t } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)

  const handleMediaSelect = (attachment: Attachment | Attachment[]) => {
    const item = Array.isArray(attachment) ? attachment[0] : attachment
    if (!item?.file_path) return
    const playUrl = item.file_path.startsWith('http')
      ? item.file_path
      : `${process.env.NEXT_PUBLIC_STORAGE_URL || ''}/${item.file_path.replace(/^\//, '')}`
    onSelect({
      name: item.name?.replace(/\.[^/.]+$/, '') || 'Selected track',
      url: playUrl,
      serverPath: item.file_path,
    })
    setIsOpen(false)
  }

  return (
    <div className="space-y-2 rounded-border-radius border border-glass-border bg-black/3 dark:bg-white/3 p-3">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-semibold text-title-color dark:text-white flex items-center gap-1.5">
          <Music2 className="w-3.5 h-3.5 text-purple-400" />
          {t('background_music_track', { defaultValue: 'Background music track' })}
        </span>
        {selectedMusic && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onSelect(null)}
            className="h-7 px-2 text-slate-400 hover:text-red-400"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        )}
      </div>

      {selectedMusic ? (
        <div className="flex items-center gap-2 rounded-lg bg-white/3 border border-white/5 px-3 py-2">
          <Music2 className="w-4 h-4 text-purple-400 shrink-0" />
          <span className="text-xs text-white truncate flex-1">{selectedMusic.name}</span>
          <a
            href={selectedMusic.url}
            target="_blank"
            rel="noreferrer"
            className="text-purple-400 hover:text-purple-300"
            onClick={(e) => e.stopPropagation()}
          >
            <Play className="w-3.5 h-3.5" />
          </a>
        </div>
      ) : (
        <p className="text-[12px] text-subtitle-color">
          {t('music_picker_hint', {
            defaultValue: 'Pick an audio file from your media library. AI-generated sound will be disabled.',
          })}
        </p>
      )}

      <Button
        type="button"
        variant="outline"
        onClick={() => setIsOpen(true)}
        className="w-full h-9 rounded-lg primary-btn text-white! text-xs font-bold gap-2"
      >
        <Upload className="w-3.5 h-3.5" />
        {selectedMusic
          ? t('change_music', { defaultValue: 'Change music' })
          : t('select_from_library', { defaultValue: 'Select from library' })}
      </Button>

      <MediaPickerModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onSelect={(attachment) => {
          const items = Array.isArray(attachment) ? attachment : [attachment]
          const audio = items.find(
            (m) => m.file_type === 'audio' || m.mime_type?.startsWith('audio/'),
          )
          if (!audio) {
            toast.error(t('select_audio_file', { defaultValue: 'Please select an audio file.' }))
            return
          }
          handleMediaSelect(audio)
        }}
        type="all"
      />
    </div>
  )
}
