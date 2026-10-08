'use client'

import React from 'react'
import { Formik, Form, FieldArray } from 'formik'
import * as Yup from 'yup'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Save, Loader2, Layout, Plus, Trash2 } from 'lucide-react'
import TextInput from '@/components/shared/form-fields/TextInput'
import TextAreaField from '@/components/shared/form-fields/TextAreaField'
import Label from '@/components/ui/label'
import { FooterFormProps } from '@/types/landing'
import { getValidationSchemas } from '@/utils/validation-schemas/landingPage'



export default function FooterForm({ data, onSubmit, isLoading }: FooterFormProps) {
  const { t } = useTranslation()
  const {
    FooterValidationSchema,
  } = getValidationSchemas(t)

  const initialValues = {
    tagline: data?.tagline || '',
    copyright: data?.copyright || '',
    address: data?.address || '',
    phone: data?.phone || '',
    email: data?.email || '',
    social_links: data?.social_links || [],
  }


  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between border-b border-white/5 pb-6">
        <div className="flex items-center gap-4">
          <div className="sm:w-12 sm:h-12 w-10 h-10 rounded-radius bg-primary/10 flex items-center justify-center">
            <Layout className="sm:w-6 sm:h-6 w-4 h-4 text-primary" />
          </div>
          <div>
            <h2 className="text-md sm:text-xl font-bold dark:text-white text-title-color">{t('footer_configuration')}</h2>
            <p className="text-subtitle-color text-sm font-medium">{t('manage_footer_content_links')}</p>
          </div>
        </div>
      </div>

      <Formik initialValues={initialValues} validationSchema={FooterValidationSchema} onSubmit={onSubmit} enableReinitialize>
        {({ values, dirty, isValid }) => (
          <Form className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <TextAreaField name="tagline" label={t('footer_tagline')} placeholder={t('enter_tagline')} rows={2} />
                <TextInput
                  name="copyright"
                  label={t('copyright_text')}
                  placeholder="© 2026 Smart AI Content Generation Suite. All rights reserved."
                />
                <TextInput name="email" label={t('contact_email')} placeholder="hello@example.ai" />
                <TextInput name="phone" label={t('contact_phone')} placeholder="+1 234 567 890" />
                <TextInput
                  name="address"
                  label={t('address')}
                  placeholder="123 AI Street, Tech City, TC 12345"
                />
              </div>

              <div className="space-y-6">
                <Label className="text-sm  text-foreground  block mb-2">{t('social_links')}</Label>
                <FieldArray name="social_links">
                  {({ push, remove }) => (
                    <div className="space-y-4">
                      {values.social_links.map((_: any, index: number) => (
                        <div
                          key={index}
                          className="flex flex-col sm:flex-row items-end gap-3 p-4 rounded-2xl dark:bg-white/3 bg-black/2 border dark:border-white/10 border-black/10 relative group/item"
                        >
                          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
                            <TextInput
                              name={`social_links.${index}.name`}
                              label={t('name')}
                              placeholder="e.g. Twitter"
                            />
                            <TextInput name={`social_links.${index}.href`} label={t('url')} placeholder="https://..." />
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => remove(index)}
                            className="h-8 w-8 rounded-lg opacity-0 group-hover/item:opacity-100 transition-all bg-destructive/20! text-destructive! hover:bg-destructive/30!"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => push({ name: '', href: '', icon: '' })}
                        className=" h-12 rounded-xl ml-auto border-dashed primary-btn  text-white! border-white/10 hover:border-primary/50 gap-2 font-medium! text-sm"
                      >
                        <Plus className="w-4 h-4" />
                        {t('add_social_link')}
                      </Button>
                    </div>
                  )}
                </FieldArray>
              </div>
            </div>

            <div className="flex justify-end pt-6 border-t dark:border-white/5 border-black/5">
              <Button
                type="submit"
                disabled={isLoading || !dirty || !isValid}
                className="rounded-xl h-12 px-8 primary-btn  text-white! font-bold gap-2 transition-all shadow-lg shadow-primary/20"
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
