'use client'

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import Input from '@/components/ui/input'
import Label from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textArea'
import { cn } from '@/lib/utils'
import { useCreateCaptionMutation, useUpdateCaptionMutation } from '@/redux/api/captionApi'
import { useGenerateCaptionMutation } from '@/redux/api/socialPublishApi'
import { Caption } from '@/types'
import { CaptionModalProps } from '@/types/socialMedia'
import {
  AlignLeft,
  CheckCircle2,
  ChevronDown,
  FileText,
  Hash,
  Image as ImageIcon,
  Info,
  Languages,
  Loader2,
  Tag,
  Wand2,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

const selectTriggerClass =
  'h-12 w-full rounded-xl border border-glass-border bg-white dark:bg-white/3 px-3 text-sm font-medium text-foreground shadow-none '

const selectContentClass =
  'z-[200] min-w-[var(--radix-select-trigger-width)] rounded-xl border border-glass-border bg-popover text-popover-foreground shadow-lg'



export const CaptionModal = ({ isOpen, onClose, caption }: CaptionModalProps) => {
  const { t } = useTranslation()
  const [formData, setFormData] = useState({
    name: '',
    source: 'manual',
    status: 'active',
    content: '',
    tags: '',
    notes: '',
  })

  const [showAiSettings, setShowAiSettings] = useState(false)
  const [aiSettings, setAiSettings] = useState({
    platform: 'instagram',
    content_type: 'post',
    tone: 'engaging and professional',
    language: 'English',
    character_limit: 2200,
    keywords: '',
    custom_prompt: '',
    image_url: '',
    image_preview: '',
  })

  const [createCaption, { isLoading: isCreating }] = useCreateCaptionMutation()
  const [updateCaption, { isLoading: isUpdating }] = useUpdateCaptionMutation()
  const [generateCaption, { isLoading: isGenerating }] = useGenerateCaptionMutation()

  const isAiSource = formData.source === 'ai'

  const handleGenerateCaption = async () => {
    try {
      const res = await generateCaption({
        platform: aiSettings.platform,
        content_type: aiSettings.content_type,
        tone: aiSettings.tone,
        language: aiSettings.language,
        character_limit: aiSettings.character_limit,
        keywords: aiSettings.keywords,
        custom_prompt: aiSettings.custom_prompt,
        image_url: aiSettings.image_url || undefined,
        num_captions: 3,
      }).unwrap()

      const captions = res.data?.captions || []
      if (captions.length > 0) {
        setFormData((prev) => ({ ...prev, content: captions[0] }))
        toast.success(`Generated ${captions.length} captions! Using the first one. Check the publish page for all options.`)
      }
    } catch (error: any) {
      toast.error(error.data?.message || t('failed_to_generate_caption'))
    }
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setAiSettings((prev) => ({
          ...prev,
          image_preview: reader.result as string,
          image_url: reader.result as string,
        }))
      }
      reader.readAsDataURL(file)
    }
  }

  useEffect(() => {
    if (!isOpen) {
      setShowAiSettings(false)
      return
    }
    if (caption) {
      setFormData({
        name: caption.name,
        source: caption.source,
        status: caption.status,
        content: caption.content,
        tags: caption.tags.join(', '),
        notes: caption.notes || '',
      })
    } else {
      setFormData({
        name: '',
        source: 'manual',
        status: 'active',
        content: '',
        tags: '',
        notes: '',
      })
    }
  }, [caption, isOpen])

  useEffect(() => {
    if (!isAiSource) setShowAiSettings(false)
  }, [isAiSource])

  const handleSubmit = async () => {
    if (!formData.name.trim() || !formData.content.trim()) {
      toast.error(t('fill_required_fields'))
      return
    }

    try {
      if (caption) {
        await updateCaption({ id: caption.id || caption._id, ...formData }).unwrap()
        toast.success(t('caption_updated_successfully'))
      } else {
        await createCaption(formData).unwrap()
        toast.success(t('caption_created_successfully'))
      }
      onClose()
    } catch (error: any) {
      toast.error(error.data?.message || t('failed_to_save_caption'))
    }
  }

  const isLoading = isCreating || isUpdating

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-3xl! max-w-[calc(100%-2rem)]! rounded-border-radius! glass-card border-glass-border bg-white dark:bg-modal-bg-color overflow-hidden p-0 gap-0 animate-in fade-in zoom-in-95 duration-300">
        <DialogHeader className="pb-4 border-b border-glass-border shrink-0">
          <div className="flex items-center gap-3 pr-8 rtl:flex-row-reverse text-left rtl:text-right rtl:pr-0">
            <div className="p-2 rounded-xl bg-primary/10 text-primary shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <DialogTitle className="text-xl font-bold">
                {caption ? t('edit_caption') : t('create_caption')}
              </DialogTitle>
              <p className="text-sm text-muted-foreground mt-0.5">
                {t('caption_modal_desc', {
                  defaultValue: 'Craft and manage tailored captions to elevate your social media presence.',
                })}
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className="py-5 overflow-y-auto max-h-[min(70vh,600px)] no-scrollbar">
          <div className="flex flex-col  md:flex-row gap-6 md:items-start">
            <div className="flex-1 min-w-0 space-y-5">
              <div className="space-y-2">
                <Label className="text-xs font-bold text-title-color flex  items-center justify-start rtl:justify-end! gap-2">
                  {t('caption_name')}
                  <span className="text-primary">*</span>
                </Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder={t('caption_name_placeholder', { defaultValue: 'e.g., Summer Sale Announcement' })}
                  className="h-12 bg-white dark:bg-white/3 border-glass-border rounded-xl focus:ring-primary/20 transition-all placeholder:text-muted-foreground"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-title-color">{t('source')}</Label>
                  <Select
                    value={formData.source}
                    onValueChange={(val) => setFormData({ ...formData, source: val })}
                  >
                    <SelectTrigger className={selectTriggerClass}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className={selectContentClass} position="popper">
                      <SelectItem value="manual">{t('manual')}</SelectItem>
                      <SelectItem value="ai">{t('ai')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-title-color">{t('status')}</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(val) => setFormData({ ...formData, status: val })}
                  >
                    <SelectTrigger className={selectTriggerClass}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className={selectContentClass} position="popper">
                      <SelectItem value="active">{t('active')}</SelectItem>
                      <SelectItem value="inactive">{t('inactive')}</SelectItem>
                      <SelectItem value="draft">{t('draft')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {isAiSource && (
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowAiSettings(!showAiSettings)}
                    className="h-9 rounded-lg border-glass-border bg-white dark:bg-white/3 gap-2 text-xs font-semibold text-primary hover:bg-primary/5"
                  >
                    <AlignLeft className="w-3.5 h-3.5" />
                    {showAiSettings ? 'Hide' : 'Show'} Settings
                    <ChevronDown
                      className={cn('w-3.5 h-3.5 transition-transform', showAiSettings && 'rotate-180')}
                    />
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleGenerateCaption}
                    disabled={isGenerating}
                    className="h-9 rounded-lg border-glass-border bg-white dark:bg-white/3 gap-2 text-xs font-semibold text-primary hover:bg-primary/5"
                  >
                    {isGenerating ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Wand2 className="w-3.5 h-3.5" />
                    )}
                    {formData.content ? t('improve_with_ai') : t('generate_caption', { defaultValue: 'Generate Caption' })}
                  </Button>
                </div>
              )}

              {isAiSource && showAiSettings && (
                <div className="rounded-border-radius border border-glass-border bg-black/3 dark:bg-white/3 p-4 space-y-4 animate-in fade-in slide-in-from-top-1 duration-200">
                  <div className="space-y-2">
                    <Label className="text-xs font-medium flex items-center gap-2 text-title-color">
                      <ImageIcon className="w-3 h-3" />
                      Upload Image (Optional)
                    </Label>
                    <div className="flex items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="h-10 text-xs rounded-xl dark:bg-white/3 border-glass-border"
                        />
                      </div>
                      {aiSettings.image_preview && (
                        <div className="relative w-16 h-16 shrink-0 rounded-lg overflow-hidden border border-glass-border">
                          <img
                            src={aiSettings.image_preview}
                            alt="Preview"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-medium text-title-color">Custom Instructions</Label>
                    <Textarea
                      value={aiSettings.custom_prompt}
                      onChange={(e) => setAiSettings((prev) => ({ ...prev, custom_prompt: e.target.value }))}
                      placeholder="E.g., Mention our new product..."
                      className="min-h-[60px] text-xs rounded-xl border-glass-border bg-white dark:bg-white/3 resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label className="text-xs font-medium text-title-color">Content Type</Label>
                      <Select
                        value={aiSettings.content_type}
                        onValueChange={(val) => setAiSettings((prev) => ({ ...prev, content_type: val }))}
                      >
                        <SelectTrigger className="h-10 text-xs dark:bg-white/3 rounded-xl border-glass-border">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className={selectContentClass} position="popper">
                          <SelectItem value="post">Post</SelectItem>
                          <SelectItem value="story">Story</SelectItem>
                          <SelectItem value="reel">Reel</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs font-medium text-title-color">Tone</Label>
                      <Select
                        value={aiSettings.tone}
                        onValueChange={(val) => setAiSettings((prev) => ({ ...prev, tone: val }))}
                      >
                        <SelectTrigger className="h-10 text-xs dark:bg-white/3 rounded-xl border-glass-border">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className={selectContentClass} position="popper">
                          <SelectItem value="engaging and professional">Professional</SelectItem>
                          <SelectItem value="fun and casual">Casual</SelectItem>
                          <SelectItem value="humorous">Humorous</SelectItem>
                          <SelectItem value="inspirational">Inspirational</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs font-medium flex items-center gap-1">
                        <Languages className="w-3 h-3" />
                        Language
                      </Label>
                      <Select
                        value={aiSettings.language}
                        onValueChange={(val) => setAiSettings((prev) => ({ ...prev, language: val }))}
                      >
                        <SelectTrigger className="h-10 text-xs dark:bg-white/3 rounded-xl border-glass-border">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className={selectContentClass} position="popper">
                          <SelectItem value="English">English</SelectItem>
                          <SelectItem value="Spanish">Spanish</SelectItem>
                          <SelectItem value="Hindi">Hindi</SelectItem>
                          <SelectItem value="Arabic">Arabic</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs font-medium flex items-center gap-1">
                        <Hash className="w-3 h-3" />
                        Char Limit
                      </Label>
                      <Input
                        type="number"
                        value={aiSettings.character_limit}
                        onChange={(e) =>
                          setAiSettings((prev) => ({
                            ...prev,
                            character_limit: parseInt(e.target.value, 10) || 2200,
                          }))
                        }
                        className="h-10 text-xs dark:bg-white/3 rounded-xl border-glass-border"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-medium">Keywords</Label>
                    <Input
                      value={aiSettings.keywords}
                      onChange={(e) => setAiSettings((prev) => ({ ...prev, keywords: e.target.value }))}
                      placeholder="fitness, wellness, summer..."
                      className="h-10 text-xs dark:bg-white/3 rounded-xl border-glass-border"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label className="text-xs font-bold text-title-color flex items-center gap-2 justify-start rtl:justify-end! ">
                  {t('caption_body')}
                  <span className="text-primary">*</span>
                </Label>
                <Textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder={t('write_or_paste_caption_body', {
                    defaultValue: 'Draft your captivating message here...',
                  })}
                  className="min-h-40 bg-white dark:bg-white/3 text-left rtl:text-right border-glass-border rounded-border-radius focus:ring-primary/20 p-4 transition-all placeholder:text-muted-foreground resize-none"
                />
              </div>
            </div>

            <aside className="w-full md:w-64 shrink-0 space-y-5 rounded-border-radius border border-glass-border bg-black/3 dark:bg-white/3 sm:p-5 p-4 h-fit md:sticky md:top-0">
              <div className="space-y-3">
                <Label className="text-xs font-bold text-title-color flex items-center justify-start rtl:justify-end! gap-2">
                  <Tag className="w-3.5 h-3.5" />
                  {t('tags')}
                </Label>
                <Input
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  placeholder={t('tags_placeholder', { defaultValue: 'campaign, promotion, engaging' })}
                  className="h-10 bg-white dark:bg-white/3 border-glass-border rounded-lg text-sm focus:ring-primary/20 placeholder:text-muted-foreground"
                />
                <p className="text-xs text-muted-foreground rtl:text-right text-left">{t('comma_separated')}</p>
              </div>

              <div className="space-y-3">
                <Label className="text-xs font-bold text-title-color flex items-center gap-2 justify-start rtl:justify-end!">
                  <Info className="w-3.5 h-3.5" />
                  {t('internal_notes')}
                </Label>
                <Textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder={t('internal_notes_placeholder', {
                    defaultValue: 'Add any team notes or specific instructions here...',
                  })}
                  className="min-h-45 bg-white dark:bg-white/3 border-glass-border rtl:text-right text-left rounded-lg text-sm focus:ring-primary/20 p-3 placeholder:text-muted-foreground resize-none"
                />
              </div>
            </aside>
          </div>
        </div>

        <DialogFooter className="px-6 pt-4 border-t border-glass-border flex flex-col-reverse sm:flex-row sm:justify-end gap-3 shrink-0">
          <Button
            variant="ghost"
            onClick={onClose}
            className="rounded-full bg-white dark:bg-white/3 h-11 px-6 border border-glass-border hover:bg-muted w-full sm:w-auto"
          >
            {t('cancel')}
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isLoading}
            className=" h-11 px-8 primary-btn text-white! font-bold transition-all w-full sm:w-auto"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
            {caption ? t('edit_caption') : t('create_caption')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
