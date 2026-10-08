'use client'

import MediaGrid from '@/components/feature/media-library/MediaGrid'
import UploadMediaModal from '@/components/feature/media-library/UploadMediaModal'
import DeleteConfirmationModal from '@/components/reusable/DeleteConfirmationModal'
import { PageHeader } from '@/components/reusable/PageHeader'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import Input from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PERMISSIONS } from '@/constants/permissions'
import { usePermission } from '@/hooks/usePermission'
import { useGetPublicSettingsQuery } from '@/redux/api/adminSettingApi'
import {
  useDeleteAttachmentMutation,
  useDeleteBulkAttachmentsMutation,
  useGetAttachmentsQuery,
  useUpdateAttachmentMutation,
} from '@/redux/api/attachmentApi'
import {
  CheckSquare,
  Image as ImageIcon,
  Loader2,
  Plus,
  Search,
  Square,
  Trash2,
  Video as VideoIcon
} from 'lucide-react'
import Image from 'next/image'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import EditMediaModal from './EditMediaModal'
import { Skeleton } from '@/components/ui/skeleton'
import { Pagination } from '@/components/reusable/Pagination'

const MediaLibraryView = () => {
  const { t } = useTranslation()
  const { hasPermission, role } = usePermission()
  const { data: settingsData } = useGetPublicSettingsQuery({})
  const settings = settingsData?.settings
  const isUserAdmin = role === 'admin' || role === 'super_admin'

  const canCreate = hasPermission(PERMISSIONS.CREATE_MEDIA_LIBRARY)
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [sourceFilter, setSourceFilter] = useState('all')
  const [mediaType, setMediaType] = useState('all')

  // Selection state
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [selectionMode, setSelectionMode] = useState(false)
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false)
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(15)
  const [debouncedSearch, setDebouncedSearch] = useState(searchQuery)

  // Debounce search to avoid too many API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery)
      setPage(1) // Reset to first page on search
    }, 500)
    return () => clearTimeout(timer)
  }, [searchQuery])

  useEffect(() => {
    setPage(1)
  }, [sourceFilter, mediaType])

  const {
    data: attachmentsData,
    isLoading,
    isFetching,
  } = useGetAttachmentsQuery({
    page,
    limit,
    search: debouncedSearch,
    type: mediaType !== 'all' ? mediaType : undefined,
    is_generated: sourceFilter === 'generated' ? true : sourceFilter === 'uploaded' ? false : undefined,
    noMerge: true,
  })
  const [deleteAttachment, { isLoading: isDeleting }] = useDeleteAttachmentMutation()
  const [deleteBulkAttachments, { isLoading: isBulkDeleting }] = useDeleteBulkAttachmentsMutation()
  const [updateAttachment, { isLoading: isUpdating }] = useUpdateAttachmentMutation()

  const [editMedia, setEditMedia] = useState<any | null>(null)

  const handleUpdateName = async (newName: string) => {
    if (!editMedia) return
    try {
      await updateAttachment({ id: editMedia._id || editMedia.id, name: newName }).unwrap()
      toast.success(t('media_updated_successfully', 'Media name updated successfully'))
      setEditMedia(null)
    } catch (error) {
      toast.error(t('failed_to_update_media', 'Failed to update media name'))
    }
  }

  const attachments = attachmentsData?.attachments || []
  const totalResults = attachmentsData?.total || 0
  const totalPages = Math.ceil(totalResults / limit)

  const handleSelect = (id: string, selected: boolean) => {
    if (selected) {
      setSelectedIds((prev) => [...prev, id])
    } else {
      setSelectedIds((prev) => prev.filter((item) => item !== id))
    }
  }

  const handleSelectAll = () => {
    if (selectedIds.length === attachments.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(attachments.map((item: any) => item._id || item.id))
    }
  }

  const toggleSelectionMode = () => {
    setSelectionMode(!selectionMode)
    if (selectionMode) {
      setSelectedIds([]) // clear selection when turning off
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    const idToDelete = deleteId // capture before clearing
    try {
      await deleteAttachment(idToDelete).unwrap()
      toast.success(t('media_deleted_successfully'))
      setDeleteId(null)
      // also remove from selection if it was selected
      setSelectedIds((prev) => prev.filter((id) => id !== idToDelete))
    } catch (error) {
      toast.error(t('failed_to_delete_media'))
    }
  }

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return
    try {
      await deleteBulkAttachments(selectedIds).unwrap()
      toast.success(t('bulk_media_deleted_successfully', { count: selectedIds.length }))
      setIsBulkDeleteModalOpen(false)
      setSelectedIds([])
      setSelectionMode(false)
    } catch (error) {
      toast.error(t('failed_to_delete_media'))
    }
  }

  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader
        showBackButton={false}
        icon={<ImageIcon className="w-6 h-6 text-primary animate-pulse" />}
        title={t('media_library', { defaultValue: 'Media Library' })}
        subtitle={t('manage_ai_prompt_templates', { defaultValue: 'Manage AI prompt templates' })}
        primaryAction={
          canCreate
            ? {
              label: t('upload_media', { defaultValue: 'Upload Media' }),
              onClick: () => setIsUploadModalOpen(true),
              icon: <Plus className="w-4 h-4" />,
              className: 'bg-primary hover:bg-primary/90 text-white! rounded-xl h-10 px-6',
            }
            : undefined
        }
        endContent={
          <div className="flex items-center flex-wrap gap-3">
            <Button
              variant={selectionMode ? 'secondary' : 'outline'}
              onClick={toggleSelectionMode}
              className={`transition-all duration-300 rounded-radius ${selectionMode ? 'bg-destructive/5! text-destructive!' : 'dark:bg-white/4 bg-black/3 dark:text-white!'}`}
            >
              {selectionMode ? (
                <>
                  <Square className="w-4 h-4" />
                  {t('cancel_selection')}
                </>
              ) : (
                <>
                  <CheckSquare className="w-4 h-4" />
                  {t('select_multiple')}
                </>
              )}
            </Button>
          </div>
        }
      />

      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
        <div className="relative group w-full xl:max-w-md">
          <div className="absolute inset-y-0 left-3 rtl:right-3 rtl:left-auto flex items-center pointer-events-none transition-colors group-focus-within:text-primary text-muted-foreground">
            <Search className="h-4 w-4" />
          </div>
          <Input
            placeholder={t('search_media_library')}
            className="pl-10 rtl:pr-10  bg-black/3 dark:bg-white/3 rounded-radius backdrop-blur-md border-glass-border focus-visible:ring-primary/20 focus-visible:border-primary transition-all duration-300"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex flex-col sm:flex-row sm:flex-wrap items-center justify-center sm:items-center gap-3 w-full xl:w-auto">
          <div className="flex flex-wrap items-center gap-4 w-full sm:w-auto">
            {!isUserAdmin && (
              <Tabs value={sourceFilter} onValueChange={setSourceFilter} className="w-full sm:w-auto">
                <TabsList className="bg-white/3 border border-glass-border h-11 p-1 rounded-xl w-full sm:w-auto justify-start sm:justify-center overflow-x-auto no-scrollbar text-black dark:text-white/70">
                  <TabsTrigger
                    value="all"
                    className="rounded-lg px-6 h-9 transition-all data-[state=active]:text-white"
                  >
                    {t('all')}
                  </TabsTrigger>
                  <TabsTrigger
                    value="generated"
                    className="rounded-lg px-6 h-9 transition-all data-[state=active]:text-white data-[state=active]:dark:text-black"
                  >
                    {t('generated')}
                  </TabsTrigger>
                  <TabsTrigger
                    value="uploaded"
                    className="rounded-lg px-6 h-9 transition-all data-[state=active]:text-white data-[state=active]:dark:text-black"
                  >
                    {t('uploaded')}
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            )}

            <Select value={mediaType} onValueChange={setMediaType}>
              <SelectTrigger className="w-full sm:w-[160px] h-11 dark:bg-white/5 bg-black/5 border-white/10 rounded-xl focus:ring-primary/20 text-sm font-medium">
                <div className="flex items-center gap-2">
                  <SelectValue placeholder={t('media_type')} />
                </div>
              </SelectTrigger>
              <SelectContent className="border-glass-border rounded-md p-2 shadow-lg">
                <SelectItem
                  value="all"
                  className="focus:bg-primary/10 focus:text-primary transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded flex items-center justify-center bg-primary/10">
                      <CheckSquare className="w-4 h-4 text-primary" />
                    </div>
                    {t('all')}
                  </div>
                </SelectItem>
                <SelectItem
                  value="image"
                  className="focus:bg-primary/10 focus:text-primary transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded flex items-center justify-center bg-blue-500/10">
                      <ImageIcon className="w-4 h-4 text-blue-400" />
                    </div>
                    {t('images')}
                  </div>
                </SelectItem>
                <SelectItem
                  value="video"
                  className="focus:bg-primary/10 focus:text-primary transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded flex items-center justify-center bg-orange-500/10">
                      <VideoIcon className="w-4 h-4 text-orange-400" />
                    </div>
                    {t('video')}
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {selectionMode && attachments.length > 0 && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
              {selectedIds.length > 0 && (
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={() => setIsBulkDeleteModalOpen(true)}
                  className="h-10 shadow-lg shadow-destructive/20 transition-all rounded-radius duration-300 transform hover:scale-105 active:scale-95 flex items-center gap-1.5 px-3"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span className="text-xs">
                    {t('delete_selected')} ({selectedIds.length})
                  </span>
                </Button>
              )}
              <Button type="button" variant="ghost" size="sm" onClick={handleSelectAll} className="h-8">
                {selectedIds.length === attachments.length ? t('deselect_all') : t('select_all')}
              </Button>
              <span className="text-sm text-nowrap">
                {selectedIds.length} {t('selected_of')} {attachmentsData?.total || 0}
              </span>
            </div>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {Array.from({ length: limit }).map((_, i) => (
            <div
              key={i}
              className="rounded-border-radius glass-card p-3 dark:bg-white/3 bg-white border border-glass-border animate-pulse"
            >
              <Skeleton className="aspect-square w-full rounded-border-radius bg-slate-200/80 dark:bg-white/10" />
              <div className="space-y-2 mt-3">
                <Skeleton className="w-2/3 h-4 bg-slate-200/80 dark:bg-white/10 rounded" />
                <div className="flex justify-between items-center w-full">
                  <Skeleton className="w-12 h-3 bg-slate-200/80 dark:bg-white/10 rounded" />
                  <Skeleton className="w-16 h-3 bg-slate-200/80 dark:bg-white/10 rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-8">
          <MediaGrid
            attachments={attachments}
            onDelete={(id) => setDeleteId(id)}
            onEdit={(attachment) => setEditMedia(attachment)}
            selectedIds={selectedIds}
            onSelect={handleSelect}
            selectionMode={selectionMode}
            onView={(url) => setPreviewUrl(url)}
          />

          {totalPages > 1 && (
            <div className="pt-6 border-t border-glass-border">
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={setPage}
                rowsPerPage={limit}
                onRowsPerPageChange={(l) => {
                  setLimit(l)
                  setPage(1)
                }}
                showRowsPerPage={true}
                totalResults={totalResults}
              />
            </div>
          )}
        </div>
      )}

      <UploadMediaModal isOpen={isUploadModalOpen} onClose={() => setIsUploadModalOpen(false)} />

      {/* Preview Modal */}
      <Dialog open={!!previewUrl} onOpenChange={() => setPreviewUrl(null)}>
        <DialogContent className="sm:max-w-2xl! max-w-[calc(100%-2rem)]! rounded-border-radius! p-0 overflow-hidden bg-black/90">
          <DialogHeader className="sr-only">
            <DialogTitle>{t('media_preview', 'Media Preview')}</DialogTitle>
            <DialogDescription>{t('media_preview_desc', 'Viewing selected media asset')}</DialogDescription>
          </DialogHeader>
          {previewUrl && (
            <div className="relative w-full h-full min-h-100 flex items-center justify-center">
              {previewUrl.match(/\.(mp4|webm|ogg)$/i) ? (
                <video
                  src={process.env.NEXT_PUBLIC_STORAGE_URL + previewUrl}
                  controls
                  autoPlay
                  className="max-w-full max-h-[80vh]"
                />
              ) : (
                <Image
                  width={500}
                  height={500}
                  unoptimized
                  src={process.env.NEXT_PUBLIC_STORAGE_URL + previewUrl}
                  alt="Preview"
                  className="max-w-full max-h-[80vh] object-contain"
                />
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Single Delete Modal */}
      <DeleteConfirmationModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title={t('delete_media_title')}
        description={t('delete_media_description')}
        isLoading={isDeleting}
      />

      {/* Bulk Delete Modal */}
      <DeleteConfirmationModal
        isOpen={isBulkDeleteModalOpen}
        onClose={() => setIsBulkDeleteModalOpen(false)}
        onConfirm={handleBulkDelete}
        title={t('bulk_delete_media_title')}
        description={t('bulk_delete_media_description')}
        isLoading={isBulkDeleting}
      />

      <EditMediaModal
        isOpen={!!editMedia}
        onClose={() => setEditMedia(null)}
        media={editMedia}
        onConfirm={handleUpdateName}
        isLoading={isUpdating}
      />
    </div>
  )
}

export default MediaLibraryView
