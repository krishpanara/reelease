'use client'

import DataLoader from '@/components/reusable/DataLoader'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Input from '@/components/ui/input'
import { Textarea } from '@/components/ui/textArea'
import { cn } from '@/lib/utils'
import { useGetLanguagesQuery, useGetTranslationsQuery, useUpdateTranslationsMutation } from '@/redux/api/languageApi'
import { ApiError } from '@/types/api'
import { ArrowLeft, ChevronLeft, FileJson, LayoutGrid, List as ListIcon, RotateCcw, Save, Search } from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

export default function ManageTranslations() {
  const { t } = useTranslation()
  const params = useParams()
  const router = useRouter()
  const id = params.id as string
  const [activeType, setActiveType] = useState<'front' | 'app'>('front')
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list')

  const {
    data: translationsData,
    isLoading: isTranslationsLoading,
    error: translationsError,
    refetch
  } = useGetTranslationsQuery(id)
  const { data: languagesData } = useGetLanguagesQuery({})
  const [updateTranslations, { isLoading: isUpdating }] = useUpdateTranslationsMutation()

  const language = useMemo(() =>
    languagesData?.data?.languages?.find((l: any) => l.id === id || l.locale === id),
    [languagesData, id]
  )

  const [editedTranslations, setEditedTranslations] = useState<Record<string, Record<string, string>>>({})

  const currentTranslations = useMemo(() => {
    const base = (translationsData?.data as any)?.[activeType] || {}
    return { ...base, ...(editedTranslations[activeType] || {}) }
  }, [translationsData, activeType, editedTranslations])

  const filteredKeys = useMemo(() => {
    const keys = Object.keys(currentTranslations)
    if (searchQuery.trim() === '') return keys

    const lowerSearch = searchQuery.toLowerCase()
    return keys.filter(key =>
      key.toLowerCase().includes(lowerSearch) ||
      String(currentTranslations[key] || '').toLowerCase().includes(lowerSearch)
    )
  }, [currentTranslations, searchQuery])

  const handleValueChange = (key: string, value: string) => {
    setEditedTranslations((prev) => ({
      ...prev,
      [activeType]: {
        ...(prev[activeType] || {}),
        [key]: value
      }
    }))
  }

  const handleSave = async () => {
    try {
      await updateTranslations({
        locale: id,
        translations: editedTranslations
      }).unwrap()
      toast.success(t('translations_updated_successfully'))
      setEditedTranslations({})
      refetch()
    } catch (error) {
      const apiError = error as ApiError
      toast.error(apiError?.data?.message || t('something_went_wrong'))
    }
  }

  const handleReset = () => {
    setEditedTranslations((prev) => {
      const next = { ...prev }
      delete next[activeType]
      return next
    })
  }

  if (isTranslationsLoading) return <DataLoader fullPage variant="spinner" />

  if (translationsError) {
    const apiError = translationsError as ApiError
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <p className="text-destructive font-medium">{apiError?.data?.message || t('failed_to_load_translations')}</p>
        <Button onClick={() => refetch()}>{t('retry')}</Button>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Refined Header */}
      <div className="flex flex-col sm:flex-row sm:items-center  justify-between gap-4">
        <div className="flex sm:items-center items-start  gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="rounded-radius h-10 w-10 border border-glass-border bg-primary/10 transition-all rtl:rotate-180"
          >
            <ArrowLeft className="h-5 w-5 text-primary" />
          </Button>
          <div>
            <div className="flex sm:flex-row flex-col items-center gap-2">
              <h1 className="text-2xl font-bold dark:text-white">
                <span className="text-title-color dark:text-white">
                  {t('manage_translations', 'Manage Translations').split(' ')[0]}
                </span>{' '}
                <span className="text-primary title-color">
                  {t('manage_translations', 'Manage Translations').split(' ').slice(1).join(' ')}
                </span>
              </h1>
              <Badge variant="outline" className="rounded-md h-6 px-3 sm:block hidden  text-xs font-bold text-primary bg-primary/10  border-primary!">
                {language?.name || id}
              </Badge>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            onClick={handleReset}
            disabled={!editedTranslations[activeType] || isUpdating}
            className="rounded-full h-10 w-full font-bold dark:bg-white/3 bg-black/5  border text-xs hover:bg-destructive! hover:text-white!"
          >
            <RotateCcw className="h-4 w-4" />
            {t('reset')}
          </Button>
          <Button
            onClick={handleSave}
            disabled={Object.keys(editedTranslations).length === 0 || isUpdating}
            className="h-10 text-white! primary-btn gap-2 w-full"
          >
            {isUpdating ? (
              <div className="h-4 w-4 text-white! rounded-full animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {t('save')}
          </Button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col md:flex-row sm:items-center justify-between! gap-4  shadow-none  ">
        <div className="relative sm:w-[700px]! w-full">
          <Search className="absolute left-3 rtl:right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground dark:text-white" />
          <Input
            placeholder={t('search_keys_or_values')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 rtl:pr-9 h-12 rounded-xl border-glass-border focus:ring-primary/20 transition-all  dark:bg-white/3 text-sm"
          />
        </div>
        <div className='flex flex-col sm:flex-row sm:w-full justify-end  sm:items-center gap-3'>
          <div className="flex items-center bg-muted/30 w-full md:justify-end">
            <div className='border border-glass-border p-1 rounded-full bg-black/3 dark:bg-white/3'>
              <Button
                variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                size="icon"
                onClick={() => setViewMode('list')}
                className={cn("h-8 w-8 rounded-lg transition-all", viewMode === 'list'
                  ? 'primary-btn  text-primary-foreground hover:bg-primary/90'
                  : 'hover:bg-muted bg-white/5 border border-glass-border')}
              >
                <ListIcon className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                size="icon"
                onClick={() => setViewMode('grid')}
                className={cn("h-8 w-8 rounded-lg transition-all", viewMode === 'grid'
                  ? 'primary-btn text-primary-foreground hover:bg-primary/90'
                  : 'hover:bg-muted bg-white/5 border border-glass-border')}
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="flex gap-2 bg-white/3 p-2 rounded-xl border border-glass-border w-full lg:w-70 ">
            {(['front', 'app'] as const).map((type) => (
              <Button
                key={type}
                onClick={() => setActiveType(type)}
                className={cn(
                  "flex-1 md:w-32 h-9 rounded-lg flex items-center justify-center gap-2  font-bold transition-all duration-300 text-xs",
                  activeType === type
                    ? "primary-btn text-white!"
                    : "text-muted-foreground bg-black/3 dark:bg-white/5! dark:text-white border border-glass-border hover:text-foreground"
                )}
              >
                <FileJson className="h-10 w-10" />
                {t(type)}
              </Button>
            ))}
          </div>
        </div>

      </div>

      <div className={cn(
        "grid gap-4 transition-all duration-300",
        viewMode === 'grid' ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"
      )}>
        {filteredKeys.length > 0 ? (
          filteredKeys.map((key) => {
            const isEdited = editedTranslations[activeType]?.[key] !== undefined
            return (
              <div
                key={key}
                className={cn(
                  "p-5 rounded-border-radius bg-white dark:bg-white/3 border transition-all duration-200 group glass-card hover-gradient-border",
                  isEdited ? "border-primary/30 bg-primary/[0.01]" : "border-glass-border"
                )}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="bg-black/3 dark:bg-white/5 px-3 py-1 rounded-lg text-sm font-bold text-title-color capitalize truncate max-w-[80%]">
                    <span>
                      {key}
                    </span>
                  </div>
                  {isEdited && (
                    <Badge variant="secondary" className="h-4 p-2.5 text-4xs font-bold bg-primary text-white border-none">
                      {t('modified')}
                    </Badge>
                  )}
                </div>
                <Textarea
                  value={currentTranslations[key] || ''}
                  onChange={(e) => handleValueChange(key, e.target.value)}
                  rows={viewMode === 'grid' ? 3 : 2}
                  className="w-full bg-black/3 dark:bg-white/5 border border-glass-border rounded-[12px]! p-3 text-sm font-medium resize-none focus:ring-2 focus:ring-primary/10 focus:border-primary/20 transition-all outline-none"
                  placeholder={t('enter_translation')}
                />
              </div>
            )
          })
        ) : (
          <div className="col-span-full py-20 flex flex-col items-center justify-center rounded-border-radius border border-glass-border dark:bg-white/3 bg-white">
            <Search className="h-10 w-10 text-muted-foreground/20 mb-4" />
            <h3 className="text-lg font-bold text-center">{t('no_keys_found')}</h3>
            <p className="text-muted-foreground text-xs font-medium mt-1">{t('try_adjusting_your_search')}</p>
          </div>
        )}
      </div>
    </div >
  )
}
