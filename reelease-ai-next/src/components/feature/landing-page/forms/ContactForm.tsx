'use client'

import React from 'react'
import { Formik, Form } from 'formik'
import * as Yup from 'yup'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Save, Loader2, Phone } from 'lucide-react'
import TextInput from '@/components/shared/form-fields/TextInput'
import TextAreaField from '@/components/shared/form-fields/TextAreaField'
import { ContactFormProps } from '@/types/landing'
import { getValidationSchemas } from '@/utils/validation-schemas/landingPage'



export default function ContactForm({ data, onSubmit, isLoading }: ContactFormProps) {
  const { t } = useTranslation()
  const {
    ContactValidationSchema,
  } = getValidationSchemas(t)

  const initialValues = {
    section_badge: data?.section_badge || '',
    heading: data?.heading || '',
    subheading: data?.subheading || '',
    email: data?.email || '',
    phone: data?.phone || '',
    address: data?.address || '',
    live_chat_label: data?.live_chat_label || '',
  }



  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between border-b border-white/5 pb-6">
        <div className="flex items-center gap-4">
          <div className="sm:w-12 sm:h-12 w-10 h-10 rounded-radius bg-primary/10 flex items-center justify-center">
            <Phone className="sm:w-6 sm:h-6 w-4 h-4 text-primary" />
          </div>
          <div>
            <h2 className="text-md sm:text-xl font-bold dark:text-white text-title-color">{t('contact_configuration')}</h2>
            <p className="text-subtitle-color text-sm font-medium">{t('manage_contact_section_details')}</p>
          </div>
        </div>
      </div>

      <Formik
        initialValues={initialValues}
        validationSchema={ContactValidationSchema}
        onSubmit={onSubmit}
        enableReinitialize
      >
        {({ values, dirty, isValid }) => (
          <Form className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <TextInput
                  name="section_badge"
                  label={t('badge_text')}
                  placeholder={t('enter_badge_text')}
                />
                <TextInput
                  name="heading"
                  label={t('section_title')}
                  placeholder={t('enter_section_title')}
                />
                <TextAreaField
                  name="subheading"
                  label={t('description')}
                  placeholder={t('enter_description')}
                  rows={3}
                />
                <TextInput
                  name="live_chat_label"
                  label={t('live_chat_label')}
                  placeholder={t('e_g_live_chat_available')}
                />
              </div>

              <div className="space-y-6">
                <TextInput
                  name="email"
                  label={t('email_address')}
                  placeholder="hello@example.ai"
                />
                <TextInput
                  name="phone"
                  label={t('phone_number')}
                  placeholder="+1 234 567 890"
                />
                <TextAreaField
                  name="address"
                  label={t('physical_address')}
                  placeholder={t('enter_address')}
                  rows={3}
                />
              </div>
            </div>

            <div className="flex justify-end pt-6 border-t dark:border-white/5 border-black/5">
              <Button
                type="submit"
                disabled={isLoading || !dirty || !isValid}
                className="rounded-xl h-12 px-8 primary-btn text-white! font-bold gap-2 transition-all"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Save className="w-5 h-5" />
                )}
                {t('save_changes')}
              </Button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  )
}
