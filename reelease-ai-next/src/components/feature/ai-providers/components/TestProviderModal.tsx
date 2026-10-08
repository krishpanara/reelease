'use client'

import MediaPickerModal from '@/components/feature/media-library/MediaPickerModal'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useSaveToMediaMutation } from '@/redux/api/aiApi'
import { useGetTaskStatusQuery, useTestProviderMutation } from '@/redux/api/aiProviderApi'
import { socket } from '@/services/socketSetup'
import { Attachment, ServiceType, TestProviderModalProps } from '@/types'
import { TestProviderProps } from '@/types/components/features'
import { AnimatePresence, motion } from 'framer-motion'
import { Loader2, Play, Plus, RotateCcw } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { TestProviderInputView } from './TestProviderInputView'
import { TestProviderProcessingView } from './TestProviderProcessingView'
import { TestProviderResultView } from './TestProviderResultView'


export const TestProviderModal = ({
  isOpen,
  onClose,
  providerId,
  providerName,
  taskId,
  setTaskId,
  view,
  setView,
  result,
  setResult,
}: TestProviderModalProps) => {
  const { t } = useTranslation()
  const [serviceType, setServiceType] = useState<ServiceType>('text_to_image')
  const [prompt, setPrompt] = useState('A futuristic city landscape, highly detailed, 8k resolution')
  const [apiKey, setApiKey] = useState('')
  const [aspectRatio, setAspectRatio] = useState('1:1')
  const [resolution, setResolution] = useState('1K')

  // New States for Media & Video
  const [referenceImages, setReferenceImages] = useState<Attachment[]>([])
  const [referenceVideo, setReferenceVideo] = useState<Attachment | null>(null)
  const [duration, setDuration] = useState(3)
  const [sound, setSound] = useState(false)
  const [mode, setMode] = useState('pro')

  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false)
  const [mediaPickerTarget, setMediaPickerTarget] = useState<'image' | 'video'>('image')
  const [mediaPickerTargetIndex, setMediaPickerTargetIndex] = useState<number | null>(null)

  const [testProvider, { isLoading }] = useTestProviderMutation()
  const [saveToMedia, { isLoading: isSaving }] = useSaveToMediaMutation()

  const { data: taskStatus } = useGetTaskStatusQuery(taskId || '', {
    skip: !taskId || !isOpen || view !== 'processing',
    pollingInterval: 3000,
  })

  useEffect(() => {
    if (!taskId || !isOpen) return
    if (!socket.connected) socket.connect()
    const eventName = `ai-task-test-${taskId}`
    const handleTaskResult = (data: TestProviderProps) => {
      if (data.status === 'completed') {
        setResult({ url: data.resultUrl ?? null, status: 'completed' })
        setView('result')
      } else if (data.status === 'failed') {
        setResult({
          url: null,
          status: 'failed',
          message: data.message || t('test_failed', 'Test failed'),
        })
        setView('result')
      }
    }
    socket.on(eventName, handleTaskResult)
    return () => {
      socket.off(eventName, handleTaskResult)
    }
  }, [taskId, isOpen, t, setView, setResult])

  useEffect(() => {
    if (taskStatus && view === 'processing') {
      if (taskStatus.status === 'completed' && taskStatus.attachment_id) {
        setResult({ url: taskStatus.attachment_id.file_path, status: 'completed' })
        setView('result')
      } else if (taskStatus.status === 'failed') {
        setResult({
          url: null,
          status: 'failed',
          message: taskStatus.error_message || t('test_failed', 'Test failed'),
        })
        setView('result')
      }
    }
  }, [taskStatus, view, t, setView, setResult])

  const handleTest = async () => {
    if (!prompt.trim()) {
      toast.error(t('prompt_required', 'Prompt is required'))
      return
    }
    try {
      const response = await testProvider({
        providerId,
        serviceType,
        prompt,
        apiKey: apiKey || undefined,
        aspectRatio: aspectRatio,
        resolution: resolution,
        attachmentId: referenceImages[0]?.id || referenceImages[0]?._id,
        attachmentIds: referenceImages.filter(Boolean).map((img) => img.id || (img._id as string)),
        videoAttachmentId: referenceVideo?.id || referenceVideo?._id,
        duration: serviceType === 'video_motion' ? undefined : duration,
        sound,
        mode,
      }).unwrap()
      if (response.taskId) {
        setTaskId(response.taskId)
        setView('processing')
      } else if (response.success || response.message) {
        if (response.data?.url) {
          setResult({ url: response.data.url, status: 'completed' })
          setView('result')
        }
      }
    } catch (error: unknown) {
      toast.error((error as { data?: { message?: string } })?.data?.message || t('test_failed', 'Test failed'))
    }
  }

  const handleReset = () => {
    setView('input')
    setResult(null)
    setTaskId(null)
    setReferenceImages([])
    setReferenceVideo(null)
    setDuration(5)
    setSound(false)
    setMode('pro')
  }

  const handleSaveToMedia = async () => {
    if (!taskId) return
    try {
      await saveToMedia({ taskId }).unwrap()
      toast.success(t('saved_to_media_success', 'Saved to media library successfully!'))
    } catch (error: unknown) {
      toast.error((error as { data?: { message?: string } })?.data?.message || t('failed_to_save_media', 'Failed to save to media'))
    }
  }

  const isVideo = serviceType.includes('video') || serviceType === 'video_motion'

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-2xl! max-w-[calc(100%-2rem)]! overflow-hidden bg-white/3 border-glass-border rounded-border-radius shadow-[0_32px_64px_-16px_rgba(0,0,0,0.4)] transition-all duration-500 flex flex-col max-h-[90vh]">
        <DialogHeader className="sr-only">
          <DialogTitle>{t('test_studio', 'AI Test Studio')}</DialogTitle>
          <DialogDescription>{t('test_provider_desc', 'Configure and test the AI service')}</DialogDescription>
        </DialogHeader>

        {/* Floating Header */}
        <div className="relative z-10">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-black tracking-tight text-foreground">
                  {t('test_studio', 'AI Test Studio')}
                </h2>
              </div>
              <p className="text-muted-foreground/80 text-sm font-medium">
                {view === 'input'
                  ? t('studio_desc', 'Powering up')
                  : view === 'processing'
                    ? t('crafting_magic', 'Weaving pixels for')
                    : t('output_ready', 'Generation result for')}{' '}
                <span className="text-primary font-bold">{providerName}</span>
              </p>
            </div>

            {view === 'processing' && (
              <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 animate-pulse">
                <Loader2 className="w-4 h-4 text-primary animate-spin" />
                <span className="text-xs font-bold text-primary uppercase tracking-widest">{t('live', 'Live')}</span>
              </div>
            )}
          </motion.div>
        </div>

        {/* Content Body */}
        <div className="relative z-10 flex-1 overflow-y-auto no-scrollbar min-h-0">
          <AnimatePresence mode="wait">
            {view === 'input' && (
              <TestProviderInputView
                serviceType={serviceType}
                setServiceType={setServiceType}
                aspectRatio={aspectRatio}
                setAspectRatio={setAspectRatio}
                resolution={resolution}
                setResolution={setResolution}
                referenceImages={referenceImages}
                setReferenceImages={setReferenceImages}
                referenceVideo={referenceVideo}
                setReferenceVideo={setReferenceVideo}
                duration={duration}
                setDuration={setDuration}
                mode={mode}
                setMode={setMode}
                sound={sound}
                setSound={setSound}
                prompt={prompt}
                setPrompt={setPrompt}
                apiKey={apiKey}
                setApiKey={setApiKey}
                setMediaPickerTarget={setMediaPickerTarget}
                setMediaPickerTargetIndex={setMediaPickerTargetIndex}
                setIsMediaPickerOpen={setIsMediaPickerOpen}
              />
            )}

            {view === 'processing' && <TestProviderProcessingView taskId={taskId} />}

            {view === 'result' && <TestProviderResultView result={result} isVideo={isVideo} />}
          </AnimatePresence>
        </div>

        {/* Dynamic Footer */}
        <div className="relative z-10 shrink-0">
          <AnimatePresence mode="wait">
            {view === 'input' ? (
              <motion.div
                key="footer-input"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-4"
              >
                <Button
                  variant="ghost"
                  onClick={onClose}
                  className="h-12 dark:bg-white/3 bg-black/3 border hover:text-white! w-full flex-1  rounded-radius hover:bg-destructive! font-bold transition-all"
                >
                  {t('cancel')}
                </Button>
                <Button
                  onClick={handleTest}
                  disabled={isLoading}
                  className="h-12 w-full flex-1 primary-btn dark:text-black text-white rounded-radius font-medium flex items-center justify-center gap-3"
                >
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Play className="w-5 h-5 fill-current" />}
                  {t('start_test')}
                </Button>
              </motion.div>
            ) : view === 'processing' ? (
              <motion.div key="footer-proc" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <Button
                  variant="outline"
                  onClick={onClose}
                  className="h-14 w-full rounded-2xl border-2 border-glass-border hover:bg-primary/5 hover:border-primary/30 font-bold transition-all flex items-center justify-center gap-3"
                >
                  <RotateCcw className="w-4 h-4 text-muted-foreground animate-reverse-spin-slow" />
                  {t('background_work', 'Continue in Studio Background')}
                </Button>
              </motion.div>
            ) : (
              <motion.div
                key="footer-res"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-3 w-full"
              >
                <Button
                  variant="outline"
                  onClick={onClose}
                  className="h-14 flex-1 rounded-2xl border-2 border-glass-border font-bold transition-all"
                >
                  {t('close', 'Close')}
                </Button>

                {result?.status === 'completed' && (
                  <Button
                    onClick={handleSaveToMedia}
                    disabled={isSaving}
                    className="h-14 flex-1 bg-emerald-500! text-black rounded-2xl font-black transition-all active:scale-95 flex items-center justify-center gap-2 shadow-[0_15px_30px_rgba(16,185,129,0.2)]"
                  >
                    {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
                    {t('save_to_media', 'SAVE TO MEDIA')}
                  </Button>
                )}

                <Button
                  onClick={handleReset}
                  className="h-14 flex-1 bg-primary! text-black rounded-2xl font-black transition-all active:scale-95 flex items-center justify-center gap-2 shadow-[0_15px_30px_rgba(var(--primary-rgb),0.2)]"
                >
                  <RotateCcw className="w-5 h-5" />
                  {t('new_test', 'NEW TEST')}
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </DialogContent>

      <MediaPickerModal
        isOpen={isMediaPickerOpen}
        onClose={() => setIsMediaPickerOpen(false)}
        onSelect={(attachment) => {
          const singleAttachment = Array.isArray(attachment) ? attachment[0] : attachment
          if (!singleAttachment) return
          if (mediaPickerTarget === 'image') {
            if (mediaPickerTargetIndex !== null) {
              setReferenceImages((prev) => {
                const next = [...prev]
                next[mediaPickerTargetIndex] = singleAttachment
                return next
              })
            } else {
              setReferenceImages((prev) => [...prev, singleAttachment])
            }
          } else {
            setReferenceVideo(singleAttachment)
          }
          setIsMediaPickerOpen(false)
        }}
      />
    </Dialog>
  )
}
