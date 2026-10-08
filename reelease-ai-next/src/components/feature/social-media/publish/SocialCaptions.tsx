'use client'

import { DeleteConfirmationModal } from '@/components/reusable/DeleteConfirmationModal'
import { PageHeader } from '@/components/reusable/PageHeader'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import Input from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { ROUTES } from '@/constants/routes'
import { useDebounce } from '@/hooks/useDebounce'
import { cn } from '@/lib/utils'
import { useDeleteCaptionMutation, useGetCaptionsQuery } from '@/redux/api/captionApi'
import { Caption } from '@/types'
import { Filter, LayoutGrid, List, Plus, RotateCcw, Search, Sparkles } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { CaptionCard } from './CaptionCard'
import { CaptionModal } from './CaptionModal'

export default function SocialCaptions() {
  const { t } = useTranslation()
  const router = useRouter()

  // States
  const [search, setSearch] = useState('')
  const [source, setSource] = useState('all')
  const [status, setStatus] = useState('all')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [editingCaption, setEditingCaption] = useState<Caption | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  // Queries
  const debouncedSearch = useDebounce(search, 500)
  const { data, isLoading, isFetching } = useGetCaptionsQuery({
    search: debouncedSearch,
    source,
    status
  })

  const [deleteCaption, { isLoading: isDeleting }] = useDeleteCaptionMutation()

  const handleDeleteClick = (id: string) => {
    setDeletingId(id)
    setIsDeleteModalOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!deletingId) return
    try {
      await deleteCaption(deletingId).unwrap()
      toast.success(t('caption_deleted_successfully'))
      setIsDeleteModalOpen(false)
      setDeletingId(null)
    } catch (error: any) {
      toast.error(error.data?.message || t('failed_to_delete_caption'))
    }
  }

  const handleEdit = (caption: Caption) => {
    setEditingCaption(caption)
    setIsModalOpen(true)
  }

  const resetFilters = () => {
    setSearch('')
    setSource('all')
    setStatus('all')
  }

  const captions = data?.captions || []

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <PageHeader
        icon={<Sparkles className="w-6 h-6 text-primary animate-pulse" />}
        title={t('captions_workspace')}
        subtitle={t('captions_workspace_desc', { defaultValue: 'Manage your captions' })}
        showBackButton={false}
        endContent={
          <div className="lg:justify-end  lg:items-end lg:w-auto w-full flex-wrap gap-3 flex">
            <Button
              onClick={() => router.push(ROUTES.SOCIAL_MEDIA.COMPOSER)}
              variant="ghost"
              className="rounded-full sm:w-auto w-full  px-6 border border-glass-border bg-black/3! dark:bg-white/3! font-bold  transition-all gap-2"
            >
              <Sparkles className="w-4 h-4 text-primary" />
              {t('open_ai_studio', { defaultValue: 'Open AI Studio' })}
            </Button>
            <Button
              onClick={() => {
                setEditingCaption(null)
                setIsModalOpen(true)
              }}
              className="rounded-full sm:w-auto w-full  px-8 primary-btn text-white! font-bold  transition-all gap-2"
            >
              {t('create_caption')}
              <Plus className="w-5 h-5" />
            </Button>
          </div>
        }
      />

      {/* Stats / Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'total_saved', value: data?.total || 0, icon: LayoutGrid, color: 'text-primary bg-primary/10' },
          {
            label: 'ai_generated',
            value: captions.filter((c: any) => c.source === 'ai').length,
            icon: Sparkles,
            color: 'text-purple-500 bg-purple-500/10',
          },
          {
            label: 'manual_written',
            value: captions.filter((c: any) => c.source === 'manual').length,
            icon: List,
            color: 'text-blue-500 bg-blue-500/10',
          },
          {
            label: 'active_ready',
            value: captions.filter((c: any) => c.status === 'active').length,
            icon: Filter,
            color: 'text-green-500 bg-green-500/10',
          },
        ].map((stat, i) => (
          <Card
            key={i}
            className="glass-card border-glass-border hover-gradient-border dark:bg-white/3! rounded-border-radius overflow-hidden group hover:border-primary/20 transition-all bg-white dark:bg-transparent"
          >
            <CardContent className="p-4 flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-base font-bold text-title-color mb-1">{t(stat.label)}</p>
                <p className="text-3xl font-black text-foreground tabular-nums tracking-tight">{stat.value}</p>
              </div>
              <div
                className={cn(
                  'rounded-[9px]  h-11 w-11 flex items-center justify-center',
                  stat.color,
                )}
              >
                <stat.icon className="w-5 h-5" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters Bar */}

      <div className="flex flex-col md:flex-row items-center gap-4">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 rtl:right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-subtitle-color" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('search_captions_placeholder', { defaultValue: 'Search by name, caption, or notes...' })}
            className="w-full ps-11 rtl:pl-4 rtl:pr-11 bg-white dark:bg-white/3 border-glass-border rounded-border-radius focus:ring-primary/20"
          />
        </div>

        <div className="flex items-center flex-wrap sm:flex-nowrap gap-3 w-full md:w-auto">
          <Select value={source} onValueChange={setSource}>
            <SelectTrigger className=" bg-white dark:bg-white/3 border border-glass-border rounded-border-radius px-4 text-sm font-bold text-foreground focus:ring-primary/20 outline-none min-w-[140px]">
              <SelectValue placeholder={t('all_sources')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('all_sources')}</SelectItem>
              <SelectItem value="manual">{t('manual')}</SelectItem>
              <SelectItem value="ai">{t('ai')}</SelectItem>
            </SelectContent>
          </Select>

          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className=" bg-white dark:bg-white/3 border border-glass-border rounded-border-radius px-4 text-sm font-bold text-foreground focus:ring-primary/20 outline-none min-w-[140px]">
              <SelectValue placeholder={t('all_statuses')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('all_statuses')}</SelectItem>
              <SelectItem value="active">{t('active')}</SelectItem>
              <SelectItem value="inactive">{t('inactive')}</SelectItem>
              <SelectItem value="draft">{t('draft')}</SelectItem>
            </SelectContent>
          </Select>

          <Button
            onClick={resetFilters}
            variant="ghost"
            className="h-9! w-12 p-0 rounded-xl bg-white dark:bg-white/3 border border-glass-border hover:bg-muted dark:hover:bg-white/10"
            title={t('reset_filters')}
          >
            <RotateCcw className="w-4 h-4" />
          </Button>
        </div>
      </div>


      {/* Results Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="glass-card rounded-border-radius sm:p-6 p-4 space-y-4 border border-glass-border bg-white dark:bg-white/3 flex flex-col h-[200px]"
            >
              {/* Top Row: Badges skeleton */}
              <div className="flex justify-between items-center w-full">
                <div className="flex gap-2">
                  <Skeleton className="w-12 h-5 rounded-full bg-slate-200/80 dark:bg-white/10" />
                  <Skeleton className="w-16 h-5 rounded-full bg-slate-200/80 dark:bg-white/10" />
                </div>
                <Skeleton className="w-24 h-4 bg-slate-200/80 dark:bg-white/10" />
              </div>
              
              {/* Title & Actions skeleton */}
              <div className="flex justify-between items-center w-full pt-2">
                <Skeleton className="w-1/3 h-5 bg-slate-200/80 dark:bg-white/10" />
                <div className="flex gap-2">
                  <Skeleton className="w-7 h-7 rounded-full bg-slate-200/80 dark:bg-white/10" />
                  <Skeleton className="w-7 h-7 rounded-full bg-slate-200/80 dark:bg-white/10" />
                  <Skeleton className="w-7 h-7 rounded-full bg-slate-200/80 dark:bg-white/10" />
                </div>
              </div>

              {/* Caption Content skeleton */}
              <div className="space-y-2 pt-2">
                <Skeleton className="w-full h-3 bg-slate-200/80 dark:bg-white/10" />
                <Skeleton className="w-5/6 h-3 bg-slate-200/80 dark:bg-white/10" />
                <Skeleton className="w-2/3 h-3 bg-slate-200/80 dark:bg-white/10" />
              </div>
            </div>
          ))}
        </div>
      ) : captions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 px-6 glass-card rounded-border-radius border-dashed border-glass-border text-center bg-white/80 dark:bg-white/3">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
            <Sparkles className="w-10 h-10 text-primary" />
          </div>
          <h3 className="text-xl font-bold text-title-color  mb-2">{t('no_captions_found')}</h3>
          <p className="text-subtitle-color text-base mb-8">
            {t('no_captions_desc', {
              defaultValue: 'Try adjusting your filters or create your first reusable caption block.',
            })}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {captions.map((caption: any) => (
            <CaptionCard
              key={caption.id || (caption as any)._id}
              caption={caption}
              onEdit={handleEdit}
              onDelete={handleDeleteClick}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      <CaptionModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setEditingCaption(null)
        }}
        caption={editingCaption}
      />

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
        title={t('confirm_delete_caption')}
        description={t('delete_confirmation_message')}
      />
    </div>
  )
}
