'use client'

import { AIFeaturePageHeader } from '@/components/feature/ai-common/AIFeaturePageHeader'
import { AIFeatureTagsBar } from '@/components/feature/ai-common/AIFeatureTagsBar'
import { AIPromptDescribeSection } from '@/components/feature/ai-common/AIPromptDescribeSection'
import MediaPickerModal from '@/components/feature/media-library/MediaPickerModal'
import { Button } from '@/components/ui/button'
import { aiVideoTools } from '@/data/features'
import { cn } from '@/lib/utils'
import { useGenerateMediaMutation, useGetUsageLogsQuery, useSaveToMediaMutation } from '@/redux/api/aiApi'
import { useGetTemplatesQuery } from '@/redux/api/aiTemplateApi'
import { useGetDashboardStatsQuery } from '@/redux/api/dashboardApi'
import { useAppSelector } from '@/redux/hooks'
import { socket } from '@/services/socketSetup'
import { AITemplate, Attachment } from '@/types'
import { FeatureTag } from '@/types/components/features'
import { getDownloadUrl } from '@/utils'
import {
  Briefcase,
  Image,
  Layers,
  Layout,
  Loader2,
  Monitor,
  Sparkles,
  Wand2,
  Zap
} from 'lucide-react'
import { useSearchParams } from 'next/navigation'
import { useEffect, useMemo, useState, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import PromptLibraryModal from '../ai-common/PromptLibraryModal'
import { ImageToImageOutput } from './components/ImageToImageOutput'
import { ReferenceImageUpload } from './components/ReferenceImageUpload'
import { useGenerateCaptionMutation } from '@/redux/api/socialPublishApi'
import { AspectRatioBox } from '../ai-common/AspectRatioBox'
import { AIProTipsCard } from '../ai-common/AIProTipsCard'

export default function ImageToImageGenerate() {
  const { t } = useTranslation()
  const user = useAppSelector((state) => state.auth.user)
  const searchParams = useSearchParams()
  const templateId = searchParams.get('templateId')

  const [prompt, setPrompt] = useState('')
  const [selectedAttachments, setSelectedAttachments] = useState<Attachment[]>([])
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [currentTaskId, setCurrentTaskId] = useState<string | null>(null)
  const [resultImage, setResultImage] = useState<string | null>(null)
  const [isPromptLibraryOpen, setIsPromptLibraryOpen] = useState(false)

  // Parameter State
  const [ratio, setRatio] = useState('1:1')
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
  }, [ratio])
  const [resolution, setResolution] = useState('1K')

  const { data: templatesRaw, isLoading: isLoadingTemplates } = useGetTemplatesQuery({ status: true })
  const [generateCaption, { isLoading: isEnhancingPrompt }] = useGenerateCaptionMutation()
  const { data: stats } = useGetDashboardStatsQuery()
  const credits = stats?.aiFeatures?.find((f) => f.feature_key === 'image_to_image')?.credits
  const templates = Array.isArray(templatesRaw) ? templatesRaw : templatesRaw?.templates || []

  useEffect(() => {
    if (templateId && templates.length > 0) {
      const found = templates.find((t: AITemplate) => (t.id || t._id) === templateId)
      if (found && !prompt) {
        setPrompt(found.prompt)

        if (found.attachment_id) {
          const attachments = Array.isArray(found.attachment_id)
            ? found.attachment_id
            : [
              typeof found.attachment_id === 'object'
                ? found.attachment_id
                : {
                  _id: typeof found.attachment_id === 'string' ? found.attachment_id : undefined,
                  file_path:
                    found.file_path || (typeof found.attachment_id === 'string' ? found.attachment_id : undefined),
                },
            ]

          const validAttachments = attachments.filter((a: any) => a.file_path || a._id || a.id)
          if (validAttachments.length > 0) {
            setSelectedAttachments(validAttachments)
          }
        }
      }
    }
  }, [templateId, templates])

  // Dynamic Recent Prompts API integration
  const { data: usageLogsData, refetch: refetchLogs } = useGetUsageLogsQuery({
    serviceType: 'image_to_image',
    limit: 5,
  })
  const recentLogs = usageLogsData?.logs || []

  const featureTags = useMemo<FeatureTag[]>(
    () => [
      {
        label: t('high_quality_output', { defaultValue: 'High Quality Output' }),
        icon: Sparkles,
        iconClassName: 'text-blue-400',
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

  const [generateMedia] = useGenerateMediaMutation()
  const [saveToMedia, { isLoading: isSaving }] = useSaveToMediaMutation()

  useEffect(() => {
    if (!user) return

    const handleTaskUpdate = (payload: any) => {
      if (payload.taskId === currentTaskId) {
        if (payload.status === 'completed') {
          setIsGenerating(false)
          setResultImage(payload.resultUrl)
          toast.success(t('image_generated_successfully', { defaultValue: 'Image generated successfully!' }))
          refetchLogs?.()
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

  const handleRecentLogSelect = (log: any) => {
    const logPromptText =
      log.payload?.prompt || log.payload?.input?.prompt || log.payload?.text || 'AI Generated Image'
    setPrompt(logPromptText)

    if (log.result_url && log.task_id) {
      setResultImage(log.result_url)
      setCurrentTaskId(log.task_id)
    }

    const payloadAttachments = log.payload?.attachmentIds || log.payload?.input?.attachmentIds
    if (Array.isArray(payloadAttachments) && payloadAttachments.length > 0) {
      const attachments = payloadAttachments.map((att: any) => {
        if (typeof att === 'string') {
          return { id: att, file_path: '' }
        }
        return {
          id: att.id || att._id,
          file_path: att.file_path || att.url || '',
        }
      })
      setSelectedAttachments(attachments as any)
    }

    toast.success(t('prompt_loaded', { defaultValue: 'Prompt loaded from history!' }))
  }

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error(t('please_enter_prompt', { defaultValue: 'Please enter a prompt' }))
      return
    }

    if (selectedAttachments.length === 0) {
      toast.error(
        t('please_select_reference_image', { defaultValue: 'Please select or upload at least one reference image' }),
      )
      return
    }

    try {
      setIsGenerating(true)
      setResultImage(null)

      const res = await generateMedia({
        serviceType: 'image_to_image',
        prompt,
        aspectRatio: ratio,
        resolution,
        attachmentIds: selectedAttachments.map((a) => a.id || (a as any)._id),
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
    if (!resultImage) return
    try {
      const url = getDownloadUrl(resultImage)
      const response = await fetch(url)
      const blob = await response.blob()
      const blobUrl = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = blobUrl
      link.download = `ai-image-${Date.now()}.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(blobUrl)
    } catch (error) {
      toast.error(t('failed_to_download_image', { defaultValue: 'Failed to download image' }))
    }
  }

  const handleTemplateClick = (template: AITemplate) => {
    setPrompt(template.prompt)

    if (template.attachment_id) {
      const attachments = Array.isArray(template.attachment_id)
        ? template.attachment_id
        : [
          typeof template.attachment_id === 'object'
            ? template.attachment_id
            : {
              _id: typeof template.attachment_id === 'string' ? template.attachment_id : undefined,
              file_path:
                template.file_path ||
                (typeof template.attachment_id === 'string' ? template.attachment_id : undefined),
            },
        ]

      const validAttachments = attachments.filter((a: any) => a.file_path || a._id || a.id)
      if (validAttachments.length > 0) {
        setSelectedAttachments(validAttachments)
      }
    }
  }

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <AIFeaturePageHeader
        icon={<Image className="w-6 h-6 text-primary animate-pulse" />}
        title={t('image_to_image', { defaultValue: 'Image to Image' })}
        subtitle={t('image_to_image_desc', { defaultValue: 'Transform your reference images using AI' })}
      />

      <AIFeatureTagsBar tags={featureTags} />

      <div className="grid grid-cols-1 2xl:grid-cols-12 gap-8">
        {/* Left Section: Input Area */}
        <div className="2xl:col-span-7 space-y-6">
          <AIPromptDescribeSection
            title={t('transformation_prompt', { defaultValue: 'Transformation Prompt' })}
            description={t('image_to_image_desc_sub', {
              defaultValue: 'Describe how you want to transform this image... e.g. make it cyberpunk',
            })}
            placeholder={t('image_to_image_placeholder', {
              defaultValue: 'Describe how you want to transform this image... e.g. make it cyberpunk, add neon glow',
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

          {/* STEP 2: Reference Image */}
          <div className="bg-white dark:bg-white/3 border border-glass-border rounded-border-radius p-4 sm:p-6 space-y-4">
            <div className="flex items-center gap-3">
              <span className="flex items-center justify-center w-8 h-8 rounded-full primary-btn text-white font-bold text-base mt-0.5 shrink-0">
                2
              </span>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {t('reference_image', { defaultValue: 'Reference Image' })}
                </h3>
                <p className="text-sm text-subtitle-color mt-0.5">
                  {t('reference_image_desc_sub', {
                    defaultValue: 'Select or upload a base image to guide the transformation',
                  })}
                </p>
              </div>
            </div>
            <ReferenceImageUpload
              selectedAttachments={selectedAttachments}
              setSelectedAttachments={setSelectedAttachments}
              setIsMediaPickerOpen={setIsMediaPickerOpen}
            />
          </div>

          {/* STEP 3: Image Settings */}
          <div className="bg-white dark:bg-white/3 border border-glass-border rounded-border-radius p-4 sm:p-6 space-y-6">
            <div className="flex items-center gap-3">
              <span className="flex items-center justify-center w-8 h-8 rounded-full primary-btn text-white font-bold text-base mt-0.5 shrink-0">
                3
              </span>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {t('image_settings', { defaultValue: 'Image Settings' })}
                </h3>
                <p className="text-sm text-subtitle-color mt-0.5">
                  {t('image_settings_desc_sub', {
                    defaultValue: 'Adjust the output format and details',
                  })}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 2xl:grid-cols-2 gap-4 pt-4 border-t border-border/30">
              {/* Aspect Ratio */}
              <div className="space-y-4">
                <div className="flex items-center justify-between px-1 mb-2!">
                  <div className=" flex items-center gap-2 text-sm font-semibold text-title">
                    {t('aspect_ratio')}
                  </div>
                </div>

                <div className="overflow-x-auto no-scrollbar py-1">
                  <div ref={aspectRatioContainerRef} className="flex sm:grid sm:grid-cols-3 gap-1 p-2 rounded-full border border-glass-card w-max sm:w-full min-w-full">
                    {aiVideoTools.map((option) => (
                      <Button
                        key={option.value}
                        type="button"
                        data-active={ratio === option.value ? 'true' : 'false'}
                        onClick={() => setRatio(option.value)}
                        className={cn(
                          'group/btn relative h-12! rounded-full flex! items-center! justify-center! gap-2! transition-all duration-500 shrink-0 w-28 sm:w-auto',
                          ratio === option.value
                            ? 'text-white! primary-btn font-bold'
                            : 'bg-black/3! dark:bg-white/3! text-title-color!',
                        )}
                      >
                        <AspectRatioBox ratio={option.value} />
                        <span className="text-xs uppercase tracking-wider">{option.label}</span>
                      </Button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Resolution */}
              <div className="space-y-4">
                <div className="flex items-center justify-between px-1 mb-2!">
                  <div className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">

                    {t('quality')}
                  </div>

                </div>

                <div className="flex gap-1  p-2 rounded-full border border-glass-card ">
                  {['1K', '2K'].map((res) => (
                    <Button
                      key={res}
                      type='button'
                      onClick={() => setResolution(res)}
                      className={cn(
                        'relative flex-1 h-10 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 font-bold ',
                        resolution === res
                          ? 'text-white! primary-btn font-bold'
                          : 'bg-black/3! dark:bg-white/3! text-title-color!',
                      )}
                    >


                      <span className="relative z-10">{res}</span>
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Action Bar */}
          <div className="pt-2 hidden 2xl:flex justify-end">
            <Button
              onClick={handleGenerate}
              disabled={isGenerating || !prompt.trim() || selectedAttachments.length === 0}
              className="gap-3 h-12 font-medium text-sm sm:text-base sm:px-6 px-4 rounded-radius primary-btn text-white! flex shadow-[0_0_20px_rgba(147,197,253,0.3)] hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:hover:scale-100 border-0 justify-center"
            >
              {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Wand2 className="w-5 h-5" />}
              {isGenerating ? t('generating') : t('transform_image', { defaultValue: 'Transform Image' })}
              {!isGenerating && credits && (
                <span className="w-7 h-7 flex items-center gap-1.5 ml-1 px-2 py-1 bg-black/20 rounded-full text-[12px] font-bold border border-black/20">
                  {credits}
                </span>
              )}
            </Button>
          </div>
        </div>

        {/* Right Section: Output Area */}
        <div className="2xl:col-span-5 flex flex-col gap-6">
          <ImageToImageOutput
            isGenerating={isGenerating}
            resultImage={resultImage}
            isSaving={isSaving}
            handleSaveToMedia={handleSaveToMedia}
            handleDownload={handleDownload}
            recentLogs={recentLogs}
            onSelectRecentLog={handleRecentLogSelect}
          />
          <AIProTipsCard
            tips={t('image_to_image_tips', {
              defaultValue:
                'Add specific details about the new style, such as lighting, mood, color palette, and composition, to get the best results.',
            })}
          />
        </div>
      </div>

      {/* Sticky Bottom Bar for screens smaller than 2xl */}
      <div className="2xl:hidden flex justify-end items-center gap-4 mt-4">
        <Button
          onClick={handleGenerate}
          disabled={isGenerating || !prompt.trim() || selectedAttachments.length === 0}
          className="w-full sm:w-auto h-12 font-medium text-sm sm:text-base sm:px-6 px-4 rounded-radius primary-btn text-white! flex shadow-[0_0_20px_rgba(147,197,253,0.3)] hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:hover:scale-100 border-0 justify-center items-center"
        >
          {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Wand2 className="w-5 h-5" />}
          {isGenerating ? t('generating') : t('transform_image', { defaultValue: 'Transform Image' })}
          {!isGenerating && credits && (
            <span className="w-7 h-7 flex items-center gap-1.5 ml-1 px-2 py-1 bg-black/20 rounded-full text-[12px] font-bold border border-black/20">
              {credits}
            </span>
          )}
        </Button>
      </div>

      <PromptLibraryModal
        isOpen={isPromptLibraryOpen}
        onClose={() => setIsPromptLibraryOpen(false)}
        onSelect={(p, item) => handleTemplateClick(item)}
        mode="image_to_image"
      />

      <MediaPickerModal
        isOpen={isMediaPickerOpen}
        onClose={() => setIsMediaPickerOpen(false)}
        type="image"
        onSelect={(attachment) => {
          const newAttachments = Array.isArray(attachment) ? attachment : [attachment]
          setSelectedAttachments((prev) => {
            if (prev.length + newAttachments.length > 8) {
              toast.error(t('max_8_images', { defaultValue: 'You can only add up to 8 images' }))
              return prev
            }
            return [...prev, ...newAttachments]
          })
          setIsMediaPickerOpen(false)
        }}
      />
    </div>
  )
}
