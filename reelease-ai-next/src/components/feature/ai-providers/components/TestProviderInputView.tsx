import { Button } from '@/components/ui/button'
import Input from '@/components/ui/input'
import Label from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textArea'
import { ServiceType, TestProviderInputViewProps } from '@/types'
import { getMediaUrl } from '@/utils'
import { motion } from 'framer-motion'
import { Clock, Image as ImageIcon, Key, Music, Plus, Settings2, Type, Video, X } from 'lucide-react'
import Image from 'next/image'
import { useTranslation } from 'react-i18next'

export const SERVICE_OPTIONS: { value: ServiceType; label: string }[] = [
  { value: 'text_to_image', label: 'Text to Image' },
  { value: 'image_to_image', label: 'Image to Image' },
  { value: 'video_motion', label: 'Video Motion' },
  { value: 'images_to_video', label: 'Images to Video' },
  { value: 'text_to_video', label: 'Text to Video' },
]

export const ASPECT_RATIOS = ['1:1', '16:9', '9:16']
export const RESOLUTIONS = ['1K', '2K']

export const TestProviderInputView = ({
  serviceType,
  setServiceType,
  aspectRatio,
  setAspectRatio,
  resolution,
  setResolution,
  referenceImages,
  setReferenceImages,
  referenceVideo,
  setReferenceVideo,
  duration,
  setDuration,
  mode,
  setMode,
  sound,
  setSound,
  prompt,
  setPrompt,
  apiKey,
  setApiKey,
  setMediaPickerTarget,
  setMediaPickerTargetIndex,
  setIsMediaPickerOpen,
}: TestProviderInputViewProps) => {
  const { t } = useTranslation()
  const isVideoService = serviceType.includes('video') || serviceType === 'video_motion'
  const needsMedia = ['image_to_image', 'images_to_video', 'video_motion'].includes(serviceType)

  return (
    <motion.div
      key="input"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="group relative p-4 rounded-border-radius bg-white/3 border border-glass-border hover:border-primary/40 transition-all duration-300">
          <Label className="text-sm font-bold text-muted-foreground block mb-2">
            {t('service', 'Service')}
          </Label>
          <Select value={serviceType} onValueChange={(v) => setServiceType(v as ServiceType)}>
            <SelectTrigger className="h-9 border-none bg-transparent p-0 focus:ring-0 shadow-none font-bold text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="rounded-2xl border-glass-border backdrop-blur-xl bg-background/95">
              {SERVICE_OPTIONS.map((opt) => (
                <SelectItem
                  key={opt.value}
                  value={opt.value}
                  className="rounded-xl mx-1 my-0.5 focus:bg-primary/10"
                >
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="group relative p-4 rounded-border-radius bg-white/3 border border-glass-border hover:border-primary/40 transition-all duration-300">
          <Label className="text-sm font-bold text-muted-foreground block mb-2">
            {t('aspect_ratio', 'Ratio')}
          </Label>
          <Select value={aspectRatio} onValueChange={setAspectRatio}>
            <SelectTrigger className="h-9 border-none bg-transparent p-0 focus:ring-0 shadow-none font-bold text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="rounded-2xl border-glass-border backdrop-blur-xl bg-background/95">
              {ASPECT_RATIOS.map((r) => (
                <SelectItem key={r} value={r} className="rounded-xl mx-1 my-0.5 focus:bg-primary/10">
                  {r}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="group relative p-4 rounded-border-radius bg-white/3 border border-glass-border hover:border-primary/40 transition-all duration-300">
          <Label className="text-sm font-bold text-muted-foreground block mb-2">
            {t('quality', 'Quality')}
          </Label>
          <Select value={resolution} onValueChange={setResolution}>
            <SelectTrigger className="h-9 border-none bg-transparent p-0 focus:ring-0 shadow-none font-bold text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="rounded-2xl border-glass-border backdrop-blur-xl bg-background/95">
              {RESOLUTIONS.map((res) => (
                <SelectItem key={res} value={res} className="rounded-xl mx-1 my-0.5 focus:bg-primary/10">
                  {res}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-4">
        {/* Media Selection Row */}
        {needsMedia && (
          <div className="space-y-4">
            {/* Image-to-Image Multi Image Grid */}
            {serviceType === 'image_to_image' && (
              <div className="space-y-3">
                <Label className="text-sm font-bold text-muted-foreground block ml-1">
                  {t('reference_images', 'Reference Images')} ({referenceImages.length}/8)
                </Label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {referenceImages.map((img, idx) => (
                    <div
                      key={idx}
                      className="relative group aspect-square rounded-xl overflow-hidden border-2 border-primary/30"
                    >
                      <Image
                        src={getMediaUrl(img.file_path)}
                        width={100}
                        height={100}
                        unoptimized
                        className="w-full h-full object-cover"
                        alt={`Ref ${idx}`}
                      />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                        <Button
                          size="icon"
                          variant="destructive"
                          onClick={() => setReferenceImages((prev) => prev.filter((_, i) => i !== idx))}
                          className="rounded-full w-8 h-8"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  {referenceImages.length < 8 && (
                    <Button
                      onClick={() => {
                        setMediaPickerTarget('image')
                        setMediaPickerTargetIndex(null)
                        setIsMediaPickerOpen(true)
                      }}
                      className="aspect-square rounded-border-radius border-2 border-dashed border-glass-border hover:border-primary/40 hover:bg-primary/5 transition-all flex flex-col items-center justify-center gap-1 group"
                    >
                      <Plus className="w-5 h-5 text-muted-foreground group-hover:text-primary" />
                      <span className="text-sm font-bold text-muted-foreground group-hover:text-primary">
                        {t('add', 'Add')}
                      </span>
                    </Button>
                  )}
                </div>
              </div>
            )}

            {/* Images-to-Video Start/End Slots */}
            {serviceType === 'images_to_video' && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-3">
                  <Label className="text-sm font-bold text-muted-foreground block ml-1">
                    {t('start_image', 'Start Image')}
                  </Label>
                  {referenceImages[0] ? (
                    <div className="relative group aspect-video rounded-border-radius overflow-hidden border-2 border-primary/30">
                      <Image
                        src={getMediaUrl(referenceImages[0].file_path)}
                        width={100}
                        height={100}
                        unoptimized
                        className="w-full h-full object-cover"
                        alt="Start"
                      />
                      <div className="absolute inset-0 bg-black/60 rounded-border-radius opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 backdrop-blur-sm">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => {
                            setMediaPickerTarget('image')
                            setMediaPickerTargetIndex(0)
                            setIsMediaPickerOpen(true)
                          }}
                          className="rounded-radius h-9"
                        >
                          <ImageIcon className="w-4 h-4 mr-2" /> {t('change', 'Change')}
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => setReferenceImages((prev) => prev.filter((_, i) => i !== 0))}
                          className="rounded-xl h-9"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Button
                      onClick={() => {
                        setMediaPickerTarget('image')
                        setMediaPickerTargetIndex(0)
                        setIsMediaPickerOpen(true)
                      }}
                      className="w-full aspect-video rounded-2xl border-2 border-dashed border-glass-border hover:border-primary/40 hover:bg-primary/5 transition-all flex flex-col items-center justify-center gap-3 group"
                    >
                      <ImageIcon className="w-6 h-6 text-muted-foreground group-hover:text-primary" />
                      <span className="text-xs font-bold text-muted-foreground group-hover:text-primary">
                        {t('select_start', 'Select Start')}
                      </span>
                    </Button>
                  )}
                </div>
                <div className="space-y-3">
                  <Label className="text-sm font-bold text-muted-foreground block ml-1">
                    {t('end_image', 'End Image')}
                  </Label>
                  {referenceImages[1] ? (
                    <div className="relative group aspect-video rounded-border-radius overflow-hidden border-2 border-purple-500/30">
                      <Image
                        src={getMediaUrl(referenceImages[1].file_path)}
                        width={100}
                        height={100}
                        unoptimized
                        className="w-full h-full object-cover"
                        alt="End"
                      />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 backdrop-blur-sm">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => {
                            setMediaPickerTarget('image')
                            setMediaPickerTargetIndex(1)
                            setIsMediaPickerOpen(true)
                          }}
                          className="rounded-radius h-9"
                        >
                          <ImageIcon className="w-4 h-4 mr-2" /> {t('change', 'Change')}
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => setReferenceImages((prev) => prev.filter((_, i) => i !== 1))}
                          className="rounded-xl h-9"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Button
                      onClick={() => {
                        setMediaPickerTarget('image')
                        setMediaPickerTargetIndex(1)
                        setIsMediaPickerOpen(true)
                      }}
                      className="w-full aspect-video rounded-2xl border-2 border-dashed border-glass-border hover:border-purple-500/40 hover:bg-purple-500/5 transition-all flex flex-col items-center justify-center gap-3 group"
                    >
                      <ImageIcon className="w-6 h-6 text-muted-foreground group-hover:text-purple-400" />
                      <span className="text-xs font-bold text-muted-foreground group-hover:text-purple-400">
                        {t('select_end', 'Select End')}
                      </span>
                    </Button>
                  )}
                </div>
              </div>
            )}

            {/* Video Motion (Single Image + Video) */}
            {serviceType === 'video_motion' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <Label className="text-sm font-bold text-muted-foreground block ml-1">
                    {t('reference_image', 'Reference Image')}
                  </Label>
                  {referenceImages[0] ? (
                    <div className="relative group aspect-video rounded-border-radius! overflow-hidden border-2 border-primary/30">
                      <Image
                        src={getMediaUrl(referenceImages[0].file_path)}
                        width={100}
                        height={100}
                        unoptimized
                        className="w-full h-full object-cover"
                        alt="Ref"
                      />
                      <div className="absolute inset-0 bg-black/60 rounded-border-radius! opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 backdrop-blur-sm">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => {
                            setMediaPickerTarget('image')
                            setMediaPickerTargetIndex(0)
                            setIsMediaPickerOpen(true)
                          }}
                          className="rounded-radius h-10 bg-primary!"
                        >
                          <ImageIcon className="w-4 h-4" /> {t('change', 'Change')}
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => setReferenceImages([])}
                          className="rounded-radius h-10"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Button
                      onClick={() => {
                        setMediaPickerTarget('image')
                        setMediaPickerTargetIndex(0)
                        setIsMediaPickerOpen(true)
                      }}
                      className="w-full aspect-video rounded-2xl border-2 border-dashed border-glass-border hover:border-primary/40 hover:bg-primary/5 transition-all flex flex-col items-center justify-center gap-3 group"
                    >
                      <ImageIcon className="w-6 h-6 text-muted-foreground group-hover:text-primary" />
                      <span className="text-xs font-bold text-muted-foreground group-hover:text-primary">
                        {t('select_image', 'Select Image')}
                      </span>
                    </Button>
                  )}
                </div>
                <div className="space-y-3">
                  <Label className="text-sm font-bold text-muted-foreground block ml-1">
                    {t('reference_video', 'Reference Video')}
                  </Label>
                  {referenceVideo ? (
                    <div className="relative group aspect-video rounded-2xl overflow-hidden border-2 border-purple-500/30">
                      <video
                        src={getMediaUrl(referenceVideo.file_path)}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 backdrop-blur-sm">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => {
                            setMediaPickerTarget('video')
                            setIsMediaPickerOpen(true)
                          }}
                          className="rounded-radius h-10 bg-primary!"
                        >
                          <Video className="w-4 h-4" /> {t('change', 'Change')}
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => setReferenceVideo(null)}
                          className="rounded-radius h-10"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Button
                      onClick={() => {
                        setMediaPickerTarget('video')
                        setIsMediaPickerOpen(true)
                      }}
                      className="w-full aspect-video rounded-2xl border-2 border-dashed border-glass-border hover:border-purple-500/40 hover:bg-purple-500/5 transition-all flex flex-col items-center justify-center gap-3 group"
                    >
                      <Video className="w-6 h-6 text-muted-foreground group-hover:text-purple-400" />
                      <span className="text-xs font-bold text-muted-foreground group-hover:text-purple-400">
                        {t('select_video', 'Select Video')}
                      </span>
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Video Settings Row */}
        {isVideoService && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-9">
            {/* Duration */}
            {serviceType !== 'video_motion' && (
              <div className="group relative p-4 rounded-2xl bg-muted/20 border border-glass-border hover:border-primary/40 transition-all duration-300">
                <Label className="text-sm font-bold text-muted-foreground mb-2 flex items-center gap-2">
                  <Clock className="w-3 h-3" /> {t('duration', 'Duration')}
                </Label>
                <Select value={duration.toString()} onValueChange={(v) => setDuration(parseInt(v))}>
                  <SelectTrigger className="h-9 border-none bg-transparent p-0 focus:ring-0 shadow-none font-bold text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-glass-border backdrop-blur-xl bg-background/95">
                    {[3, 5, 7, 10].map((d) => (
                      <SelectItem
                        key={d}
                        value={d.toString()}
                        className="rounded-xl mx-1 my-0.5 focus:bg-primary/10"
                      >
                        {d}s
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Mode */}
            <div className="group relative p-4 rounded-border-radius bg-white/3 border border-glass-border hover:border-primary/40 transition-all duration-300">
              <Label className="text-sm font-bold text-muted-foreground mb-2 flex items-center gap-2">
                <Settings2 className="w-5 h-5" /> {t('mode', 'Mode')}
              </Label>
              <Select value={mode} onValueChange={setMode}>
                <SelectTrigger className="h-9 border-none bg-transparent p-0 focus:ring-0 shadow-none font-bold text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-border-radius border-glass-border backdrop-blur-xl bg-background/95">
                  {['standard', 'pro', 'quality'].map((m) => (
                    <SelectItem
                      key={m}
                      value={m}
                      className="rounded-xl mx-1 my-0.5 focus:bg-primary/10 text-sm"
                    >
                      {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Sound */}
            <div className="group relative p-4 rounded-border-radius bg-white/3 border border-glass-border hover:border-primary/40 transition-all duration-300 flex flex-col justify-between">
              <Label className="text-sm font-bold text-muted-foreground  mb-2 flex items-center gap-2">
                <Music className="w-5 h-5" /> {t('sound', 'Sound')}
              </Label>
              <div className="flex items-center justify-between pb-1">
                <span className="text-xs font-bold text-muted-foreground">
                  {sound ? t('enabled', 'ON') : t('disabled', 'OFF')}
                </span>
                <Switch
                  checked={sound}
                  onCheckedChange={setSound}
                  className="data-[state=checked]:bg-primary"
                />
              </div>
            </div>
          </div>
        )}

        <div className="relative">
          <Label className="text-sm font-bold text-muted-foreground  block mb-3 ml-1">
            {t('creative_prompt', 'Creative Prompt')}
          </Label>
          <div className="relative group">
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="w-full min-h-25 bg-muted/10 border-2 border-glass-border rounded-border-radius p-5 text-base focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none transition-all resize-none shadow-inner"
              placeholder={t('enter_prompt', 'Imagine something extraordinary...')}
            />
            <div className="absolute bottom-4 right-4 opacity-40 group-focus-within:opacity-100 transition-opacity">
              <Type className="w-5 h-5 text-primary" />
            </div>
          </div>
        </div>

        <div className="relative group">
          <Label className="text-sm font-bold text-muted-foreground block mb-3 ml-1">
            {t('api_override', 'API Key Override (Optional)')}
          </Label>
          <div className="flex items-center gap-3 px-5 h-14 rounded-radius bg-white/3 border border-glass-border focus-within:border-primary transition-all shadow-inner">
            <Key className="w-5 h-5 text-muted-foreground/60" />
            <Input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder={t('leave_empty_for_default', 'Leave empty to use default config')}
              className="bg-transparent border-none outline-none flex-1 text-sm font-medium"
            />
          </div>
        </div>
      </div>
    </motion.div>
  )
}
