'use client'

import React from 'react'
import { Formik, Form } from 'formik'
import * as Yup from 'yup'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Save, Loader2, HelpCircle } from 'lucide-react'
import TextInput from '@/components/shared/form-fields/TextInput'
import TextAreaField from '@/components/shared/form-fields/TextAreaField'
import MultiSelectFormField from '@/components/shared/form-fields/MultiSelectFormField'
import { useGetFaqsQuery } from '@/redux/api/faqApi'
import Label from '@/components/ui/label'
import { FAQFormProps } from '@/types/landing'
import { getValidationSchemas } from '@/utils/validation-schemas/landingPage'

export default function FAQForm({ data, onSubmit, isLoading }: FAQFormProps) {
  const { t } = useTranslation()
  const { FAQValidationSchema } = getValidationSchemas(t)
  const { data: faqsData, isLoading: isLoadingFaqs } = useGetFaqsQuery({})

  const initialValues = {
    section_badge: data?.section_badge || '',
    section_heading: data?.section_heading || '',
    section_subheading: data?.section_subheading || '',
    faq_ids: data?.faq_ids?.map((f: any) => f._id || f.id || f) || [],
  }

  const faqOptions =
    faqsData?.faqs?.map((faq: any) => ({
      label: faq.title || faq.question,
      value: faq._id || faq.id,
    })) || []

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between border-b border-white/5 pb-6">
        <div className="flex items-center gap-4">
          <div className="sm:w-12 sm:h-12 w-10 h-10 rounded-radius bg-primary/10 flex items-center justify-center">
            <HelpCircle className="sm:w-6 sm:h-6 w-4 h-4 text-primary" />
          </div>
          <div>
            <h2 className="text-md sm:text-xl font-bold dark:text-white text-title-color">{t('faq_configuration')}</h2>
            <p className="text-subtitle-color text-sm font-medium">{t('manage_faq_section_questions')}</p>
          </div>
        </div>
      </div>

      <Formik
        initialValues={initialValues}
        validationSchema={FAQValidationSchema}
        onSubmit={onSubmit}
        enableReinitialize
      >
        {({ values, dirty, isValid }) => (
          <Form className="space-y-8">
            <div className="grid grid-cols-1 gap-8">
              <div className="space-y-6">
                <TextInput name="section_badge" label={t('badge_text')} placeholder={t('enter_badge_text')} />
                <TextInput name="section_heading" label={t('section_title')} placeholder={t('enter_section_title')} />
                <TextAreaField
                  name="section_subheading"
                  label={t('description')}
                  placeholder={t('enter_description')}
                  rows={3}
                />

                <div className="space-y-2">
                  <Label className="text-sm  text-foreground  block mb-2">{t('select_faqs')}</Label>
                  <MultiSelectFormField
                    name="faq_ids"
                    options={faqOptions}
                    placeholder={isLoadingFaqs ? t('loading_faqs') : t('select_faqs_to_display')}
                    isLoading={isLoadingFaqs}
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-6 border-t dark:border-white/5 border-black/5">
              <Button
                type="submit"
                disabled={isLoading || !dirty || !isValid}
                className="rounded-xl h-12 px-8 primary-btn text-white! font-bold gap-2 transition-all"
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                {t('save_changes')}
              </Button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  )
}
