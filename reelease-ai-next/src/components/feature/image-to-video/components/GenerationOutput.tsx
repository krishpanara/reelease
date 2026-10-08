'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { GenerationOutputProps } from '@/types/components/features'
import { useTranslation } from 'react-i18next'
import { useRouter } from 'next/navigation'
import { ROUTES } from '@/constants/routes'
import { Download, Film, Loader2, Save, MoreVertical, Play, Maximize2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export function GenerationOutput({
  isGenerating,
  resultVideo,
  isSaving,
  handleSaveToMedia,
  handleDownload,
  recentLogs = [],
  onSelectRecentLog,
}: GenerationOutputProps) {
  const { t } = useTranslation()
  const router = useRouter()

  return (
    <Card className="bg-white dark:bg-white/3 border border-slate-200 dark:border-white/5 rounded-2xl overflow-hidden flex flex-col min-h-[350px] sm:min-h-115">
      <div className="p-4 border-b border-slate-200 dark:border-white/5 flex flex-col">
        <div className="text-base font-bold flex items-center gap-2 text-slate-900 dark:text-white">
          <Film className="w-5 h-5 text-primary" />
          {t('generation_result', { defaultValue: 'Generation Result' })}
        </div>
        <p className="text-sm text-subtitle-color mt-0.5">
          {t('generation_result_desc', { defaultValue: 'Your AI generated video will appear here.' })}
        </p>
      </div>

      <CardContent className="p-6 flex-1 flex flex-col justify-center items-center relative min-h-[220px]">
        {isGenerating && !resultVideo ? (
          <div className="flex flex-col items-center gap-4 py-8">
            <div className="relative w-16 h-16 sm:w-20 sm:h-20">
              <div className="absolute inset-0 rounded-full border-4 border-primary/10" />
              <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin" />
              <Film className="absolute inset-0 m-auto w-5 h-5 sm:w-6 sm:h-6 text-primary animate-pulse" />
            </div>
            <p className="text-xs sm:text-sm font-bold text-primary animate-pulse tracking-tight text-center">
              {t('crafting_video', { defaultValue: 'Processing Video...' })}
            </p>
          </div>
        ) : resultVideo ? (
          <div className="w-full aspect-video rounded-xl overflow-hidden border border-slate-200 dark:border-white/5 bg-black/5 dark:bg-black/40 relative group">
            <video
              src={`${process.env.NEXT_PUBLIC_STORAGE_URL || ''}/${resultVideo}`}
              className="w-full h-full object-contain"
              controls
              playsInline
              autoPlay
              loop
            />
            <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center gap-2 z-10">
              <Button
                onClick={handleSaveToMedia}
                disabled={isSaving}
                className="gap-2 rounded-xl primary-btn h-9 w-40 text-white! font-bold text-xs"
              >
                {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                {t('save_to_library', { defaultValue: 'Save to Library' })}
              </Button>
              <Button
                onClick={handleDownload}
                className="gap-2 rounded-xl h-9 w-9 p-2! bg-primary! border border-white/10 text-white! font-bold text-xs"
              >
                <Download className="w-3.5 h-3.5" />
              </Button>
            </div>
            <div className="absolute bottom-3 right-3 p-2 rounded-xl bg-black/45 border border-white/10 text-white/60 hover:text-white cursor-pointer transition-colors z-10">
              <Maximize2 className="w-4 h-4" />
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 w-full animate-in fade-in duration-500 text-center">
            <div className="w-16 h-16 rounded-full bg-foreground/5 dark:bg-white/5 flex items-center justify-center mb-1 text-muted-foreground">
              <Play className="w-6 h-6" />
            </div>
            <div className="space-y-1.5">
              <p className="text-sm font-bold text-slate-900 dark:text-white">
                {t('no_video_generated', { defaultValue: 'No video generated yet' })}
              </p>
              <p className="text-xs text-slate-500 max-w-[220px] mx-auto leading-normal">
                {t('video_appear_here_desc', {
                  defaultValue: 'Enter a prompt and click generate to create your first video.',
                })}
              </p>
            </div>
          </div>
        )}
      </CardContent>

      {/* Recent Generations area inside Result Card */}
      <div className="p-4 border-t border-slate-200 dark:border-white/5 space-y-3">
        <h4 className="text-sm font-semibold text-title">{t('recent_generations', { defaultValue: 'Recent Generations' })}</h4>

        <div className="space-y-2">
          {recentLogs.slice(0, 4).map((log) => {
            const logPromptText =
              log.payload?.prompt ||
              (log.payload?.input as any)?.prompt ||
              log.payload?.text ||
              t('ai_generated_video', { defaultValue: 'AI Generated Video' })

            const dateStr = log.created_at ? new Date(log.created_at).toLocaleDateString() : t('recently', { defaultValue: 'Recently' })
            const resolutionLabel = log.payload?.resolution || '1080p'
            const durationLabel = log.payload?.duration ? `${log.payload.duration}s` : '5s'
            const thumbnail = log.result_url
              ? `${process.env.NEXT_PUBLIC_STORAGE_URL || ''}/${log.result_url}`
              : null

            return (
              <div
                key={log._id || log.id}
                onClick={() => onSelectRecentLog?.(log)}
                className="w-full text-left py-10 px-4 h-12 rounded-border-radius-inner bg-subcard dark:bg-white/3! border border-glass-border flex items-center justify-between gap-3 group transition-colors cursor-pointer"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white truncate leading-tight transition-colors">
                    {logPromptText}
                  </p>
                  <p className="text-xs text-subtitle-color mt-1 font-medium">
                    {dateStr} • {resolutionLabel} • {durationLabel}
                  </p>
                </div>
                <div className="w-10 h-10 rounded-full bg-purple-900/10 border border-white/5 shrink-0 flex items-center justify-center text-slate-650 group-hover:border-purple-500/20 transition-all overflow-hidden relative aspect-square">
                  {thumbnail ? (
                    <>
                      <video src={thumbnail} className="w-full h-full object-cover" muted playsInline />
                      <span className="absolute bottom-0.5 right-0.5 text-[8px] font-bold bg-black/70 text-white px-1 rounded-sm scale-75 origin-bottom-right">
                        {durationLabel}
                      </span>
                    </>
                  ) : (
                    <Film className="w-4 h-4 text-purple-500/30" />
                  )}
                </div>
              </div>
            )
          })}
          {recentLogs.length === 0 && (
            <p className="text-xs text-slate-600 text-center py-4">{t('no_recent_videos', { defaultValue: 'No recent videos found.' })}</p>
          )}
        </div>

        <Button
          type="button"
          onClick={() => router.push(ROUTES.USAGE_LOGS)}
          className="w-full py-2 primary-btn border border-dashed border-glass-border hover:border-white/10 rounded-xl text-center text-white! text-xs font-semibold transition-colors block mt-2"
        >
          {t('view_all_history', { defaultValue: 'View All History' })}
        </Button>
      </div>
    </Card>
  )
}
