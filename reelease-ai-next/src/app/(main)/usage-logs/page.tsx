'use client'

import { PageHeader } from '@/components/reusable/PageHeader'
import { Pagination } from '@/components/reusable/Pagination'
import { MediaViewModal } from '@/components/reusable/MediaViewModal'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Input from '@/components/ui/input'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { PERMISSIONS } from '@/constants/permissions'
import { useDebounce } from '@/hooks/useDebounce'
import { usePermission } from '@/hooks/usePermission'
import { cn } from '@/lib/utils'
import { useGetUsageLogsQuery, useSaveToMediaMutation } from '@/redux/api/aiApi'
import type { AITask } from '@/types/ai'
import { formatDate, getMediaUrl, getDownloadUrl } from '@/utils'
import { AlertCircle, Calendar, Clock, Clock3, Copy, Download, Loader2, PlayCircle, Save, Search, Zap } from 'lucide-react'
import Image from 'next/image'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { copyToClipboard } from '@/utils/clipboard'

export default function UsageLogsPage() {
  const { t } = useTranslation()
  const { hasPermission } = usePermission()
  const canView = hasPermission(PERMISSIONS.VIEW_USAGE_LOGS)

  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(12)
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search, 500)

  const { data, isLoading, isFetching } = useGetUsageLogsQuery({
    page,
    limit,
    search: debouncedSearch,
  })

  const [selectedLog, setSelectedLog] = useState<AITask | null>(null)
  const [saveToMedia, { isLoading: isSaving }] = useSaveToMediaMutation()

  const handleSaveToMedia = async () => {
    if (!selectedLog) return
    try {
      await saveToMedia({ taskId: selectedLog.task_id || selectedLog.id }).unwrap()
      toast.success(t('media_saved_successfully', { defaultValue: 'Media saved to library successfully' }))
    } catch (error: any) {
      toast.error(error?.data?.message || t('failed_to_save_media', { defaultValue: 'Failed to save media' }))
    }
  }

  const handleDownload = async () => {
    if (!selectedLog || !selectedLog.result_url) return
    const isVideo = selectedLog.service_type.toLowerCase().includes('video') || selectedLog.service_type.toLowerCase() === 'ecommerce_catalogue'
    const mediaUrl = getMediaUrl(selectedLog.result_url)
    try {
      const downloadUrl = getDownloadUrl(selectedLog.result_url)
      const response = await fetch(downloadUrl)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `media-${selectedLog.task_id || 'result'}.${isVideo ? 'mp4' : 'png'}`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      toast.error(t('failed_to_download', { defaultValue: 'Failed to download media' }))
      if (mediaUrl) window.open(mediaUrl, '_blank')
    }
  }

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'completed':
        return { label: t('completed'), color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20' }
      case 'running':
        return { label: t('running'), color: 'text-blue-500 bg-blue-500/10 border-blue-500/20' }
      case 'failed':
        return { label: t('failed'), color: 'text-rose-500 bg-rose-500/10 border-rose-500/20' }
      default:
        return { label: t(status), color: 'text-zinc-500 bg-zinc-500/10 border-zinc-500/20' }
    }
  }

  const selectedLogVideo = selectedLog ? (selectedLog.service_type.toLowerCase().includes('video') || selectedLog.service_type.toLowerCase() === 'ecommerce_catalogue') : false
  const selectedLogMediaUrl = selectedLog?.result_url ? getMediaUrl(selectedLog.result_url) : null
  const selectedLogPayload = selectedLog?.payload as any
  const selectedLogPrompt = selectedLogPayload?.input?.prompt || selectedLogPayload?.prompt || selectedLogPayload?.text || selectedLogPayload?.custom_prompt || ''

  useEffect(() => {
    setPage(1)
  }, [debouncedSearch])

  const logs = data?.logs || []
  const totalLogs = data?.total || 0
  const totalPages = data?.totalPages || 0

  if (!canView) {
    return (
      <div className="flex flex-col items-center justify-center p-10 sm:p-20 glass-card rounded-border-radius border-glass-border">
        <AlertCircle className="w-12 h-12 text-rose-500 mb-4" />
        <h3 className="text-xl font-bold text-white mb-2">{t('access_restricted')}</h3>
        <p className="text-muted-foreground">{t('no_permission_usage_logs')}</p>
      </div>
    )
  }

  return (
    <TooltipProvider>
      <div className="space-y-8">
        <PageHeader
          icon={<Clock3 className="w-6 h-6 text-primary animate-pulse" />}
          title={t('usage_logs')}
          subtitle={t('usage_logs_desc')}
          showBackButton={false}
          endContent={
            <div className="relative group w-full max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <Input
                type="text"
                placeholder={t('search_logs')}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-10 sm:h-11 pl-10 pr-4 bg-white/5 border border-white/10 rounded-xl outline-hidden focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all text-sm text-white placeholder:text-muted-foreground"
              />
              {isFetching && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <Loader2 className="w-4 h-4 text-primary animate-spin" />
                </div>
              )}
            </div>
          }
        />

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="glass-card h-80 rounded-border-radius border-glass-border animate-pulse bg-white/5"
              />
            ))}
          </div>
        ) : logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 sm:py-20 glass-card rounded-border-radius border-glass-border bg-white/3">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Clock className="w-8 h-8 text-primary/50" />
            </div>
            <h3 className="text-lg font-bold dark:text-white text-black">{t('no_usage_logs_found')}</h3>
            <p className="text-muted-foreground text-sm mt-1">{t('try_adjusting_your_search')}</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
              {logs.map((log, index) => (
                <UsageLogCard key={index} log={log} onView={() => setSelectedLog(log)} />
              ))}
            </div>

            <div className="mt-10 py-6 border-t border-white/10">
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                totalResults={totalLogs}
                onPageChange={setPage}
                rowsPerPage={limit}
                onRowsPerPageChange={(l) => {
                  setLimit(l)
                  setPage(1)
                }}
              />
            </div>
          </>
        )}
      </div>

      <MediaViewModal
        isOpen={selectedLog !== null}
        onClose={() => setSelectedLog(null)}
        title={selectedLog ? selectedLog.service_type.replace(/_/g, ' ') : ''}
        status={selectedLog ? getStatusConfig(selectedLog.status) : undefined}
        mediaUrl={selectedLogMediaUrl}
        isVideo={selectedLogVideo}
        isLoadingMedia={selectedLog?.status === 'running'}
        errorMessage={selectedLog?.status === 'failed' ? (selectedLog.error_message || 'Task failed') : null}
        prompt={selectedLogPrompt}
        creditsUsed={selectedLog?.credits_used}
        createdAt={selectedLog?.created_at}
        onDownload={selectedLog && selectedLog.status === 'completed' && selectedLogMediaUrl ? handleDownload : undefined}
        onSaveToMedia={selectedLog && selectedLog.status === 'completed' && selectedLogMediaUrl ? handleSaveToMedia : undefined}
        isSavingToMedia={isSaving}
      />
    </TooltipProvider>
  )
}

