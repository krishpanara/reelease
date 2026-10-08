'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Input from '@/components/ui/input'
import Label from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { ScrollArea } from '@/components/ui/scrollArea'
import { Switch } from '@/components/ui/switch'
import { cn } from '@/lib/utils'
import { languageOptions, translationFileOptions, languageSettingsOptions, configurationTips } from '@/data/languages'
import { Formik, Form, ErrorMessage } from 'formik'
import {
  ArrowLeft,
  Check,
  CheckCircle2,
  ChevronLeft,
  FileJson,
  Globe,
  Image as ImageIcon,
  Info,
  Plus,
  Search,
  ShieldCheck,
  Upload,
} from 'lucide-react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { FormValues, LanguageFormProps } from '@/types'
import { getFormSchema } from '@/utils/validation-schemas/language'

export const LanguageForm = ({ initialValues, onSubmit, isLoading, isEdit }: LanguageFormProps) => {
  const { t } = useTranslation()
  const router = useRouter()
  const FormSchema = getFormSchema(t)
  const [flagPreview, setFlagPreview] = useState<string | null>(() => {
    if (typeof initialValues?.flag === 'string') {
      if (initialValues.flag.startsWith('http') || initialValues.flag.startsWith('data:')) {
        return initialValues.flag
      }
      return `/${initialValues.flag.replace(/^\//, '')}?v=${Date.now()}`
    }
    return null
  })

  const [langSearch, setLangSearch] = useState('')
  const [isPopoverOpen, setIsPopoverOpen] = useState(false)
  const [isCustomLocale, setIsCustomLocale] = useState(false)

  const flagInputRef = useRef<HTMLInputElement>(null)
  const frontInputRef = useRef<HTMLInputElement>(null)
  const appInputRef = useRef<HTMLInputElement>(null)

  const formikInitialValues: FormValues = {
    name: initialValues?.name || '',
    locale: initialValues?.locale || '',
    is_rtl: initialValues?.is_rtl || false,
    is_active: initialValues?.is_active ?? true,
    is_default: initialValues?.is_default || false,
    flag: initialValues?.flag || null,
    front_translation_file: initialValues?.front_translation_file || null,
    app_translation_file: initialValues?.app_translation_file || null,
  }


  const handleFormSubmit = async (values: FormValues) => {
    const formData = new FormData()
    Object.entries(values).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        if (value instanceof File) {
          formData.append(key, value)
        } else {
          formData.append(key, String(value))
        }
      }
    })
    await onSubmit(formData)
  }

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: keyof FormValues,
    setFieldValue: (field: string, value: any) => void,
  ) => {
    const file = e.target.files?.[0]
    if (file) {
      setFieldValue(field, file)
      if (field === 'flag') {
        const reader = new FileReader()
        reader.onloadend = () => setFlagPreview(reader.result as string)
        reader.readAsDataURL(file)
      }
    }
  }

  return (
    <Formik
      initialValues={formikInitialValues}
      validationSchema={FormSchema}
      onSubmit={handleFormSubmit}
      enableReinitialize
    >
      {({ values, errors, touched, handleChange, handleBlur, setFieldValue, isValid, dirty }) => (
        <Form className="space-y-4 animate-in fade-in duration-300">
          {/* Sleek Toolbar Header */}
          <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="icon"
                onClick={() => router.back()}
                type="button"
                className="h-10 w-10 rtl:rotate-180 bg-primary/10 text-primary hover:bg-primary/10 hover:text-primary dark:bg-primary/20 rounded-radius transition-all shrink-0 border-none!"
              >
                <ArrowLeft className="h-4 w-4 text-primary" />
              </Button>
              <div>
                <h1 className="text-3xl font-bold leading-[1.3] dark:text-white">
                  <span className="text-title-color dark:text-white">
                    {(isEdit ? t('edit_language') : t('add_new_language')).split(' ')[0]}
                  </span>
                  {(isEdit ? t('edit_language') : t('add_new_language')).split(' ').length > 1 && (
                    <>
                      {' '}
                      <span className="text-primary title-color">
                        {(isEdit ? t('edit_language') : t('add_new_language')).split(' ').slice(1).join(' ')}
                      </span>
                    </>
                  )}
                </h1>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                onClick={() => router.back()}
                type="button"
                className="rounded-full h-10 font-bold dark:bg-white/3 bg-black/5  border text-xs hover:bg-destructive! hover:text-white! "
              >
                {t('cancel')}
              </Button>
              <Button type="submit" disabled={isLoading || !isValid || !dirty} className=" h-10 text-white! primary-btn gap-2">
                {isLoading ? (
                  <div className="h-3.5 w-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <CheckCircle2 className="h-3.5 w-3.5" />
                )}
                {isEdit ? t('update_language') : t('create_language')}
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
            {/* Left: Configuration Sections */}
            <div className="xl:col-span-8 space-y-6">
              {/* Identity Section */}
              <div className="glass-card rounded-border-radius overflow-hidden bg-white dark:bg-white/3">
                <div className="sm:px-6 px-4 py-4 border-b border-glass-border bg-muted/5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Globe className="h-5 w-5 text-primary" />
                    <h2 className="text-lg font-medium text-muted-foreground">{t('identity_locale')}</h2>
                  </div>
                  {values.locale && (
                    <Badge variant="outline" className="rounded-md font-mono text-[10px] bg-muted/30">
                      {values.locale}
                    </Badge>
                  )}
                </div>

                <div className="sm:p-6 p-4 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Select Language */}
                    <div className="space-y-2 flex flex-col">
                      <Label className="text-sm font-medium text-muted-foreground">{t('choose_language')}</Label>
                      <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            role="combobox"
                            className="w-full justify-between rounded-radius h-11 border-glass-border px-4 font-bold transition-all text-sm dark:bg-white/3"
                          >
                            <div className="flex items-center gap-3">
                              {values.locale === 'custom' ||
                              (values.locale && !languageOptions.find((l) => l.locale === values.locale)) ? (
                                <Plus className="h-4 w-4 text-primary" />
                              ) : (
                                <Globe className="h-4 w-4 text-primary" />
                              )}
                              {values.locale === 'custom' ||
                              (values.locale && !languageOptions.find((l) => l.locale === values.locale))
                                ? t('custom_language')
                                : languageOptions.find((l) => l.locale === values.locale)?.name || t('select_language')}
                            </div>
                            <ChevronLeft className="h-4 w-4 opacity-50 rotate-[-90deg]" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 border-glass-border rounded-border-radius shadow-2xl overflow-hidden ">
                          <div className="search-lining-content relative w-full py-2 px-3">
                            <Search className="absolute start-6 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground transition-colors z-30" />
                            <Input
                              placeholder={t('search_languages')}
                              value={langSearch}
                              onChange={(e) => setLangSearch(e.target.value)}
                              className="ps-10 pe-11 rounded-full!  py-2.5 text-base h-11 focus-visible:ring-0 w-full"
                            />
                          </div>
                          <ScrollArea className="h-64">
                            <div className="p-1.5">
                              {languageOptions
                                .filter(
                                  (l) =>
                                    l.name.toLowerCase().includes(langSearch.toLowerCase()) ||
                                    l.locale.toLowerCase().includes(langSearch.toLowerCase()),
                                )
                                .map((lang) => (
                                  <div
                                    key={lang.locale}
                                    onClick={() => {
                                      if (lang.locale === 'custom') {
                                        setIsCustomLocale(true)
                                        setFieldValue('locale', 'custom')
                                      } else {
                                        setIsCustomLocale(false)
                                        setFieldValue('locale', lang.locale)
                                        setFieldValue('name', lang.name)
                                      }
                                      setIsPopoverOpen(false)
                                      setLangSearch('')
                                    }}
                                    className={cn(
                                      'flex items-center px-3 py-2.5 rounded-lg text-sm font-bold cursor-pointer transition-all mb-0.5',
                                      values.locale === lang.locale
                                        ? 'bg-primary text-white shadow-md shadow-primary/20'
                                        : 'hover:bg-muted',
                                    )}
                                  >
                                    <div className="flex-1 flex items-center gap-3">
                                      {lang.locale === 'custom' ? (
                                        <Plus className="h-3.5 w-3.5" />
                                      ) : (
                                        <Globe className="h-3.5 w-3.5" />
                                      )}
                                      {lang.name}
                                      {lang.locale !== 'custom' && (
                                        <span
                                          className={cn(
                                            'text-[10px] uppercase font-bold',
                                            values.locale === lang.locale ? 'text-white' : 'text-muted-foreground',
                                          )}
                                        >
                                          ({lang.locale})
                                        </span>
                                      )}
                                    </div>
                                    {values.locale === lang.locale && <Check className="h-4 w-4 text-white" />}
                                  </div>
                                ))}
                            </div>
                          </ScrollArea>
                        </PopoverContent>
                      </Popover>
                    </div>

                    {/* Display Name */}
                    <div className="space-y-2 flex flex-col">
                      <Label className="text-sm font-medium text-muted-foreground">{t('display_name')}</Label>
                      <Input
                        name="name"
                        placeholder={t('e.g._english')}
                        value={values.name}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className={cn(
                          'rounded-radius h-11 border-glass-border px-4  text-sm focus:ring-primary/20 ',
                          touched.name && errors.name && 'border-destructive',
                        )}
                      />
                      <ErrorMessage name="name" component="div" className="text-xs text-destructive mt-1" />
                    </div>

                    {/* Dedicated Flag Asset */}
                    <div className="space-y-2 flex flex-col">
                      <Label className="text-sm font-medium text-muted-foreground">{t('flag_icon')}</Label>
                      <div
                        onClick={() => flagInputRef.current?.click()}
                        className="h-12 flex items-center gap-3 px-4 rounded-radius border border-glass-border dark:bg-white/3 transition-all cursor-pointer group"
                      >
                        <div className="h-8 w-8 rounded-radius border border-glass-border bg-primary/5 flex items-center justify-center overflow-hidden shrink-0">
                          {flagPreview ? (
                            <Image
                              src={flagPreview.startsWith('data:') || flagPreview.startsWith('blob:') || flagPreview.startsWith('http') ? flagPreview : process.env.NEXT_PUBLIC_STORAGE_URL + flagPreview}
                              alt="Flag"
                              unoptimized
                              className="object-cover h-full w-full text-primary"
                              width={400}
                              height={400}
                            />
                          ) : (
                            <ImageIcon className="h-4 w-4 text-muted-foreground/40" />
                          )}
                        </div>
                        <div className="flex-1 text-xs font-medium text-muted-foreground truncate">
                          {flagPreview ? t('change_flag_image') : t('upload_flag_image')}
                        </div>
                        <div className="h-7 w-7 rounded-radius bg-primary/5! flex items-center justify-center border border-glass-border  group-hover:text-primary transition-colors">
                          <Upload className="h-3 w-3 text-primary" />
                        </div>
                        <Input
                          type="file"
                          ref={flagInputRef}
                          className="hidden"
                          accept="image/*"
                          onChange={(e) => handleFileChange(e, 'flag', setFieldValue)}
                        />
                      </div>
                    </div>

                    {isCustomLocale && (
                      <div className="md:col-span-2 space-y-2 animate-in slide-in-from-top-2 duration-300">
                        <Label className="text-sm font-medium text-muted-foreground">{t('custom_locale_code')}</Label>
                        <Input
                          name="locale"
                          placeholder={t('e.g._pt-br')}
                          value={values.locale === 'custom' ? '' : values.locale}
                          onChange={(e) => setFieldValue('locale', e.target.value)}
                          onBlur={handleBlur}
                          className={cn(
                            'rounded-xl h-12 border-glass-border px-4  text-sm focus:ring-primary/20',
                            touched.locale && errors.locale && 'border-destructive',
                          )}
                        />
                        <ErrorMessage name="locale" component="div" className="text-xs text-destructive mt-1" />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Translation Files Section */}
              <div className="glass-card rounded-border-radius overflow-hidden bg-white dark:bg-white/3">
                <div className="sm:px-6 px-4 py-4 border-b border-glass-border  flex items-center gap-2">
                  <FileJson className="h-5 w-5 text-primary" />
                  <h2 className="text-lg font-medium text-muted-foreground">{t('system_translations')}</h2>
                </div>
                <div className="sm:p-6 p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {translationFileOptions.map((json) => {
                      const Icon = json.icon
                      const ref = json.id === 'front' ? frontInputRef : appInputRef
                      const field = json.field as keyof FormValues
                      return (
                        <div
                          key={json.id}
                          onClick={() => ref.current?.click()}
                          className={cn(
                            'sm:p-4 p-2 rounded-border-radius border border-glass-border bg-black/2 hover:bg-white/5 dark:bg-white/3 transition-all cursor-pointer flex items-center gap-4 group',
                            values[field] && 'border-primary/20 bg-primary/5',
                          )}
                        >
                          <div
                            className={cn(
                              'sm:h-12 sm:w-12 w-9 h-9 rounded-radius flex items-center justify-center transition-all',
                              values[field]
                                ? 'bg-primary! text-white'
                                : 'bg-white dark:bg-zinc-900 text-muted-foreground group-hover:text-primary border border-glass-border',
                            )}
                          >
                            {values[field] ? (
                              <CheckCircle2 className="sm:h-6 sm:w-6 w-4 h-4" />
                            ) : (
                              <Icon className="h-5 w-5" />
                            )}
                          </div>
                          <div className="flex-1 overflow-hidden">
                            <div className="text-sm font-black line-clamp-1 text-muted-foreground mb-0.5">
                              {t(json.labelKey)}
                            </div>
                            <div className="text-xs font-bold truncate">
                              {values[field]
                                ? values[field] instanceof File
                                  ? (values[field] as File).name
                                  : (values[field] as string).split('/').pop()
                                : t('select_translation_source')}
                            </div>
                          </div>
                          <Input
                            type="file"
                            ref={ref}
                            className="hidden"
                            accept=".json"
                            onChange={(e) => handleFileChange(e, field, setFieldValue)}
                          />
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Settings & Meta */}
            <div className="xl:col-span-4 space-y-6">
              <div className="glass-card rounded-border-radius overflow-hidden bg-white dark:bg-white/3">
                <div className="sm:px-6 px-4 py-4 border-b border-glass-border bg-muted/5 flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-primary" />
                  <h2 className="text-lg font-medium text-muted-foreground">{t('visibility_access')}</h2>
                </div>
                <div className="p-4 space-y-3">
                  {languageSettingsOptions.map((opt) => {
                    const field = opt.id as keyof FormValues
                    return (
                      <div
                        key={opt.id}
                        className="flex items-center justify-between py-3.5 px-5 rounded-full border border-glass-border transition-colors bg-black/2 dark:bg-white/3"
                      >
                        <div className="space-y-0.5">
                          <Label className="text-[14px] font-bold cursor-pointer" htmlFor={opt.id}>
                            {t(opt.labelKey)}
                          </Label>
                          <p className="text-[12px] text-muted-foreground font-medium line-clamp-1">{t(opt.descKey)}</p>
                        </div>
                        <Switch
                          id={opt.id}
                          checked={values[field] as boolean}
                          onCheckedChange={(val) => setFieldValue(opt.id, val)}
                        />
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className="bg-primary/5 rounded-border-radius border border-primary/10 sm:p-5 p-4 space-y-4">
                <div className="flex items-center gap-2 text-primary">
                  <Info className="h-5 w-5" />
                  <h3 className="text-[16px] font-bold">{t('configuration_tips')}</h3>
                </div>
                <div className="space-y-3">
                  {configurationTips.map((tip, i) => {
                    const Icon = tip.icon
                    return (
                      <div
                        key={i}
                        className="flex gap-2.5 text-[12px] font-semibold text-muted-foreground leading-relaxed"
                      >
                        <span className="text-primary/60 mt-0.5">
                          <Icon className="h-4 w-4" />
                        </span>
                        {t(tip.textKey)}
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        </Form>
      )}
    </Formik>
  )
}
