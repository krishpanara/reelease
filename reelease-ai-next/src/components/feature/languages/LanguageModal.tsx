'use client'

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import Label from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { cn } from '@/lib/utils'
import { LanguageModalProps } from '@/types/language'
import { Check, Loader2, Plus, Upload, X } from 'lucide-react'
import Image from 'next/image'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { LanguageSelector } from './LanguageSelector'
import { TranslationDropzone } from './TranslationDropzone'
import Input from '@/components/ui/input'
import { Formik, Form } from 'formik'
import * as Yup from 'yup'

export default function LanguageModal({ isOpen, onClose, onSave, language, isLoading }: LanguageModalProps) {
  const { t } = useTranslation()
  const isEditing = !!language
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const validationSchema = Yup.object({
    selectedLang: Yup.object().required(t('please_select_a_language')).nullable(),
    name: Yup.string().required(t('name_is_required')),
    locale: Yup.string().required(t('locale_is_required')).min(2, t('invalid_locale')),
    translationFile: Yup.mixed().test('required', t('json_file_is_required'), function(value) {
      if (isEditing) return true
      return !!value
    })
  })

  const initialValues = {
    selectedLang: language ? {
      name: language.name,
      locale: language.locale,
      emoji: language.emoji || '',
      code: ''
    } : null,
    name: language?.name || '',
    locale: language?.locale || '',
    emoji: language?.emoji || '',
    isActive: language?.is_active ?? true,
    flagFile: null as File | null,
    translationFile: null as File | null,
  }

  const handleSubmit = async (values: any) => {
    const formData = new FormData()
    formData.append('name', values.name)
    formData.append('locale', values.locale.toLowerCase())
    formData.append('isActive', String(values.isActive))
    formData.append('emoji', values.emoji || '🌐')
    if (values.flagFile) formData.append('flag', values.flagFile)
    if (values.translationFile) formData.append('translation', values.translationFile)

    await onSave(formData)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-xl max-w-[95vw] sm:p-6 p-4 overflow-y-auto max-h-[90vh] border-none rounded-border-radius dark:bg-modal-bg-color backdrop-blur-xl no-scrollbar flex flex-col">
        <DialogHeader className="px-0">
          <DialogTitle>
            {isEditing ? t('edit_language') : t('add_language')}
          </DialogTitle>
        </DialogHeader>

        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
          enableReinitialize
        >
          {({ values, errors, touched, setFieldValue, dirty }) => {
            // Internal states for previews and select open/close
            const [searchQuery, setSearchQuery] = useState('')
            const [isSelectOpen, setIsSelectOpen] = useState(false)
            const [flagPreview, setFlagPreview] = useState<string | null>(() => {
              if (language?.flag) {
                const storageUrl = process.env.NEXT_PUBLIC_STORAGE_URL || ''
                return language.flag.startsWith('http')
                  ? language.flag
                  : `${storageUrl.replace(/\/$/, '')}/${language.flag.replace(/^\//, '')}`
              }
              return null
            })
            const [isFlagDragOver, setIsFlagDragOver] = useState(false)
            
            const handleSelectLanguage = (lang: any) => {
              setFieldValue('selectedLang', lang)
              setFieldValue('name', lang.name)
              setFieldValue('locale', lang.locale.toLowerCase())
              setFieldValue('emoji', lang.emoji || '🌐')
              
              if (lang.code) {
                fetch(`https://flagcdn.com/w160/${lang.code.toLowerCase()}.png`)
                  .then(res => res.blob())
                  .then(blob => {
                    const file = new File([blob], `${lang.code}_flag.png`, { type: 'image/png' })
                    setFieldValue('flagFile', file)
                    setFlagPreview(URL.createObjectURL(file))
                  })
              }
              setIsSelectOpen(false)
            }

            const handleFlagChange = (e: React.ChangeEvent<HTMLInputElement>) => {
              const file = e.target.files?.[0]
              if (file) {
                setFieldValue('flagFile', file)
                setFlagPreview(URL.createObjectURL(file))
              }
            }

            return (
              <Form className="space-y-6 w-full mx-auto">
                <div className="relative group w-full">
                  <div className="relative sm:p-6 px-4 py-6 glass-dark-card rounded-border-radius inner-card space-y-6 w-full">
                    <div className="space-y-6 animate-in fade-in duration-500">
                      {!isEditing && (
                        <LanguageSelector
                          selectedLang={values.selectedLang}
                          onSelect={handleSelectLanguage}
                          isSelectOpen={isSelectOpen}
                          setIsSelectOpen={setIsSelectOpen}
                          searchQuery={searchQuery}
                          setSearchQuery={setSearchQuery}
                          error={errors.selectedLang as string}
                        />
                      )}

                      {(isEditing || values.selectedLang) && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 relative overflow-hidden group/identity">
                          <div className="space-y-2 sm:col-span-2">
                            <Label className="text-sm text-foreground mb-2! font-medium">
                              {t('language_name')}
                            </Label>
                            <Input
                              type="text"
                              name="name"
                              value={values.name}
                              onChange={(e) => setFieldValue('name', e.target.value)}
                              className={cn(
                                "w-full h-11 rounded-[8px] px-4 inner-card glass-dark-card font-bold text-sm focus:outline-none focus:ring-0 transition-all placeholder:text-muted-foreground/60",
                                errors.name && touched.name ? "border-destructive" : " "
                              )}
                              placeholder={t('e_g_spanish')}
                            />
                            {errors.name && touched.name && <p className="text-[10px] text-destructive font-bold ml-1">{errors.name}</p>}
                          </div>

                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-foreground mb-2!">
                              {t('identity_locale')}
                            </Label>
                            <Input
                              type="text"
                              name="locale"
                              value={values.locale}
                              onChange={(e) => setFieldValue('locale', e.target.value.toLowerCase())}
                              className={cn(
                                "w-full h-11  rounded-[8px] px-4 font-mono text-sm uppercase font-bold focus:outline-none focus:ring-0 transition-all",
                                errors.locale && touched.locale ? "border-destructive" : "border-glass-border focus:border-primary/30"
                              )}
                              placeholder="e.g. es"
                            />
                            {errors.locale && touched.locale && <p className="text-[10px] text-destructive font-bold ml-1">{errors.locale}</p>}
                          </div>

                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-foreground mb-2!">
                              {t('visual_identity')}
                            </Label>
                            <Input
                              type="text"
                              name="emoji"
                              value={values.emoji}
                              onChange={(e) => setFieldValue('emoji', e.target.value)}
                              className="w-full h-11 rounded-[8px] px-4 text-lg focus:outline-none focus:border-primary/30 transition-all text-center"
                              placeholder="🌐"
                            />
                          </div>
                        </div>
                      )}

                      {(isEditing || values.selectedLang) && (
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <Label className="text-sm font-medium text-foreground">{t('flag_icon_optional')}</Label>
                            {flagPreview && (
                              <Button
                                type="button"
                                onClick={() => {
                                  setFieldValue('flagFile', null)
                                  setFlagPreview(null)
                                }}
                                className="text-xs text-destructive p-0! bg-[unset]! font-bold hover:underline transition-all"
                              >
                                {t('remove_flag')}
                              </Button>
                            )}
                          </div>
                          
                          <div 
                            onClick={() => fileInputRef.current?.click()}
                            onDragOver={(e) => { e.preventDefault(); setIsFlagDragOver(true); }}
                            onDragLeave={() => setIsFlagDragOver(false)}
                            onDrop={(e) => {
                              e.preventDefault();
                              setIsFlagDragOver(false);
                              const file = e.dataTransfer.files?.[0];
                              if (file && file.type.startsWith('image/')) {
                                setFieldValue('flagFile', file);
                                setFlagPreview(URL.createObjectURL(file));
                              }
                            }}
                            className={cn(
                              'relative h-32 w-full rounded-2xl border-2 border-dashed flex items-center px-6 gap-6 cursor-pointer transition-all duration-300 group/file',
                              isFlagDragOver
                                ? 'border-primary bg-primary/10 scale-[1.02] shadow-lg shadow-primary/10'
                                : flagPreview
                                  ? 'border-primary/20 bg-primary/5 hover:border-primary/40'
                                  : 'border-glass-border bg-muted/10 hover:border-primary/40 hover:bg-primary/5'
                            )}
                          >
                            <div className="relative h-20 w-32 rounded-xl border-2 border-dashed border-glass-border flex items-center justify-center overflow-hidden bg-background/50 group/flaghouse shadow-sm transition-transform group-hover/file:scale-[1.02]">
                              {flagPreview ? (
                                <>
                                  <Image src={flagPreview} alt="Flag preview" fill className="object-cover" unoptimized />
                                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover/flaghouse:opacity-100 transition-opacity flex items-center justify-center">
                                    <Upload className="w-6 h-6 text-white" />
                                  </div>
                                </>
                              ) : (
                                <div className="flex flex-col items-center gap-1.5">
                                  <div className="p-2 rounded-full bg-primary/10">
                                    <Upload className="w-5 h-5 text-primary" />
                                  </div>
                                </div>
                              )}
                            </div>

                            <div className="flex-1 space-y-1">
                              <p className="text-sm font-bold text-foreground/80">
                                {isFlagDragOver ? t('release_to_drop_flag') : flagPreview ? t('change_flag_icon') : t('upload_custom_flag')}
                              </p>
                              <p className="text-[10px] text-muted-foreground leading-relaxed">
                                {t('file_format_extenstion')}<br />{t('recommended_size_160x100')}
                              </p>
                              <Input
                                type="file"
                                ref={fileInputRef}
                                accept="image/*"
                                onChange={handleFlagChange}
                                className="hidden"
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    <TranslationDropzone
                      translationFile={values.translationFile}
                      setTranslationFile={(file) => setFieldValue('translationFile', file)}
                      error={errors.translationFile as string}
                    />
                  </div>
                </div>

                <div className={cn(
                  "flex sm:items-center items-start justify-between sm:px-6 px-4 py-4 rounded-border-radius glass-dark-card border gap-4 w-full transition-opacity",
                  language?.is_default && "opacity-60 cursor-not-allowed"
                )}>
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={cn(
                      "h-4 w-4 rounded-full shrink-0",
                      values.isActive ? "bg-emerald-500 animate-pulse" : "bg-muted-foreground/30"
                    )} />
                    <div className="min-w-0 font-bold overflow-hidden">
                      <Label
                        className={cn(
                          "text-sm font-medium flex items-center gap-2 truncate",
                          !language?.is_default && "cursor-pointer"
                        )}
                        htmlFor="lang-active"
                      >
                        {t('global_availability')}
                        {language?.is_default && (
                          <span className="text-[9px] font-black uppercase text-primary/60 border border-primary/20 px-2 rounded-full">
                            {t('default')}
                          </span>
                        )}
                      </Label>
                    </div>
                  </div>
                  <Switch
                    id="lang-active"
                    checked={values.isActive}
                    onCheckedChange={(val) => setFieldValue('isActive', val)}
                    disabled={language?.is_default}
                    className="data-[state=checked]:bg-primary"
                  />
                </div>

                <DialogFooter className="sm:flex-row flex-col-reverse items-center gap-3 mt-4 w-full px-0">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onClose}
                    disabled={isLoading}
                    className="sm:h-12 h-10 rounded-border-radius bg-light-gray text-light-text-color dark:text-white font-medium w-full border-glass-border transition-all active:scale-95"
                  >
                    {t('cancel')}
                  </Button>
                  <Button
                    type="submit"
                    disabled={isLoading || !values.selectedLang || (isEditing && !dirty)}
                    className="sm:h-12 h-10 rounded-border-radius font-medium w-full bg-primary! text-white transition-all active:scale-95 gap-2"
                  >
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="w-4 h-4" />}
                    {isEditing ? t('apply_updates') : t('build_language')}
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
