'use client'

import DataLoader from '@/components/reusable/DataLoader'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Input from '@/components/ui/input'
import { Textarea } from '@/components/ui/textArea'
import { cn } from '@/lib/utils'
import { useGetLanguagesQuery, useGetTranslationsQuery, useUpdateTranslationsMutation } from '@/redux/api/languageApi'
import { ApiError } from '@/types/api'
import { ChevronLeft, FileJson, LayoutGrid, List as ListIcon, RotateCcw, Save, Search } from 'lucide-react'
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
    const base = translationsData?.data?.[activeType] || {}
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-border-radius glass-card">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="rounded-xl h-10 w-10 border border-glass-border hover:bg-primary/10 transition-all"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight">{t('manage_translations')}</h1>
              <Badge variant="secondary" className="rounded-md h-5 px-2 text-[10px] font-bold bg-primary/10 text-primary border-primary/20 uppercase">
                {language?.name || id}
              </Badge>
            </div>
            <p className="text-muted-foreground text-xs font-medium mt-0.5">{t('edit_localization_keys_desc')}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            onClick={handleReset}
            disabled={!editedTranslations[activeType] || isUpdating}
            className="rounded-xl h-10 px-5 font-bold text-xs  hover:bg-muted"
          >
            <RotateCcw className="h-4 w-4" />
            {t('reset')}
          </Button>
          <Button
            onClick={handleSave}
            disabled={Object.keys(editedTranslations).length === 0 || isUpdating}
            className="rounded-full! h-10 px-6 font-medium text-xs bg-primary! hover:bg-primary/90 hover:rounded-full text-black! cursor-pointer gap-2"
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
      <div className="flex flex-col md:flex-row items-center gap-4  p-4 rounded-border-radius glass-card">
        <div className="flex bg-muted/50 p-2 rounded-xl border border-glass-border w-full md:w-96">
          {(['front', 'app'] as const).map((type) => (
            <Button
              key={type}
              onClick={() => setActiveType(type)}
              className={cn(
                "flex-1 md:w-32 h-10 rounded-lg flex items-center justify-center gap-2 text-[11px] font-bold uppercase tracking-wider transition-all",
                activeType === type
                  ? "bg-white dark:bg-zinc-900 text-primary shadow-sm border border-glass-border"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <FileJson className="h-3.5 w-3.5" />
              {t(type)}
            </Button>
          ))}
        </div>

        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t('search_keys_or_values')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-12 rounded-xl border-glass-border focus:ring-primary/20 transition-all bg-white dark:bg-card shadow-sm text-sm"
          />
        </div>

        <div className="flex items-center gap-1 bg-muted/30 p-1 rounded-xl border border-glass-border">
          <Button
            variant={viewMode === 'list' ? 'secondary' : 'ghost'}
            size="icon"
            onClick={() => setViewMode('list')}
            className={cn("h-8 w-8 rounded-lg transition-all", viewMode === 'list' && "shadow-sm bg-white dark:bg-zinc-800 text-primary")}
          >
            <ListIcon className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
            size="icon"
            onClick={() => setViewMode('grid')}
            className={cn("h-8 w-8 rounded-lg transition-all", viewMode === 'grid' && "shadow-sm bg-white dark:bg-zinc-800 text-primary")}
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
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
                  "p-5 rounded-border-radius border transition-all duration-200 group glass-card hover-gradient-border",
                  isEdited ? "border-primary/30 bg-primary/[0.01]" : "border-glass-border"
                )}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="bg-muted/90 px-3 py-1 rounded-lg text-[10px] font-bold text-muted-foreground uppercase tracking-wider font-mono truncate max-w-[80%]">
                    <span className="transition-all duration-300 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-primary group-hover:to-secondary1">
                      {key}
                    </span>
                  </div>
                  {isEdited && (
                    <Badge variant="secondary" className="h-4 px-1.5 text-[8px] font-bold bg-primary text-white border-none uppercase">
                      {t('modified')}
                    </Badge>
                  )}
                </div>
                <Textarea
                  value={currentTranslations[key] || ''}
                  onChange={(e) => handleValueChange(key, e.target.value)}
                  rows={viewMode === 'grid' ? 3 : 2}
                  className="w-full bg-muted/20 border border-glass-border rounded-border-radius p-3 text-sm font-medium resize-none focus:ring-2 focus:ring-primary/10 focus:border-primary/20 transition-all outline-none"
                  placeholder={t('enter_translation')}
                />
              </div>
            )
          })
        ) : (
          <div className="col-span-full py-20 flex flex-col items-center justify-center  rounded-border-radius border border-dashed border-glass-border">
            <Search className="h-10 w-10 text-muted-foreground/20 mb-4" />
            <h3 className="text-lg font-bold">{t('no_keys_found')}</h3>
            <p className="text-muted-foreground text-xs font-medium mt-1">{t('try_adjusting_your_search')}</p>
          </div>
        )}
      </div>
    </div>
  )
}
