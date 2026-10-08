'use client'

import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdownMenu'
import { useAppDirection } from '@/hooks/useAppDirection'
import { cn } from '@/lib/utils'
import { useGetActiveLanguagesQuery } from '@/redux/api/languageApi'
import { setDirection } from '@/redux/slices/layoutSlice'
import { Language } from '@/types/language'
import { ChevronDown, Check, Languages } from 'lucide-react'
import Image from 'next/image'
import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch } from 'react-redux'

interface LanguageDropdownProps {
  variant?: 'default' | 'pill' | 'auth'
}

const LanguageDropdown = ({ variant = 'default' }: LanguageDropdownProps) => {
  const { i18n, t } = useTranslation()
  const dispatch = useDispatch()
  const { data: languagesData, isLoading } = useGetActiveLanguagesQuery({})
  const [currentLanguage, setCurrentLanguage] = useState<Language | null>(null)
  const [lastDefaultLocale, setLastDefaultLocale] = useState<string | null>(null)
  const direction = useAppDirection()

  const activeLanguages = useMemo(() => languagesData?.data?.languages || [], [languagesData])

  useEffect(() => {
    if (activeLanguages.length > 0) {
      activeLanguages.forEach((lang) => {
        if (lang.translation_json) {
          try {
            const resources =
              typeof lang.translation_json === 'string' ? JSON.parse(lang.translation_json) : lang.translation_json
            i18n.addResourceBundle(lang.locale, 'translation', resources, true, true)
          } catch (error) {
            console.error(`Failed to parse translation for ${lang.locale}:`, error)
          }
        }
      })

      // Force refresh of translations for the current language to apply newly added bundles
      i18n.changeLanguage(i18n.language)

      const defaultLang = activeLanguages.find((l) => l.is_default) || activeLanguages[0]
      const currentLocale = i18n.language
      const detectedLang = activeLanguages.find((l) => l.locale === currentLocale)

      if (detectedLang) {
        setCurrentLanguage(detectedLang)
        dispatch(setDirection(detectedLang.is_rtl ? 'rtl' : 'ltr'))
        setLastDefaultLocale(defaultLang.locale)
      } else if (defaultLang && defaultLang.locale !== lastDefaultLocale) {
        i18n.changeLanguage(defaultLang.locale)
        setCurrentLanguage(defaultLang)
        setLastDefaultLocale(defaultLang.locale)
        dispatch(setDirection(defaultLang.is_rtl ? 'rtl' : 'ltr'))
      }
    }
  }, [activeLanguages, i18n, lastDefaultLocale, dispatch])

  // Update HTML lang attribute
  useEffect(() => {
    if (typeof window !== 'undefined') {
      document.documentElement.lang = i18n.language || 'en'
      // removed global dir setting to keep layout fixed as per user request
      document.documentElement.dir = 'ltr'
    }
  }, [i18n.language])

  const handleLanguageChange = (lang: Language) => {
    i18n.changeLanguage(lang.locale)
    setCurrentLanguage(lang)
    dispatch(setDirection(lang.is_rtl ? 'rtl' : 'ltr'))
  }

  const getLanguageIcon = (lang: Language) => {
    if (lang.flag) {
      const storageUrl = process.env.NEXT_PUBLIC_STORAGE_URL || ''
      const flagPath = lang.flag || ''

      // Use versioning query param to bust cache when flag is updated
      // const version = new Date(lang.updated_at || lang.created_at || Date.now()).getTime()

      const timestamp = lang.updated_at ?? lang.created_at
      const version = timestamp ? new Date(timestamp).getTime() : 0

      const flagUrl = flagPath.startsWith('http')
        ? flagPath
        : // : `/api/${flagPath.replace(/^\//, '')}?v=${version}`
        // : `http://localhost:3000/${flagPath.replace(/^\//, '')}?v=${version}`
        `${storageUrl}/${flagPath.replace(/^\//, '')}?v=${version}`

      return (
        <Image
          src={flagUrl}
          alt={lang.name}
          width={24}
          height={24}
          unoptimized
          className="w-6 h-6 object-cover inline-block rounded-radius"
          onError={(e) => {
            ; (e.target as HTMLImageElement).style.display = 'none'
          }}
        />
      )
    }
    return (
      lang.emoji || (
        <Languages className="w-[18px]! h-[18px]! text-subtitle-color  dark:text-white/70 transition-colors duration-300" />
      )
    )
  }

  if (isLoading || activeLanguages.length === 0) {
    if (variant === 'pill') {
      return (
        <Button variant="ghost" disabled className="flex items-center gap-2 px-3 sm:px-4 h-9 sm:h-11 rounded-full! transition-all duration-300 opacity-50">
          <Languages className="h-4 w-4 animate-pulse text-subtitle-color" />
          <span className="text-sm font-medium text-title-color">Loading...</span>
        </Button>
      )
    }
    return (
      <Button
        variant="ghost"
        disabled
        className="flex items-center p-0! gap-1.5 h-9 w-9 sm:h-11 sm:w-11 transition-all duration-300 group opacity-50 rounded-full!"
      >
        <div className="flex items-center justify-center text-primary ">
          <Languages className="h-4 w-4 animate-pulse" />
        </div>
      </Button>
    )
  }

  return (
    <DropdownMenu dir={direction}>
      <DropdownMenuTrigger asChild>
        {variant === 'auth' ? (
          <Button
            variant="outline"
            title={t('lang_label')}
            className="flex items-center gap-2 px-3 h-10 rounded-full! bg-white dark:bg-white/5 backdrop-blur-2xl border border-gray-200 dark:border-white/10 shadow-sm hover:bg-gray-50 dark:hover:bg-white/10 transition-all duration-300 group cursor-pointer"
          >
            <div className="flex items-center text-subtitle-color dark:text-white/70 group-hover:text-primary transition-colors duration-200">
              {currentLanguage && currentLanguage.flag ? getLanguageIcon(currentLanguage) : <Languages className="h-[18px] w-[18px]" />}
            </div>
            <span className="text-[13px] font-semibold text-title-color dark:text-white group-hover:text-primary transition-colors duration-200 uppercase">
              {currentLanguage?.locale || 'EN'}
            </span>
            <ChevronDown className="h-3.5 w-3.5 text-subtitle-color dark:text-white/70 group-hover:text-primary transition-colors duration-200 ml-0.5" />
          </Button>
        ) : variant === 'pill' ? (
          <Button
            variant="ghost"
            title={t('lang_label')}
            className="flex items-center gap-2 px-3 sm:px-4 h-9 sm:h-11 rounded-full! hover:bg-transparent hover:text-primary transition-all duration-300 group"
          >
            <div className="flex items-center text-subtitle-color dark:text-white/70 group-hover:text-primary transition-colors duration-200">
              {currentLanguage && currentLanguage.flag ? getLanguageIcon(currentLanguage) : <Languages className="h-[18px] w-[18px]" />}
            </div>
            {/* <span className="text-sm font-medium text-title-color group-hover:text-primary transition-colors duration-200">
              {currentLanguage?.name || 'English'}
            </span> */}
            {/* <ChevronDown className="h-4 w-4 text-subtitle-color dark:text-white/70 group-hover:text-primary transition-colors duration-200 ml-1" /> */}
          </Button>
        ) : (
          <Button
            variant="ghost"
            title={t('lang_label')}
            className="flex items-center p-0! gap-1.5 h-9 w-9 sm:h-11 sm:w-11 bg-black/3 dark:bg-white/3 transition-all duration-300 group rounded-border-radius-inner! hover:bg-black/3!"
          >
            <div className="flex items-center justify-center text-primary transition-transform duration-200">
              <span className="text-base leading-none">
                {currentLanguage ? getLanguageIcon(currentLanguage) : <Languages className="h-6 w-6" />}
              </span>
            </div>
          </Button>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        collisionPadding={16}
        className="w-[calc(100vw-32px)] sm:w-60 p-2 mt-2 border border-border bg-white dark:bg-white/3  backdrop-blur-3xl rounded-border-radius! glass-dark-card shadow-2xl animate-in fade-in zoom-in duration-200 z-50"
      >
        <div className="px-2 py-1.5 mb-1.5">
          <p className="text-sm font-medium text-subtitle-color">{t('quick_select_language')}</p>
        </div>
        <div className="space-y-1 no-scrollbar max-h-47.5 overflow-auto">
          {activeLanguages.map((lang) => (
            <DropdownMenuItem
              key={lang.id}
              onClick={() => handleLanguageChange(lang)}
              className={cn(
                'flex items-center justify-between px-3 py-2.5 glass-card glass-dark-card rounded-radius cursor-pointer transition-all duration-200',
                i18n.language === lang.locale
                  ? 'bg-primary/10 text-primary! hover:text-primary hover:bg-primary/10!'
                  : 'hover:bg-accent',
              )}
            >
              <div className="flex items-center gap-3">
                <span className="text-xl leading-none grayscale-[0.2] group-hover:grayscale-0">
                  {getLanguageIcon(lang)}
                </span>
                <div className="flex flex-col">
                  <span className="text-sm font-bold tracking-tight dark:text-white">{lang.name}</span>
                  <span className="text-xs text-subtitle-color text-left rtl:text-right">{lang.locale}</span>
                </div>
              </div>
              {i18n.language === lang.locale && <Check className="h-4 w-4 stroke-[3px]" />}
            </DropdownMenuItem>
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default LanguageDropdown
