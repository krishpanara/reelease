'use client'

import MediaPickerModal from '@/components/feature/media-library/MediaPickerModal'
import { AIFeaturePageHeader } from '../ai-common/AIFeaturePageHeader'
import { AspectRatioBox } from '../ai-common/AspectRatioBox'
import { AISwitch } from '../ai-common/AISwitch'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textArea'
import { Slider } from '@/components/ui/slider'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useGenerateMediaMutation, useGetUsageLogsQuery, useSaveToMediaMutation } from '@/redux/api/aiApi'
import { useGetDashboardStatsQuery } from '@/redux/api/dashboardApi'
import { useGenerateCaptionMutation } from '@/redux/api/socialPublishApi'
import { useAppSelector } from '@/redux/hooks'
import type { RootState } from '@/redux/store'
import { socket } from '@/services/socketSetup'
import { Attachments, MediaTaskProp } from '@/types/components/features'
import { ROUTES } from '@/constants/routes'
import { getDownloadUrl, getMediaUrl } from '@/utils'
import { videoDetailEnhancements, videoSurprisePrompts } from '@/data/aiPromptPresets'
import {
  Clapperboard,
  Sparkle,
  Layers,
  Briefcase,
  Zap,
  Clock,
  ChevronDown,
  Wand2,
  Plus,
  Dices,
  HelpCircle,
  Video,
  Image as ImageIcon,
  RotateCcw,
  Sparkles,
  Loader2,
  Save,
  Download,
  Play,
  Maximize2,
  Film,
  MoreVertical,
  Volume2,
  VolumeX,
  Lightbulb,
  X,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import PromptLibraryModal from '../ai-common/PromptLibraryModal'
import { AIProTipsCard } from '../ai-common/AIProTipsCard'
import { AIPromptDescribeSection } from '../ai-common/AIPromptDescribeSection'

const VideoMotionContent = () => {
  const { t } = useTranslation()
  const router = useRouter()
  const user = useAppSelector((state: RootState) => state.auth.user)

  // Core inputs state
  const [prompt, setPrompt] = useState('')
  const [selectedVideo, setSelectedVideo] = useState<Attachments | null>(null)
  const [selectedImage, setSelectedImage] = useState<Attachments | null>(null)
  const [mediaPickerType, setMediaPickerType] = useState<'video' | 'image'>('video')
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isPromptLibraryOpen, setIsPromptLibraryOpen] = useState(false)

  // Generation State
  const [currentTaskId, setCurrentTaskId] = useState<string | null>(null)
  const [resultVideo, setResultVideo] = useState<string | null>(null)

  // Settings State (matching Step 2 & 3 layout)
  const [ratio, setRatio] = useState('16:9')
  const [quality, setQuality] = useState('1080p')
  const [intensity, setIntensity] = useState(50) // Low (0-34), Medium (35-65), High (66-100)
  const [cameraMovement, setCameraMovement] = useState('Default (AI Optimized)')
  const [duration, setDuration] = useState(5) // Default to 5s

  // Advanced Options State
  const [sound, setSound] = useState(false)
  const [addWatermark, setAddWatermark] = useState(false)
  const [negativePrompt, setNegativePrompt] = useState('')
  const [seed, setSeed] = useState('')
  const [outputDestination, setOutputDestination] = useState('Media Library')
  const [isOutputOpen, setIsOutputOpen] = useState(false)

  // Redux API Mutations/Queries
  const { data: stats } = useGetDashboardStatsQuery()
  const credits = stats?.aiFeatures?.find((f) => f.feature_key === 'video_motion')?.credits || 10

  const [generateMedia] = useGenerateMediaMutation()
  const [saveToMedia, { isLoading: isSaving }] = useSaveToMediaMutation()
  const [generateCaption, { isLoading: isEnhancingPrompt }] = useGenerateCaptionMutation()

  // Recent Generations usage logs
  const { data: usageLogsData, refetch: refetchLogs } = useGetUsageLogsQuery({
    serviceType: 'video_motion',
    limit: 5,
  })
  const recentLogs = usageLogsData?.logs || []

  // Socket Listener for AI Task
  useEffect(() => {
    if (!user) return

    const handleTaskUpdate = (payload: MediaTaskProp) => {
      if (payload.taskId === currentTaskId) {
        if (payload.status === 'completed') {
          setIsGenerating(false)
          setResultVideo(payload.resultUrl ?? null)
          refetchLogs()
          toast.success(t('video_generated_successfully', { defaultValue: 'Motion video generated successfully!' }))
        } else if (payload.status === 'failed') {
          setIsGenerating(false)
          toast.error(payload.message || t('generation_failed', { defaultValue: 'Motion generation failed' }))
        }
      }
    }

    const eventName = `ai-task-${user._id || user.id}`
    socket.on(eventName, handleTaskUpdate)

    return () => {
      socket.off(eventName, handleTaskUpdate)
    }
  }, [user, currentTaskId, t, refetchLogs])

  const handleGenerate = async () => {
    if (!selectedVideo && !selectedImage) {
      toast.error(t('select_media_first', { defaultValue: 'Please select reference media' }))
      return
    }
    if (!prompt.trim()) {
      toast.error(t('enter_prompt_first', { defaultValue: 'Please enter a creative prompt' }))
      return
    }

    try {
      setIsGenerating(true)
      setResultVideo(null)
      setCurrentTaskId(null)

      let finalPrompt = prompt.trim()

      // Since the backend Kling video motion API payload only receives `prompt`, `input_urls` (reference image),
      // and `video_urls` (reference video), we append the advanced settings (camera movement, intensity, negative prompt, seed)
      // directly to the prompt text string so they guide the AI model's generation process.
      if (cameraMovement && cameraMovement !== 'Default (AI Optimized)') {
        finalPrompt += `, camera movement: ${cameraMovement}`
      }

      // Determine intensity label
      let intensityLabel = 'Medium'
      if (intensity < 35) intensityLabel = 'Low'
      else if (intensity > 65) intensityLabel = 'High'
      finalPrompt += `, motion intensity: ${intensityLabel}`

      if (negativePrompt && negativePrompt.trim()) {
        finalPrompt += `, negative prompt: ${negativePrompt.trim()}`
      }

      if (seed && seed.trim()) {
        finalPrompt += `, seed: ${seed.trim()}`
      }

      const res = await generateMedia({
        serviceType: 'video_motion',
        prompt: finalPrompt,
        attachmentId: selectedImage?.id || selectedImage?._id,
        videoAttachmentId: selectedVideo?.id || selectedVideo?._id,
        aspectRatio: ratio,
        resolution: quality,
        mode: 'pro',
        sound,
        duration,
        seed: seed || undefined,
        negativePrompt: negativePrompt || undefined,
        addWatermark,
      }).unwrap()

      if (res.taskId) {
        setCurrentTaskId(res.taskId)
        toast.info(t('motion_gen_started', { defaultValue: 'Video Motion processing started...' }))
      } else {
        setIsGenerating(false)
        toast.error(t('failed_to_start_generation', { defaultValue: 'Failed to start generation task' }))
      }
    } catch (error: unknown) {
      setIsGenerating(false)
      toast.error(
        (error as { data?: { message?: string } })?.data?.message ||
        t('something_went_wrong', { defaultValue: 'Something went wrong' }),
      )
    }
  }

  const handleSaveToMedia = async () => {
    if (!currentTaskId) return
    try {
      await saveToMedia({ taskId: currentTaskId }).unwrap()
      toast.success(t('saved_to_media_success', { defaultValue: 'Saved to media library successfully!' }))
    } catch (error: unknown) {
      toast.error(
        (error as { data?: { message?: string } })?.data?.message ||
        t('failed_to_save_media', { defaultValue: 'Failed to save to media' }),
      )
    }
  }

  const handleDownload = async (videoPath?: string) => {
    const path = videoPath || resultVideo
    if (!path) return
    try {
      const url = getDownloadUrl(path)
      const response = await fetch(url)
      const blob = await response.blob()
      const blobUrl = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = blobUrl
      link.download = `motion-video-${Date.now()}.mp4`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(blobUrl)
    } catch {
      toast.error(t('failed_to_download_video', { defaultValue: 'Failed to download video' }))
    }
  }

  const openMediaPicker = (type: 'video' | 'image') => {
    setMediaPickerType(type)
    setIsMediaPickerOpen(true)
  }

  const handleAddDetails = () => {
    if (!prompt.trim()) {
      toast.warning(t('enter_prompt_first', { defaultValue: 'Please enter a prompt first' }))
      return
    }
    const detail = videoDetailEnhancements[Math.floor(Math.random() * videoDetailEnhancements.length)]
    setPrompt((prev) => (prev.includes(detail) ? prev : `${prev}, ${detail}`))
    toast.success(t('details_added', { defaultValue: 'Visual details added to your prompt!' }))
  }

  const handleResetAll = () => {
    setPrompt('')
    setSelectedVideo(null)
    setSelectedImage(null)
    setRatio('16:9')
    setQuality('1080p')
    setIntensity(50)
    setCameraMovement('Default (AI Optimized)')
    setDuration(5)
    setSound(false)
    setAddWatermark(false)
    setNegativePrompt('')
    setSeed('')
    setOutputDestination('Media Library')
    toast.info(t('settings_reset', { defaultValue: 'All settings reset to defaults.' }))
  }

  const handleRandomizeSeed = () => {
    setSeed(Math.floor(Math.random() * 89999 + 10000).toString())
    toast.success(t('seed_randomized', { defaultValue: 'Random seed generated!' }))
  }

  const handleHistorySelect = (log: any) => {
    const logPrompt = log.payload?.prompt || log.payload?.input?.prompt || log.payload?.text || ''
    if (logPrompt) setPrompt(logPrompt)
    if (log.result_url && log.task_id) {
      setResultVideo(log.result_url)
      setCurrentTaskId(log.task_id)
    }
  }

  const intensityText =
    intensity < 35
      ? t('low', { defaultValue: 'Low' })
      : intensity > 65
        ? t('high', { defaultValue: 'High' })
        : t('medium', { defaultValue: 'Medium' })

  const actionFooter = (
    <>
      <Button
        onClick={handleResetAll}
        variant="outline"
        className="h-11 px-4 rounded-xl bg-slate-50 dark:bg-white/3 border border-glass-border hover:border-slate-300 dark:hover:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5 text-slate-700 dark:text-slate-300 gap-2 font-bold text-xs"
      >
        <RotateCcw className="w-4 h-4 text-slate-400" />
        {t('reset_all', { defaultValue: 'Reset All' })}
      </Button>

      <div className="flex flex-col items-end">
        <Button
          onClick={handleGenerate}
          disabled={isGenerating || (!selectedVideo && !selectedImage) || !prompt.trim()}
          className="h-11 sm:h-12 px-6 rounded-xl primary-btn hover:opacity-95 text-white! font-bold gap-2 text-xs sm:text-sm flex items-center border-0"
        >
          {isGenerating ? (
            <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
          ) : (
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-white fill-white/10" />
          )}
          {isGenerating ? t('generating') : t('generate_motion_btn', { defaultValue: 'Generate Motion' })}

          {!isGenerating && (
            <span className="w-7 h-7 flex items-center gap-1.5 ml-1 justify-center bg-black/20 rounded-full text-[12px] font-bold border border-glass-border">
              {credits}
            </span>
          )}
        </Button>
        <span className="text-[11px] text-slate-500 font-medium mt-1">
          {t('generation_credit_cost_video', {
            defaultValue: 'Uses {{credits}} credits (1 generation)',
            credits,
          })}
        </span>
      </div>
    </>
  )

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-10">
      {/* Header section with rich aesthetics */}
      <AIFeaturePageHeader
        icon={<Clapperboard className="w-6 h-6 text-primary animate-pulse" />}
        title={t('video_motion', { defaultValue: 'Video Motion' })}
        subtitle={t('video_motion_desc', {
          defaultValue: 'Add cinematic movement to your videos with advanced AI motion control.',
        })}
      />

      {/* Glassmorphic tags bar under header */}
      <div className="flex flex-wrap gap-2 py-1">
        <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-slate-100 dark:bg-white/3 border border-slate-200 dark:border-white/5 text-slate-700 dark:text-slate-300">
          <Sparkle className="w-3.5 h-3.5 text-blue-400" />{' '}
          {t('cinematic_presets', { defaultValue: 'Cinematic Presets' })}
        </span>
        <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-slate-100 dark:bg-white/3 border border-slate-200 dark:border-white/5 text-slate-700 dark:text-slate-300">
          <Layers className="w-3.5 h-3.5 text-purple-400" />{' '}
          {t('smooth_camera_moves', { defaultValue: 'Smooth Camera Moves' })}
        </span>
        <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-slate-100 dark:bg-white/3 border border-slate-200 dark:border-white/5 text-slate-700 dark:text-slate-300">
          <Video className="w-3.5 h-3.5 text-pink-400" />{' '}
          {t('high_quality_output', { defaultValue: 'High Quality Output' })}
        </span>
        <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-slate-100 dark:bg-white/3 border border-slate-200 dark:border-white/5 text-slate-700 dark:text-slate-300">
          <Briefcase className="w-3.5 h-3.5 text-amber-400" /> {t('commercial_use', { defaultValue: 'Commercial Use' })}
        </span>
        <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-slate-100 dark:bg-white/3 border border-slate-200 dark:border-white/5 text-slate-700 dark:text-slate-300">
          <Zap className="w-3.5 h-3.5 text-amber-400" /> {t('fast_generation', { defaultValue: 'Fast Generation' })}
        </span>
      </div>

      {/* Main 2-Column Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Section: Inputs & Parameters (takes 8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* STEP 1: Describe the Motion */}
          <AIPromptDescribeSection
            title={t('describe_the_motion', { defaultValue: 'Describe the Motion' })}
            description={t('describe_motion_desc', {
              defaultValue:
                'Describe the motion physics, camera movements, transitions, and cinematic energy you want to create.',
            })}
            placeholder={t('video_motion_placeholder', {
              defaultValue:
                'Example: A dramatic camera push-in with shallow depth of field, subtle parallax, and cinematic lighting...',
            })}
            prompt={prompt}
            onPromptChange={setPrompt}
            isEnhancingPrompt={isEnhancingPrompt}
            onImprovePrompt
            onAddDetails
            onSurpriseMe
            generateCaption={generateCaption}
            t={t}
            onOpenPromptLibrary={() => setIsPromptLibraryOpen(true)}
          />

          {/* Grid for Settings side-by-side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* STEP 2: Motion Settings */}
            <div className="bg-white dark:bg-white/3 border border-glass-border rounded-border-radius p-4 sm:p-6 space-y-5">
              <div className="flex items-center gap-3">
                <span className="flex items-center justify-center w-8 h-8 rounded-full primary-btn text-white font-bold text-[11px] shadow-[0_0_10px_rgba(139,92,246,0.5)] mt-0.5 shrink-0">
                  2
                </span>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {t('motion_settings', { defaultValue: 'Motion Settings' })}
                  </h3>
                </div>
              </div>

              {/* Aspect Ratio */}
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-title">
                  {t('aspect_ratio', { defaultValue: 'Aspect Ratio' })}
                </h4>
                <div className="overflow-x-auto no-scrollbar py-1">

                  <div className="flex sm:grid sm:grid-cols-3 gap-2 border border-glass-border p-2 rounded-xl w-max sm:w-full min-w-full">
                    {['16:9', '9:16', '1:1'].map((val) => (
                      <Button
                        key={val}
                        type="button"
                        onClick={() => setRatio(val)}
                        className={cn(
                          'group/btn relative h-12! rounded-full flex! items-center! justify-center! gap-2! transition-all duration-500 shrink-0 w-28 sm:w-auto ',
                          ratio === val
                            ? 'text-white! primary-btn font-bold'
                            : 'bg-black/3! dark:bg-white/3! text-title-color!',
                        )}
                      >
                        <AspectRatioBox ratio={val} />
                        <span className="text-xs uppercase tracking-wider">{val}</span>
                      </Button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Resolution selector */}
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-title">{t('resolution', { defaultValue: 'Resolution' })}</h4>
                <div className="flex rounded-xl border border-glass-border gap-1 p-2">
                  {['720p', '1080p'].map((val) => (
                    <Button
                      key={val}
                      type="button"
                      onClick={() => setQuality(val)}
                      className={cn(
                        'flex-1 py-2 rounded-lg text-xs font-bold  flex items-center justify-center gap-1 transition-all duration-200',
                        quality === val
                          ? 'primary-btn text-white! shadow-md'
                          : 'bg-black/3! dark:bg-white/3! text-title-color!',
                      )}
                    >
                      {val}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Motion Intensity Slider */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-title">
                    {t('motion_intensity', { defaultValue: 'Motion Intensity' })}
                  </h4>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300">
                    {intensityText}
                  </span>
                </div>
                <div className="pt-3 pb-1">
                  <Slider
                    value={[intensity]}
                    min={1}
                    max={100}
                    step={1}
                    onValueChange={(vals) => setIntensity(vals[0])}
                    className="w-full"
                  />
                </div>
                <div className="flex items-center justify-between text-[10px] font-bold text-slate-400">
                  <span className={cn(intensity < 35 && 'text-primary')}>{t('low', { defaultValue: 'Low' })}</span>
                  <span className={cn(intensity >= 35 && intensity <= 65 && 'text-primary')}>
                    {t('medium', { defaultValue: 'Medium' })}
                  </span>
                  <span className={cn(intensity > 65 && 'text-primary')}>{t('high', { defaultValue: 'High' })}</span>
                </div>
              </div>

              {/* Camera Movement Select */}
              <div className="space-y-2 relative">
                <h4 className="text-sm font-semibold text-title">
                  {t('camera_movement', { defaultValue: 'Camera Movement' })}
                </h4>
                <Select value={cameraMovement} onValueChange={setCameraMovement}>
                  <SelectTrigger className="w-full h-10 px-3 bg-slate-50 dark:bg-white/3 border border-glass-border rounded-xl text-xs flex items-center justify-between text-slate-900 dark:text-white">
                    <SelectValue
                      placeholder={t('select_camera_movement', { defaultValue: 'Select Camera Movement' })}
                    />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-[#0F111E] border border-glass-border rounded-xl py-1 shadow-2xl z-50">
                    {[
                      'Default (AI Optimized)',
                      'Pan Left',
                      'Pan Right',
                      'Tilt Up',
                      'Tilt Down',
                      'Zoom In',
                      'Zoom Out',
                    ].map((opt) => (
                      <SelectItem key={opt} value={opt} className="text-xs cursor-pointer">
                        {opt === 'Default (AI Optimized)'
                          ? t('default_ai_optimized', { defaultValue: 'Default (AI Optimized)' })
                          : opt === 'Pan Left'
                            ? t('pan_left', { defaultValue: 'Pan Left' })
                            : opt === 'Pan Right'
                              ? t('pan_right', { defaultValue: 'Pan Right' })
                              : opt === 'Tilt Up'
                                ? t('tilt_up', { defaultValue: 'Tilt Up' })
                                : opt === 'Tilt Down'
                                  ? t('tilt_down', { defaultValue: 'Tilt Down' })
                                  : opt === 'Zoom In'
                                    ? t('zoom_in', { defaultValue: 'Zoom In' })
                                    : t('zoom_out', { defaultValue: 'Zoom Out' })}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Duration Slider (Changed from buttons/segmented control) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-title">{t('duration', { defaultValue: 'Duration' })}</h4>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300">
                    {duration}s
                  </span>
                </div>
                <div className="pt-3 pb-1">
                  <Slider
                    value={[duration]}
                    min={3}
                    max={10}
                    step={1}
                    onValueChange={(vals) => setDuration(vals[0])}
                    className="w-full"
                  />
                </div>
                <div className="flex items-center justify-between text-[10px] font-bold text-slate-400">
                  <span>3s</span>
                  <span>5s</span>
                  <span>10s</span>
                </div>
              </div>
            </div>

            {/* STEP 3: Advanced Options */}
            <div className="bg-white dark:bg-white/3 border border-glass-border rounded-border-radius p-4 sm:p-6 space-y-5">
              <div className="flex items-center gap-3">
                <span className="flex items-center justify-center w-8 h-8 rounded-full primary-btn text-white font-bold text-[11px] shadow-[0_0_10px_rgba(139,92,246,0.5)] mt-0.5 shrink-0">
                  3
                </span>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {t('advanced_options', { defaultValue: 'Advanced Options' })}
                  </h3>
                </div>
              </div>

              {/* Sound Toggle */}
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-title">{t('sound', { defaultValue: 'Sound' })}</h4>
                <div className="flex items-center justify-between h-11 px-4 rounded-xl border border-slate-200 dark:border-glass-border bg-slate-50 dark:bg-white/3">
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
                    {sound ? (
                      <Volume2 className="w-4 h-4 text-purple-500" />
                    ) : (
                      <VolumeX className="w-4 h-4 text-slate-400" />
                    )}
                    {sound
                      ? t('audio_enabled', { defaultValue: 'Audio Enabled' })
                      : t('muted', { defaultValue: 'Muted' })}
                  </div>
                  <AISwitch checked={sound} onChange={setSound} />
                </div>
              </div>

              {/* Watermark Toggle */}
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-title">
                  {t('add_watermark', { defaultValue: 'Add Watermark' })}
                </h4>
                <div className="flex items-center justify-between h-11 px-4 rounded-xl border border-slate-200 dark:border-glass-border bg-slate-50 dark:bg-white/3">
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
                    {t('watermark_enabled', { defaultValue: 'Add Watermark' })}
                  </div>
                  <AISwitch checked={addWatermark} onChange={setAddWatermark} />
                </div>
              </div>

              {/* Negative Prompt */}
              <div className="space-y-2">
                <div className="flex items-center gap-1.5">
                  <h4 className="text-sm font-semibold text-title">
                    {t('negative_prompt', { defaultValue: 'Negative Prompt' })}
                  </h4>
                  <span
                    title={t('negative_prompt_tooltip', { defaultValue: 'Things you do not want in the video' })}
                    className="inline-flex"
                  >
                    <HelpCircle className="w-3.5 h-3.5 text-slate-600 hover:text-slate-400 cursor-pointer" />
                  </span>
                </div>
                <input
                  type="text"
                  value={negativePrompt}
                  onChange={(e) => setNegativePrompt(e.target.value)}
                  placeholder={t('negative_prompt_placeholder', {
                    defaultValue: 'e.g., shaky, distorted, low quality',
                  })}
                  className="w-full h-10 px-3 bg-slate-50 dark:bg-white/3 border border-glass-border rounded-border-radius-inner text-xs text-slate-900 dark:text-white outline-hidden placeholder:text-slate-450 dark:placeholder:text-slate-650"
                />
              </div>

              {/* Seed */}
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-title">
                  {t('seed_optional', { defaultValue: 'Seed (Optional)' })}
                </h4>
                <div className="relative">
                  <input
                    type="text"
                    value={seed}
                    onChange={(e) => setSeed(e.target.value)}
                    placeholder={t('seed_placeholder', { defaultValue: 'Enter a number (e.g. 12345)' })}
                    className="w-full h-10 pl-3 pr-10 bg-slate-50 dark:bg-white/3 border border-glass-border rounded-border-radius-inner text-xs text-slate-900 dark:text-white outline-hidden placeholder:text-slate-450 dark:placeholder:text-slate-650"
                  />
                  <Button
                    type="button"
                    onClick={handleRandomizeSeed}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-purple-400 transition-colors"
                    title={t('generate_random_seed', { defaultValue: 'Generate Random Seed' })}
                  >
                    <Dices className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Output Target */}
              <div className="space-y-2 relative">
                <h4 className="text-sm font-semibold text-title">
                  {t('outputs_saved_to', { defaultValue: 'Outputs will be saved to' })}
                </h4>
                <Button
                  type="button"
                  onClick={() => setIsOutputOpen(!isOutputOpen)}
                  className="w-full h-10 px-3 bg-slate-50 dark:bg-white/3 border border-glass-border rounded-border-radius-inner text-xs flex items-center justify-between text-slate-900 dark:text-white hover:border-slate-300 dark:hover:border-white/10 transition-colors"
                >
                  <span>{outputDestination}</span>
                  <ChevronDown className="w-4 h-4 opacity-50" />
                </Button>
                {isOutputOpen && (
                  <div className="absolute top-16 left-0 w-full bg-white dark:bg-[#0F111E] border border-slate-200 dark:border-white/10 rounded-border-radius-inner py-1 shadow-2xl z-50">
                    {['Media Library'].map((opt) => (
                      <Button
                        key={opt}
                        type="button"
                        onClick={() => {
                          setOutputDestination(opt)
                          setIsOutputOpen(false)
                        }}
                        className={cn(
                          'w-full h-8 px-3 text-left text-xs transition-colors block hover:bg-slate-105 dark:hover:bg-white/5',
                          outputDestination === opt ? 'text-purple-400 font-bold bg-white/3' : 'text-slate-350',
                        )}
                      >
                        {opt}
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* STEP 4: Source Assets */}
          <div className="bg-white dark:bg-white/3 border border-glass-border rounded-border-radius p-4 sm:p-6 space-y-4">
            <div className="flex items-center gap-3">
              <span className="flex items-center justify-center w-8 h-8 rounded-full primary-btn text-white font-bold text-[11px] shadow-[0_0_10px_rgba(139,92,246,0.5)] mt-0.5 shrink-0">
                4
              </span>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {t('source_assets', { defaultValue: 'Source Assets' })}
                </h3>
                <p className="text-sm text-subtitle-color mt-0.5">
                  {t('source_assets_desc', {
                    defaultValue: 'Add reference video or image to guide the motion generation.',
                  })}
                </p>
              </div>
            </div>

            {/* Reference Video and Image side-by-side columns */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              {/* Reference Video Column */}
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  {t('reference_video_optional', { defaultValue: 'Reference Video*' })}
                </h4>
                <div
                  onClick={() => openMediaPicker('video')}
                  className="relative h-44 w-full rounded-2xl border-2 border-dashed transition-all flex flex-col items-center justify-center cursor-pointer overflow-hidden group border-glass-border dark:bg-white/3 bg-foreground/5 hover:border-primary/30 dark:hover:bg-white/5"
                >
                  {selectedVideo ? (
                    <>
                      <video
                        src={getMediaUrl(selectedVideo.file_path)}
                        className="absolute inset-0 w-full h-full object-cover"
                        muted
                        loop
                        autoPlay
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Button
                          type="button"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation()
                            setSelectedVideo(null)
                          }}
                          className="h-9 w-9 rounded-full bg-red-650 hover:bg-red-700 text-white flex items-center justify-center"
                        >
                          <X className="w-4 h-4 text-white" />
                        </Button>
                      </div>
                    </>
                  ) : (
                    <div className="text-center p-4">
                      <div className="w-10 h-10 rounded-full bg-foreground/5 dark:bg-white/5 flex items-center justify-center mx-auto mb-2 text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                        <Video className="w-5 h-5" />
                      </div>
                      <p className="text-xs font-bold text-slate-750 dark:text-white/80">
                        {t('upload_video', { defaultValue: 'Upload Video' })}
                      </p>
                      <p className="text-[10px] text-slate-500 mt-1.5">
                        {t('video_formats_desc', { defaultValue: 'MP4, MOV up to 500MB' })}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Reference Image Column */}
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  {t('reference_image_optional', { defaultValue: 'Reference Image (Optional)' })}
                </h4>
                <div
                  onClick={() => openMediaPicker('image')}
                  className="relative h-44 w-full rounded-2xl border-2 border-dashed transition-all flex flex-col items-center justify-center cursor-pointer overflow-hidden group border-glass-border dark:bg-white/3 bg-foreground/5 hover:border-primary/30 dark:hover:bg-white/5"
                >
                  {selectedImage ? (
                    <>
                      <Image
                        src={getMediaUrl(selectedImage.file_path)}
                        fill
                        unoptimized
                        className="absolute inset-0 w-full h-full object-cover"
                        alt="Selected Image"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Button
                          type="button"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation()
                            setSelectedImage(null)
                          }}
                          className="h-9 w-9 rounded-full bg-red-650 hover:bg-red-700 text-white flex items-center justify-center"
                        >
                          <X className="w-4 h-4 text-white" />
                        </Button>
                      </div>
                    </>
                  ) : (
                    <div className="text-center p-4">
                      <div className="w-10 h-10 rounded-full bg-foreground/5 dark:bg-white/5 flex items-center justify-center mx-auto mb-2 text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                        <ImageIcon className="w-5 h-5" />
                      </div>
                      <p className="text-xs font-bold text-slate-755 dark:text-white/80">
                        {t('upload_image', { defaultValue: 'Upload Image' })}
                      </p>
                      <p className="text-[10px] text-slate-500 mt-1.5">
                        {t('image_formats_desc', { defaultValue: 'JPG, PNG up to 20MB' })}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Footer Bar for Reset & Generation Trigger (Desktop) */}
          <div className="hidden lg:flex items-center justify-between w-full">{actionFooter}</div>
        </div>

        {/* Right Section: Output area, recent generations history, and Pro Tips (takes 4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Generation Result Card */}
          <Card className="bg-white dark:bg-white/3 border border-slate-200 dark:border-white/5 rounded-2xl overflow-hidden flex flex-col min-h-[350px] sm:min-h-115">
            <div className="p-4 border-b border-slate-200 dark:border-white/5 flex flex-col">
              <div className="text-base font-bold flex items-center gap-2 text-slate-900 dark:text-white">
                <Sparkles className="w-5 h-5 text-purple-400" />
                {t('generation_result', { defaultValue: 'Generation Result' })}
              </div>
              <p className="text-sm text-subtitle-color mt-0.5">
                {t('generation_result_desc', { defaultValue: 'Your AI generated motion will appear here' })}
              </p>
            </div>

            <CardContent className="p-6 flex-1 flex flex-col justify-center items-center relative min-h-[220px]">
              {isGenerating && !resultVideo ? (
                <div className="flex flex-col items-center gap-4 py-8">
                  <div className="relative w-16 h-16 sm:w-20 sm:h-20">
                    <div className="absolute inset-0 rounded-full border-4 border-purple-500/10" />
                    <div className="absolute inset-0 rounded-full border-4 border-purple-500 border-t-transparent animate-spin" />
                    <Wand2 className="absolute inset-0 m-auto w-5 h-5 sm:w-6 sm:h-6 text-purple-400 animate-pulse" />
                  </div>
                  <p className="text-xs sm:text-sm font-bold text-purple-400 animate-pulse tracking-tight text-center">
                    {t('crafting_motion', {
                      defaultValue: 'Processing Motion...',
                    })}
                  </p>
                </div>
              ) : resultVideo ? (
                <div className="w-full aspect-video rounded-xl overflow-hidden border border-slate-200 dark:border-white/5 bg-black/5 dark:bg-black/40 relative group">
                  <video
                    src={getMediaUrl(resultVideo)}
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
                      onClick={() => handleDownload()}
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
                      {t('no_motion_generated', { defaultValue: 'No motion generated yet' })}
                    </p>
                    <p className="text-xs text-slate-500 max-w-[220px] mx-auto leading-normal">
                      {t('motion_appear_here_desc', {
                        defaultValue: 'Enter a prompt and click generate to create your first motion.',
                      })}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>

            {/* Recent Generations list inside Result Card */}
            <div className="p-4 border-t border-slate-200 dark:border-white/5 space-y-3">
              <h4 className="text-sm font-semibold text-title">
                {t('recent_generations', { defaultValue: 'Recent Generations' })}
              </h4>
              <div className="space-y-2">
                {recentLogs.slice(0, 4).map((log) => {
                  const logPromptText =
                    log.payload?.prompt ||
                    log.payload?.input?.prompt ||
                    log.payload?.text ||
                    t('ai_generated_motion', { defaultValue: 'AI Generated Motion' })
                  const dateStr = log.created_at
                    ? new Date(log.created_at).toLocaleDateString()
                    : t('recently', { defaultValue: 'Recently' })
                  const resolutionLabel = log.payload?.resolution || '1080p'
                  const durationLabel = log.payload?.duration ? `${log.payload.duration}s` : '5s'
                  const thumbnail = log.result_url ? getMediaUrl(log.result_url) : null

                  return (
                    <div
                      key={log._id || log.id}
                      onClick={() => handleHistorySelect(log)}
                      className="w-full text-left py-10 px-4 h-12 rounded-border-radius-inner bg-subcard dark:bg-white/3! border border-glass-border flex items-center justify-between gap-3 group transition-colors cursor-pointer"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-slate-900 dark:text-white truncate leading-tight transition-colors">
                          {logPromptText}
                        </p>
                        <p className="text-xs text-subtitle-color mt-1 font-medium  ">
                          {dateStr} • {resolutionLabel} • {durationLabel}
                        </p>
                      </div>
                      <div className="w-10 h-10 rounded-full bg-purple-900/10 border border-white/5 shrink-0 flex items-center justify-center text-slate-650 group-hover:border-purple-500/20 transition-all overflow-hidden relative aspect-square">
                        {thumbnail ? (
                          <>
                            <video src={thumbnail} className="w-full h-full object-cover" muted />
                            <span className="absolute bottom-0.5 right-0.5 text-[8px] font-bold bg-black/70 text-white px-1 rounded-sm scale-75 origin-bottom-right">
                              {durationLabel}
                            </span>
                          </>
                        ) : (
                          <Film className="w-4 h-4 text-purple-500/30" />
                        )}
                      </div>
                      {/* <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation()
                        }}
                        className="h-8 w-8 text-slate-400 hover:text-white shrink-0"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </Button> */}
                    </div>
                  )
                })}
                {recentLogs.length === 0 && (
                  <p className="text-xs text-slate-600 text-center py-4">
                    {t('no_recent_motions', { defaultValue: 'No recent motions found.' })}
                  </p>
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
          <AIProTipsCard
            tips={t('pro_tips_desc', {
              defaultValue:
                'Use descriptive prompts for better motion. Mention camera moves, lighting, depth, speed, and mood for cinematic results.',
            })}
          />
        </div>

        {/* Footer Bar for Reset & Generation Trigger (Mobile) */}
        <div className="flex lg:hidden flex-wrap gap-4 lg:col-span-12 items-center justify-between w-full">
          {actionFooter}
        </div>
      </div>

      <PromptLibraryModal
        isOpen={isPromptLibraryOpen}
        onClose={() => setIsPromptLibraryOpen(false)}
        onSelect={(p) => setPrompt(p)}
        mode="video_motion"
      />

      <MediaPickerModal
        isOpen={isMediaPickerOpen}
        onClose={() => setIsMediaPickerOpen(false)}
        onSelect={(media) => {
          const selectedMedia = Array.isArray(media) ? media[0] : media
          if (mediaPickerType === 'video') setSelectedVideo(selectedMedia)
          else setSelectedImage(selectedMedia)
          setIsMediaPickerOpen(false)
        }}
        type={mediaPickerType}
      />
    </div>
  )
}

export default VideoMotionContent
