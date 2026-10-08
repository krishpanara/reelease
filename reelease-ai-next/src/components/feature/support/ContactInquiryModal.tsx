'use client'

import TextInput from '@/components/shared/form-fields/TextInput'
import TextAreaField from '@/components/shared/form-fields/TextAreaField'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useCreateContactInquiryMutation } from '@/redux/api/contactInquiryApi'
import { ApiError, ContactInquiryModalProps } from '@/types'
import { inquirySchemas } from '@/utils/validation-schemas'
import { Form, Formik } from 'formik'
import { Loader2, Send } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { useAppSelector } from '@/redux/hooks'
import { RootState } from '@/redux/store'



export function ContactInquiryModal({ isOpen, onClose }: ContactInquiryModalProps) {
  const { t } = useTranslation()
  const [createInquiry, { isLoading }] = useCreateContactInquiryMutation()
  const { user } = useAppSelector((state: RootState) => state.auth)

  const initialValues = {
    name: user?.name || '',
    email: user?.email || '',
    subject: '',
    message: '',
  }

  const handleSubmit = async (values: typeof initialValues) => {
    try {
      const res = await createInquiry(values).unwrap()
      toast.success(res.message || t('message_sent_successfully'))
      onClose()
    } catch (error) {
      const apiError = error as ApiError
      toast.error(apiError?.data?.message || t('something_went_wrong'))
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-xl! max-w-[calc(100%-2rem)]! max-h-[90vh] no-scrollbar overflow-auto dark:bg-light-body! rounded-border-radius border-none glass-dark-card shadow-2xl">
        <DialogHeader className="space-y-3">
          <DialogTitle className="text-2xl text-left rtl:text-right font-bold text-title-color dark:text-white mb-0">
            {t('contact_support_title')}
          </DialogTitle>
          <DialogDescription className="text-subtitle-color font-medium">
            {t('contact_support_desc')}
          </DialogDescription>
        </DialogHeader>

        <Formik
          initialValues={initialValues}
          enableReinitialize
          validationSchema={inquirySchemas.create(t)}
          onSubmit={handleSubmit}
        >
          {() => (
            <Form className="space-y-6 py-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <TextInput
                  name="name"
                  label={t('full_name')}
                  placeholder={t('enter_name')}
                  className="bg-background/50"
                />
                <TextInput
                  name="email"
                  label={t('email_address')}
                  placeholder={t('email_placeholder')}
                  className="bg-background/50"
                />
              </div>
              <TextInput
                name="subject"
                label={t('subject')}
                placeholder={t('enter_subject', { defaultValue: 'Enter subject...' })}
                className="bg-background/50"
              />
              <TextAreaField
                name="message"
                label={t('message')}
                placeholder={t('type_message_placeholder')}
                rows={4}
                className="bg-background/50 dark:bg-white/3!"
              />

              <DialogFooter className="pt-4 gap-3">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={onClose}
                  disabled={isLoading}
                  className="sm:h-12 h-10 rounded-radius dark:bg-white/5 bg-black/5 w-full hover:bg-destructive  hover:text-white"
                >
                  {t('cancel')}
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="sm:h-12 h-10 primary-btn rounded-radius px-8 w-full text-white! hover:bg-primary/90 flex items-center gap-2"
                >
                  {isLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <>
                      <Send className="h-4 w-4 bg-" />
                      {t('send_message')}
                    </>
                  )}
                </Button>
              </DialogFooter>
            </Form>
          )}
        </Formik>
      </DialogContent>
    </Dialog>
  )
}
