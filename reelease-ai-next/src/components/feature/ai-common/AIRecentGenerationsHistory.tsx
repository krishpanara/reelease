'use client'

import { getMediaUrl } from '@/utils'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useTranslation } from 'react-i18next'
import { ROUTES } from '@/constants/routes'
import { Image as ImageIcon, Film } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { AIRecentGenerationsHistoryProps, GenerationLogItem } from '@/types/components/features'

export function AIRecentGenerationsHistory({
  logs,
  mediaType,
  onSelectLog,
  title = 'Recent Generations',
  emptyMessage = 'No recent generations found.',
}: AIRecentGenerationsHistoryProps) {
  const { t } = useTranslation()
  const router = useRouter()
  const MediaIcon = mediaType === 'video' ? Film : ImageIcon

  const getPromptText = (log: GenerationLogItem) => {
    const p = log.payload
    if (!p) return mediaType === 'video' ? 'AI Generated Video' : 'AI Generated Image'
    return (
      (p.prompt as string) ||
      (p.input as { prompt?: string })?.prompt ||
      (p.text as string) ||
      (mediaType === 'video' ? 'AI Generated Video' : 'AI Generated Image')
    )
  }

  return (
    <div className="p-4 border-t border-glass-border space-y-3">
      <h4 className="text-sm font-semibold text-title">{title}</h4>

      <div className="space-y-2">
        {logs.slice(0, 3).map((log) => {
          const logPromptText = getPromptText(log)
          const dateStr = log.created_at ? new Date(log.created_at).toLocaleDateString() : 'Recently'
          const thumbnail = log.result_url ? getMediaUrl(log.result_url) : null

          return (
            <Button
              key={log._id || log.id || log.task_id}
              type="button"
              onClick={() => {
                onSelectLog(log)
                toast.success(t('prompt_loaded', { defaultValue: 'Loaded from history!' }))
              }}
              variant="ghost"
              className="w-full h-auto text-left p-3 sm:p-4 rounded-border-radius-inner bg-subcard border! border-glass-border! dark:bg-white/3!  flex items-center justify-between gap-3 group transition-colors whitespace-normal"
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-black dark:text-white mb-1 truncate leading-tight">
                  {logPromptText}
                </p>
                <p className="text-xs text-normal text-subtitle-color">
                  {log.status === 'completed' ? (mediaType === 'video' ? '1 video' : '1 image') : log.status} •{' '}
                  {dateStr}
                </p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-purple-900/10 border border-white/5 shrink-0 flex items-center justify-center text-slate-600 group-hover:border-purple-500/20 transition-all overflow-hidden relative">
                {thumbnail ? (
                  mediaType === 'video' ? (
                    <video src={thumbnail} className="w-full h-full object-cover" muted playsInline />
                  ) : (
                    <Image src={thumbnail} alt="Thumbnail" fill unoptimized className="object-cover" />
                  )
                ) : (
                  <MediaIcon className="w-4 h-4 text-purple-500/30" />
                )}
              </div>
            </Button>
          )
        })}
        {logs.length === 0 && <p className="text-xs text-slate-600 text-center py-4">{emptyMessage}</p>}
      </div>

      <button
        type="button"
        onClick={() => router.push(ROUTES.USAGE_LOGS)}
        disabled={logs.length === 0}
        className="w-full py-2 primary-btn border border-dashed border-glass-border hover:border-white/10 rounded-xl text-center text-white! text-xs font-semibold transition-colors block mt-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none"
      >
        {t('view_all_history', { defaultValue: 'View All History' })}
      </button>
    </div>
  )
}
