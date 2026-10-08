'use client'

import React from 'react'
import { Formik, Form } from 'formik'
import * as Yup from 'yup'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Save, Loader2, MessageCircle } from 'lucide-react'
import TextInput from '@/components/shared/form-fields/TextInput'
import TextAreaField from '@/components/shared/form-fields/TextAreaField'
import MultiSelectFormField from '@/components/shared/form-fields/MultiSelectFormField'
import { useGetActiveTestimonialsQuery } from '@/redux/api/testimonialApi'
import Label from '@/components/ui/label'
import { TestimonialsFormProps } from '@/types/landing'
import { getValidationSchemas } from '@/utils/validation-schemas/landingPage'

export default function TestimonialsForm({ data, onSubmit, isLoading }: TestimonialsFormProps) {
  const { t } = useTranslation()
  const { TestimonialsValidationSchema } = getValidationSchemas(t)
  const { data: testimonialsData, isLoading: isLoadingTestimonials } = useGetActiveTestimonialsQuery()

  const initialValues = {
    section_badge: data?.section_badge || '',
    section_heading: data?.section_heading || '',
    section_subheading: data?.section_subheading || '',
    testimonial_ids: data?.testimonial_ids?.map((t: any) => t._id || t.id || t) || [],
  }

  const testimonialOptions =
    testimonialsData?.testimonials?.map((test: any) => ({
      label: `${test.user_name} (${test.title})`,
      value: test._id || test.id,
    })) || []

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between border-b border-white/5 pb-6">
        <div className="flex items-center gap-4">
          <div className="sm:w-12 sm:h-12 w-10 h-10 rounded-radius bg-primary/10 flex items-center justify-center">
            <MessageCircle className="sm:w-6 sm:h-6 w-4 h-4 text-primary" />
          </div>
          <div>
            <h2 className="text-md sm:text-xl font-bold dark:text-white text-title-color">
              {t('testimonials_configuration')}
            </h2>
            <p className="text-subtitle-color text-sm font-medium">{t('manage_testimonials_section_content')}</p>
          </div>
        </div>
      </div>

      <Formik
        initialValues={initialValues}
        validationSchema={TestimonialsValidationSchema}
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
                  <Label className="text-sm text-foreground  block mb-2">{t('select_testimonials')}</Label>
                  <MultiSelectFormField
                    name="testimonial_ids"
                    options={testimonialOptions}
                    placeholder={
                      isLoadingTestimonials ? t('loading_testimonials') : t('select_testimonials_to_display')
                    }
                    isLoading={isLoadingTestimonials}
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-6 border-t dark:border-white/5 border-black/5">
              <Button
                type="submit"
                disabled={isLoading || !dirty || !isValid}
                className="rounded-xl h-12 px-8 primary-btn text-white! font-bold gap-2 transition-all "
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
