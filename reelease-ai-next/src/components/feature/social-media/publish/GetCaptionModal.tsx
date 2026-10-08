'use client'

import React, { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useTranslation } from 'react-i18next'
import { useGenerateCaptionMutation } from '@/redux/api/socialPublishApi'
import { useGetCaptionsQuery, useCreateCaptionMutation } from '@/redux/api/captionApi'
import { toast } from 'sonner'
import {
  Loader2,
  Sparkles,
  Copy,
  Check,
  FileText,
  BookmarkPlus,
  Image as ImageIcon,
  Languages,
  Hash,
  Type,
  AlignLeft,
} from 'lucide-react'
import Input from '@/components/ui/input'
import Label from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textArea'
import { GetCaptionModalProps } from '@/types/socialMedia'
import { copyToClipboard } from '@/utils/clipboard'

export const GetCaptionModal = ({ isOpen, onClose, onSelect, platform = 'instagram' }: GetCaptionModalProps) => {
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState('generate')
  const [generatedCaptions, setGeneratedCaptions] = useState<string[]>([])
  const [copiedIndex, setCopiedIndex] = useState<string | number | null>(null)
  const [savingIndex, setSavingIndex] = useState<number | null>(null)
  const [generateCaption, { isLoading }] = useGenerateCaptionMutation()
  const [createCaption] = useCreateCaptionMutation()

  // Form states
  const [contentType, setContentType] = useState('post')
  const [tone, setTone] = useState('engaging and professional')
  const [language, setLanguage] = useState('English')
  const [characterLimit, setCharacterLimit] = useState(2200)
  const [keywords, setKeywords] = useState('')
  const [customPrompt, setCustomPrompt] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [imagePreview, setImagePreview] = useState<string>('')

  const { data: storedCaptionsData, isLoading: isLoadingStored } = useGetCaptionsQuery({ limit: 50 })
  const storedCaptions = storedCaptionsData?.captions || []

  const handleGenerate = async () => {
    try {
      const res = await generateCaption({
        platform,
        content_type: contentType,
        tone,
        language,
        character_limit: characterLimit,
        keywords,
        custom_prompt: customPrompt,
        image_url: imageUrl || undefined,
        num_captions: 3,
      }).unwrap()

      const captions = res.data?.captions || []
      if (captions.length > 0) {
        setGeneratedCaptions(captions)
        toast.success(`Generated ${captions.length} captions!`)
      }
    } catch (error: any) {
      toast.error(error.data?.message || t('failed_to_generate_caption'))
    }
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // For now, we'll use a placeholder URL. In production, you'd upload to your server
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
        // Store as data URL for now (or upload to server)
        setImageUrl(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleCopy = (text: string, index: string | number) => {
    copyToClipboard(text)
    setCopiedIndex(index)
    setTimeout(() => setCopiedIndex(null), 2000)
    toast.success(t('copied_to_clipboard', { defaultValue: 'Copied to clipboard' }))
  }

  const handleSaveToCollection = async (text: string, index: number) => {
    setSavingIndex(index)
    try {
      await createCaption({
        name: `${platform.charAt(0).toUpperCase() + platform.slice(1)} Caption — ${new Date().toLocaleDateString()}`,
        source: 'ai',
        status: 'active',
        content: text,
        tags: platform,
        notes: `Auto-saved from AI Caption Generator for ${platform}`,
      }).unwrap()
      toast.success(t('caption_saved_to_collection', { defaultValue: 'Caption saved to your collection!' }))
    } catch (error: any) {
      toast.error(error.data?.message || t('failed_to_save_caption'))
    } finally {
      setSavingIndex(null)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl! max-w-[calc(100%-2rem)]! rounded-border-radius! dark:bg-light-body! border-glass-border overflow-hidden p-0">
        <DialogHeader className=" pb-3 border-b border-glass-border">
          <DialogTitle className="text-lg font-bold flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary font-black" />
            {t('ai_caption_generator', { defaultValue: 'AI Caption Generator' })}
          </DialogTitle>
        </DialogHeader>

        <div className=" py-5 space-y-6 max-h-[60vh] overflow-y-auto no-scrollbar">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full dark:bg-white/3 bg-black/3 grid grid-cols-2 mb-6">
              <TabsTrigger
                value="generate"
                className={activeTab === 'generate' ? 'primary-btn text-white! text-base font-light! gap-0' : ''}
              >
                {t('generate_new', { defaultValue: 'Generate New' })}
              </TabsTrigger>
              <TabsTrigger
                value="saved"
                className={`flex rtl:flex-row-reverse items-center gap-2 ${activeTab === 'saved' ? 'primary-btn text-white! text-base font-light! gap-0' : ''}`}
              >
                <FileText className="w-4 h-4" />
                {t('saved_captions', { defaultValue: 'Saved Captions' })}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="generate" className="space-y-6">
              {/* Image Upload Section */}
              <div className="space-y-3">
                <Label className="text-sm font-medium flex items-center gap-2 rtl:flex-row-reverse">
                  <ImageIcon className="w-4 h-4 text-primary " />
                  Upload Image (Optional)
                </Label>
                <div className="flex sm:items-center sm:flex-row flex-col rtl:flex-row-reverse  gap-4">
                  <div className="flex-1 ">
                    <Input type="file" accept="image/*" onChange={handleImageUpload} className="h-10 dark:bg-white/3" />
                    <p className="text-xs text-muted-foreground mt-1 text-left rtl:text-right">
                      Upload an image and AI will generate captions based on it
                    </p>
                  </div>
                  {imagePreview && (
                    <div className="relative sm:w-20 mh-20 rounded-lg overflow-hidden border">
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
              </div>

              {/* Custom Prompt */}
              <div className="space-y-2">
                <Label
                  htmlFor="customPrompt"
                  className="text-sm font-medium flex items-center gap-2 rtl:flex-row-reverse"
                >
                  <AlignLeft className="w-4 h-4 text-primary" />
                  Custom Instructions (Optional)
                </Label>
                <Textarea
                  id="customPrompt"
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  placeholder="E.g., Mention our new product launch, focus on sustainability, include a call-to-action..."
                  className="min-h-[80px] dark:bg-white/3 resize-none"
                />
              </div>

              {/* Settings Grid */}
              <div className="grid grid-cols-2 gap-4">
                {/* Content Type */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium flex items-center gap-2">
                    <Type className="w-4 h-4 text-primary" />
                    Content Type
                  </Label>
                  <Select value={contentType} onValueChange={setContentType}>
                    <SelectTrigger className="h-10 dark:bg-white/3">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white! dark:bg-light-body!">
                      <SelectItem value="post">Post</SelectItem>
                      <SelectItem value="story">Story</SelectItem>
                      <SelectItem value="reel">Reel</SelectItem>
                      <SelectItem value="video">Video</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Tone */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Tone</Label>
                  <Select value={tone} onValueChange={setTone}>
                    <SelectTrigger className="h-10 dark:bg-white/3">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white! dark:bg-light-body!">
                      <SelectItem value="engaging and professional">Professional</SelectItem>
                      <SelectItem value="fun and casual">Casual</SelectItem>
                      <SelectItem value="humorous">Humorous</SelectItem>
                      <SelectItem value="inspirational">Inspirational</SelectItem>
                      <SelectItem value="educational">Educational</SelectItem>
                      <SelectItem value="promotional">Promotional</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Language */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium flex items-center gap-2">
                    <Languages className="w-4 h-4 text-primary" />
                    Language
                  </Label>
                  <Select value={language} onValueChange={setLanguage}>
                    <SelectTrigger className="h-10 dark:bg-white/3">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white! dark:bg-light-body!">
                      <SelectItem value="English">English</SelectItem>
                      <SelectItem value="Spanish">Spanish</SelectItem>
                      <SelectItem value="French">French</SelectItem>
                      <SelectItem value="German">German</SelectItem>
                      <SelectItem value="Hindi">Hindi</SelectItem>
                      <SelectItem value="Arabic">Arabic</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Character Limit */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium flex items-center gap-2">
                    <Hash className="w-4 h-4 text-primary" />
                    Character Limit
                  </Label>
                  <Input
                    type="number"
                    value={characterLimit}
                    onChange={(e) => setCharacterLimit(parseInt(e.target.value) || 2200)}
                    className="h-10 dark:bg-white/3"
                  />
                </div>
              </div>

              {/* Keywords */}
              <div className="space-y-2">
                <Label htmlFor="keywords" className="text-sm mb-2 font-medium block">
                  Keywords/Topics
                </Label>
                <Input
                  id="keywords"
                  value={keywords}
                  onChange={(e) => setKeywords(e.target.value)}
                  placeholder="E.g., fitness, wellness, new product, summer sale..."
                  className="h-10 dark:bg-white/3"
                />
              </div>

              {/* Generate Button */}
              <Button
                onClick={handleGenerate}
                disabled={isLoading}
                className="w-full primary-btn text-white! font-bold gap-2 rounded-lg h-12"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Generating 3 Captions...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Generate 3 Captions
                  </>
                )}
              </Button>

              <div className="space-y-4">
                {generatedCaptions.length === 0 && !isLoading ? (
                  <div className="text-center py-10 text-muted-foreground bg-black/3 dark:bg-white/3 border-2 border-dashed rounded-border-radius">
                    <Sparkles className="w-10 h-10 mx-auto mb-3" />
                    <p>Configure your settings and click generate to create 3 caption options!</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-sm font-medium text-muted-foreground">
                      Generated {generatedCaptions.length} caption{generatedCaptions.length > 1 ? 's' : ''} - Choose
                      your favorite:
                    </p>
                    {generatedCaptions.map((cap, index) => (
                      <div
                        key={index}
                        className="group relative p-5 mb-6 rounded-xl border border-glass-border bg-white dark:bg-white/3  transition-all animate-in fade-in slide-in-from-top-2 duration-300"
                      >
                        {/* Caption Number Badge */}
                        <div className="absolute -top-3 left-4 px-3 py-1 bg-primary text-white text-xs font-bold rounded-full shadow-lg">
                          Option {index + 1}
                        </div>

                        {/* Caption Text */}
                        <p className="text-sm leading-relaxed pr-10 mt-6 line-clamp-4">
                          {cap}
                        </p>

                        {/* Action Buttons */}
                        <div className="absolute top-2 right-2 flex gap-2">
                          <Button
                            onClick={() => handleCopy(cap, `gen-${index}`)}
                            className="p-2! w-7.5 rounded-lg bg-black/3 dark:bg-white/3 hover:bg-primary/20! text-subtitle-color/70 hover:text-primary transition-all"
                            title="Copy to clipboard"
                          >
                            {copiedIndex === `gen-${index}` ? (
                              <Check className="w-4 h-4 text-green-500" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </Button>
                          <Button
                            onClick={() => handleSaveToCollection(cap, index)}
                            disabled={savingIndex === index}
                            className="p-2! w-7.5 rounded-lg bg-muted/60 dark:bg-white/3 hover:bg-amber-500/20 text-subtitle-color/70 hover:text-amber-600 dark:hover:text-amber-400 transition-all"
                            title="Save to Collection"
                          >
                            {savingIndex === index ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <BookmarkPlus className="w-4 h-4" />
                            )}
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => {
                              onSelect(cap)
                              onClose()
                            }}
                            className="h-6! px-4 text-xs font-bold bg-primary! text-white hover:bg-primary/90! rounded-md  transition-all"
                          >
                            {t('use_this', { defaultValue: 'Use' })}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {isLoading && (
                  <div className="p-4 rounded-xl border border-dashed border-primary/30 bg-primary/5 flex items-center justify-center py-8">
                    <div className="flex flex-col items-center gap-2">
                      <Loader2 className="w-6 h-6 animate-spin text-primary" />
                      <span className="text-xs text-primary font-medium animate-pulse">
                        {t('crafting_caption', { defaultValue: 'Crafting your caption...' })}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="saved" className="space-y-4">
              {isLoadingStored ? (
                <div className="p-4 rounded-xl border border-dashed border-primary/30 bg-primary/5 flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
              ) : storedCaptions.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground">
                  <FileText className="w-10 h-10 mx-auto mb-3 opacity-20" />
                  <p>{t('no_saved_captions', { defaultValue: 'You have no saved captions.' })}</p>
                </div>
              ) : (
                storedCaptions.map((cap: any) => (
                  <div
                    key={cap._id || cap.id}
                    className="group relative p-4 rounded-xl border border-glass-border bg-white dark:bg-white/3 hover:bg-muted/50 dark:hover:bg-white/5 transition-all animate-in fade-in slide-in-from-top-2 duration-300"
                  >
                    <div className="flex justify-between items-start mb-2 pr-10">
                      <span className="text-xs font-bold text-primary px-2 py-1 bg-primary/10 rounded-md">
                        {cap.name || 'Untitled'}
                      </span>
                      {cap.tags && cap.tags.length > 0 && (
                        <div className="flex gap-1 flex-wrap justify-end">
                          {cap.tags.map((tag: string, i: number) => (
                            <span
                              key={i}
                              className="text-[9px] text-muted-foreground bg-muted/60 dark:bg-white/5 px-1.5 py-0.5 rounded"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap pr-10">{cap.content}</p>
                    <div className="absolute top-4 right-4 flex flex-col gap-2">
                      <Button
                        onClick={() => handleCopy(cap.content, cap._id || cap.id)}
                        className="p-2! h-[unset]! rounded-lg bg-muted/60 dark:bg-white/5 hover:bg-muted dark:hover:bg-white/10 text-muted-foreground hover:text-title-color transition-all"
                        title={t('copy')}
                      >
                        {copiedIndex === (cap._id || cap.id) ? (
                          <Check className="w-4 h-4 text-green-500" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          onSelect(cap.content)
                          onClose()
                        }}
                        className="h-6! px-2! py-2! text-[10px] font-bold bg-primary/10! text-primary hover:bg-primary/20! rounded-md"
                      >
                        {t('use_this', { defaultValue: 'Use' })}
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </TabsContent>
          </Tabs>
        </div>

        <DialogFooter className="  dark:bg-[unset]  border-t dark:border-white/5 border-black/5 pt-3">
          <Button
            variant="ghost"
            onClick={onClose}
            className="rounded-[18px] hover:bg-destructive! bg-black/3 border border-black/3 hover:text-white dark:bg-white/3 ml-auto h-10"
          >
            {t('cancel')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
