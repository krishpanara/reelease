'use client'

import { AIFeatureTagsBar } from '@/components/feature/ai-common/AIFeatureTagsBar'
import { AIPromptDescribeSection } from '@/components/feature/ai-common/AIPromptDescribeSection'
import MediaPickerModal from '@/components/feature/media-library/MediaPickerModal'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { aiVideoTools, surprisePrompts, videoGenerationOptions } from '@/data/features'
import { cn } from '@/lib/utils'
import { useGenerateMediaMutation, useGetUsageLogsQuery, useSaveToMediaMutation } from '@/redux/api/aiApi'
import { useGetTemplatesQuery } from '@/redux/api/aiTemplateApi'
import { useGetDashboardStatsQuery } from '@/redux/api/dashboardApi'
import { useGenerateCaptionMutation } from '@/redux/api/socialPublishApi'
import { useAppSelector } from '@/redux/hooks'
import { socket } from '@/services/socketSetup'
import { AITemplate, Attachment } from '@/types'
import { FeatureTag, GenerationLogItem } from '@/types/components/features'
import { getDownloadUrl, getMediaUrl } from '@/utils'
import {
  Briefcase,
  ChevronDown,
  ChevronRight,
  Dices,
  Film,
  HelpCircle,
  Layers,
  Loader2,
  Plus,
  RotateCcw,
  Sparkles,
  Trash2,
  Volume2,
  VolumeX,
  Wand2,
  X,
  Zap
} from 'lucide-react'
import Image from 'next/image'
import { useSearchParams } from 'next/navigation'
import { useEffect, useMemo, useState, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { AIFeaturePageHeader } from '../ai-common/AIFeaturePageHeader'
import { AIProTipsCard } from '../ai-common/AIProTipsCard'
import { AISwitch } from '../ai-common/AISwitch'
import { AspectRatioBox } from '../ai-common/AspectRatioBox'
import PromptLibraryModal from '../ai-common/PromptLibraryModal'
import { GenerationOutput } from './components/GenerationOutput'

export default function ImageToVideoGenerate() {
  const { t } = useTranslation()
  const user = useAppSelector((state) => state.auth.user)
  const searchParams = useSearchParams()
  const templateId = searchParams.get('templateId')

  const [prompt, setPrompt] = useState('')
  const [aspectRatio, setAspectRatio] = useState('16:9')
  const aspectRatioContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!aspectRatioContainerRef.current) return
    const activeButton = aspectRatioContainerRef.current.querySelector('[data-active="true"]')
    if (activeButton) {
      activeButton.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center',
      })
    }
  }, [aspectRatio])
  const [duration, setDuration] = useState(5)
  const [mode, setMode] = useState('std')
  const modeContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!modeContainerRef.current) return
    const activeButton = modeContainerRef.current.querySelector('[data-active="true"]')
    if (activeButton) {
      activeButton.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center',
      })
    }
  }, [mode])
  const [sound, setSound] = useState(false)
  const [isMultiShot, setIsMultiShot] = useState(false)
  const [shots, setShots] = useState<{ image: Attachment | null; prompt: string; duration: number }[]>([
    { image: null, prompt: '', duration: 3 },
  ])
  const [startAttachment, setStartAttachment] = useState<Attachment | null>(null)
  const [endAttachment, setEndAttachment] = useState<Attachment | null>(null)
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false)
  const [pickingFor, setPickingFor] = useState<{ type: 'start' | 'end' | 'shot'; index?: number } | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [currentTaskId, setCurrentTaskId] = useState<string | null>(null)
  const [resultVideo, setResultVideo] = useState<string | null>(null)
  const [isPromptLibraryOpen, setIsPromptLibraryOpen] = useState(false)

  // Advanced options state
  const [negativePrompt, setNegativePrompt] = useState('')
  const [seed, setSeed] = useState('')
  const [outputDestination, setOutputDestination] = useState('Media Library')
  const [isOutputOpen, setIsOutputOpen] = useState(false)
  const [addWatermark, setAddWatermark] = useState(false)

  const { data: templatesRaw } = useGetTemplatesQuery({ status: true })
  const { data: stats } = useGetDashboardStatsQuery()
  const credits = stats?.aiFeatures?.find((f) => f.feature_key === 'images_to_video')?.credits
  const templates = Array.isArray(templatesRaw) ? templatesRaw : templatesRaw?.templates || []

  const [generateCaption, { isLoading: isEnhancingPrompt }] = useGenerateCaptionMutation()
  const [generateMedia] = useGenerateMediaMutation()
  const [saveToMedia, { isLoading: isSaving }] = useSaveToMediaMutation()

  const { data: usageLogsData, refetch: refetchLogs } = useGetUsageLogsQuery({
    serviceType: 'images_to_video',
    limit: 5,
  })
  const recentLogs = (usageLogsData?.logs || []) as GenerationLogItem[]

  const featureTags = useMemo<FeatureTag[]>(
    () => [
      {
        label: t('high_quality_output', { defaultValue: 'High Quality Output' }),
        icon: Sparkles,
        iconClassName: 'text-blue-400',
      },
      {
        label: t('smooth_motion', { defaultValue: 'Smooth Motion' }),
        icon: Sparkles,
        iconClassName: 'text-amber-400 animate-pulse',
      },
      {
        label: t('multiple_styles', { defaultValue: 'Multiple Styles' }),
        icon: Layers,
        iconClassName: 'text-purple-400',
      },
      {
        label: t('commercial_use', { defaultValue: 'Commercial Use' }),
        icon: Briefcase,
        iconClassName: 'text-blue-400',
      },
      {
        label: t('fast_generation', { defaultValue: 'Fast Generation' }),
        icon: Zap,
        iconClassName: 'text-amber-400',
      },
    ],
    [t],
  )

  useEffect(() => {
    if (templateId && templates.length > 0) {
      const found = templates.find((t: AITemplate) => (t.id || t._id) === templateId)
      if (found && !prompt) {
        setPrompt(found.prompt)

        if (found.attachment_id) {
          const attachmentObj: any =
            typeof found.attachment_id === 'object' && found.attachment_id !== null
              ? found.attachment_id
              : {
                _id: typeof found.attachment_id === 'string' ? found.attachment_id : undefined,
                file_path:
                  found.file_path || (typeof found.attachment_id === 'string' ? found.attachment_id : undefined),
              }

          if (attachmentObj.file_path || attachmentObj._id || attachmentObj.id) {
            setStartAttachment(attachmentObj)
          }
        }
      }
    }
  }, [templateId, templates])

  useEffect(() => {
    if (!user) return

    const handleTaskUpdate = (payload: any) => {
      if (payload.taskId === currentTaskId) {
        if (payload.status === 'completed') {
          setIsGenerating(false)
          setResultVideo(payload.resultUrl)
          refetchLogs()
          toast.success(t('video_generated_successfully', { defaultValue: 'Video generated successfully!' }))
        } else if (payload.status === 'failed') {
          setIsGenerating(false)
          toast.error(payload.message || t('generation_failed', { defaultValue: 'Generation failed' }))
        }
      }
    }

    const eventName = `ai-task-${(user as any)._id || user.id}`
    socket.on(eventName, handleTaskUpdate)

    return () => {
      socket.off(eventName, handleTaskUpdate)
    }
  }, [user, currentTaskId, t, refetchLogs])

  const handleGenerate = async () => {
    if (!isMultiShot && !prompt.trim()) {
      toast.error(t('please_enter_prompt', { defaultValue: 'Please enter a prompt' }))
      return
    }

    if (isMultiShot) {
      if (shots.some((s) => !s.prompt.trim())) {
        toast.error(t('please_fill_all_shot_prompts', { defaultValue: 'Please fill prompts for all shots' }))
        return
      }
      if (!shots[0].image) {
        toast.error(t('please_select_first_shot_image', { defaultValue: 'Please select an image for the first shot' }))
        return
      }
    } else if (!startAttachment) {
      toast.error(t('please_select_start_image', { defaultValue: 'Please select a start image' }))
      return
    }

    try {
      setIsGenerating(true)
      setResultVideo(null)

      let attachmentIds: string[] = []
      let multiPrompt: any[] = []

      if (isMultiShot) {
        attachmentIds = [shots[0]?.image?.id || (shots[0]?.image as any)?._id].filter(Boolean)
        multiPrompt = shots.map((s) => ({
          prompt: s.prompt,
          duration: s.duration,
        }))
      } else {
        attachmentIds = [
          startAttachment?.id || (startAttachment as any)?._id,
          endAttachment ? endAttachment.id || (endAttachment as any)?._id : null,
        ].filter(Boolean) as string[]
      }

      const res = await generateMedia({
        serviceType: 'images_to_video',
        prompt: isMultiShot ? undefined : prompt,
        attachmentIds,
        aspectRatio,
        duration: isMultiShot ? undefined : duration,
        mode,
        sound,
        multiShots: isMultiShot,
        multiPrompt: isMultiShot ? multiPrompt : undefined,
        seed: seed || undefined,
        addWatermark,
      }).unwrap()

      if (res.taskId) {
        setCurrentTaskId(res.taskId)
      } else {
        setIsGenerating(false)
        toast.error(t('failed_to_start_generation', { defaultValue: 'Failed to start generation task' }))
      }
    } catch (error: any) {
      setIsGenerating(false)
      toast.error(error?.data?.message || t('something_went_wrong', { defaultValue: 'Something went wrong' }))
    }
  }

  const handleSaveToMedia = async () => {
    if (!currentTaskId) return
    try {
      await saveToMedia({ taskId: currentTaskId }).unwrap()
      toast.success(t('saved_to_media_success', { defaultValue: 'Saved to media library successfully!' }))
    } catch (error: any) {
      toast.error(error?.data?.message || t('failed_to_save_media', { defaultValue: 'Failed to save to media' }))
    }
  }

  const handleDownload = async () => {
    if (!resultVideo) return
    try {
      const url = getDownloadUrl(resultVideo)
      const response = await fetch(url)
      const blob = await response.blob()
      const blobUrl = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = blobUrl
      link.download = `ai-video-${Date.now()}.mp4`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(blobUrl)
    } catch (error) {
      toast.error(t('failed_to_download_video', { defaultValue: 'Failed to download video' }))
    }
  }


  const detailEnhancements = [
    'highly detailed',
    'cinematic lighting',
    'photorealistic',
    '4k resolution',
    'smooth camera motion',
    'soft focus background',
    'vibrant colors',
    'dramatic shadows',
  ]

  const handleRandomizeSeed = () => {
    setSeed(Math.floor(Math.random() * 89999 + 10000).toString())
    toast.success(t('seed_randomized', { defaultValue: 'Random seed generated!' }))
  }

  const handleResetAll = () => {
    setPrompt('')
    setAspectRatio('16:9')
    setDuration(5)
    setMode('std')
    setSound(false)
    setIsMultiShot(false)
    setShots([{ image: null, prompt: '', duration: 3 }])
    setStartAttachment(null)
    setEndAttachment(null)
    setNegativePrompt('')
    setSeed('')
    setOutputDestination('Media Library')
    setAddWatermark(false)
    toast.info(t('settings_reset', { defaultValue: 'All settings reset to defaults.' }))
  }

  // Shot helpers
  const addShot = () => {
    const lastShot = shots[shots.length - 1]
    if (shots.length >= 4) return

    if (!lastShot.image || !lastShot.prompt.trim()) {
      toast.error(
        t('please_fill_current_shot', {
          defaultValue: 'Please complete the current shot (image and prompt) before adding another',
        }),
      )
      return
    }

    setShots((prev) => [...prev, { image: null, prompt: '', duration: 3 }])
  }

  const removeShot = (index: number) => {
    if (shots.length <= 1) return
    setShots((prev) => prev.filter((_, i) => i !== index))
  }

  const updateShot = (index: number, data: any) => {
    setShots((prev) => {
      const newShots = [...prev]
      newShots[index] = { ...newShots[index], ...data }
      return newShots
    })
  }

  const renderSourceImagesCard = () => (
    <div className="bg-white dark:bg-white/3 border border-glass-border rounded-2xl p-4 sm:p-6 space-y-4">
      <div className="flex items-center gap-3">
        <span className="flex items-center justify-center w-8 h-8 rounded-full primary-btn text-white font-bold text-base mt-0.5 shrink-0">
          2
        </span>
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            {t('source_images', { defaultValue: 'Source Images' })}
          </h3>
          <p className="text-sm text-subtitle-color mt-0.5">
            {t('source_images_desc', { defaultValue: 'Add start and end images to guide the video generation.' })}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between gap-4 pt-2">
        {/* Start Image Box */}
        <div className="flex-1 space-y-2">
          <span className="text-sm font-bold text-title-color ">
            {t('start_image', { defaultValue: 'Start Image' })}
          </span>
          <div
            onClick={() => {
              setPickingFor({ type: 'start' })
              setIsMediaPickerOpen(true)
            }}
            className={cn(
              'relative aspect-square w-full rounded-border-radius-inner border-2 border-dashed flex flex-col items-center justify-center cursor-pointer overflow-hidden group border-slate-200 dark:border-white/5 bg-foreground/5 dark:bg-white/3 hover:border-primary/30',
              startAttachment && 'border-primary bg-primary/5',
            )}
          >
            {startAttachment ? (
              <>
                <Image
                  src={getMediaUrl(startAttachment.file_path)}
                  fill
                  unoptimized
                  alt="Start Reference"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-black/3 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Button
                    type="button"
                    variant="destructive"
                    className="h-8 w-8 rounded-full p-0 flex items-center justify-center border-0"
                    onClick={(e) => {
                      e.stopPropagation()
                      setStartAttachment(null)
                    }}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </>
            ) : (
              <div className="text-center p-2">
                <Plus className="w-5 h-5 mx-auto mb-1 text-subtitle-color group-hover:text-primary transition-colors" />
                <p className="text-xs font-bold text-subtitle-color">
                  {t('upload_start_image', { defaultValue: 'Upload Start Image' })}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Arrow Separator */}
        <div className="flex items-center justify-center shrink-0 w-8 h-8 rounded-full bg-black/3 dark:bg-white/5 border border-glass-border text-primary self-center mt-6">
          <ChevronRight className="w-4 h-4" />
        </div>

        {/* End Image Box */}
        <div className="flex-1 space-y-2">
          <span className="text-sm font-bold text-title-color ">
            {t('end_image', { defaultValue: 'End Image (Optional)' })}
          </span>
          <div
            onClick={() => {
              setPickingFor({ type: 'end' })
              setIsMediaPickerOpen(true)
            }}
            className={cn(
              'relative aspect-square w-full rounded-border-radius-inner border-2 border-dashed flex flex-col items-center justify-center cursor-pointer overflow-hidden group border-slate-200 dark:border-white/5 bg-foreground/5 dark:bg-white/3 hover:border-primary/30',
              endAttachment && 'border-primary bg-primary/5',
            )}
          >
            {endAttachment ? (
              <>
                <Image
                  src={getMediaUrl(endAttachment.file_path)}
                  fill
                  unoptimized
                  alt="End Reference"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Button
                    type="button"
                    variant="destructive"
                    className="h-8 w-8 rounded-full p-0 flex items-center justify-center border-0"
                    onClick={(e) => {
                      e.stopPropagation()
                      setEndAttachment(null)
                    }}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </>
            ) : (
              <div className="text-center p-2">
                <Plus className="w-5 h-5 mx-auto mb-1 text-subtitle-color group-hover:text-primary transition-colors" />
                <p className="text-xs font-bold text-subtitle-color">
                  {t('upload_end_image', { defaultValue: 'Upload End Image' })}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )

  const actionFooter = (
    <>
      <Button
        onClick={handleResetAll}
        type="button"
        variant="outline"
        className="w-full sm:w-auto h-11 px-6 rounded-xl bg-transparent border border-glass-border gap-2 font-bold text-xs flex items-center justify-center"
      >
        <RotateCcw className="w-4 h-4 text-slate-405" />
        {t('reset_all', { defaultValue: 'Reset All' })}
      </Button>

      <div className="flex flex-col items-center sm:items-end w-full sm:w-auto">
        <Button
          onClick={handleGenerate}
          type="button"
          disabled={
            isGenerating ||
            (isMultiShot
              ? shots.some((s) => !s.prompt.trim() || (s === shots[0] && !s.image))
              : !prompt.trim() || !startAttachment)
          }
          className="w-full sm:w-auto h-11 sm:h-12 px-6 rounded-xl primary-btn hover:opacity-95 text-white! font-bold gap-2 text-xs sm:text-sm flex items-center border-0 justify-center"
        >
          {isGenerating ? (
            <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
          ) : (
            <Wand2 className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          )}
          {isGenerating ? t('generating') : t('generate_video', { defaultValue: 'Generate Video' })}
          {!isGenerating && credits && (
            <span className="w-7 h-7 flex items-center gap-1.5 ml-1 justify-center bg-black/20 rounded-full text-[12px] font-bold border border-slate-200 dark:border-white/5">
              {credits}
            </span>
          )}
        </Button>
        <span className="text-[11px] text-slate-500 font-medium mt-2 sm:mt-1 text-center sm:text-right w-full sm:w-auto">
          {t('generation_credit_cost_video', {
            defaultValue: 'Uses {{credits}} credits (1 generation)',
            credits,
          })}
        </span>
      </div>
    </>
  )

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <AIFeaturePageHeader
        icon={<Film className="w-6 h-6 text-primary animate-pulse" />}
        title={t('image_to_video', { defaultValue: 'Image to Video' })}
        subtitle={t('image_to_video_desc', {
          defaultValue: 'Turn your ideas into stunning videos with AI',
        })}
      />
      <AIFeatureTagsBar tags={featureTags} />

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 2xl:grid-cols-12 gap-8">
        <div className="2xl:col-span-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            <div className="space-y-6">
              <AIPromptDescribeSection
                title={t('describe_the_video', { defaultValue: 'Describe the Video' })}
                description={t('describe_video_desc', {
                  defaultValue: 'Describe the scene, motion, camera movement, and atmosphere you want to create.',
                })}
                placeholder={t('image_to_video_placeholder_examples', {
                  defaultValue:
                    'Example: A beautiful sunset over the mountains, clouds moving slowly, camera zooming in...',
                })}
                prompt={prompt}
                onPromptChange={setPrompt}
                maxLength={2000}
                isEnhancingPrompt={isEnhancingPrompt}
                onImprovePrompt
                // onAddDetails
                onSurpriseMe
                generateCaption={generateCaption}
                t={t}
                onOpenPromptLibrary={() => setIsPromptLibraryOpen(true)}
              />

              {/* Card 2: Multiple Shots Container */}
              <div className="bg-white dark:bg-white/3 border border-slate-200 dark:border-white/5 rounded-2xl p-4 sm:p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Layers className="w-5 h-5 text-purple-400" />
                    <div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white">
                        {t('multiple_shots', { defaultValue: 'Multiple Shots' })}
                      </h3>
                      <p className="text-xs text-subtitle-color mt-0.5">
                        {t('multi_shot_desc', {
                          defaultValue: 'Create a sequence of up to 4 scenes with different prompts',
                        })}
                      </p>
                    </div>
                  </div>
                  <AISwitch checked={isMultiShot} onChange={setIsMultiShot} />
                </div>

                {isMultiShot && (
                  <div className="space-y-4 pt-2 border-t border-slate-200 dark:border-white/5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-500 dark:text-white/60">
                        {t('video_shots', { defaultValue: 'Video Shots' })} ({shots.length}/4)
                      </span>
                    </div>

                    <div className="space-y-4">
                      {shots.map((shot, index) => (
                        <div
                          key={index}
                          className="relative rounded-2xl border border-slate-200 dark:border-white/5 bg-slate-50/50 dark:bg-white/1 p-4 space-y-4 transition-all hover:border-primary/30"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="flex items-center justify-center w-5 h-5 rounded-full bg-primary/10 text-primary font-bold text-[10px]">
                                {index + 1}
                              </span>
                              <span className="text-xs font-bold text-title-color">Shot {index + 1}</span>
                            </div>
                            {shots.length > 1 && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-destructive hover:text-red-500 hover:bg-red-500/10 rounded-lg bg-transparent border-0"
                                onClick={() => removeShot(index)}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            )}
                          </div>

                          <div className="flex gap-4 items-start">
                            {/* Shot Image Preview Box */}
                            <div
                              onClick={() => {
                                setPickingFor({ type: 'shot', index })
                                setIsMediaPickerOpen(true)
                              }}
                              className={cn(
                                'w-20 h-20 rounded-border-radius-inner border-2 border-dashed flex flex-col items-center justify-center cursor-pointer shrink-0 overflow-hidden relative transition-all group bg-slate-100 dark:bg-white/3 border-slate-200 dark:border-white/5',
                                shot.image ? 'border-primary bg-primary/5' : 'hover:border-primary/50',
                              )}
                            >
                              {shot.image ? (
                                <>
                                  <Image
                                    src={getMediaUrl(shot.image.file_path)}
                                    fill
                                    unoptimized
                                    alt={`Shot ${index + 1}`}
                                    className="object-cover"
                                  />
                                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <Button
                                      type="button"
                                      variant="destructive"
                                      className="h-6 w-6 rounded-full p-0 flex items-center justify-center border-0"
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        updateShot(index, { image: null })
                                      }}
                                    >
                                      <X className="w-3 h-3" />
                                    </Button>
                                  </div>
                                </>
                              ) : (
                                <div className="text-center p-1">
                                  <Plus className="w-4 h-4 mx-auto mb-1 text-slate-405 group-hover:text-primary transition-colors" />
                                  <span className="text-3xs font-bold text-sutitle-color">Upload</span>
                                </div>
                              )}
                            </div>

                            {/* Shot Prompt & Duration Slider */}
                            <div className="flex-1 space-y-3">
                              <div className="space-y-1">
                                <label className="text-xs font-semibold text-subtitle-color">Shot Prompt</label>
                                <input
                                  type="text"
                                  value={shot.prompt}
                                  onChange={(e) => updateShot(index, { prompt: e.target.value })}
                                  placeholder={t('describe_this_shot', { defaultValue: 'Describe this scene...' })}
                                  className="w-full h-9 px-3 bg-slate-100 dark:bg-white/3 border border-slate-200 dark:border-white/5 rounded-xl text-xs text-slate-900 dark:text-white outline-hidden placeholder:text-slate-400 dark:placeholder:text-slate-605 focus:border-primary/50 transition-colors"
                                />
                              </div>

                              <div className="space-y-1">
                                <div className="flex justify-between items-center">
                                  <label className="text-xs font-semibold text-subtitle-color">Duration</label>
                                  <span className="text-[10px] font-bold text-primary">{shot.duration}s</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Slider
                                    value={[shot.duration]}
                                    min={1}
                                    max={10}
                                    step={1}
                                    onValueChange={(vals) => updateShot(index, { duration: vals[0] })}
                                    className="flex-1 h-1 cursor-pointer"
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {shots.length < 4 && (
                      <Button
                        onClick={addShot}
                        disabled={!shots[shots.length - 1].image || !shots[shots.length - 1].prompt.trim()}
                        className="w-full h-10 rounded-xl text-white! transition-all gap-2 text-xs font-bold justify-center primary-btn"
                      >
                        <Plus className="w-4 h-4" />
                        {t('add_another_shot', { defaultValue: 'Add Another Shot' })}
                      </Button>
                    )}
                  </div>
                )}
              </div>

              {/* Source Images: rendered below Multiple Shots only when multiple shots is OFF */}
              {!isMultiShot && renderSourceImagesCard()}
            </div>

            {/* Column 2 (Middle): Source Images (if isMultiShot is true), Video Settings & Advanced Options */}
            <div className="space-y-6">
              {/* Source Images: rendered here only when multiple shots is ON */}
              {isMultiShot && renderSourceImagesCard()}

              {/* Card 4: Video Settings */}
              <div className="bg-white dark:bg-white/3 border border-glass-border rounded-2xl p-4 sm:p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center justify-center w-8 h-8 rounded-full primary-btn text-white font-bold text-base mt-0.5 shrink-0">
                      3
                    </span>
                    <h3 className="text-base font-bold text-title-color">
                      {t('video_settings', { defaultValue: 'Video Settings' })}
                    </h3>
                  </div>
                </div>

                {/* Aspect Ratio Options */}
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-title">
                    {t('aspect_ratio', { defaultValue: 'Aspect Ratio' })}
                  </h4>
                  <div className="overflow-x-auto no-scrollbar py-1">
                    <div ref={aspectRatioContainerRef} className="flex sm:grid sm:grid-cols-3 gap-2 border border-glass-border p-2 rounded-xl w-max sm:w-full min-w-full">
                      {aiVideoTools.map((option) => (
                        <Button
                          key={option.value}
                          type="button"
                          data-active={aspectRatio === option.value ? 'true' : 'false'}
                          onClick={() => setAspectRatio(option.value)}
                          className={cn(
                            'group/btn relative h-12! rounded-xl flex! items-center! justify-center! gap-2! transition-all duration-300 shrink-0 w-28 sm:w-auto',
                            aspectRatio === option.value
                              ? 'text-white! primary-btn font-bold'
                              : 'bg-black/3! dark:bg-white/3! text-title-color!',
                          )}
                        >
                          <AspectRatioBox ratio={option.value} />
                          <span className="text-xs font-semibold">{option.value}</span>
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Duration Slider (hidden if isMultiShot) */}
                {!isMultiShot && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-semibold text-title">
                        {t('duration', { defaultValue: 'Duration' })}
                      </h4>
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-105 dark:bg-white/5 text-slate-700 dark:text-slate-300">
                        {duration}s
                      </span>
                    </div>
                    <div className="pt-3 pb-1">
                      <Slider
                        value={[duration]}
                        min={3}
                        max={15}
                        step={1}
                        onValueChange={(vals) => setDuration(vals[0])}
                        className="w-full cursor-pointer"
                      />
                    </div>
                    <div className="flex items-center justify-between text-[10px] font-bold text-slate-400">
                      <span>3s</span>
                      <span>15s</span>
                    </div>
                  </div>
                )}

                {/* Mode Selector */}
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-title">{t('mode', { defaultValue: 'Mode' })}</h4>
                  <div className="overflow-x-auto no-scrollbar py-1">
                    <div ref={modeContainerRef} className="flex sm:grid sm:grid-cols-3 gap-2 border border-glass-border p-2 rounded-xl w-max sm:w-full min-w-full">
                      {videoGenerationOptions.map((option) => (
                        <Button
                          key={option.value}
                          type="button"
                          data-active={mode === option.value ? 'true' : 'false'}
                          onClick={() => setMode(option.value)}
                          className={cn(
                            'relative h-12! rounded-xl flex! items-center! justify-center! gap-2! transition-all duration-300 text-xs font-bold shrink-0 w-28 sm:w-auto',
                            mode === option.value
                              ? 'text-white! primary-btn font-bold'
                              : 'bg-black/3! dark:bg-white/3! text-title-color!',
                          )}
                        >
                          <option.icon className="w-4 h-4" />
                          <span>{option.label}</span>
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Sound Toggle Switch */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between h-11 px-4 rounded-border-radius-inner border border-glass-border bg-black/3 dark:bg-white/3">
                    <div className="flex items-center gap-2 text-xs font-semibold text-subtitle-color">
                      {sound ? (
                        <Volume2 className="w-4 h-4 text-primary" />
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
              </div>

              {/* Card 5: Advanced Options */}
              <div className="bg-white dark:bg-white/3 border border-slate-200 dark:border-white/5 rounded-2xl p-4 sm:p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <span className="flex items-center justify-center w-8 h-8 rounded-full primary-btn text-white font-bold text-base mt-0.5 shrink-0">
                    4
                  </span>
                  <h3 className="text-base font-bold text-title-color">
                    {t('advanced_options', { defaultValue: 'Advanced Options' })}
                  </h3>
                </div>

                {/* Negative Prompt */}
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-sm font-semibold text-title">
                      {t('negative_prompt', { defaultValue: 'Negative Prompt (Optional)' })}
                    </h4>
                    <span
                      title={t('negative_prompt_tooltip', { defaultValue: 'Things you do not want in the video' })}
                      className="inline-flex"
                    >
                      <HelpCircle className="w-4 h-4 text-slate-650 hover:text-slate-405 cursor-pointer" />
                    </span>
                  </div>
                  <input
                    type="text"
                    value={negativePrompt}
                    onChange={(e) => setNegativePrompt(e.target.value)}
                    placeholder={t('negative_prompt_placeholder', {
                      defaultValue: 'e.g., shaky, distorted, low quality',
                    })}
                    className="w-full h-10 px-3 bg-black/3 dark:bg-white/3 border border-slate-200 dark:border-white/5 rounded-border-radius-inner text-xs text-slate-900 dark:text-white outline-hidden placeholder:text-slate-450 dark:placeholder:text-slate-650"
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
                      className="w-full h-10 pl-3 pr-10 bg-black/3 dark:bg-white/3 border border-slate-200 dark:border-white/5 rounded-border-radius-inner text-xs text-slate-900 dark:text-white outline-hidden placeholder:text-slate-455 dark:placeholder:text-slate-655"
                    />
                    <Button
                      type="button"
                      onClick={handleRandomizeSeed}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-subtitle-color hover:text-purple-400  transition-colors bg-transparent!  border-0 hover:bg-transparent"
                      title={t('generate_random_seed', { defaultValue: 'Generate Random Seed' })}
                    >
                      <Dices className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Output Destination Dropdown */}
                <div className="space-y-2 relative">
                  <h4 className="text-sm font-semibold text-title">
                    {t('outputs_saved_to', { defaultValue: 'Outputs will be saved to' })}
                  </h4>
                  <Button
                    type="button"
                    onClick={() => setIsOutputOpen(!isOutputOpen)}
                    className="w-full h-10 px-3 bg-black/3 dark:bg-white/3 border border-slate-200 dark:border-white/5 rounded-border-radius-inner text-xs flex items-center justify-between text-slate-900 dark:text-white hover:border-slate-300 dark:hover:border-white/10 transition-colors "
                  >
                    <span>{outputDestination}</span>
                    <ChevronDown className="w-4 h-4 opacity-50" />
                  </Button>
                  {isOutputOpen && (
                    <div className="absolute top-16 left-0 w-full bg-white dark:bg-modal-bg-color border border-glass-border rounded-border-radius-inner py-1 shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                      {['Media Library'].map((opt) => (
                        <Button
                          key={opt}
                          type="button"
                          onClick={() => {
                            setOutputDestination(opt)
                            setIsOutputOpen(false)
                          }}
                          className={cn(
                            'w-full h-8 px-3 text-left text-xs transition-colors block  bg-transparent border-0',
                            outputDestination === opt ? 'text-primary!' : 'text-title-color',
                          )}
                        >
                          {opt}
                        </Button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Watermark Toggle Switch */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between h-11 px-4 rounded-border-radius-inner border border-slate-200 dark:border-white/5 bg-slate-55 dark:bg-white/3">
                    <div className="flex items-center gap-2 text-xs font-semibold text-subtitle-color">
                      {t('add_watermark', { defaultValue: 'Add Watermark' })}
                    </div>
                    <AISwitch checked={addWatermark} onChange={setAddWatermark} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Desktop Only Action Footer */}
          <div className="hidden 2xl:flex flex-col-reverse sm:flex-row items-center justify-between pt-6 gap-4 w-full">
            <Button
              onClick={handleResetAll}
              variant="outline"
              className="w-full sm:w-auto h-11 px-6 rounded-xl bg-transparent border border-glass-border gap-2 font-bold text-xs"
            >
              <RotateCcw className="w-4 h-4 text-slate-405" />
              {t('reset_all', { defaultValue: 'Reset All' })}
            </Button>
            <div className="flex flex-col items-center sm:items-end w-full sm:w-auto">
              <Button
                onClick={handleGenerate}
                disabled={
                  isGenerating ||
                  (isMultiShot
                    ? shots.some((s) => !s.prompt.trim() || (s === shots[0] && !s.image))
                    : !prompt.trim() || !startAttachment)
                }
                className="w-full sm:w-auto h-11 sm:h-12 px-6 rounded-xl primary-btn hover:opacity-95 text-white! font-bold gap-2 text-xs sm:text-sm flex items-center border-0 justify-center"
              >
                {isGenerating ? (
                  <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                ) : (
                  <Wand2 className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                )}
                {isGenerating ? t('generating') : t('generate_video', { defaultValue: 'Generate Video' })}
                {!isGenerating && credits && (
                  <span className="w-7 h-7 flex items-center gap-1.5 ml-1 justify-center bg-black/20 rounded-full text-[12px] font-bold border border-slate-200 dark:border-white/5">
                    {credits}
                  </span>
                )}
              </Button>
              <span className="text-[11px] text-slate-500 font-medium mt-2 sm:mt-1 text-center sm:text-right w-full sm:w-auto">
                {t('generation_credit_cost_video', {
                  defaultValue: 'Uses {{credits}} credits (1 generation)',
                  credits,
                })}
              </span>
            </div>
          </div>
        </div>

        {/* Right Column (takes 4 cols on desktop): Generation Output, Pro Tips */}
        <div className="2xl:col-span-4 space-y-6">
          <GenerationOutput
            isGenerating={isGenerating}
            resultVideo={resultVideo}
            isSaving={isSaving}
            handleSaveToMedia={handleSaveToMedia}
            handleDownload={handleDownload}
            recentLogs={recentLogs}
            onSelectRecentLog={(log: GenerationLogItem) => {
              const logPrompt =
                (log.payload?.prompt as string) ||
                (log.payload?.input as { prompt?: string })?.prompt ||
                (log.payload?.text as string) ||
                ''
              if (logPrompt) setPrompt(logPrompt)
              if (log.result_url && log.task_id) {
                setResultVideo(log.result_url)
                setCurrentTaskId(log.task_id)
              }
            }}
          />
          <AIProTipsCard
            tips={t('image_to_video_tips', {
              defaultValue:
                'Describe motion, camera angle, and lighting. Use phrases like slow dolly-in, golden hour, or cinematic tracking shot for stronger results.',
            })}
          />
        </div>
      </div>

      {/* Sticky Bottom Bar for screens smaller than 2xl */}
      <div className="2xl:hidden  flex flex-col-reverse sm:flex-row items-center justify-between gap-4 mt-4 ">
        {actionFooter}
      </div>

      <PromptLibraryModal
        isOpen={isPromptLibraryOpen}
        onClose={() => setIsPromptLibraryOpen(false)}
        onSelect={(p) => setPrompt(p)}
        mode="image_to_video"
      />

      <MediaPickerModal
        isOpen={isMediaPickerOpen}
        type="image"
        onClose={() => {
          setIsMediaPickerOpen(false)
          setPickingFor(null)
        }}
        onSelect={(attachment) => {
          const singleAttachment = Array.isArray(attachment) ? attachment[0] : attachment
          if (!singleAttachment) return
          if (!pickingFor) return
          if (pickingFor.type === 'start') {
            setStartAttachment(singleAttachment)
          } else if (pickingFor.type === 'end') {
            setEndAttachment(singleAttachment)
          } else if (pickingFor.type === 'shot' && pickingFor.index !== undefined) {
            setShots((prev) => {
              const newShots = [...prev]
              newShots[pickingFor.index!] = { ...newShots[pickingFor.index!], image: singleAttachment }
              return newShots
            })
          }
          setIsMediaPickerOpen(false)
          setPickingFor(null)
        }}
      />
    </div>
  )
}
