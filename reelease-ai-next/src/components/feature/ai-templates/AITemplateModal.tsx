'use client'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import Input from '@/components/ui/input'
import Label from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textArea'
import { useCreateTemplateMutation, useUpdateTemplateMutation } from '@/redux/api/aiTemplateApi'
import { useGetAiTemplateCategoriesQuery } from '@/redux/api/aiTemplateCategoryApi'
import { AITemplateCategory, AITemplateModalProps, ApiError, Attachment } from '@/types'
import { getMediaUrl } from '@/utils'
import { Field, Form, Formik } from 'formik'
import { ImageIcon, Loader2, Upload } from 'lucide-react'
import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import * as Yup from 'yup'
import MediaPickerModal from '../media-library/MediaPickerModal'

export function AITemplateModal({ isOpen, onClose, template }: AITemplateModalProps) {
  const { t } = useTranslation()
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [filePreview, setFilePreview] = useState<string | null>(null)
  const [selectedAttachment, setSelectedAttachment] = useState<Attachment | null>(null)
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [createTemplate, { isLoading: isCreating }] = useCreateTemplateMutation()
  const [updateTemplate, { isLoading: isUpdating }] = useUpdateTemplateMutation()

  const { data: categoriesRaw } = useGetAiTemplateCategoriesQuery({ status: true })
  const categories = Array.isArray(categoriesRaw)
    ? categoriesRaw
    : categoriesRaw?.categories || (categoriesRaw as any)?.data || []

  const isEditing = !!template
  const isLoading = isCreating || isUpdating

  const initialAttachmentId = typeof template?.attachment_id === 'object'
    ? (template?.attachment_id as any)?._id || (template?.attachment_id as any)?.id
    : template?.attachment_id

  const currentAttachmentId = selectedAttachment
    ? selectedAttachment.id || (selectedAttachment as any)._id
    : null

  const mediaChanged = selectedFile !== null || currentAttachmentId !== initialAttachmentId

  useEffect(() => {
    if (isOpen) {
      if (template) {
        let previewPath = template.file_path
        if (!previewPath && template.attachment_id && typeof template.attachment_id === 'object') {
          previewPath = template.attachment_id.file_path
        }

        setFilePreview(getMediaUrl(previewPath || '') || null)
        if (template.attachment_id && typeof template.attachment_id === 'object') {
          setSelectedAttachment(template.attachment_id as any)
        }
      } else {
        setFilePreview(null)
        setSelectedAttachment(null)
      }
      setSelectedFile(null)
    }
  }, [isOpen, template])

  const handleClose = () => {
    setSelectedFile(null)
    setFilePreview(null)
    setSelectedAttachment(null)
    setIsMediaPickerOpen(false)
    onClose()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      setSelectedAttachment(null)
      const reader = new FileReader()
      reader.onloadend = () => {
        setFilePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleAttachmentSelect = (attachment: Attachment) => {
    setSelectedAttachment(attachment)
    setSelectedFile(null)
    setFilePreview(getMediaUrl(attachment.file_path) || null)
    setIsMediaPickerOpen(false)
  }

  const buildInitialValues = () => ({
    title: template?.title || '',
    prompt: template?.prompt || '',
    category_id:
      typeof template?.category_id === 'object'
        ? template?.category_id?._id || template?.category_id?.id
        : template?.category_id || '',
    status: template?.status ?? true,
  })

  const validationSchema = Yup.object({
    title: Yup.string().required(t('title_required', { defaultValue: 'Title is required' })),
    prompt: Yup.string().required(t('prompt_required', { defaultValue: 'Prompt is required' })),
    category_id: Yup.string().required(t('category_required', { defaultValue: 'Category is required' })),
  })

  const handleSubmit = async (values: any) => {
    if (!isEditing && !selectedFile && !selectedAttachment) {
      toast.error(t('template_file_required', { defaultValue: 'Template file (image or video) is required' }))
      return
    }

    try {
      const data = new FormData()
      data.append('title', values.title)
      data.append('prompt', values.prompt)
      data.append('category_id', values.category_id)
      data.append('status', String(values.status))

      if (selectedFile) {
        data.append('file', selectedFile)
      } else if (selectedAttachment) {
        data.append('attachment_id', selectedAttachment.id || (selectedAttachment as any)._id)
      }

      if (isEditing && template) {
        const res = await updateTemplate({
          id: template._id || template.id,
          data: data,
        }).unwrap()
        toast.success(res.message || t('template_updated_successfully'))
      } else {
        const res = await createTemplate(data).unwrap()
        toast.success(res.message || t('template_created_successfully'))
      }
      handleClose()
    } catch (error) {
      const apiError = error as ApiError
      toast.error(apiError?.data?.message || t('something_went_wrong'))
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-xl! max-w-[calc(100%-2rem)]! overflow-hidden p-4! rounded-border-radius!">
        <Formik
          initialValues={buildInitialValues()}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
          enableReinitialize
        >
          {({ values, setFieldValue, handleSubmit: formikSubmit, dirty }) => (
            <Form onSubmit={formikSubmit} className="relative z-10 flex flex-col h-full max-h-[90vh]">
              <DialogHeader className="border-b border-glass-border dark:border-white/5 pb-3 space-y-1">
                <DialogTitle className="text-xl flex items-center gap-2 rtl:flex-row-reverse">
                  {isEditing ? t('edit_template') : t('create_template')}
                </DialogTitle>
                <DialogDescription className="text-muted-foreground text-left rtl:text-right">
                  {isEditing
                    ? t('update_template_details', { defaultValue: 'Update the details for this prompt template' })
                    : t('create_template_details', {
                      defaultValue: 'Fill in the details to create a new prompt template',
                    })}
                </DialogDescription>
              </DialogHeader>

              <div className="py-3 space-y-5 overflow-y-auto no-scrollbar">
                <div className="space-y-2 flex flex-col">
                  <Label htmlFor="title" className="text-sm font-semibold text-left rtl:text-right">
                    {t('title')} <span className="text-destructive">*</span>
                  </Label>
                  <Field name="title">
                    {({ field }: any) => (
                      <Input
                        {...field}
                        id="title"
                        placeholder={t('template_title_placeholder', { defaultValue: 'e.g., Cyberpunk City' })}
                        className="h-11 border border-glass-border  dark:border-white/10 focus-visible:ring-primary/20 transition-all rounded-xl"
                      />
                    )}
                  </Field>
                </div>

                <div className="space-y-2 flex flex-col py-3">
                  <Label className="text-sm font-semibold text-left rtl:text-right">
                    {t('category')} <span className="text-destructive">*</span>
                  </Label>
                  <Select value={values.category_id} onValueChange={(val) => setFieldValue('category_id', val)}>
                    <SelectTrigger className="h-11 border border-glass-border  dark:border-white/10  focus:ring-primary/20 rounded-radius">
                      <SelectValue placeholder={t('select_category')} />
                    </SelectTrigger>
                    <SelectContent className="bg-background border dark:border-white/10 border-black/10">
                      {categories.map((c: AITemplateCategory) => (
                        <SelectItem
                          key={c.id || c._id}
                          value={c.id || c._id}
                          className="cursor-pointer hover:bg-primary/10!"
                        >
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2 flex flex-col">
                  <Label className="text-sm font-semibold text-left rtl:text-right!">
                    {t('template_file', { defaultValue: 'Template File (Image/Video)' })}{' '}
                    <span className="text-destructive">*</span>
                  </Label>
                  <div
                    onClick={() => setIsMediaPickerOpen(true)}
                    className={`relative h-[350px] rounded-border-radius border-2 border-dashed dark:bg-white/3 transition-all flex flex-col items-center justify-center cursor-pointer overflow-hidden ${filePreview
                      ? 'border-primary/50 bg-primary/5'
                      : 'border border-glass-border dark:border-white/10  hover:border-primary/30'
                      }`}
                  >
                    {filePreview ? (
                      <>
                        {filePreview.startsWith('data:video') ||
                          selectedAttachment?.mime_type?.startsWith('video/') ||
                          (typeof template?.file_path === 'string' && template.file_path.match(/\.(mp4|webm|ogg)$/i)) ? (
                          <video
                            src={filePreview}
                            className="w-full h-full object-cover"
                            controls={false}
                            autoPlay
                            muted
                            loop
                          />
                        ) : (
                          <Image
                            width={50}
                            height={50}
                            unoptimized
                            src={filePreview}
                            alt="Preview"
                            className="w-full h-full object-cover"
                          />
                        )}
                        <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                          <p className="text-white text-xs font-medium bg-black/60 px-3 py-1 rounded-full flex items-center gap-1">
                            <Upload className="w-3 h-3" /> {t('change_file', { defaultValue: 'Change File' })}
                          </p>
                        </div>
                      </>
                    ) : (
                      <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center">
                          <ImageIcon className="w-5 h-5" />
                        </div>
                        <span className="text-xs">
                          {t('click_to_select_media', { defaultValue: 'Click to select from media library' })}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-2 flex flex-col">
                  <Label htmlFor="prompt" className="text-sm font-semibold text-left rtl:text-right">
                    {t('prompt')} <span className="text-destructive">*</span>
                  </Label>
                  <Field name="prompt">
                    {({ field }: any) => (
                      <Textarea
                        {...field}
                        id="prompt"
                        placeholder={t('enter_prompt_placeholder', {
                          defaultValue: 'A highly detailed rendering of...',
                        })}
                        className="min-h-35 text-left rtl:text-right resize-none border border-glass-border  dark:border-white/10  focus-visible:ring-primary/20 transition-all rounded-border-radius p-3"
                      />
                    )}
                  </Field>
                </div>

                <div className="flex items-center rtl:flex-row-reverse justify-between p-4 rounded-border-radius border border-glass-border dark:border-white/5">
                  <div className="space-y-0.5 flex-1 text-left rtl:text-right">
                    <Label className="text-sm font-semibold text-left rtl:text-right!">{t('active_status')}</Label>
                    <div className="text-xs text-muted-foreground text-left rtl:text-right">
                      {values.status
                        ? t('template_is_active', { defaultValue: 'Template is active and visible' })
                        : t('template_is_hidden', { defaultValue: 'Template is hidden' })}
                    </div>
                  </div>
                  <Switch checked={values.status} onCheckedChange={(val) => setFieldValue('status', val)} />
                </div>
              </div>

              <DialogFooter className="py-4 pb-0! border-t border-glass-border dark:border-white/5 mt-auto">
                <div className="flex rtl:flex-row-reverse items-center gap-3 justify-between w-full">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={handleClose}
                    className="text-muted-foreground w-full font-semibold hover:text-foreground text-base rounded-radius sm:h-12 h-10 dark:bg-white/3 bg-black/3 hover:bg-destructive hover:text-white! dark:hover:bg-destructive "
                  >
                    {t('cancel')}
                  </Button>
                  <Button
                    type="submit"
                    disabled={isLoading || (isEditing || !dirty || !mediaChanged)}
                    className="rounded-radius sm:h-12 h-10 text-white! text-base w-full primary-btn"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        {isEditing ? t('updating') : t('saving')}
                      </>
                    ) : isEditing ? (
                      t('update_template', { defaultValue: 'Update Template' })
                    ) : (
                      t('save_template', { defaultValue: 'Save Template' })
                    )}
                  </Button>
                </div>
              </DialogFooter>
            </Form>
          )}
        </Formik>

        <Input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*,video/*" className="hidden" />

        <MediaPickerModal
          isOpen={isMediaPickerOpen}
          onClose={() => setIsMediaPickerOpen(false)}
          onSelect={(attachment) => {
            const singleAttachment = Array.isArray(attachment) ? attachment[0] : attachment
            if (singleAttachment) {
              handleAttachmentSelect(singleAttachment)
            }
          }}
        />
      </DialogContent>
    </Dialog>
  )
}
