'use client'

import { Button } from '@/components/ui/button'
import Input from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { ServiceType } from '@/types'
import { Field } from 'formik'
import { ArrowLeft, Coins, Loader2, Play, Save, WandSparkles, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useTranslation } from 'react-i18next'
import Label from '@/components/ui/label'

export const ProviderFormHeader = ({
  isEditing,
  isLoading,
  onCancel,
}: {
  isEditing: boolean
  isLoading: boolean
  onCancel: () => void
}) => {
  const { t } = useTranslation()
  const router = useRouter()
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          type="button"
          className="h-10 w-10 bg-primary/10 text-primary hover:bg-primary/10 hover:text-primary dark:bg-primary/20 rounded-radius transition-all shrink-0"
          onClick={onCancel || (() => router.back())}
        >
          <ArrowLeft className="w-5 h-5 rtl:rotate-180" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold leading-[1.3] dark:text-white">
            <span className="text-title-color dark:text-white">
              {(isEditing ? t('ai_provider_edit') : t('ai_provider_add_new')).split(' ')[0]}
            </span>
            {(isEditing ? t('ai_provider_edit') : t('ai_provider_add_new')).split(' ').length > 1 && (
              <>
                {' '}
                <span className="text-primary title-color">
                  {(isEditing ? t('ai_provider_edit') : t('ai_provider_add_new')).split(' ').slice(1).join(' ')}
                </span>
              </>
            )}
          </h1>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          onClick={onCancel}
          type="button"
          className="transition-all leading-0 h-11 dark:bg-white/3 bg-black/3 hover:text-white! hover:bg-destructive! rounded-radius border-none! duration-200"
        >
          {t('cancel')}
        </Button>
        <Button type="submit" disabled={isLoading} className=" primary-btn rounded-radius text-white!">
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {isLoading ? t('saving') : t('save_changes')}
        </Button>
      </div>
    </div>
  )
}

export const ProviderNameField = ({
  errors,
  touched,
  isEditing,
  onTestClick,
}: {
  errors: any
  touched: any
  isEditing: boolean
  onTestClick: () => void
}) => {
  const { t } = useTranslation()
  return (
    <div className="glass-card p-3 sm:p-6 rounded-border-radius">
      <div className="flex flex-col md:flex-row md:items-end gap-4 justify-between">
        <div className="space-y-1.5 flex-1 max-w-md flex flex-col">
          <Label className="text-xs font-semibold text-muted-foreground ">
            {t('ai_provider_name')}
          </Label>
          <Field name="name">
            {({ field }: { field: any }) => (
              <Input
                {...field}
                placeholder={t('ai_provider_name_placeholder')}
                className="bg-background/50 border-glass-border focus-visible:ring-primary/20 focus-visible:border-primary"
              />
            )}
          </Field>
          {errors.name && touched.name && <p className="text-xs text-destructive">{errors.name}</p>}
        </div>

        {isEditing && (
          <Button
            type="button"
            onClick={onTestClick}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold border border-primary/30 bg-primary/10 text-primary! hover:bg-primary/20 transition-all duration-200 h-11"
          >
            <Play className="w-3 h-3" />
            {t('test_module', 'Test Module')}
          </Button>
        )}
      </div>
    </div>
  )
}

export const ProviderTabsList = ({
  mainTab,
  setMainTab,
}: {
  mainTab: 'services' | 'credits'
  setMainTab: (t: 'services' | 'credits') => void
}) => {
  const { t } = useTranslation()
  return (
    <div className="flex items-center gap-2 border-b border-glass-border">
      <Button
        type="button"
        variant="ghost"
        onClick={() => setMainTab('services')}
        className={cn(
          'px-4 py-2.5 text-sm font-semibold transition-all duration-200 border-b-2 rounded-none h-auto bg-transparent! shadow-none!',
          mainTab === 'services'
            ? 'border-primary text-primary'
            : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground/30',
        )}
      >
        <WandSparkles className="w-4 h-4" />
        {t('service_types', 'Service Types')}
      </Button>
      <Button
        type="button"
        variant="ghost"
        onClick={() => setMainTab('credits')}
        className={cn(
          'px-4 py-2.5 text-sm font-semibold transition-all duration-200 border-b-2 rounded-none h-auto bg-transparent! shadow-none!',
          mainTab === 'credits'
            ? 'border-yellow-400 text-yellow-400 hover:text-yellow-400'
            : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground/30',
        )}
      >
        <div className="flex items-center gap-2">
          <Coins className="w-4 h-4" />
          {t('credits', 'Credits')}
        </div>
      </Button>
    </div>
  )
}

export const ProviderServiceVerticalTabs = ({
  serviceTabs,
  activeTab,
  setActiveTab,
  enabledServices,
  onClose,
}: {
  serviceTabs: any[]
  activeTab: string
  setActiveTab: (t: ServiceType) => void
  enabledServices: Set<ServiceType>
  onClose?: () => void
}) => {
  const { t } = useTranslation()
  return (
    <div className="w-70 shrink-0 border-r rtl:border-r-0 rtl:border-l border-glass-border bg-white/3 dark:bg-white/3 p-3 space-y-1.5">
      <div className="flex items-center  justify-between px-3 pb-1">
        <p className="text-sm font-semibold  text-muted-foreground">{t('ai_provider_services')}</p>
        {onClose && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8 rounded-full xl:hidden"
          >
            <X className="w-4 h-4 text-muted-foreground hover:text-foreground" />
          </Button>
        )}
      </div>
      {serviceTabs.map((tab) => {
        const isEnabled = enabledServices.has(tab.key as ServiceType)
        const isActive = activeTab === tab.key
        return (
          <Button
            key={tab.key}
            type="button"
            variant="ghost"
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              'w-full flex items-center gap-3 px-3 py-2.5 rounded-radius text-sm font-medium transition-all duration-200 text-left rtl:text-right h-auto justify-start',
              isActive
                ? 'bg-primary/10 border border-primary/30 text-primary  hover:bg-primary/10 hover:text-primary'
                : 'text-muted-foreground dark:hover:bg-muted/40! hover:bg-black/3',
            )}
          >
            <span
              className={cn(
                'flex-shrink-0 transition-colors duration-200',
                isActive ? 'text-primary' : isEnabled ? tab.color.split(' ')[0] : '',
              )}
            >
              {tab.icon}
            </span>
            <span className="truncate">{tab.label}</span>
            {isEnabled && <div className="ml-auto rtl:mr-auto rtl:ml-0 w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />}
          </Button>
        )
      })}
    </div>
  )
}
