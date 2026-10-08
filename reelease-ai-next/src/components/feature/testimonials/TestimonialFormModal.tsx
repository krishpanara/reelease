'use client'

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import Input from "@/components/ui/input"
import Label from "@/components/ui/label"
import { Textarea } from "@/components/ui/textArea"
import { cn } from "@/lib/utils"
import { TestimonialFormModalProps } from "@/types/testimonial"
import { getTestimonialModalSchema } from "@/utils/validation-schemas/Features"
import { ErrorMessage, Form, Formik } from "formik"
import { Camera, Loader2, Star, X } from "lucide-react"
import Image from "next/image"
import { useEffect, useRef, useState } from "react"
import { useTranslation } from "react-i18next"

const TestimonialFormModal = ({
  isOpen, 
  onClose,
  onSave,
  testimonial,
  isLoading,
}: TestimonialFormModalProps) => {
  const { t } = useTranslation()

  const TestimonialModalSchema = getTestimonialModalSchema(t)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const initialValues = {
    title: testimonial?.title || '',
    description: testimonial?.description || '',
    user_name: testimonial?.user_name || '',
    user_post: testimonial?.user_post || '',
    rating: testimonial?.rating || 5,
    status: testimonial?.status ?? true,
  }

  useEffect(() => {
    if (testimonial) {
      setImagePreview(testimonial.user_image ? `${process.env.NEXT_PUBLIC_STORAGE_URL}${testimonial.user_image}` : null)
      setSelectedFile(null)
    } else {
      setImagePreview(null)
      setSelectedFile(null)
    }
  }, [testimonial, isOpen])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemoveImage = () => {
    setSelectedFile(null)
    setImagePreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleSubmit = async (values: typeof initialValues) => {
    const data = new FormData()
    data.append('title', values.title)
    data.append('description', values.description)
    data.append('user_name', values.user_name)
    data.append('user_post', values.user_post)
    data.append('rating', values.rating.toString())
    data.append('status', values.status.toString())

    if (selectedFile) {
      data.append('user_image', selectedFile)
    } else if (testimonial && !imagePreview) {
      data.append('remove_image', 'true')
    }
    await onSave(data)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl! max-w-[calc(100%-2rem)]! border-glass-border max-h-[90vh] no-scrollbar overflow-auto rounded-border-radius! p-4">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-title-color dark:text-white ">
            {testimonial ? t('edit_testimonial') : t('add_testimonial')}
          </DialogTitle>
        </DialogHeader>

        <Formik
          initialValues={initialValues}
          validationSchema={TestimonialModalSchema}
          onSubmit={handleSubmit}
          enableReinitialize
        >
          {({ values, errors, touched, handleChange, handleBlur, setFieldValue, dirty }) => {
            const initialImagePreview = testimonial?.user_image ? `${process.env.NEXT_PUBLIC_STORAGE_URL}${testimonial.user_image}` : null
            const imageChanged = imagePreview !== initialImagePreview
            const hasChanges = dirty || imageChanged || selectedFile !== null

            return (
              <Form className="space-y-6">
                <div className="flex flex-col items-center gap-4 mb-6">
                  <div className="relative group">
                    <div className="w-24 h-24 rounded-full overflow-hidden bg-black/10 dark:bg-white/10 border-2 border-dashed border-black/20  dark:border-white/20 flex items-center justify-center transition-all group-hover:border-primary/40">
                      {imagePreview ? (
                        <Image src={imagePreview} alt="Preview" fill unoptimized className="object-cover rounded-full" />
                      ) : (
                        <Camera className="w-8 h-8 text-black/40 dark:text-white/40" />
                      )}
                    </div>
                    <Input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept="image/*"
                      className="hidden"
                    />
                    <Button
                      type="button"
                      size="icon"
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute bottom-0 -right-3 w-8 h-8 rounded-radius dark:bg-black! bg-white!  text-black dark:text-white!"
                    >
                      <Camera className="w-4 h-4" />
                    </Button>
                    {imagePreview && (
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        onClick={handleRemoveImage}
                        className="absolute -top-1 right-0 w-6 h-6 rounded-lg shadow-lg hover:scale-110 transition-transform"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground font-medium">{t('upload_user_photo')}</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2 flex flex-col">
                    <Label className="text-sm font-semibold text-title-color dark:text-white text-left rtl:text-right!">
                      {t('title')}
                    </Label>
                    <Input
                      name="title"
                      value={values.title}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={cn(
                        'h-11 rounded-radius bg-white/3 border-glass-border focus:ring-primary/20 text-left rtl:text-right!',
                        touched.title && errors.title && 'border-destructive',
                      )}
                      placeholder={t('testimonial_title_placeholder')}
                    />
                    <ErrorMessage name="title" component="div" className="text-xs text-destructive mt-1" />
                  </div>
                  <div className="space-y-2 flex flex-col">
                    <Label className="text-sm font-semibold text-title-color dark:text-white text-left rtl:text-right!">
                      {t('rating')}
                    </Label>
                    <div className="flex items-center rtl:justify-end gap-2 h-11">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Button
                          key={star}
                          onClick={() => setFieldValue('rating', star)}
                          className="transition-transform bg-[unset]! p-0! h-[unset]! active:scale-125"
                        >
                          <Star
                            className={cn(
                              'w-6! h-6! transition-colors text-left rtl:text-right!',
                              star <= values.rating ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/30',
                            )}
                          />
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-2 flex flex-col">
                  <Label className="text-sm font-semibold text-title-color dark:text-white text-left rtl:text-right!">
                    {t('description')}
                  </Label>
                  <Textarea
                    name="description"
                    value={values.description}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    rows={4}
                    className={cn(
                      'w-full p-4 rounded-border-radius bg-white/3 border border-glass-border focus:outline-none text-sm transition-all resize-none',
                      touched.description && errors.description && 'border-destructive',
                    )}
                    placeholder={t('testimonial_description_placeholder')}
                  />
                  <ErrorMessage name="description" component="div" className="text-xs text-destructive mt-1" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2 flex flex-col">
                    <Label className="text-sm font-semibold text-title-color dark:text-white text-left rtl:text-right!">
                      {t('user_name')}
                    </Label>
                    <Input
                      name="user_name"
                      value={values.user_name}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={cn(
                        'h-11 rounded-radius bg-white/3 border-glass-border focus:ring-primary/20',
                        touched.user_name && errors.user_name && 'border-destructive',
                      )}
                      placeholder={t('user_name_placeholder')}
                    />
                    <ErrorMessage name="user_name" component="div" className="text-xs text-destructive mt-1" />
                  </div>
                  <div className="space-y-2 flex flex-col">
                    <Label className="text-sm font-semibold text-title-color dark:text-white text-left rtl:text-right! ">
                      {t('user_post')}
                    </Label>
                    <Input
                      name="user_post"
                      value={values.user_post}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={cn(
                        'h-11 rounded-radius bg-white/3 border-glass-border focus:ring-primary/20',
                        touched.user_post && errors.user_post && 'border-destructive',
                      )}
                      placeholder={t('user_post_placeholder')}
                    />
                    <ErrorMessage name="user_post" component="div" className="text-xs text-destructive mt-1" />
                  </div>
                </div>

                <DialogFooter className="pt-4 border-t border-glass-border mt-6 rtl:flex-row-reverse">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onClose}
                    className="h-11 w-full rounded-radius border-none  dark:bg-white/3 bg-black/3 hover:bg-destructive! hover:text-white transition-all font-bold"
                  >
                    {t('cancel')}
                  </Button>
                  <Button
                    type="submit"
                    disabled={isLoading || !hasChanges}
                    className="h-11 w-full rounded-radius text-white! primary-btn transition-all font-bold gap-2"
                  >
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                    {testimonial ? t('update_testimonial') : t('create_testimonial')}
                  </Button>
                </DialogFooter>
              </Form>
            )
          }}
        </Formik>
      </DialogContent>
    </Dialog>
  )
}

export default TestimonialFormModal
