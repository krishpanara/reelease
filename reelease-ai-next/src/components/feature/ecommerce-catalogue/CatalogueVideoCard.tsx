'use client'

import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { getMediaUrl, normalizeUploadPath } from '@/utils'
import { AlertCircle, Loader2, Play, Trash2 } from 'lucide-react'
import Image from 'next/image'
import { useTranslation } from 'react-i18next'
import { CatalogueVideoCardProps } from '@/types/ecommerceCatalogue'

function MediaImage({ path, alt }: { path: string; alt: string }) {
  const src = getMediaUrl(path)
  if (!src) return null
  return <Image src={src} alt={alt} fill unoptimized className="object-cover" />
}

export function CatalogueVideoCard({ task, onPlay, onDelete }: CatalogueVideoCardProps) {
  const { t } = useTranslation()

  const char = task.payload?.character
  const prod = task.payload?.product
  const isPending = task.status === 'pending' || task.status === 'running'
  const isFailed = task.status === 'failed'
  const videoUrl = getMediaUrl(normalizeUploadPath(task?.result_url))

  return (
    <Card className="dark:bg-white/3 h-full bg-black/3 border border-glass-border overflow-hidden rounded-2xl flex flex-col group transition-all duration-300 hover:border-purple-500/20 hover:-translate-y-0.5">
      <div className="aspect-[4/5] w-full bg-black relative flex items-center justify-center overflow-hidden">
        {/* Status overlays */}
        {isPending ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 z-10 p-6 text-center space-y-4">
            <Loader2 className="w-10 h-10 animate-spin text-purple-400" />
            <p className="text-sm font-bold text-white uppercase tracking-wider">
              {t('generating_video', { defaultValue: 'AI Model Demonstrating...' })}
            </p>
          </div>
        ) : isFailed ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 z-10 p-6 text-center space-y-4">
            <AlertCircle className="w-10 h-10 text-red-500" />
            <p className="text-sm font-bold text-red-400 uppercase tracking-wider">
              {t('generation_failed', { defaultValue: 'Generation Failed' })}
            </p>
          </div>
        ) : (
          <>
            {videoUrl && (
              <video
                src={videoUrl}
                autoPlay
                loop
                muted
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/10 to-transparent opacity-60" />
            <button
              type="button"
              onClick={() => task.result_url && onPlay(task.result_url, task.payload?.prompt || null)}
              className="absolute w-16 h-16 rounded-full bg-purple-600 text-white flex items-center justify-center shadow-2xl z-10 hover:bg-purple-500 transition-colors"
            >
              <Play className="w-7 h-7 fill-white translate-x-[2px]" />
            </button>
          </>
        )}

        {/* Character badge */}
        {char?.image_url && (
          <div className="absolute top-4 left-4 z-20 flex items-center gap-2 bg-black/60 backdrop-blur-md rounded-full pl-2 pr-4 py-1.5 border border-white/10">
            <div className="w-6 h-6 rounded-full overflow-hidden relative border border-purple-500/40">
              <MediaImage path={char.image_url} alt={char.name} />
            </div>
            <span className="text-[10px] font-bold text-white uppercase">{char.name}</span>
          </div>
        )}

        {/* Aspect / duration badge */}
        <div className="absolute bottom-4 left-4 right-4 z-10 flex justify-between text-[10px] font-bold uppercase text-white bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/5">
          <span>{task.payload?.aspectRatio || '9:16'}</span>
          <span>{task.payload?.duration || '8s'}</span>
        </div>

        {/* Delete button */}
        <button
          type="button"
          onClick={() => onDelete(task._id || task.id)}
          className="absolute top-4 right-4 z-20 w-8 h-8 rounded-xl bg-black/60 hover:bg-red-500/80 border border-white/10 text-slate-300 flex items-center justify-center"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      <CardContent className="p-4 flex-1 flex flex-col justify-between gap-4">
        <div className="space-y-2">
          <p className="text-sm font-bold text-purple-400">{prod?.name || 'Product'}</p>
          <p className="text-xs text-slate-500 line-clamp-2">&ldquo;{task.payload?.prompt}&rdquo;</p>
        </div>
        <div className="pt-2 border-t border-white/5 flex justify-between items-center text-[12px] text-slate-500">
          <span>{new Date(task.created_at).toLocaleDateString()}</span>
          <span
            className={cn(
              'px-2 py-0.5 rounded-full text-[12px] font-bold capitalize',
              isPending
                ? 'bg-amber-500/10 text-amber-400'
                : isFailed
                  ? 'bg-red-500/10 text-red-400'
                  : 'bg-emerald-500/10 text-emerald-400',
            )}
          >
            {task.status}
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
