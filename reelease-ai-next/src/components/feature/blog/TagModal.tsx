'use client'

import TextInput from '@/components/shared/form-fields/TextInput'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { useCreateTagMutation, useUpdateTagMutation } from '@/redux/api/tagApi'
import { TagModalProps } from '@/types'
import { Form, Formik } from 'formik'
import { Loader2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import * as Yup from 'yup'

const TagModal = ({ isOpen, onClose, tag }: TagModalProps) => {
  const { t } = useTranslation()
  const [createTag, { isLoading: isCreating }] = useCreateTagMutation()
  const [updateTag, { isLoading: isUpdating }] = useUpdateTagMutation()

  const isEditing = !!tag
  const isLoading = isCreating || isUpdating

  const validationSchema = Yup.object().shape({
    title: Yup.string().required(t('title_required')),
  })

  const initialValues = {
    title: tag?.title || '',
  }

  const handleSubmit = async (values: typeof initialValues) => {
    try {
      if (isEditing && tag) {
        await updateTag({ id: tag._id || tag.id, data: values }).unwrap()
        toast.success(t('tag_updated_successfully'))
      } else {
        await createTag(values).unwrap()
        toast.success(t('tag_created_successfully'))
      }
      onClose()
    } catch (error: any) {
      toast.error(error?.data?.message || t('something_went_wrong'))
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md! max-w-[calc(100%-2rem)]! rounded-border-radius">
        <DialogHeader>
          <DialogTitle>{isEditing ? t('edit_tag') : t('add_tag')}</DialogTitle>
        </DialogHeader>

        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
          enableReinitialize
        >
          {() => (
            <Form className="space-y-6 pt-4">
              <TextInput
                name="title"
                label={t('title')}
                placeholder={t('enter_tag_title')}
              />

              <DialogFooter className="gap-2 rtl:flex-row-reverse">
                <Button className='h-11 dark:bg-white/3 bg-black/3 text-base hover:text-white hover:bg-destructive! rounded-radius w-full' type="button" variant="outline" onClick={onClose} disabled={isLoading}>
                  {t('cancel')}
                </Button>
                <Button className='h-11 primary-btn text-white! text-base rounded-radius w-full' type="submit" disabled={isLoading}>
                  {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  {isEditing ? t('update') : t('create')}
                </Button>
              </DialogFooter>
            </Form>
          )}
        </Formik>
      </DialogContent>
    </Dialog>
  )
}

export default TagModal
