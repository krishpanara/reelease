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
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textArea'
import { cn } from '@/lib/utils'
import { useCreateAiTemplateCategoryMutation, useUpdateAiTemplateCategoryMutation } from '@/redux/api/aiTemplateCategoryApi'
import { AITemplateCategory, AITemplateCategoryModalProps, ApiError } from '@/types'
import { Form, Formik } from 'formik'
import { Image as ImageIcon, Loader2, Upload } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import * as Yup from 'yup'
import MediaPickerModal from '../media-library/MediaPickerModal'
import { getMediaUrl } from '@/utils'
import Image from 'next/image'
import { defaultForm } from '@/data/aiProvider'

export function AITemplateCategoryModal({ isOpen, onClose, category }: AITemplateCategoryModalProps) {
  const { t } = useTranslation()
  const [createCategory, { isLoading: isCreating }] = useCreateAiTemplateCategoryMutation()
  const [updateCategory, { isLoading: isUpdating }] = useUpdateAiTemplateCategoryMutation()
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  const isEditing = !!category
  const isLoading = isCreating || isUpdating

  useEffect(() => {
    if (category?.attachment_id && typeof category.attachment_id === 'object') {
      setPreviewUrl(category.attachment_id.file_path)
    } else {
      setPreviewUrl(null)
    }
  }, [category])

  const handleClose = () => {
    setPreviewUrl(null)
    onClose()
  }

  const validationSchema = Yup.object({
    name: Yup.string().required(t('name_is_required', { defaultValue: 'Name is required' })),
    slug: Yup.string().required(t('slug_is_required', { defaultValue: 'Slug is required' })),
  })

  const handleSubmit = async (values: any) => {
    try {
      if (isEditing && category) {
        const res = await updateCategory({
          id: category._id || category.id,
          data: values,
        }).unwrap()
        toast.success(res.message || t('category_updated_successfully'))
      } else {
        const res = await createCategory(values).unwrap()
        toast.success(res.message || t('category_created_successfully'))
      }
      handleClose()
    } catch (error) {
      const apiError = error as ApiError
      toast.error(apiError?.data?.message || t('something_went_wrong'))
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-xl! max-w-[calc(100%-2rem)]! overflow-hidden p-4! shadow-2xl rounded-border-radius">
        <Formik
          initialValues={
            isEditing && category
              ? {
                  name: category.name,
                  slug: category.slug,
                  description: category.description || '',
                  attachment_id:
                    typeof category.attachment_id === 'object'
                      ? category.attachment_id?._id
                      : category.attachment_id || '',
                  status: category.status ?? true,
                }
              : defaultForm
          }
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
          enableReinitialize
        >
          {({ values, errors, touched, setFieldValue, dirty }) => {
            return (
              <Form className="relative z-10 flex flex-col h-full max-h-[90vh]">
                <DialogHeader className="border-b dark:border-white/5 border-glass-border space-y-1 pb-3 text-left rtl:text-right">
                  <DialogTitle className="text-xl flex items-center gap-2 rtl:flex-row-reverse">
                    {isEditing ? t('edit_category') : t('create_category')}
                  </DialogTitle>
                  <DialogDescription className="text-muted-foreground">
                    {isEditing ? t('update_category_details') : t('create_category_details')}
                  </DialogDescription>
                </DialogHeader>

                <div className="py-4 space-y-5 overflow-y-auto no-scrollbar">
                  {/* Image Selection */}
                  <div className="space-y-2 flex flex-col">
                    <Label className="text-sm font-semibold text-start rtl:text-end">{t('category_image')}</Label>
                    <div
                      onClick={() => setIsMediaModalOpen(true)}
                      className="w-full aspect-video rounded-border-radius border-2 border-dashed border-glass-border dark:border-white/10 hover:border-primary/50 transition-all flex flex-col items-center justify-center cursor-pointer overflow-hidden relative group "
                    >
                      {previewUrl ? (
                        <>
                          <Image
                            src={getMediaUrl(previewUrl)}
                            width={100}
                            height={100}
                            unoptimized
                            alt="Category Preview"
                            className="w-full h-full object-cover group-hover:opacity-50 transition-all"
                          />
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                            <Button
                              type="button"
                              variant="secondary"
                              className="gap-2 h-10 rounded-lg primary-btn text-white"
                            >
                              <Upload className="w-4 h-4" /> {t('change_image')}
                            </Button>
                          </div>
                        </>
                      ) : (
                        <div className="flex flex-col items-center gap-2 text-muted-foreground">
                          <ImageIcon className="w-8 h-8 opacity-40" />
                          <span className="text-sm font-medium">{t('click_to_upload')}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <MediaPickerModal
                    isOpen={isMediaModalOpen}
                    onClose={() => setIsMediaModalOpen(false)}
                    onSelect={(attachment) => {
                      const singleAttachment = Array.isArray(attachment) ? attachment[0] : attachment
                      if (!singleAttachment) return
                      setFieldValue('attachment_id', singleAttachment.id || (singleAttachment as any)._id)
                      setPreviewUrl(singleAttachment.file_path)
                      setIsMediaModalOpen(false)
                    }}
                  />

                  <div className="space-y-2 flex flex-col">
                    <Label htmlFor="name" className="text-sm font-semibold text-left rtl:text-right">
                      {t('name')} <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="name"
                      name="name"
                      value={values.name}
                      onChange={(e) => {
                        setFieldValue('name', e.target.value)
                        if (!isEditing) {
                          setFieldValue(
                            'slug',
                            e.target.value
                              .toLowerCase()
                              .replace(/[^a-z0-9]+/g, '-')
                              .replace(/(^-|-$)+/g, ''),
                          )
                        }
                      }}
                      placeholder={t('enter_category_name')}
                      className={cn(
                        'h-11 border-glass-border dark:border-white/10 focus-visible:ring-primary/20 transition-all rounded-xl',
                        errors.name && touched.name && 'border-destructive',
                      )}
                    />
                    {errors.name && touched.name && <p className="text-xs text-destructive">{errors.name}</p>}
                  </div>

                  <div className="space-y-2 flex flex-col">
                    <Label htmlFor="slug" className="text-sm font-semibold text-left rtl:text-right">
                      {t('slug')} <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="slug"
                      name="slug"
                      value={values.slug}
                      onChange={(e) => setFieldValue('slug', e.target.value)}
                      placeholder={t('enter_category_slug')}
                      className={cn(
                        'h-11 border-glass-border dark:border-white/10 focus-visible:ring-primary/20 transition-all rounded-xl',
                        errors.slug && touched.slug && 'border-destructive',
                      )}
                    />
                    {errors.slug && touched.slug && <p className="text-xs text-destructive">{errors.slug}</p>}
                  </div>

                  <div className="space-y-2 flex flex-col">
                    <Label htmlFor="description" className="text-sm font-semibold text-left rtl:text-right">
                      {t('description')}
                    </Label>
                    <Textarea
                      id="description"
                      name="description"
                      value={values.description}
                      onChange={(e) => setFieldValue('description', e.target.value)}
                      placeholder={t('enter_description')}
                      className="min-h-25 resize-none border-glass-border text-left rtl:text-right dark:border-white/10 focus-visible:ring-primary/20 transition-all rounded-border-radius p-3"
                    />
                  </div>

                  <div className="flex items-center rtl:flex-row-reverse justify-between p-4 rounded-border-radius border border-glass-border dark:border-white/10">
                    <div className="space-y-0.5">
                      <Label className="text-sm font-semibold text-left rtl:text-right">{t('active_status')}</Label>
                      <div className="text-xs text-muted-foreground text-left rtl:text-right">
                        {values.status ? t('active') : t('inactive')}
                      </div>
                    </div>
                    <Switch checked={values.status} onCheckedChange={(val) => setFieldValue('status', val)} />
                  </div>
                </div>

                <DialogFooter className="py-4 border-t border-glass-border dark:border-white/5  mt-auto">
                  <div className="flex items-center gap-2 sm:gap-3 justify-between flex-col sm:flex-row w-full rtl:flex-row-reverse">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={handleClose}
                      className="z-10 text-muted-foreground border border-glass-border inset-0 flex items-center justify-center hover:text-white! hover:bg-destructive! rounded-radius sm:h-12 h-10 text-base w-full dark:bg-white/3 bg-black/3"
                    >
                      {t('cancel')}
                    </Button>
                    <Button
                      type="submit"
                      disabled={isLoading || (isEditing && !dirty)}
                      className="rounded-radius sm:h-12 h-10 w-full primary-btn text-white! text-base font-semibold"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          {isEditing ? t('updating') : t('creating')}
                        </>
                      ) : isEditing ? (
                        t('update_category')
                      ) : (
                        t('create_category')
                      )}
                    </Button>
                  </div>
                </DialogFooter>
              </Form>
            )
          }}
        </Formik>
      </DialogContent>
    </Dialog>
  )
}