function UsageLogCard({ log, onView }: { log: AITask; onView: () => void }) {
  const { t } = useTranslation()
  const isVideo = log.service_type.toLowerCase().includes('video') || log.service_type.toLowerCase() === 'ecommerce_catalogue'
  const mediaUrl = log.result_url ? getMediaUrl(log.result_url) : null

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'completed':
        return { label: t('completed'), color: 'text-emerald-400 bg-emerald-600/10 border-emerald-500/20' }
      case 'running':
        return { label: t('running'), color: 'text-blue-500 bg-blue-500/10 border-blue-500/20' }
      case 'failed':
        return { label: t('failed'), color: 'text-rose-500 bg-rose-500/10 border-rose-500/20' }
      default:
        return { label: t(status), color: 'text-zinc-500 bg-zinc-500/10 border-zinc-500/20' }
    }
  }

  const status = getStatusConfig(log.status)
  const [saveToMedia, { isLoading: isSaving }] = useSaveToMediaMutation()

  const logPayload = log.payload as any
  const logPrompt =
    logPayload?.input?.prompt || logPayload?.prompt || logPayload?.text || logPayload?.custom_prompt || ''

  const handleSaveToMedia = async (e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      await saveToMedia({ taskId: log.task_id || log.id }).unwrap()
      toast.success(t('media_saved_successfully', { defaultValue: 'Media saved to library successfully' }))
    } catch (error: any) {
      toast.error(error?.data?.message || t('failed_to_save_media', { defaultValue: 'Failed to save media' }))
    }
  }

  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!log.result_url) return

    try {
      const downloadUrl = getDownloadUrl(log.result_url)
      const response = await fetch(downloadUrl)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `media-${log.task_id || 'result'}.${isVideo ? 'mp4' : 'png'}`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      toast.error(t('failed_to_download', { defaultValue: 'Failed to download media' }))
      // Fallback: open in new tab
      if (mediaUrl) window.open(mediaUrl, '_blank')
    }
  }

  return (
    <div onClick={onView} className="group relative flex flex-col p-3 rounded-border-radius border border-border/40 glass-card overflow-hidden transition-all duration-500 hover:-translate-y-2 glass-dark-card h-full cursor-pointer dark:bg-white/3 bg-white">
      {/* Media Preview Section */}
      <div className="relative flex-none aspect-video rounded-border-radius overflow-hidden transition-all duration-500">
        <div className="absolute inset-0 transition-all duration-300">
          <div className="relative w-full h-full rounded-border-radius overflow-hidden hover-gradient-border shadow-[0_0_0_1px_rgba(255,255,255,0.05)]">
            {log.status === 'completed' && mediaUrl ? (
              <div className="block w-full h-full relative group/media">
                {isVideo ? (
                  <div className="relative w-full h-full overflow-hidden rounded-border-radius group/media bg-zinc-900">
                    <div className="absolute inset-0 pointer-events-none select-none overflow-hidden">
                      <video
                        src={mediaUrl}
                        className="w-full h-full object-cover blur-sm opacity-80 scale-110"
                        muted
                        playsInline
                      />
                      <div className="absolute inset-0 bg-black/10" />
                    </div>
                    <video
                      src={mediaUrl}
                      className="w-full h-full object-contain rounded-border-radius transition-transform duration-700 group-hover:scale-95 relative z-10"
                      muted
                      playsInline
                      onMouseOver={(e) => {
                        const video = e.target as HTMLVideoElement
                        video.play()
                        const container = video.parentElement
                        const bgVideo = container?.querySelector('video.object-cover') as HTMLVideoElement
                        if (bgVideo) bgVideo.play()
                      }}
                      onMouseOut={(e) => {
                        const video = e.target as HTMLVideoElement
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
                    <div className="absolute inset-0 m-auto w-10 h-10 text-white opacity-0 group-hover/media:opacity-100 transition-all duration-300 scale-50 group-hover/media:scale-100 flex items-center justify-center pointer-events-none z-20">
                      <PlayCircle className="w-10 h-10" />
                    </div>
                  </div>
                ) : (
                  <div className="relative w-full h-full overflow-hidden">
                    <div className="absolute inset-0 pointer-events-none select-none overflow-hidden">
                      <Image
                        src={mediaUrl}
                        alt={log.service_type}
                        fill
                        className="object-cover blur-sm opacity-80 scale-110"
                        unoptimized
                      />
                      <div className="absolute inset-0 bg-black/10" />
                    </div>
                    <Image
                      src={mediaUrl}
                      alt={log.service_type}
                      fill
                      className="object-contain transition-transform duration-700 relative z-10"
                      unoptimized
                    />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/3 dark:bg-white/8! border transition-opacity duration-500 group-hover:opacity-80 pointer-events-none" />
              </div>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center gap-3 bg-black dark:bg-white/8">
                {log.status === 'running' ? (
                  <div className="relative">
                    <div className="w-12 h-12 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
                    <Clock className="absolute inset-0 m-auto w-5 h-5 text-primary animate-pulse" />
                  </div>
                ) : (
                  <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                    <AlertCircle
                      className={cn('w-6 h-6', log.status === 'failed' ? 'text-rose-500' : 'text-muted-foreground')}
                    />
                  </div>
                )}
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-widest">
                  {t(log.status)}
                </span>
              </div>
            )}

            {/* Status Badge Overlay */}
            <div className="absolute top-3 left-3 z-10 text-white!">
              <Badge
                className={cn(
                  'px-2.5 py-0.5 text-3xs font-bold rounded-md border shadow-2xl backdrop-blur-md',
                  status.color,
                )}
              >
                {status.label}
              </Badge>
            </div>

            {/* Action Buttons Overlay */}
            {log.status === 'completed' && mediaUrl && (
              <div className="absolute top-3 right-3 z-10 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 scale-90 group-hover:scale-100">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={handleSaveToMedia}
                      disabled={isSaving}
                      className="w-8! h-8! p-0! rounded-full bg-black/55! border border-white/30 text-white! hover:bg-black/40 hover:text-white backdrop-blur-3xl flex items-center justify-center transition-all duration-300 disabled:opacity-50"
                    >
                      {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="bg-zinc-900 border-zinc-800 text-white!">
                    <p>{t('save_to_media_library', { defaultValue: 'Save to Media Library' })}</p>
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={handleDownload}
                      className="w-8! h-8! p-0! rounded-full bg-black/55! border border-white/30 text-white! hover:bg-black/40 hover:text-white backdrop-blur-3xl flex items-center justify-center transition-all duration-300"
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="bg-zinc-900 border-zinc-800 text-white!">
                    <p>{t('download_media', { defaultValue: 'Download Media' })}</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="pt-4 flex flex-col flex-1">
        <div className="flex flex-col gap-2 mb-4">
          <div className="flex items-start justify-between gap-2">
            <div className="flex flex-col gap-0.5 min-w-0">
              <span className="text-base text-primary font-bold break-all whitespace-normal line-clamp-1">
                {t('service_type')}
              </span>
              <h3
                className="text-sm font-semibold text-title-color dark:text-white truncate transition-colors"
                title={log.service_type.replace(/_/g, ' ')}
              >
                {log.service_type.replace(/_/g, ' ')}
              </h3>
            </div>
            <div className="flex flex-col items-end shrink-0">
              <span className="text-sm text-amber-500 font-bold ">{t('used_credits')}</span>
              <div className="flex items-center gap-1 mt-0.5">
                <Zap className="w-3 h-3 text-amber-500 fill-amber-500" />
                <span className="text-3xs sm:text-base font-semibold text-subtitle-color dark:text-white">
                  {log.credits_used}
                </span>
              </div>
            </div>
          </div>
          {logPrompt && (
            <div className="group/prompt relative rounded-[8px] bg-subcard dark:bg-white/5 p-3 border border-glass-border">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <span className="text-3xs font-bold text-muted-foreground uppercase tracking-wider mb-1 block">
                    {t('prompt', { defaultValue: 'Prompt' })}
                  </span>
                  <p className="text-xs text-slate-700 dark:text-slate-300 line-clamp-2" title={logPrompt}>
                    {logPrompt}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-6 h-6 shrink-0 opacity-0 group-hover/prompt:opacity-100 transition-opacity bg-white dark:bg-white/10 shadow-sm"
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    copyToClipboard(logPrompt)
                    toast.success(t('prompt_copied', { defaultValue: 'Prompt copied to clipboard' }))
                  }}
                  title="Copy Prompt"
                >
                  <Copy className="w-3 h-3 text-title-color" />
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="mt-auto pt-3 border-t border-glass-border flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-muted-foreground min-w-0">
            <Calendar className="w-4 h-4 shrink-0" />
            <span className="text-subtitle-color font-medium truncate text-sm">{formatDate(log.created_at)}</span>
          </div>
          <div className="flex items-center gap-1.5 text-muted-foreground shrink-0">
            <Clock className="w-4 h-4" />
            <span className="text-sm font-medium">
              {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

