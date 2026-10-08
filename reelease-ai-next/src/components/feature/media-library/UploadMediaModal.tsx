'use client'

import React, { useState, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Upload, X, File, Loader2, CloudUpload } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useUploadAttachmentsMutation } from '@/redux/api/attachmentApi'
import { useGetPublicSettingsQuery } from '@/redux/api/adminSettingApi'
import { toast } from 'sonner'
import { formatBytes } from '@/utils'
import Input from '@/components/ui/input'
import { UploadMediaModalProps } from '@/types'

const UploadMediaModal = ({ isOpen, onClose }: UploadMediaModalProps) => {
  const { t } = useTranslation()
  const [isDragging, setIsDragging] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [uploadAttachments, { isLoading }] = useUploadAttachmentsMutation()
  const { data: settingsData } = useGetPublicSettingsQuery({})
  const fileInputRef = useRef<HTMLInputElement>(null)

  const getTypePrefix = (mimetype: string, originalname: string = '') => {
    if (mimetype && mimetype.startsWith('audio/')) return 'audio';
    if (mimetype && mimetype.startsWith('image/')) return 'image';
    if (mimetype && mimetype.startsWith('video/')) return 'video';

    const ext = originalname.split('.').pop()?.toLowerCase() || '';
    const imageExts = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'];
    const videoExts = ['mp4', 'webm', 'avi', 'mov', 'wmv', 'mkv'];
    const audioExts = ['mp3', 'wav', 'ogg', 'm4a'];
    const docExts = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'csv'];

    if (imageExts.includes(ext)) return 'image';
    if (videoExts.includes(ext)) return 'video';
    if (audioExts.includes(ext)) return 'audio';
    if (docExts.includes(ext)) return 'document';

    if (
      mimetype === 'application/pdf' ||
      mimetype.includes('document') ||
      mimetype.includes('text') ||
      mimetype.includes('sheet') ||
      mimetype.includes('presentation')
    ) {
      return 'document';
    }
    return 'file';
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      addFiles(Array.from(e.target.files))
    }
  }

  const addFiles = (newFiles: File[]) => {
    const settings = settingsData?.settings;
    const limits = {
      image: (settings?.image_file_limit || 10) * 1024 * 1024,
      video: (settings?.video_file_limit || 20) * 1024 * 1024,
      audio: (settings?.audio_file_limit || 10) * 1024 * 1024,
      document: (settings?.document_file_limit || 10) * 1024 * 1024,
      file: 25 * 1024 * 1024,
    };

    const validFiles = newFiles.filter((file) => {
      const type = getTypePrefix(file.type, file.name);
      const maxSize = (limits as any)[type] || limits.file;

      if (file.size > maxSize) {
        toast.error(t('file_too_large_message', {
          defaultValue: `${file.name} is too large. Max size for ${type} is ${formatBytes(maxSize)}`,
          name: file.name,
          type: type,
          limit: formatBytes(maxSize)
        }));
        return false;
      }
      return true;
    });

    if (selectedFiles.length + validFiles.length > (settings?.multiple_file_share_limit || 10)) {
      toast.error(t('max_files_hint'));
      return;
    }
    setSelectedFiles((prev) => [...prev, ...validFiles]);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const files = Array.from(e.dataTransfer.files)
    addFiles(files)
  }

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;

    const formData = new FormData();
    selectedFiles.forEach((file) => {
      formData.append('files', file);
    });

    try {
      await uploadAttachments(formData).unwrap();
      toast.success(t('files_uploaded_successfully'));
      setSelectedFiles([]);
      onClose();
    } catch (error: any) {
      const errorMessage = error?.data?.message || t('failed_to_upload_media');
      toast.error(errorMessage);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-xl! max-w-[calc(100%-2rem)]! rounded-border-radius! border-glass-border">
        <DialogHeader>
          <DialogTitle className="text-2xl font-medium text-black ">
            {t('upload_media')}
          </DialogTitle>
          <DialogDescription>{t('media_library_desc')}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div
            onClick={() => fileInputRef.current?.click()}
            onDragOver={handleDragOver}
            onDragEnter={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`group relative border-2 border-dashed rounded-border-radius sm:p-12 p-6 transition-all duration-300 cursor-pointer flex flex-col items-center justify-center gap-4 ${isDragging
              ? 'border-primary bg-primary/10 scale-[0.98]'
              : 'border-glass-border hover:border-primary/50 bg-muted/20 hover:bg-primary/5'
              }`}
          >
            <Input type="file" ref={fileInputRef} onChange={handleFileChange} multiple className="hidden" />
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center ring-8 ring-primary/5 group-hover:scale-110 transition-transform duration-500">
              <CloudUpload className="w-8 h-8 text-primary" />
            </div>
            <div className="text-center">
              <p className="text-lg font-semibold">{t('drop_files_here')}</p>
              <p className="text-sm text-muted-foreground mt-1">{t('max_files_hint')}</p>
            </div>
          </div>

          {selectedFiles.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm font-medium">
                <span>{t('files_selected')}</span>
                <span className="text-primary">{selectedFiles.length} / {settingsData?.settings?.multiple_file_share_limit || 10}</span>
              </div>
              <div className="max-h-50 overflow-y-auto space-y-2 no-scrollbar">
                {selectedFiles.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between rtl:flex-row-reverse p-3 rounded-full bg-muted/30 border border-glass-border group animate-in fade-in slide-in-from-bottom-2 duration-300"
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="w-9 h-9 bg-primary/10 rounded-radius flex items-center justify-center shrink-0">
                        <File className="w-5 h-5 text-primary" />
                      </div>
                      <div className="overflow-hidden">
                        <p className="text-sm font-medium truncate pr-4">{file.name}</p>
                        <p className="text-[10px] text-muted-foreground truncate uppercase font-bold tracking-tighter">
                          {formatBytes(file.size)}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-full hover:bg-destructive/10  hover:text-white! shrink-0"
                      onClick={(e) => {
                        e.stopPropagation()
                        removeFile(index)
                      }}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter className=" flex rtl:flex-row-reverse sm576:flex-col flex-row gap-2 ">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            className="w-full h-12! text-base rounded-full dark:bg-white/3 bg-black/3! hover:bg-destructive! hover:text-white! border-none!"
          >
            {t('cancel')}
          </Button>
          <Button
            onClick={handleUpload}
            disabled={isLoading || selectedFiles.length === 0}
            className="w-full text-sm h-12 primary-btn hover:bg-primary/90 dark:text-black text-white! min-w-30"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4  animate-spin" />
                {t('uploading_media')}
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 " />
                {t('upload_media')}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default UploadMediaModal
