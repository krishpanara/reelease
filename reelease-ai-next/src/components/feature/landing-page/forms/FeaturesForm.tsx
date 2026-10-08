'use client'

import MediaPickerModal from '@/components/feature/media-library/MediaPickerModal'
import TextAreaField from '@/components/shared/form-fields/TextAreaField'
import TextInput from '@/components/shared/form-fields/TextInput'
import { Button } from '@/components/ui/button'
import Label from '@/components/ui/label'
import { FeaturesFormProps } from '@/types/landing'
import { getMediaUrl } from '@/utils'
import { getValidationSchemas } from '@/utils/validation-schemas/landingPage'
import { FieldArray, Form, Formik } from 'formik'
import { Image as ImageIcon, Layers, Loader2, Plus, Save, Trash2 } from 'lucide-react'
import Image from 'next/image'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

export default function FeaturesForm({ data, onSubmit, isLoading }: FeaturesFormProps) {
  const { t } = useTranslation()
  const { FeatureValidationSchema } = getValidationSchemas(t)
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false)
  const [activeItemIndex, setActiveItemIndex] = useState<number | null>(null)

  const initialValues = {
    section_badge: data?.section_badge || '',
    section_heading: data?.section_heading || '',
    section_subheading: data?.section_subheading || '',
    items: data?.items || [],
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between border-b dark:border-white/5 border-black/5 pb-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-radius bg-primary/10 flex items-center justify-center">
            <Layers className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h2 className="text-md sm:text-xl font-bold dark:text-white text-title-color">
              {t('features_configuration')}
            </h2>
            <p className="text-subtitle-color text-sm font-medium">{t('manage_features_section_content')}</p>
          </div>
        </div>
      </div>

      <Formik
        initialValues={initialValues}
        validationSchema={FeatureValidationSchema}
        onSubmit={onSubmit}
        enableReinitialize
      >
        {({ values, setFieldValue, dirty, isValid }) => (
          <Form className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-b dark:border-white/5 border-black/5 pb-10">
              <div className="space-y-6">
                <TextInput name="section_badge" label={t('badge_text')} placeholder={t('enter_badge_text')} />
                <TextInput name="section_heading" label={t('section_title')} placeholder={t('enter_section_title')} />
              </div>
              <div className="space-y-6">
                <TextAreaField
                  name="section_subheading"
                  label={t('description')}
                  placeholder={t('enter_description')}
                  rows={3}
                />
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold dark:text-white text-title-color">{t('feature_items')}</h3>
              </div>

              <FieldArray name="items">
                {({ push, remove }) => (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {values.items.map((item: any, index: number) => (
                      <div
                        key={index}
                        className="sm:p-6 p-4 rounded-border-radius  border border-glass-border space-y-6 relative group/item"
                      >
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => remove(index)}
                          className="absolute top-2 right-2 rtl:left-2 rtl:right-auto h-8 w-8 rounded-lg opacity-0 group-hover/item:opacity-100 transition-all z-20 bg-destructive/20! text-destructive! hover:bg-destructive/30!"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>

                        <div className="flex flex-col sm:flex-row gap-6">
                          <div
                            onClick={() => {
                              setActiveItemIndex(index)
                              setIsMediaPickerOpen(true)
                            }}
                            className="relative w-full sm:w-24 h-48 sm:h-24 rounded-2xl border-2 border-dashed dark:border-white/10 border-white bg-black/5! overflow-hidden shrink-0 cursor-pointer hover:border-primary/50 transition-all flex flex-col items-center justify-center"
                          >
                            {(() => {
                              const featureSrc = getMediaUrl(
                                item.image_id?.url || item.image_id?.path || item.image_id?.file_path,
                              )
                              if (featureSrc && featureSrc.length > 0) {
                                return (
                                  <Image src={featureSrc} alt="Feature" fill className="object-cover" unoptimized />
                                )
                              }
                              return <ImageIcon className="w-6 h-6 dark:text-white/20 text-black" />
                            })()}
                          </div>

                          <div className="flex-1 space-y-4">
                            <TextInput
                              name={`items.${index}.title`}
                              placeholder={t('feature_title')}
                              className="h-10 text-sm"
                            />
                            <TextAreaField
                              name={`items.${index}.description`}
                              placeholder={t('feature_description')}
                              rows={2}
                              className="text-xs"
                            />
                          </div>
                        </div>

                        <div className="flex items-center gap-3 flex-wrap">
                          <Label className="text-xs font-bold text-white/40">{t('accent_color')}:</Label>
                          <TextInput
                            name={`items.${index}.color`}
                            placeholder="Enter color code"
                            className="h-8 max-w-30 text-[10px]"
                          />
                        </div>
                      </div>
                    ))}

                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => push({ title: '', description: '', image_id: null, color: '#33ffaa' })}
                      className="h-auto bg-white/3! min-h-40 rounded-border-radius! border-dashed border-white/10 hover:border-primary/50  flex flex-col gap-3 font-bold group"
                    >
                      <div className="w-12 h-12 rounded-radius dark:bg-white/3 bg-black/5 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                        <Plus className="w-6 h-6" />
                      </div>
                      {t('add_new_feature')}
                    </Button>
                  </div>
                )}
              </FieldArray>
            </div>

            <MediaPickerModal
              isOpen={isMediaPickerOpen}
              onClose={() => {
                setIsMediaPickerOpen(false)
                setActiveItemIndex(null)
              }}
              onSelect={(attachment) => {
                const singleAttachment = Array.isArray(attachment) ? attachment[0] : attachment
                if (!singleAttachment) return
                if (activeItemIndex !== null) {
                  setFieldValue(`items.${activeItemIndex}.image_id`, singleAttachment)
                }
              }}
            />

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
