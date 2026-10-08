'use client'

import { AIFeaturePageHeader } from '@/components/feature/ai-common/AIFeaturePageHeader'
import { AIFeatureTagsBar } from '@/components/feature/ai-common/AIFeatureTagsBar'
import { AIPromptDescribeSection } from '@/components/feature/ai-common/AIPromptDescribeSection'
import { AIProTipsCard } from '@/components/feature/ai-common/AIProTipsCard'
import {
  AIRecentGenerationsHistory,
} from '@/components/feature/ai-common/AIRecentGenerationsHistory'
import { AISwitch } from '@/components/feature/ai-common/AISwitch'
import { AspectRatioBox } from '@/components/feature/ai-common/AspectRatioBox'
import PromptLibraryModal from '@/components/feature/ai-common/PromptLibraryModal'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import Input from '@/components/ui/input'
import { Slider } from '@/components/ui/slider'
import { videoDetailEnhancements, videoSurprisePrompts } from '@/data/aiPromptPresets'
import {
  textToVideoFeatureTags,
  videoAspectRatios,
  videoStyleOptions
} from '@/data/videoGeneration'
import { cn } from '@/lib/utils'
import { useGenerateMediaMutation, useGetUsageLogsQuery, useSaveToMediaMutation } from '@/redux/api/aiApi'
import { useGetPromptsQuery } from '@/redux/api/aiPromptApi'
import { useGetDashboardStatsQuery } from '@/redux/api/dashboardApi'
import { useGenerateCaptionMutation } from '@/redux/api/socialPublishApi'
import { useAppSelector } from '@/redux/hooks'
import { socket } from '@/services/socketSetup'
import { AiPrompt } from '@/types/components/ai-prompts'
import { FeatureTag, GenerationLogItem, SelectedMusic } from '@/types/components/features'
import { getDownloadUrl, getMediaUrl } from '@/utils'
import {
  ChevronDown,
  Crown,
  Dices,
  Download,
  Film,
  HelpCircle,
  Layers,
  Loader2,
  Mic,
  RotateCcw,
  Save,
  Shield,
  Sparkle,
  Sparkles,
  Volume2,
  VolumeX,
  Wand2,
  Zap,
} from 'lucide-react'
import Image from 'next/image'
import { useSearchParams } from 'next/navigation'
import { useEffect, useMemo, useState, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

const TAG_ICONS: Record<string, FeatureTag['icon']> = {
  sparkle: Sparkle,
  layers: Layers,
  mic: Mic,
  zap: Zap,
}

export default function TextToVideoGenerate() {
  const { t } = useTranslation()
  const user = useAppSelector((state) => state?.auth.user)
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
  const [duration, setDuration] = useState(8)
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
  const [style, setStyle] = useState('Cinematic')
  const [isStyleOpen, setIsStyleOpen] = useState(false)
  const [soundToggle, setSoundToggle] = useState(false)
  const [addBackgroundMusicToggle, setAddBackgroundMusicToggle] = useState(false)
  const [selectedMusic, setSelectedMusic] = useState<SelectedMusic | null>(null)
  const [customMusicUrl, setCustomMusicUrl] = useState('')
  const [addWatermark, setAddWatermark] = useState(false)

  const [negativePrompt, setNegativePrompt] = useState('blurry, low quality, watermark')
  const [seed, setSeed] = useState('')
  const [outputDestination, setOutputDestination] = useState('Media Library')
  const [isOutputOpen, setIsOutputOpen] = useState(false)
  const destinationOptions = ['Media Library']

  const [isGenerating, setIsGenerating] = useState(false)
  const [currentTaskId, setCurrentTaskId] = useState<string | null>(null)
  const [resultVideo, setResultVideo] = useState<string | null>(null)
  const [isPromptLibraryOpen, setIsPromptLibraryOpen] = useState(false)

  const { data: promptsData } = useGetPromptsQuery({ page: 1, limit: 100 })
  const { data: stats } = useGetDashboardStatsQuery()
  const baseCredits = stats?.aiFeatures?.find((f) => f.feature_key === 'text_to_video')?.credits || 25


  const totalCredits = baseCredits

  const { data: usageLogsData, refetch: refetchLogs } = useGetUsageLogsQuery({
    serviceType: 'text_to_video',
    limit: 5,
  })
  const recentLogs = (usageLogsData?.logs || []) as GenerationLogItem[]

  const featureTags: FeatureTag[] = useMemo(
    () =>
      textToVideoFeatureTags.map((tag) => ({
        label: tag.label,
        icon: TAG_ICONS[tag.iconKey] || Sparkle,
        iconClassName:
          tag.iconKey === 'sparkle'
            ? 'text-blue-400'
            : tag.iconKey === 'layers'
              ? 'text-purple-400'
              : tag.iconKey === 'mic'
                ? 'text-pink-400'
                : 'text-amber-400',
      })),
    [],
  )

  useEffect(() => {
    const prompts = promptsData?.prompts || []
    if (templateId && prompts.length > 0) {
      const found = prompts.find((p: AiPrompt) => (p.id || p._id) === templateId)
      if (found) setPrompt(found.prompt)
    }
  }, [templateId])

  const [generateMedia] = useGenerateMediaMutation()
  const [saveToMedia, { isLoading: isSaving }] = useSaveToMediaMutation()
  const [generateCaption, { isLoading: isEnhancingPrompt }] = useGenerateCaptionMutation()

  useEffect(() => {
    if (!user) return

    const handleTaskUpdate = (payload: { taskId?: string; status?: string; resultUrl?: string; message?: string }) => {
      if (payload.taskId !== currentTaskId) return
      if (payload.status === 'completed') {
        setIsGenerating(false)
        setResultVideo(payload.resultUrl || null)
        refetchLogs()
        toast.success(t('video_generated_successfully', { defaultValue: 'Video generated successfully!' }))
      } else if (payload.status === 'failed') {
        setIsGenerating(false)
        toast.error(payload.message || t('generation_failed', { defaultValue: 'Generation failed' }))
      }
    }

    const eventName = `ai-task-${(user as { _id?: string; id?: string })._id || user.id}`
    socket.on(eventName, handleTaskUpdate)
    return () => {
      socket.off(eventName, handleTaskUpdate)
    }
  }, [user, currentTaskId, t, refetchLogs])

  const buildFinalPrompt = () => {
    let finalPrompt = prompt.trim()
    if (style && style !== 'Photorealistic') finalPrompt += `, ${style} style`
    return finalPrompt
  }

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error(t('please_enter_prompt', { defaultValue: 'Please enter a prompt' }))
      return
    }

    try {
      setIsGenerating(true)
      setResultVideo(null)

      const useCustomMusic = Boolean(selectedMusic?.serverPath)
      const res = await generateMedia({
        serviceType: 'text_to_video',
        prompt: buildFinalPrompt(),
        aspectRatio,
        duration,
        sound: soundToggle,
        resolution: mode,
        mode,
        addBackgroundMusic: addBackgroundMusicToggle || useCustomMusic || !!customMusicUrl.trim(),
        backgroundMusicPath: useCustomMusic ? selectedMusic!.serverPath : undefined,
        backgroundMusicUrl: customMusicUrl.trim() || (useCustomMusic ? selectedMusic!.url : undefined),
        addWatermark,
        allowWatermark: addWatermark,
        negativePrompt,
        seed: seed || undefined,
      }).unwrap()

      if (res.taskId) {
        setCurrentTaskId(res.taskId)
      } else {
        setIsGenerating(false)
        toast.error(t('failed_to_start_generation', { defaultValue: 'Failed to start generation task' }))
      }
    } catch (error: unknown) {
      setIsGenerating(false)
      const err = error as { data?: { message?: string } }
      toast.error(err?.data?.message || t('something_went_wrong', { defaultValue: 'Something went wrong' }))
    }
  }

  const handleSaveToMedia = async () => {
    if (!currentTaskId) return
    try {
      await saveToMedia({ taskId: currentTaskId }).unwrap()
      toast.success(t('saved_to_media_success', { defaultValue: 'Saved to media library successfully!' }))
    } catch (error: unknown) {
      const err = error as { data?: { message?: string } }
      toast.error(err?.data?.message || t('failed_to_save_media', { defaultValue: 'Failed to save to media' }))
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
    } catch {
      toast.error(t('failed_to_download_video', { defaultValue: 'Failed to download video' }))
    }
  }

  const handleResetAll = () => {
    setPrompt('')
    setAspectRatio('16:9')
    setDuration(8)
    setMode('std')
    setStyle('Cinematic')
    setSoundToggle(false)
    setAddBackgroundMusicToggle(false)
    setSelectedMusic(null)
    setCustomMusicUrl('')
    setAddWatermark(false)
    setNegativePrompt('blurry, low quality, watermark')
    setSeed('')
    setOutputDestination('Media Library')
    toast.info(t('settings_reset', { defaultValue: 'All settings reset to defaults.' }))
  }

  const handleRandomizeSeed = () => {
    setSeed(Math.floor(Math.random() * 89999 + 10000).toString())
    toast.success(t('seed_randomized', { defaultValue: 'Random seed generated!' }))
  }

  const handleHistorySelect = (log: GenerationLogItem) => {
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
  }

  const videoPreviewUrl = resultVideo ? getMediaUrl(resultVideo) : null

  const videoActionFooter = (
    <>
      <Button
        onClick={handleResetAll}
        variant="outline"
        className="w-full sm:w-auto h-11 px-4 rounded-xl bg-black/3 dark:bg-white/3 border border-glass-border text-subtitle-color hover:bg-slate-100 dark:hover:bg-white/5 gap-2 font-bold text-xs"
      >
        <RotateCcw className="w-4 h-4" />
        {t('reset_all', { defaultValue: 'Reset All' })}
      </Button>
      <div className="flex flex-col items-center sm:items-end w-full sm:w-auto">
        <Button
          onClick={handleGenerate}
          disabled={isGenerating || !prompt.trim()}
          className="w-full sm:w-auto h-11 sm:h-12 px-6 rounded-xl primary-btn text-white! font-bold gap-2 text-xs sm:text-sm border-0 flex items-center justify-center"
        >
          {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
          {isGenerating
            ? t('generating', { defaultValue: 'Generating...' })
            : t('generate_video', { defaultValue: 'Generate Video' })}
          {!isGenerating && (
            <span className="ml-1 px-2 py-0.5 bg-black/20 rounded-full text-[11px] border border-black/20">
              {totalCredits} {t('credits', { defaultValue: 'credits' })}
            </span>
          )}
        </Button>
      </div>
    </>
  )

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <AIFeaturePageHeader
        title={t('text_to_video', { defaultValue: 'Text to Video' })}
        subtitle={t('text_to_video_subtitle', {
          defaultValue: 'Turn your ideas into stunning videos with AI',
        })}
      />

      <AIFeatureTagsBar tags={featureTags} />

      <div className="grid grid-cols-1 2xl:grid-cols-12 gap-6 items-start">
        <div className="2xl:col-span-8 space-y-6">
          <AIPromptDescribeSection
            title={t('describe_your_video', { defaultValue: 'Describe your video' })}
            description={t('describe_video_hint', {
              defaultValue: 'Write a detailed prompt. The more details, the better the result.',
            })}
            placeholder={t('text_to_video_placeholder', {
              defaultValue:
                'Describe the scene you want to generate... e.g., A majestic dragon soaring through snowy mountains, hyper-realistic, 4k cinematic',
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

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            {/* Video Settings */}
            <div className="bg-white dark:bg-white/3 border border-slate-200 dark:border-glass-border rounded-border-radius p-4 sm:p-6 space-y-5">
              <div className="flex items-center gap-3">
                <span className="flex items-center justify-center w-8 h-8 primary-btn text-white font-bold text-base shrink-0">
                  2
                </span>
                <h3 className="text-base font-bold text-title-">
                  {t('video_settings', { defaultValue: 'Video Settings' })}
                </h3>
              </div>

              {/* Aspect Ratio — full width */}
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-title mb-2!">
                  {t('aspect_ratio', { defaultValue: 'Aspect Ratio' })}
                </h4>
                <div className="overflow-x-auto no-scrollbar py-1">
                  <div ref={aspectRatioContainerRef} className="flex sm:grid sm:grid-cols-3 gap-2 border border-glass-border p-2 rounded-xl w-max sm:w-full min-w-full">
                    {videoAspectRatios.map((ar) => (
                      <Button
                        key={ar.value}
                        type="button"
                        data-active={aspectRatio === ar.value ? 'true' : 'false'}
                        onClick={() => setAspectRatio(ar.value)}
                        className={cn(
                          'group/btn relative h-12! rounded-full flex! items-center! justify-center! gap-2! transition-all duration-500 shrink-0 w-28 sm:w-auto',
                          aspectRatio === ar.value
                            ? 'text-white! primary-btn font-bold'
                            : 'bg-black/3! dark:bg-white/3! text-title-color!',
                        )}
                      >
                        <AspectRatioBox ratio={ar.value} />
                        <span className="text-xs uppercase tracking-wider">{ar.label}</span>
                      </Button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Mode — full width */}
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-title mb-2!">{t('mode', { defaultValue: 'Mode' })}</h4>
                <div className="overflow-x-auto no-scrollbar py-1">
                  <div ref={modeContainerRef} className="flex sm:grid sm:grid-cols-3 gap-2 border border-glass-border p-2 rounded-xl w-max sm:w-full min-w-full">
                    {[
                      { value: 'std', label: 'Standard', icon: Zap },
                      { value: 'pro', label: 'Pro', icon: Shield, pro: true },
                      { value: '4k', label: '4K', icon: Crown, pro: true },
                    ].map((m) => (
                      <Button
                        key={m.value}
                        type="button"
                        data-active={mode === m.value ? 'true' : 'false'}
                        onClick={() => setMode(m.value)}
                        className={cn(
                          'h-11 rounded-xl font-semibold flex items-center justify-center gap-1.5 transition-all shrink-0 w-28 sm:w-auto',
                          mode === m.value
                            ? ' text-white! primary-btn font-bold'
                            : 'bg-black/3! dark:bg-white/3! text-title-color!',
                        )}
                      >
                        <m.icon className={cn('w-3.5 h-3.5', mode === m.value ? 'text-white' : 'text-title-color')} />
                        <span className="text-xs">{m.label}</span>
                      </Button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Duration + Sound — side by side */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold text-title mb-2!" >{t('duration', { defaultValue: 'Duration' })}</h4>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300">
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
                      className="w-full"
                    />
                  </div>
                  <div className="flex items-center justify-between text-[10px] font-bold text-slate-400">
                    <span>3s</span>
                    <span>15s</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-title mb-2!">{t('sound', { defaultValue: 'Sound' })}</h4>
                  <div className="flex items-center justify-between h-11 px-4 rounded-border-radius-inner border border-glass-border bg-black/3 dark:bg-white/3">
                    <div className="flex items-center gap-2 text-xs font-semibold text-title-color">
                      {soundToggle ? (
                        <Volume2 className="w-4 h-4 text-primary" />
                      ) : (
                        <VolumeX className="w-4 h-4 text-slate-400" />
                      )}
                      {soundToggle ? 'ON' : 'OFF'}
                    </div>
                    <AISwitch checked={soundToggle} onChange={setSoundToggle} />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3">
                <div className="space-y-2 relative">
                  <h4 className="text-sm font-semibold text-title mb-2!">{t('style', { defaultValue: 'Style' })}</h4>
                  <Button
                    type="button"
                    onClick={() => setIsStyleOpen(!isStyleOpen)}
                    className="w-full h-10 px-3 bg-slate-50 dark:bg-white/3! border border-slate-200 dark:border-glass-border rounded-border-radius-inner text-xs flex items-center justify-between text-slate-900 dark:text-white"
                  >
                    {style}
                    <ChevronDown className="w-4 h-4 opacity-50" />
                  </Button>
                  {isStyleOpen && (
                    <div className="absolute top-16 left-0 w-full bg-white dark:bg-modal-bg-color border border-glass-border rounded-xl p-2 py-2 shadow-2xl z-50 max-h-40 overflow-y-auto no-scrollbar">
                      {videoStyleOptions.map((opt) => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => {
                            setStyle(opt)
                            setIsStyleOpen(false)
                          }}
                          className="w-full h-8 px-3 py-1 text-left text-xs hover:bg-slate-100 dark:hover:bg-white/5 text-slate-700 dark:text-slate-300"
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Advanced Options */}
            <div className="bg-white dark:bg-white/3 border border-slate-200 dark:border-glass-border rounded-border-radius p-4 sm:p-6 space-y-4">
              <div className="flex items-center gap-3">
                <span className="flex items-center justify-center w-8 h-8  primary-btn text-white font-bold text-base shrink-0">
                  3
                </span>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {t('advanced_options', { defaultValue: 'Advanced Options' })}
                </h3>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between h-11 px-4 rounded-border-radius-inner border border-slate-200 dark:border-white/5 bg-slate-55 dark:bg-white/3 ">
                  <span className="text-sm text-subtitle-color font-semibold">
                    {t('add_watermark', { defaultValue: 'Watermark' })}
                  </span>
                  <AISwitch checked={addWatermark} onChange={setAddWatermark} />
                </div>

                <div className="flex items-center justify-between h-11 px-4 rounded-border-radius-inner border border-slate-200 dark:border-white/5 bg-slate-55 dark:bg-white/3">
                  <span className="text-sm text-subtitle-color font-semibold">
                    {t('add_music', { defaultValue: 'Add Background Music' })}
                  </span>
                  <AISwitch checked={addBackgroundMusicToggle} onChange={setAddBackgroundMusicToggle} />
                </div>
              </div>

              {addBackgroundMusicToggle && (
                <div className="space-y-3 pt-2">
                  <h4 className="text-sm font-semibold text-title">{t('music_url', { defaultValue: 'Music URL' })}</h4>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <span className="text-[10px] font-bold text-slate-400">URL</span>
                    </div>
                    <Input
                      type="url"
                      value={customMusicUrl}
                      onChange={(e) => setCustomMusicUrl(e.target.value)}
                      placeholder="Or paste a direct audio URL (.mp3, .wav)"
                      className="w-full h-10 pl-10 bg-slate-50 dark:bg-white/3 border border-slate-200 dark:border-white/10 rounded-border-radius-inner text-xs text-slate-900 dark:text-white outline-hidden placeholder:text-slate-400"
                    />
                  </div>
                </div>
              )}

              {/* Negative Prompt field */}
              <div className="space-y-2">
                <div className="flex items-center gap-1.5">
                  <h4 className="text-sm font-semibold text-title">Negative Prompt</h4>
                  <span title="Things you do not want in the video" className="inline-flex">
                    <HelpCircle className="w-3.5 h-3.5 text-slate-600 hover:text-slate-400 cursor-pointer" />
                  </span>
                </div>
                <Input
                  type="text"
                  value={negativePrompt}
                  onChange={(e) => setNegativePrompt(e.target.value)}
                  placeholder="blurry, low quality, watermark..."
                  className="w-full h-10 px-3 bg-slate-50 dark:bg-white/3 border border-slate-200 dark:border-white/10 rounded-border-radius-inner text-xs text-slate-900 dark:text-white outline-hidden placeholder:text-slate-400 dark:placeholder:text-slate-600"
                />
              </div>

              {/* Seed field with Randomize icon */}
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-title">Seed (Optional)</h4>
                <div className="relative">
                  <Input
                    type="text"
                    value={seed}
                    onChange={(e) => setSeed(e.target.value)}
                    placeholder="Enter a number (e.g. 12345)"
                    className="w-full h-10 pl-3 pr-10 bg-black/3 dark:bg-white/3 border border-glass-border rounded-border-radius-inner text-xs text-title-color outline-hidden placeholder:text-title-color"
                  />
                  <button
                    type="button"
                    onClick={handleRandomizeSeed}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-purple-400 transition-colors"
                    title="Generate Random Seed"
                  >
                    <Dices className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Outputs will be saved to */}
              <div className="space-y-2 relative">
                <h4 className="text-sm font-semibold text-title">Outputs will be saved to</h4>
                <Button
                  type="button"
                  onClick={() => setIsOutputOpen(!isOutputOpen)}
                  className="w-full h-10 px-3 bg-black/3 dark:bg-white/3! border border-slate-200 dark:border-white/10 rounded-border-radius-inner text-xs flex items-center justify-between text-slate-900 dark:text-white hover:border-slate-300 dark:hover:border-white/20 transition-colors"
                >
                  <span>{outputDestination}</span>
                  <ChevronDown className="w-4 h-4 opacity-50" />
                </Button>
                {isOutputOpen && (
                  <div className="absolute top-16 left-0 w-full bg-white dark:bg-modal-bg-color border border-glass-border rounded-border-radius-inner py-1 shadow-2xl z-50">
                    {destinationOptions.map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => {
                          setOutputDestination(opt)
                          setIsOutputOpen(false)
                        }}
                        className={cn(
                          'w-full h-8 px-3 text-left text-xs transition-colors bloc',
                          outputDestination === opt
                            ? 'text-primary font-bold '
                            : 'text-slate-700 dark:text-slate-300',
                        )}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* Desktop Only Action Footer */}
          <div className="hidden 2xl:flex items-center justify-between gap-4 mt-6">
            {videoActionFooter}
          </div>
        </div>

        {/* Right column */}
        <div className="2xl:col-span-4 space-y-6">
          <Card className="bg-white dark:bg-white/3 border border-slate-200 dark:border-glass-border rounded-border-radius overflow-hidden  flex flex-col min-h-[350px]">
            <div className="p-4 border-b border-slate-200 dark:border-white/5">
              <div className="text-base font-bold flex items-center gap-2 text-slate-900 dark:text-white">
                <Film className="w-5 h-5 text-purple-400" />
                {t('video_preview', { defaultValue: 'Video Preview' })}
              </div>
              <p className="text-sm text-subtitle-color mt-0.5">
                {t('video_preview_hint', { defaultValue: 'Your generated video will appear here' })}
              </p>
            </div>

            <CardContent className="p-4 flex-1 flex flex-col justify-center items-center min-h-[220px]">
              {isGenerating && !resultVideo ? (
                <div className="flex flex-col items-center gap-4 py-8">
                  <div className="relative w-16 h-16">
                    <div className="absolute inset-0 rounded-full border-4 border-purple-500/10" />
                    <div className="absolute inset-0 rounded-full border-4 border-purple-500 border-t-transparent animate-spin" />
                    <Wand2 className="absolute inset-0 m-auto w-5 h-5 text-purple-400 animate-pulse" />
                  </div>
                  <p className="text-xs font-bold text-purple-400 animate-pulse">
                    {t('crafting_video', { defaultValue: 'Crafting your video...' })}
                  </p>
                </div>
              ) : videoPreviewUrl ? (
                <div className="w-full aspect-video rounded-xl overflow-hidden border border-slate-200 dark:border-white/5 bg-black/5 dark:bg-black/40 relative group">
                  <video src={videoPreviewUrl} className="w-full h-full object-contain" controls playsInline />
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
                      className="gap-2 rounded-xl h-9 w-9 p-2! bg-primary!  border border-white/10 text-white! font-bold text-xs"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center flex-col text-center space-y-3 py-6">
                  <Image
                    src="/images/text-to-video.png"
                    alt="Text to Video preview"
                    width={150}
                    height={150}
                    className="w-37.5 h-37.5 opacity-[0.5] object-cover"
                    unoptimized
                  />
                  <p className="text-base font-bold text-slate-900 dark:text-white">
                    {t('ready_to_create', { defaultValue: 'Ready to Create?' })}
                  </p>
                  <p className="text-xs text-slate-500 max-w-[200px] mx-auto">
                    {t('video_appear_here', {
                      defaultValue: 'Enter a prompt and generate your first video.',
                    })}
                  </p>
                </div>
              )}
            </CardContent>

            <AIRecentGenerationsHistory logs={recentLogs} mediaType="video" onSelectLog={handleHistorySelect} />
          </Card>

          <AIProTipsCard tips="Describe motion, camera angle, and lighting. Use phrases like slow dolly-in, golden hour, or cinematic tracking shot for stronger results." />


        </div>
      </div>
      <div className="2xl:hidden  flex flex-col-reverse sm:flex-row items-center justify-between gap-4 mt-4 ">
        <Button
          onClick={handleResetAll}
          variant="outline"
          className="h-11 px-4 rounded-xl bg-black/3 dark:bg-white/3 border border-glass-border text-subtitle-color gap-2 font-bold text-xs"
        >
          <RotateCcw className="w-4 h-4" />
          {t('reset_all', { defaultValue: 'Reset All' })}
        </Button>
        <div className="flex flex-col items-end">
          <Button
            onClick={handleGenerate}
            disabled={isGenerating || !prompt.trim()}
            className="h-11 sm:h-12 px-6 rounded-xl primary-btn text-white! font-bold gap-2 text-xs sm:text-sm border-0"
          >
            {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
            {isGenerating
              ? t('generating', { defaultValue: 'Generating...' })
              : t('generate_video', { defaultValue: 'Generate Video' })}
            {!isGenerating && (
              <span className="ml-1 px-2 py-0.5 bg-black/20 rounded-full text-[11px] border border-black/20">
                {totalCredits} {t('credits', { defaultValue: 'credits' })}
              </span>
            )}
          </Button>
        </div>
      </div>

      <PromptLibraryModal
        isOpen={isPromptLibraryOpen}
        onClose={() => setIsPromptLibraryOpen(false)}
        onSelect={(p) => setPrompt(p)}
        mode="text_to_video"
      />
    </div>
  )
}
