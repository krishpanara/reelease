'use client'

import MediaPickerModal from '@/components/feature/media-library/MediaPickerModal'
import TextAreaField from '@/components/shared/form-fields/TextAreaField'
import TextInput from '@/components/shared/form-fields/TextInput'
import { Button } from '@/components/ui/button'
import Label from '@/components/ui/label'
import { HeroFormProps } from '@/types/landing'
import { getMediaUrl } from '@/utils'
import { getValidationSchemas } from '@/utils/validation-schemas/landingPage'
import { Form, Formik } from 'formik'
import { Image as ImageIcon, Loader2, Rocket, Save } from 'lucide-react'
import Image from 'next/image'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

export default function HeroForm({ data, onSubmit, isLoading }: HeroFormProps) {
  const { t } = useTranslation()
  const { HeroValidationSchema } = getValidationSchemas(t)
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false)

  const initialValues = {
    badge: data?.badge || '',
    heading: data?.heading || '',
    subheading: data?.subheading || '',
    cta_primary_text: data?.cta_primary_text || '',
    cta_secondary_text: data?.cta_secondary_text || '',
    dashboard_image_id: data?.dashboard_image_id || null,
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between border-b dark:border-white/5 border-black/5  pb-6">
        <div className="flex items-center gap-4">
          <div className="sm:w-12 sm:h-12 w-10 h-10 rounded-radius bg-primary/10 flex items-center justify-center">
            <Rocket className="sm:w-6 sm:h-6 w-4 h-4 text-primary" />
          </div>
          <div>
            <h2 className="text-md sm:text-xl font-bold dark:text-white text-title-color">{t('hero_configuration')}</h2>
            <p className="text-subtitle-color text-sm font-medium">{t('main_landing_header_global_settings')}</p>
          </div>
        </div>
      </div>

      <Formik
        initialValues={initialValues}
        validationSchema={HeroValidationSchema}
        onSubmit={onSubmit}
        enableReinitialize
      >
        {({ values, setFieldValue, dirty, isValid }) => (
          <Form className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <TextInput name="badge" label={t('badge_text')} placeholder={t('enter_badge_text')} />
                <TextInput name="heading" label={t('section_title')} placeholder={t('enter_section_title')} />
                <TextAreaField
                  name="subheading"
                  label={t('description')}
                  placeholder={t('enter_description')}
                  rows={4}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <TextInput name="cta_primary_text" label={t('primary_cta')} placeholder={t('e_g_get_started')} />
                  <TextInput name="cta_secondary_text" label={t('secondary_cta')} placeholder={t('e_g_view_demo')} />
                </div>
              </div>

              <div className="space-y-6">
                <Label className="text-sm text-foreground  block mb-2">{t('hero_main_image')}</Label>
                <div
                  onClick={() => setIsMediaPickerOpen(true)}
                  className="relative aspect-video rounded-border-radius border-2 border-dashed border-black/10 bg-black/3  dark:border-white/10! dark:bg-white/3! overflow-hidden group cursor-pointer hover:border-primary/50 transition-all flex flex-col items-center justify-center gap-4"
                >
                  {(() => {
                    const heroSrc = getMediaUrl(
                      values.dashboard_image_id?.url ||
                        values.dashboard_image_id?.path ||
                        values.dashboard_image_id?.file_path,
                    )
                    if (values.dashboard_image_id && heroSrc && heroSrc.length > 0) {
                      return (
                        <>
                          <Image
                            src={heroSrc}
                            alt="Hero"
                            fill
                            className="object-cover transition-transform group-hover:scale-105"
                            unoptimized
                          />
                          <div className="absolute inset-0 bg-black/20!  opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <div className="primary-btn backdrop-blur-md px-4 py-2 rounded-radius  text-white text-sm font-medium!">
                              {t('change_image')}
                            </div>
                          </div>
                        </>
                      )
                    }
                    return (
                      <>
                        <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center text-white/20 group-hover:text-primary transition-colors">
                          <ImageIcon className="w-8 h-8" />
                        </div>
                        <div className="text-center">
                          <p className="text-white font-bold">{t('update_media')}</p>
                          <p className="text-white/40 text-xs">{t('click_to_browse_library')}</p>
                        </div>
                      </>
                    )
                  })()}
                </div>

                <MediaPickerModal
                  isOpen={isMediaPickerOpen}
                  onClose={() => setIsMediaPickerOpen(false)}
                  onSelect={(attachment) => {
                    const singleAttachment = Array.isArray(attachment) ? attachment[0] : attachment
                    if (singleAttachment) {
                      setFieldValue('dashboard_image_id', singleAttachment)
                    }
                  }}
                />
              </div>
            </div>

            <div className="flex justify-end pt-6 border-t dark:border-white/5 border-black/5">
              <Button
                type="submit"
                disabled={isLoading || !dirty || !isValid}
                className="rounded-xl h-12 px-8 primary-btn text-white! font-bold gap-2 transition-all shadow-lg shadow-primary/20"
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
