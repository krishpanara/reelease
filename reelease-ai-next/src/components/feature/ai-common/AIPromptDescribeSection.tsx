'use client'

import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textArea'
import { localDetailEnhancements } from '@/data/aiPromptPresets'
import { surprisePrompts } from '@/data/features'
import { useGenerateCaptionMutation } from '@/redux/api/socialPublishApi'
import { AIPromptDescribeSectionProps } from '@/types/ecommerceCatalogue'
import { Clock, Loader2, Plus, Sparkle, Wand2 } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

export function AIPromptDescribeSection({
  stepNumber = 1,
  title,
  description,
  placeholder,
  generateCaption,
  prompt,
  onPromptChange,
  maxLength = 1000,
  isEnhancingPrompt = false,
  onImprovePrompt = false,
  onAddDetails = false,
  onSurpriseMe = false,
  onOpenPromptLibrary,
  improveLabel = 'Improve Prompt',
  addDetailsLabel = 'Add Details',
  surpriseLabel = 'Surprise Me',
  promptLibraryLabel = 'Prompt Library',
  t
}: AIPromptDescribeSectionProps) {
// Prompt helpers
  const handleSurpriseMe = () => {
    const randomIndex = Math.floor(Math.random() * surprisePrompts.length)
    onPromptChange(surprisePrompts[randomIndex])
    toast.success(t('surprise_prompt_applied', { defaultValue: 'Random prompt applied!' }))
  }
  
    // Handle Dynamic Improve Prompt using AI caption endpoint
    const handleImprovePrompt = async () => {
      if (!prompt.trim()) {
        toast.warning(t('enter_prompt_first', { defaultValue: 'Please enter a prompt first' }))
        return
      }
      try {
        const res = await generateCaption({
          platform: 'instagram',
          purpose: 'image_prompt',
          custom_prompt: `Refine this image-generation prompt with richer visual detail, lighting, and composition. Keep it under 200 characters as one line: "${prompt}"`,
          num_captions: 1,
        }).unwrap()
  
        if (res.success && res.data?.captions?.length > 0) {
          onPromptChange(res.data.captions[0])
          toast.success(t('prompt_enhanced', { defaultValue: 'Prompt enhanced with descriptive details!' }))
        } else {
          throw new Error('Empty response')
        }
      } catch (error: any) {
        console.error('Enhance prompt error:', error)
        const apiMessage = error?.data?.message as string | undefined
        if (apiMessage) {
          toast.error(apiMessage)
          return
        }
        onPromptChange((prev: any) => `${prev}, photorealistic, dramatic lighting, highly detailed, 8k resolution`)
        toast.warning(
          t('ai_unavailable_local_enhance', {
            defaultValue: 'AI is unavailable — added basic enhancement keywords locally.',
          }),
        )
      }
    }
  
    const handleAddDetails = () => {
      if (!prompt.trim()) {
        toast.warning(t('enter_prompt_first', { defaultValue: 'Please enter a prompt first' }))
        return
      }
      const detail = localDetailEnhancements[Math.floor(Math.random() * localDetailEnhancements.length)]
      onPromptChange((prev: string | string[]) => (prev.includes(detail) ? prev : `${prev}, ${detail}`))
      toast.success(t('details_added', { defaultValue: 'Visual details added to your prompt!' }))
    }


  return ( 
    <div className="bg-white dark:bg-white/3 border border-glass-border dark:border-glass-border rounded-border-radius p-4 sm:p-6 space-y-4">
      <div className="flex items-start gap-3">
        <span className="flex items-center justify-center w-8 h-8 rounded-full primary-btn text-white font-bold text-base mt-0.5 shrink-0">
          {stepNumber}
        </span>
        <div>
          <h3 className="text-base font-bold text-title-color">{title}</h3>
          <p className="text-sm text-subtitle-color mt-0.5">{description}</p>
        </div>
      </div>

      <div className="relative">
        <Textarea
          value={prompt}
          onChange={(e) => onPromptChange(e.target.value)}
          placeholder={placeholder}
          className="w-full min-h-32 sm:min-h-40 bg-subcard dark:bg-white/3 border border-glass-border dark:border-glass-border  rounded-border-radius p-4 text-sm sm:text-base leading-relaxed text-slate-900 dark:text-white placeholder:text-subtitle-color resize-none outline-hidden"
        />
        <div className="absolute bottom-3 right-3 text-right">
          <span className="text-3xs font-semibold text-subtitle-color/70 bg-subcard dark:bg-white/3 px-2 py-0.5 rounded-md">
            {prompt.length} / {maxLength}
          </span>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        <div className="flex flex-wrap gap-2">
          {onImprovePrompt && (
            <Button
              type="button"
              // onClick={onImprovePrompt}
              onClick={handleImprovePrompt}
              disabled={isEnhancingPrompt}
              variant="outline"
              className="h-8 px-3 rounded-lg bg-subcard dark:bg-white/3 border border-glass-border dark:border-glass-border hover:bg-slate-100 dark:hover:bg-white/5 text-slate-700 dark:text-slate-300 gap-1.5 font-bold"
            >
              {isEnhancingPrompt ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-secondary" />
              ) : (
                <Wand2 className="w-3.5 h-3.5 text-secondary" />
              )}
              {improveLabel}
            </Button>
          )}
          {onAddDetails && (
            <Button
              type="button"
              // onClick={onAddDetails}
              onClick={handleAddDetails}
              variant="outline"
              className="h-8 px-3 rounded-lg bg-subcard dark:bg-white/3 border border-glass-border dark:border-white/5  gap-1.5 font-bold"
            >
              <Plus className="w-3.5 h-3.5 text-primary" />
              {addDetailsLabel}
            </Button>
          )}
          {onSurpriseMe && (
            <Button
              type="button"
              // onClick={onSurpriseMe}
              onClick={handleSurpriseMe}
              variant="outline"
              className="h-8 px-3 rounded-lg bg-subcard dark:bg-white/3 border border-glass-border dark:border-white/5  gap-1.5 font-bold"
            >
              <Sparkle className="w-3.5 h-3.5 text-pink-400" />
              {surpriseLabel}
            </Button>
          )}
        </div>

        <Button
          type="button"
          onClick={onOpenPromptLibrary}
          variant="ghost"
          className="h-8 px-3 rounded-lg bg-subcard dark:bg-white/3 border border-glass-border dark:border-white/5  gap-1.5 font-bold"
        >
          <Clock className="w-3.5 h-3.5 text-amber-400" />
          {promptLibraryLabel}
          {/* <ChevronDown className="w-3 h-3 opacity-60" /> */}
        </Button>
      </div>
    </div>
  )
}
