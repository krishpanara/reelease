'use client'

import MediaPickerModal from '@/components/feature/media-library/MediaPickerModal'
import TextAreaField from '@/components/shared/form-fields/TextAreaField'
import TextInput from '@/components/shared/form-fields/TextInput'
import { Button } from '@/components/ui/button'
import { SocialFormProps } from '@/types/landing'
import { getMediaUrl } from '@/utils'
import { getValidationSchemas } from '@/utils/validation-schemas/landingPage'
import { FieldArray, Form, Formik } from 'formik'
import { Image as ImageIcon, Loader2, Plus, Save, Share2, Smartphone, Trash2 } from 'lucide-react'
import Image from 'next/image'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

export default function SocialForm({ data, onSubmit, isLoading }: SocialFormProps) {
  const { t } = useTranslation()
  const { SocialValidationSchema } = getValidationSchemas(t)
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false)
  const [selectionTarget, setSelectionTarget] = useState<{ pIndex: number; fIndex?: number | null } | null>(null)

  const initialValues = {
    platforms:
      data?.platforms?.map((p: any) => ({
        ...p,
        image_id: p.image_id || null,
        features:
          p.features?.map((f: any) => ({
            ...f,
            image_id: f.image_id || null,
          })) || [],
      })) || [],
  }

  return (
    <div className="space-y-8 ">
      <div className="flex items-center justify-between border-b border-white/5 pb-6 ">
        <div className="flex items-center gap-4">
          <div className="sm:w-12 sm:h-12 w-10 h-10 rounded-radius bg-primary/10 flex items-center justify-center">
            <Share2 className="sm:w-6 sm:h-6 w-4 h-4 text-primary" />
          </div>
          <div>
            <h2 className="text-md sm:text-xl font-bold dark:text-white text-title-color">
              {t('social_platforms_configuration')}
            </h2>
            <p className="text-subtitle-color text-sm font-medium">{t('manage_social_media_platforms_features')}</p>
          </div>
        </div>
      </div>

      <Formik
        initialValues={initialValues}
        validationSchema={SocialValidationSchema}
        onSubmit={onSubmit}
        enableReinitialize
      >
        {({ values, dirty, isValid, setFieldValue }) => (
          <Form className="space-y-8">
            <FieldArray name="platforms">
              {({ push, remove }) => (
                <div className="space-y-10">
                  {values.platforms.map((platform: any, pIndex: number) => (
                    <div
                      key={pIndex}
                      className="p-4 sm:p-6 rounded-border-radius border border-glass-border relative group/p"
                    >
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => remove(pIndex)}
                        className="absolute top-2 right-2 rtl:left-2 rtl:right-auto h-8 w-8 rounded-lg opacity-0 group-hover/p:opacity-100 transition-all bg-destructive/20! text-destructive! hover:bg-destructive/30!"
                      >
                        <Trash2 className="w-5 h-5" />
                      </Button>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <TextInput
                          name={`platforms.${pIndex}.name`}
                          label={t('platform_name')}
                          placeholder="e.g. Instagram"
                        />
                        <TextInput
                          name={`platforms.${pIndex}.badge`}
                          label={t('platform_badge')}
                          placeholder="e.g. Visual Pro"
                        />
                        <TextInput
                          name={`platforms.${pIndex}.highlight`}
                          label={t('highlight_keyword')}
                          placeholder="e.g. Aesthetics"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        <TextInput
                          name={`platforms.${pIndex}.title`}
                          label={t('platform_title')}
                          placeholder={t('enter_platform_title')}
                        />
                        <TextAreaField
                          name={`platforms.${pIndex}.description`}
                          label={t('description')}
                          placeholder={t('enter_description')}
                          rows={2}
                        />
                      </div>

                      <div className="space-y-4 pt-6 border-t dark:border-white/5 border-black/5">
                        <h4 className="text-sm font-bold dark:text-white/60 text-black/60 flex items-center gap-2">
                          <Smartphone className="w-4 h-4" />
                          {t('platform_features')}
                        </h4>

                        <FieldArray name={`platforms.${pIndex}.features`}>
                          {({ push: pushF, remove: removeF }) => (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {platform.features?.map((_: any, fIndex: number) => (
                                <div
                                  key={fIndex}
                                  className="p-4 rounded-border-radius border  dark:border-white/5 border-black/8 flex items-start gap-4 group/f"
                                >
                                  <div
                                    onClick={() => {
                                      setSelectionTarget({ pIndex, fIndex })
                                      setIsMediaPickerOpen(true)
                                    }}
                                    className="relative w-16 h-16 rounded-border-radius border border-dashed dark:border-white/10 border-black/10 bg-black/5 overflow-hidden shrink-0 cursor-pointer hover:border-primary/50 transition-all flex flex-col items-center justify-center"
                                  >
                                    {(() => {
                                      const featureSrc = getMediaUrl(
                                        platform.features[fIndex].image_id?.url ||
                                          platform.features[fIndex].image_id?.path ||
                                          platform.features[fIndex].image_id?.file_path,
                                      )
                                      if (featureSrc && featureSrc.length > 0) {
                                        return (
                                          <Image
                                            src={featureSrc}
                                            alt="Feature"
                                            fill
                                            className="object-cover OBJECT-"
                                            unoptimized
                                          />
                                        )
                                      }
                                      return <ImageIcon className="w-5 h-5 dark:text-white/30 text-black " />
                                    })()}
                                  </div>
                                  <div className="flex-1 space-y-3">
                                    <TextInput
                                      name={`platforms.${pIndex}.features.${fIndex}.title`}
                                      placeholder={t('feature_title')}
                                      className="h-9 text-xs"
                                    />
                                    <TextInput
                                      name={`platforms.${pIndex}.features.${fIndex}.description`}
                                      placeholder={t('feature_description')}
                                      className="h-9 text-xs"
                                    />
                                  </div>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => removeF(fIndex)}
                                    className="h-8 w-8 rounded-lg opacity-0 group-hover/f:opacity-100 transition-all bg-destructive/20! text-destructive! hover:bg-destructive/30!"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </Button>
                                </div>
                              ))}
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => pushF({ title: '', description: '', icon: 'Layout' })}
                                className="h-12 rounded-xl border-dashed border-white/10 text-white  primary-btn gap-2 font-medium! text-sm"
                              >
                                <Plus className="w-4 h-4" />
                                {t('add_platform_feature')}
                              </Button>
                            </div>
                          )}
                        </FieldArray>
                      </div>
                    </div>
                  ))}

                  <Button
                    type="button"
                    variant="outline"
                    onClick={() =>
                      push({ name: '', badge: '', title: '', highlight: '', description: '', features: [] })
                    }
                    className=" h-12 rounded-radius ml-auto primary-btn  text-white border-white/10 hover:border-primary/50 gap-3 font-medium! text-sm group"
                  >
                    <Plus className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    {t('add_new_platform')}
                  </Button>
                </div>
              )}
            </FieldArray>

            <MediaPickerModal
              isOpen={isMediaPickerOpen}
              onClose={() => {
                setIsMediaPickerOpen(false)
                setSelectionTarget(null)
              }}
              onSelect={(attachment) => {
                const singleAttachment = Array.isArray(attachment) ? attachment[0] : attachment
                if (!singleAttachment) return
                if (selectionTarget) {
                  const { pIndex, fIndex } = selectionTarget
                  if (fIndex !== undefined && fIndex !== null) {
                    setFieldValue(`platforms.${pIndex}.features.${fIndex}.image_id`, singleAttachment)
                  }
                }
              }}
            />

            <div className="flex justify-end pt-6 border-t border-white/5">
              <Button
                type="submit"
                disabled={isLoading || !dirty || !isValid}
                className="rounded-xl h-12 px-8 primary-btn text-white! font-bold gap-2 transition-all  "
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
