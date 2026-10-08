import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ImageToImageOutputProps } from '@/types/components/features'
import { Download, Image as ImageIcon, Loader2, Save, Wand2, Sparkles } from 'lucide-react'
import Image from 'next/image'
import { useTranslation } from 'react-i18next'
import { useRouter } from 'next/navigation'
import { ROUTES } from '@/constants/routes'

export interface ImageToImageOutputPropsExtended extends ImageToImageOutputProps {
  recentLogs?: any[]
  onSelectRecentLog?: (log: any) => void
}

export function ImageToImageOutput({
  isGenerating,
  resultImage,
  isSaving,
  handleSaveToMedia,
  handleDownload,
  recentLogs = [],
  onSelectRecentLog,
}: ImageToImageOutputPropsExtended) {
  const { t } = useTranslation()
  const router = useRouter()

  return (
    <Card className="bg-white dark:bg-white/3 border border-slate-200 dark:border-white/5 rounded-2xl overflow-hidden flex flex-col min-h-[350px] sm:min-h-115">
      <div className="p-4 border-b border-slate-200 dark:border-white/5 flex flex-col">
        <div className="text-base font-bold flex items-center gap-2 text-slate-900 dark:text-white">
          <Sparkles className="w-5 h-5 text-purple-400" />
          {t('generation_result', { defaultValue: 'Generation Result' })}
        </div>
        <p className="text-sm text-subtitle-color mt-0.5">Your AI generated images will appear here</p>
      </div>

      <CardContent className="p-6 flex-1 flex flex-col justify-center items-center relative">
        {isGenerating && !resultImage ? (
          <div className="flex flex-col items-center gap-4 py-8">
            <div className="relative w-16 h-16 sm:w-20 sm:h-20">
              <div className="absolute inset-0 rounded-full border-4 border-purple-500/10" />
              <div className="absolute inset-0 rounded-full border-4 border-purple-500 border-t-transparent animate-spin" />
              <Wand2 className="absolute inset-0 m-auto w-5 h-5 sm:w-6 sm:h-6 text-purple-400 animate-pulse" />
            </div>
            <p className="text-xs sm:text-sm font-bold text-purple-400 animate-pulse tracking-tight text-center">
              {t('crafting_masterpiece', { defaultValue: 'Crafting your masterpiece...' })}
            </p>
          </div>
        ) : resultImage ? (
          <div className="flex flex-col items-center gap-4 w-full max-w-sm mx-auto animate-in fade-in duration-500">
            <div className="relative group aspect-square w-full rounded-xl overflow-hidden shadow-2xl border border-white/5 bg-black/5">
              <Image
                src={`${process.env.NEXT_PUBLIC_STORAGE_URL || ''}/${resultImage}`}
                alt="Generated result"
                fill
                unoptimized
                className="object-contain"
              />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center gap-2 backdrop-blur-xs p-3">
                <Button
                  onClick={handleSaveToMedia}
                  disabled={isSaving}
                  className="gap-2 rounded-xl primary-btn h-9 w-40 text-white! font-bold text-xs"
                >
                  {isSaving ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Save className="w-3.5 h-3.5" />
                  )}
                  {t('save_to_library', { defaultValue: 'Save to Library' })}
                </Button>
                <Button
                  onClick={handleDownload}
                  className="gap-2 rounded-full h-10 w-10 p-0! bg-black/30 border border-white/30 text-white hover:bg-black/40 hover:text-white backdrop-blur-3xl flex items-center justify-center font-bold"
                >
                  <Download className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 w-full animate-in fade-in duration-500">
            <Image
              src="/images/text-to-image.png"
              alt="Text to Image preview"
              width={150}
              height={150}
              className="w-[150px] h-[150px] opacity-[0.5] object-cover"
              unoptimized
            />
            <div className="space-y-1.5 text-center">
              <p className="text-sm font-bold text-slate-900 dark:text-white">
                {t('no_images_generated', { defaultValue: 'No images generated yet' })}
              </p>
              <p className="text-xs text-slate-500 leading-normal">
                {t('image_appear_here_desc', {
                  defaultValue: 'Enter a prompt and click generate to create your first image.',
                })}
              </p>
            </div>
          </div>
        )}
      </CardContent>

      {/* Recent Prompts area inside Result Card */}
      <div className="p-4 border-t border-slate-200 dark:border-white/5 space-y-3">
        <h4 className="text-sm font-semibold text-title">{t('recent_prompts', { defaultValue: 'Recent Prompts' })}</h4>

        <div className="space-y-2">
          {recentLogs.slice(0, 3).map((log) => {
            const logPromptText =
              log.payload?.prompt || log.payload?.input?.prompt || log.payload?.text || 'AI Generated Image'
            const dateStr = log.created_at ? new Date(log.created_at).toLocaleDateString() : 'Recently'
            const thumbnail = log.result_url
              ? `${process.env.NEXT_PUBLIC_STORAGE_URL || ''}/${log.result_url}`
              : null

            return (
              <Button
                key={log._id || log.id}
                type="button"
                onClick={() => onSelectRecentLog?.(log)}
                variant="ghost"
                className="w-full h-auto text-left p-3 sm:p-4 rounded-border-radius-inner bg-subcard border! border-glass-border! dark:bg-white/3!  flex items-center justify-between gap-3 group transition-colors whitespace-normal"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white truncate leading-tight group-hover:text-primary transition-colors">
                    {logPromptText}
                  </p>
                  <p className="text-sm text-subtitle-color mt-1">
                    {log.status === 'completed' ? '1 image' : log.status} • {dateStr}
                  </p>
                </div>
                <div className="w-9 h-9 rounded-lg bg-purple-900/10 \ shrink-0 flex items-center justify-center text-slate-600 group-hover:border-purple-500/20 transition-all overflow-hidden relative">
                  {thumbnail ? (
                    <Image src={thumbnail} alt="Thumbnail" fill unoptimized className="object-cover" />
                  ) : (
                    <ImageIcon className="w-4 h-4 text-purple-500/30" />
                  )}
                </div>
              </Button>
            )
          })}
          {recentLogs.length === 0 && (
            <p className="text-xs text-slate-600 text-center py-4">{t('no_recent_prompts', { defaultValue: 'No recent prompts found.' })}</p>
          )}
        </div>

        <button
          type="button"
          onClick={() => router.push(ROUTES.USAGE_LOGS)}
          disabled={recentLogs.length === 0}
          className="w-full py-2 primary-btn border border-dashed border-glass-border hover:border-white/10 rounded-xl text-center text-white! text-xs font-semibold transition-colors block mt-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none"
        >
          {t('view_all_history', { defaultValue: 'View All History' })}
        </button>
      </div>
    </Card>
  )
}
