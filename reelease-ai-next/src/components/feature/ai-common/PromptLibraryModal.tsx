import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import Input from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'
import { useGetPromptsQuery } from '@/redux/api/aiPromptApi'
import { useGetTemplatesQuery } from '@/redux/api/aiTemplateApi'
import { PromptLibraryModalProps } from '@/types/components/ai-prompts'
import { getMediaUrl } from '@/utils'
import { Loader2, Search, Sparkles, Tag, Play, Film, Image as ImageIcon } from 'lucide-react'
import Image from 'next/image'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

export default function PromptLibraryModal({ isOpen, onClose, onSelect, mode }: PromptLibraryModalProps) {
  const { t } = useTranslation()
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [page, setPage] = useState(1)
  const [activeTab, setActiveTab] = useState('prompts')
  const limit = 20
  const observer = useRef<IntersectionObserver | null>(null)

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery)
      setPage(1)
    }, 500)
    return () => clearTimeout(timer)
  }, [searchQuery])

  const [prompts, setPrompts] = useState<any[]>([])
  const [templates, setTemplates] = useState<any[]>([])
  const [hasMore, setHasMore] = useState(false)

  // Data fetching logic
  const isPromptMode = ['text_to_image', 'image_to_image', 'text_to_video', 'image_to_video', 'video_motion'].includes(mode)
  const isTemplateMode = ['image_to_image', 'image_to_video', 'video_motion'].includes(mode)

  const {
    data: promptsData,
    isLoading: isLoadingPrompts,
    isFetching: isFetchingPrompts,
  } = useGetPromptsQuery({ page, limit, search: debouncedSearch }, { skip: !isPromptMode || !isOpen })

  const {
    data: templatesData,
    isLoading: isLoadingTemplates
  } = useGetTemplatesQuery({ status: true, search: debouncedSearch }, { skip: !isTemplateMode || !isOpen })

  // Handle data population and persistence
  useEffect(() => {
    if (isOpen && promptsData && isPromptMode) {
      const newPrompts = promptsData.prompts || []
      if (page === 1) {
        setPrompts(newPrompts)
      } else {
        setPrompts((prev) => {
          const ids = new Set(prev.map((p) => p._id || p.id))
          return [...prev, ...newPrompts.filter((p: any) => !ids.has(p._id || p.id))]
        })
      }
      setHasMore(promptsData.currentPage < promptsData.totalPages)
    }
  }, [promptsData, isPromptMode, page, isOpen])

  useEffect(() => {
    if (isOpen && templatesData && isTemplateMode) {
      const raw = Array.isArray(templatesData) ? templatesData : templatesData?.templates || []
      let filtered = raw

      if (mode === 'image_to_image' || mode === 'image_to_video') {
        filtered = raw.filter((t: any) => t.type === 'image')
      } else if (mode === 'video_motion') {
        // As requested: "in video motion display all the types of ai templates"
        // This removes the previous restrictive text-based "motion" filter
        filtered = raw
      }

      setTemplates(filtered)
    }
  }, [templatesData, isTemplateMode, mode, isOpen])

  // Reset page but keep data if already fetched unless mode changes
  useEffect(() => {
    if (isOpen) {
      setPage(1)
    }
  }, [isOpen, mode, debouncedSearch])

  const lastElementRef = useCallback(
    (node: HTMLDivElement) => {
      if (isLoadingPrompts || isFetchingPrompts) return
      if (observer.current) observer.current.disconnect()
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore && activeTab === 'prompts') {
          setPage((prev: number) => prev + 1)
        }
      })
      if (node) observer.current.observe(node)
    },
    [isLoadingPrompts, isFetchingPrompts, hasMore, activeTab],
  )

  const handleSelect = (item: any) => {
    onSelect(item.prompt, item)
    onClose()
  }

  const renderCard = (item: any, type: 'prompt' | 'template') => {
    const filePath = item.file_path || item.attachment_id?.file_path
    const isVideo = filePath?.endsWith('.mp4') || filePath?.endsWith('.webm')

    return (
      <div
        key={item._id || item.id}
        onClick={() => handleSelect(item)}
        className="group relative bg-black/3 dark:bg-white/3  border border-glass-border dark:border-white/5 hover:border-primary/30 rounded-[20px]! cursor-pointer transition-all flex flex-col overflow-hidden"
      >
        {/* Media Preview for Templates */}
        {type === 'template' && filePath && (
          <div className="relative aspect-video w-full overflow-hidden bg-black/40 border-b border-white/5">
            {isVideo ? (
              <video
                src={getMediaUrl(filePath)}
                className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity"
                muted
                loop
                autoPlay
                playsInline
              />
            ) : (
              <Image
                src={getMediaUrl(filePath)}
                alt={item.title}
                width={300}
                height={200}
                unoptimized
                className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
            <div className="absolute bottom-3 left-3 bg-primary/20 backdrop-blur-md px-2 py-0.5 rounded text-[10px] font-bold text-primary uppercase border border-primary/20 shadow-lg">
              {isVideo ? <Film className="w-3 h-3 inline me-1" /> : <ImageIcon className="w-3 h-3 inline me-1" />}
              {t(isVideo ? 'motion_preset' : 'style_preset', { defaultValue: isVideo ? 'Motion' : 'Style' })}
            </div>
          </div>
        )}

        <div className="p-4 space-y-3 flex-1 flex flex-col">
          <div className="flex items-center justify-between rtl:flex-row-reverse">
            <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-white/5 border border-glass-border">
              <Tag className="w-3 h-3 text-slate-500 dark:text-white/40" />
              <span className="text-3xs font-bold text-title-color uppercase tracking-normal">
                {item.category || item.category_id?.name || 'Neural_Preset'}
              </span>
            </div>
            {!filePath && <Sparkles className="w-4 h-4 text-subtitle-color/60 group-hover:text-primary transition-colors" />}
          </div>

          <div className="space-y-1.5 pt-1">
            {item.title && (
              <h4 className="font-bold text-title-color  text-base group-hover:text-primary transition-colors line-clamp-1 tracking-tight">
                {item.title}
              </h4>
            )}
            <p className="text-sm   text-left rtl:text-right text-subtitle-color/70  transition-colors line-clamp-3 leading-relaxed font-medium italic">
              "{item.prompt}"
            </p>
          </div>
        </div>

        <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/10 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      </div>
    )
  }

  const renderEmptyState = () => (
    <div className="flex flex-col items-center justify-center py-20 text-center gap-6">
      <div className="w-20 h-20 bg-slate-50 dark:bg-white/5 rounded-full flex items-center justify-center">
        <Sparkles className="w-10 h-10 text-slate-300 dark:text-white/10" />
      </div>
      <div className="space-y-2 px-4">
        <p className="text-xl font-bold text-slate-900 dark:text-white">
          {t('no_items_found', { defaultValue: 'No Results Found' })}
        </p>
        <p className="text-slate-500 dark:text-white/40 font-medium max-w-[300px] text-sm leading-relaxed">
          {t('no_results_desc', {
            defaultValue: "We couldn't find anything matching your current search criteria in the library.",
          })}
        </p>
      </div>
    </div>
  )

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-195! max-w-[calc(100%-1rem)]! rounded-[24px]! h-[90vh] sm:h-[85vh] gap-0 flex flex-col overflow-hidden bg-white dark:bg-light-body! border-glass-border dark:border-white/10 shadow-[0_0_80px_rgba(0,0,0,0.1)] dark:shadow-[0_0_80px_rgba(0,0,0,0.6)] p-6">
        <div className="pb-2 space-y-6">
          <div className="flex items-center justify-between rtl:flex-row-reverse">
            <DialogTitle className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
              <Sparkles className="w-6 h-6 text-primary fill-primary/10" />
              {t('prompt_library', { defaultValue: 'Neural Laboratory' })}
            </DialogTitle>
          </div>

          <div className="relative group">
            <Search className="absolute left-4 rtl:right-4 rtl:left-auto top-1/2 -translate-y-1/2 h-5 w-5 text-subtitle-color  group-focus-within:text-primary transition-all" />
            <Input
              placeholder={t('search_ai_assets', { defaultValue: 'Explore styles, motions, and artistic prompts...' })}
              className="w-full pl-12 rtl:pl-4 pr-4 rtl:pr-12 h-11 bg-slate-50 dark:bg-white/5 border-glass-border dark:border-white/10 rounded-[18px] focus:ring-primary/20 transition-all text-base text-slate-900 dark:text-white placeholder:text-subtitle-color dark:placeholder:text-white/20"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
          {isTemplateMode && (
            <div className="pt-4 pb-2">
              <TabsList className="h-auto p-0 gap-3">
                <TabsTrigger
                  value="prompts"
                  className={cn(
                    'text-xs px-5 py-2.5 rounded-full transition-all h-auto shrink-0 font-bold uppercase tracking-widest',
                    activeTab === 'prompts'
                      ? 'text-primary border border-primary bg-primary/5 dark:text-white! dark:border-primary! dark:bg-transparent!'
                      : 'text-slate-500 dark:text-white/40 hover:border-primary/40 hover:text-slate-900 dark:hover:text-white',
                  )}
                >
                  {t('ai_prompts', { defaultValue: 'AI Prompts' })}
                </TabsTrigger>
                <TabsTrigger
                  value="templates"
                  className={cn(
                    'text-xs px-5 py-2.5 rounded-full transition-all h-auto shrink-0 font-bold uppercase tracking-widest',
                    activeTab === 'templates'
                      ? 'text-primary border border-primary bg-primary/5 dark:text-white! dark:border-primary! dark:bg-transparent!'
                      : 'text-slate-500 dark:text-white/40 hover:border-primary/40 hover:text-slate-900 dark:hover:text-white',
                  )}
                >
                  {t('ai_templates', { defaultValue: 'AI Templates' })}
                </TabsTrigger>
              </TabsList>
            </div>
          )}

          <div className="flex-1 overflow-y-auto no-scrollbar pt-4">
            <TabsContent value="prompts" className="m-0 focus-visible:ring-0">
              {isLoadingPrompts && page === 1 ? (
                <div className="flex flex-col items-center justify-center py-24 gap-4">
                  <div className="relative">
                    <Loader2 className="w-12 h-12 text-primary animate-spin" />
                    <div className="absolute inset-0 blur-2xl bg-primary/20 animate-pulse" />
                  </div>
                  <p className="text-xs font-bold text-subtitle-color  uppercase tracking-[0.2em]">{t('syncing_prompts', { defaultValue: 'Accessing Neural Database' })}</p>
                </div>
              ) : prompts.length === 0 ? (
                renderEmptyState()
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {prompts.map((p) => renderCard(p, 'prompt'))}
                  <div ref={lastElementRef} className="col-span-full h-10 flex items-center justify-center">
                    {isFetchingPrompts && <Loader2 className="w-6 h-6 text-primary animate-spin" />}
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="templates" className="m-0 focus-visible:ring-0">
              {isLoadingTemplates ? (
                <div className="flex flex-col items-center justify-center py-24 gap-4">
                  <div className="relative">
                    <Loader2 className="w-12 h-12 text-primary animate-spin" />
                    <div className="absolute inset-0 blur-2xl bg-primary/20 animate-pulse" />
                  </div>
                  <p className="text-xs font-bold text-subtitle-color  uppercase tracking-[0.2em]">{t('syncing_templates', { defaultValue: 'Generating Visual Presets' })}</p>
                </div>
              ) : templates.length === 0 ? (
                renderEmptyState()
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {templates.map((t) => renderCard(t, 'template'))}
                </div>
              )}
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
