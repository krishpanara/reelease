'use client'

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useGetAttachmentsQuery, useUploadAttachmentsMutation } from '@/redux/api/attachmentApi'
import { Attachment, MediaPickerModalProps } from '@/types'
import { ImageIcon, Loader2, Plus, Search } from 'lucide-react'
import { useState, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import MediaCard from './MediaCard'
import Input from '@/components/ui/input'
import { useEffect, useCallback } from 'react'

export default function MediaPickerModal({ isOpen, onClose, onSelect, onUploadNew, type = 'all', multiSelect = false }: MediaPickerModalProps) {
  const { t } = useTranslation()
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [page, setPage] = useState(1)
  const [selectedAttachments, setSelectedAttachments] = useState<Attachment[]>([])
  const limit = 20
  const fileInputRef = useRef<HTMLInputElement>(null)
  const observer = useRef<IntersectionObserver | null>(null)

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery)
      setPage(1)
    }, 500)
    return () => clearTimeout(timer)
  }, [searchQuery])

  const [uploadAttachments, { isLoading: isUploading }] = useUploadAttachmentsMutation()

  const {
    data: attachmentsData,
    isLoading,
    isFetching,
  } = useGetAttachmentsQuery({
    page,
    limit,
    search: debouncedSearch,
    type: type === 'all' ? undefined : type,
  })

  const attachments = attachmentsData?.attachments || []
  const hasMore = attachmentsData?.total ? attachments.length < attachmentsData.total : false

  const lastElementRef = useCallback(
    (node: HTMLDivElement) => {
      if (isLoading || isFetching) return
      if (observer.current) observer.current.disconnect()
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setPage((prev: number) => prev + 1)
        }
      })
      if (node) observer.current.observe(node)
    },
    [isLoading, isFetching, hasMore]
  )

  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    if (onUploadNew) {
      onUploadNew(files[0]) // Still support single for onUploadNew if needed by props
      return
    }

    const fileList = Array.from(files)
    let successCount = 0

    for (const file of fileList) {
      const formData = new FormData()
      formData.append('files', file)

      try {
        await uploadAttachments(formData).unwrap()
        successCount++
      } catch (error: any) {
        const errorMessage = error?.data?.message || t('failed_to_upload_media', { defaultValue: 'Failed to upload media' })
        toast.error(`${file.name}: ${errorMessage}`)
      }
    }

    if (successCount > 0) {
      toast.success(t('files_uploaded_successfully', { defaultValue: 'Files uploaded successfully' }))
    }

    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleSelect = (attachment: Attachment) => {
    if (multiSelect) {
      setSelectedAttachments(prev => {
        const isAlreadySelected = prev.some(a => (a.id || a._id) === (attachment.id || attachment._id))
        if (isAlreadySelected) {
          return prev.filter(a => (a.id || a._id) !== (attachment.id || attachment._id))
        } else {
          return [...prev, attachment]
        }
      })
    } else {
      onSelect(attachment)
      onClose()
    }
  }

  const handleConfirm = () => {
    onSelect(selectedAttachments)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-3xl! max-w-[calc(100%-2rem)]! rounded-border-radius! max-h-[85vh] gap-0 flex flex-col overflow-hidden">
        <DialogHeader className="border-b border-white/5 space-y-1">
          <DialogTitle className="text-xl flex items-center justify-between flex-wrap gap-4 mb-3">
            <div className="flex flex-col">
              {t('select_media')}
              <span className="text-base rtl:sm:text-right text-muted-foreground text-left rtl:text-right">choose and manage your media files for this content.</span>
            </div>

            <div className="flex items-center gap-2 mr-6">
              <Button
                size="sm"
                onClick={handleUploadClick}
                disabled={isUploading}
                variant="outline"
                className="rounded-lg primary-btn gap-2 border-glass-border text-white text-sm h-10"
              >
                {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                {t('upload', { defaultValue: 'Upload' })}
              </Button>
              {multiSelect && (
                <Button
                  size="sm"
                  onClick={handleConfirm}
                  disabled={selectedAttachments.length === 0}
                  className="rounded-lg gap-2 primary-btn text-white! text-sm h-10 font-bold px-6"
                >
                  {t('select_count', { defaultValue: 'Select' })} ({selectedAttachments.length})
                </Button>
              )}
            </div>
          </DialogTitle>
          <DialogDescription className="sr-only">
            {t('media_picker_description', { defaultValue: 'Select an existing asset or upload a new one.' })}
          </DialogDescription>
        </DialogHeader>

        <div className=" px-0 py-4">
          <div className="relative group w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-all text-sm" />
            <Input
              placeholder={t('search_media_library')}
              className="w-full pl-10 h-11 bg-black/3 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setPage(1)
              }}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-2 pt-4  no-scrollbar relative">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
              <p className="text-sm text-muted-foreground">
                {t('loading_details', { defaultValue: 'Loading media details...' })}
              </p>
            </div>
          ) : attachments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
              <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center">
                <ImageIcon className="w-8 h-8 text-muted-foreground" />
              </div>
              <div>
                <p className="font-medium">{t('no_media_found', { defaultValue: 'No media found' })}</p>
                <p className="text-sm text-muted-foreground">
                  {t('no_results_description', { defaultValue: "We couldn't find any media assets in your library." })}
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-3 gap-4">
                {attachments.map((attachment: Attachment, index) => {
                  const isSelected = selectedAttachments.some(a => (a.id || a._id) === (attachment.id || attachment._id))
                  return (
                    <div
                      key={index}
                      className="cursor-pointer"
                      onClick={() => !multiSelect && handleSelect(attachment)}
                    >
                      <MediaCard
                        attachment={attachment}
                        onDelete={() => { }}
                        selectionMode={multiSelect}
                        hideActions={true}
                        isSelected={isSelected}
                        onSelect={() => handleSelect(attachment)}
                      />
                    </div>
                  )
                })}
              </div>

              {hasMore && (
                <div ref={lastElementRef} className="flex justify-center py-6 h-10">
                  {isFetching && (
                    <div className="flex items-center gap-2 text-primary">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span className="text-sm font-medium">
                        {t('loading_more', { defaultValue: 'Loading more...' })}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          <Input
            type="file"
            ref={fileInputRef}
            className="hidden"
            onChange={handleFileChange}
            accept={type === 'image' ? 'image/*' : type === 'video' ? 'video/*' : 'image/*,video/*'}
            multiple
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
