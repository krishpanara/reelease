'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Input from '@/components/ui/input'
import Label from '@/components/ui/label'
import { Textarea } from '@/components/ui/textArea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Sparkles, Loader2, AlignLeft, Image as ImageIcon, X, Type, Hash } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { characterStyles, characterResolutions } from '@/data/characterData'
import { CharacterFormProps } from '@/types/character'
import Image from 'next/image'
import PromptLibraryModal from '../ai-common/PromptLibraryModal'
import MediaPickerModal from '@/components/feature/media-library/MediaPickerModal'
import { getResolvedImageUrl } from '@/utils/image'

export const CharacterForm: React.FC<CharacterFormProps> = ({
  name,
  setName,
  description,
  setDescription,
  prompt,
  setPrompt,
  negativePrompt,
  setNegativePrompt,
  style,
  setStyle,
  resolution,
  setResolution,
  tags,
  setTags,
  imagePreview,
  setImagePreview,
  setReferenceImageUrl,
  isGenerating,
  onGenerate,
}) => {
  const { t } = useTranslation()

  // Modal & Input States
  const [isPromptLibraryOpen, setIsPromptLibraryOpen] = useState(false)
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false)
  const [tagInput, setTagInput] = useState('')

  // Tag Helpers
  const tagList = tags ? tags.split(',').map((t) => t.trim()).filter(Boolean) : []

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      const newTag = tagInput.trim()
      if (newTag && !tagList.includes(newTag)) {
        const updatedTags = [...tagList, newTag].join(', ')
        setTags(updatedTags)
      }
      setTagInput('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    const updatedTags = tagList.filter((t) => t !== tagToRemove).join(', ')
    setTags(updatedTags)
  }

  return (
    <Card className="lg:col-span-1 dark:bg-white/3 bg-white">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          {t('generate_character', { defaultValue: 'Generate Character' })}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 pt-0!">
        {/* Character Name */}
        <div className="space-y-2 flex flex-col">
          <Label className="text-sm font-bold">{t('character_name', { defaultValue: 'Character Name' })} *</Label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t('character_name_placeholder', { defaultValue: 'e.g., Warrior Hero' })}
            className="h-10 dark:bg-white/3"
          />
        </div>

        {/* Description */}
        <div className="space-y-2 flex flex-col">
          <Label className="text-sm font-bold">{t('description')}</Label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={t('character_description_placeholder', { defaultValue: 'Brief description of the character...' })}
            className="min-h-[60px] dark:bg-white/3"
          />
        </div>

        {/* Prompt */}
        <div className="space-y-2 flex flex-col">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-bold flex items-center gap-2">
              <AlignLeft className="w-4 h-4" />
              {t('prompt')} *
            </Label>
            <Button
              type="button"
              onClick={() => setIsPromptLibraryOpen(true)}
              variant="ghost"
              size="sm"
              className="h-8! gap-1.5 text-xs text-primary bg-primary/10 hover:bg-primary/20"
            >
              <Sparkles className="w-3.5 h-3.5" />
              {t('prompt_library', 'Prompt Library')}
            </Button>
          </div>
          <Textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={t('character_prompt_placeholder', { defaultValue: 'A brave warrior with sword and shield, wearing armor...' })}
            className="min-h-[100px] dark:bg-white/3"
          />
        </div>

        {/* Negative Prompt */}
        <div className="space-y-2 flex flex-col">
          <Label className="text-sm font-bold">{t('negative_prompt', { defaultValue: 'Negative Prompt' })}</Label>
          <Textarea
            value={negativePrompt}
            onChange={(e) => setNegativePrompt(e.target.value)}
            placeholder={t('negative_prompt_placeholder', { defaultValue: 'e.g., shaky, distorted, low quality' })}
            className="min-h-[60px] dark:bg-white/3"
          />
        </div>

        {/* Reference Image */}
        <div className="space-y-2 flex flex-col">
          <Label className="text-sm font-bold flex items-center gap-2">
            <ImageIcon className="w-4 h-4" />
            {t('reference_image_optional', { defaultValue: 'Reference Image (Optional)' })}
          </Label>
          <div className="flex flex-col gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsMediaPickerOpen(true)}
              className="w-full h-10 border-dashed border-glass-border hover:border-primary/50 text-muted-foreground flex items-center justify-center gap-2 dark:bg-white/3 rounded-border-radius-inner"
            >
              <ImageIcon className="w-4 h-4" />
              {imagePreview ? t('change_image', 'Change Image') : t('choose_image_from_media', 'Choose Image from Media')}
            </Button>

            {imagePreview && (
              <div className="relative mt-2 rounded-border-radius-inner overflow-hidden border border-glass-border bg-slate-100 dark:bg-black/20 p-2 flex items-center justify-center">
                <div className="relative w-full aspect-video max-h-48 rounded-lg overflow-hidden">
                  <Image
                    src={getResolvedImageUrl(imagePreview)}
                    alt="Preview"
                    fill
                    unoptimized
                    className="object-contain"
                  />
                </div>
                <Button
                  onClick={() => {
                    setImagePreview('')
                    setReferenceImageUrl('')
                  }}
                  variant="destructive"
                  size="icon"
                  className="absolute top-4 right-4 h-7 w-7 rounded-full shadow-lg"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Style & Resolution */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2 flex flex-col">
            <Label className="text-sm font-bold flex items-center gap-1">
              <Type className="w-3 h-3" />
              {t('style')}
            </Label>
            <Select value={style} onValueChange={setStyle}>
              <SelectTrigger className="h-10 dark:bg-white/3">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {characterStyles.map((s) => (
                  <SelectItem key={s.value} value={s.value}>
                    {t(s.label, { defaultValue: s.defaultLabel })}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2 flex flex-col">
            <Label className="text-sm font-bold flex items-center gap-1">
              <Hash className="w-3 h-3" />
              {t('resolution')}
            </Label>
            <Select value={resolution} onValueChange={setResolution}>
              <SelectTrigger className="h-10 dark:bg-white/3">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {characterResolutions.map((r) => (
                  <SelectItem key={r.value} value={r.value}>
                    {t(r.label, { defaultValue: r.defaultLabel })}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Tags */}
        <div className="space-y-2 flex flex-col">
          <Label className="text-sm font-bold">{t('tags')}</Label>
          <div className="flex flex-wrap gap-2 p-2 min-h-10 dark:bg-white/3 border border-glass-border rounded-border-radius-inner ">
            {tagList.map((tag) => (
              <span
                key={tag}
                className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="hover:text-destructive transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
            <input
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={tagList.length === 0 ? t('character_tags_placeholder', { defaultValue: 'game, warrior, fantasy...' }) : ''}
              className="flex-1 bg-transparent border-0 outline-hidden text-sm p-0 focus:ring-0 min-w-[120px] placeholder:text-muted-foreground"
            />
          </div>
          <p className="text-xs text-muted-foreground">{t('press_enter_to_add_tag', 'Press Enter to add tag')}</p>
        </div>

        {/* Generate Button */}
        <Button
          onClick={onGenerate}
          disabled={isGenerating || !name.trim() || !prompt.trim()}
          className="w-full h-11 primary-btn text-white!"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              {t('generating_dots')}
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              {t('generate_character', { defaultValue: 'Generate Character' })}
            </>
          )}
        </Button>
      </CardContent>

      {/* Modals */}
      <PromptLibraryModal
        isOpen={isPromptLibraryOpen}
        onClose={() => setIsPromptLibraryOpen(false)}
        onSelect={(p) => setPrompt(p)}
        mode="text_to_image"
      />

      <MediaPickerModal
        isOpen={isMediaPickerOpen}
        onClose={() => setIsMediaPickerOpen(false)}
        onSelect={(attachment) => {
          const selected = Array.isArray(attachment) ? attachment[0] : attachment
          if (selected) {
            const url = selected.file_path || selected.url || ''
            setImagePreview(url)
            setReferenceImageUrl(url)
          }
          setIsMediaPickerOpen(false)
        }}
        type="image"
      />
    </Card>
  )
}
