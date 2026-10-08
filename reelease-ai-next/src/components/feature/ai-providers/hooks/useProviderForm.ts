'use client'

import { useState, useEffect } from 'react'
import { AIProvider, ServiceType, ServiceConfig, CreateAIProviderRequest } from '@/types'
import { 
  useCreateAIProviderMutation, 
  useUpdateAIProviderMutation, 
  useGetAIFeatureCreditsQuery, 
  useUpsertAIFeatureCreditMutation, 
} from '@/redux/api/aiProviderApi'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'

const emptyService = (): Partial<ServiceConfig> => ({
  api_key: '',
  base_url: '',
  auth_type: 'Bearer Token',
  create_job_request: {
    endpoint: '',
    method: 'POST',
    payload: '',
    job_id_path: '',
  },
  poll_job_status: {
    endpoint: '',
    method: 'GET',
    state_path: '',
    success_state_value: '',
    failed_state_value: '',
    result_media_url_path: '',
  },
})

export function useProviderForm(editingProvider: AIProvider | null | undefined, onSuccess: () => void) {
  const { t } = useTranslation()
  const [mainTab, setMainTab] = useState<'services' | 'credits'>('services')
  const [activeTab, setActiveTab] = useState<ServiceType>('text_to_image')
  const [enabledServices, setEnabledServices] = useState<Set<ServiceType>>(new Set())

  const [createProvider, { isLoading: isCreating }] = useCreateAIProviderMutation()
  const [updateProvider, { isLoading: isUpdating }] = useUpdateAIProviderMutation()
  const isLoading = isCreating || isUpdating

  const isEditing = !!editingProvider
  const providerId = editingProvider?.id || editingProvider?._id
  
  const { data: creditsData } = useGetAIFeatureCreditsQuery(
    providerId as string,
    { skip: !isEditing || !providerId }
  )
  const [upsertCredit] = useUpsertAIFeatureCreditMutation()

  useEffect(() => {
    if (editingProvider) {
      const enabled = new Set<ServiceType>()
      const keys: ServiceType[] = ['text_to_image', 'image_to_image', 'video_motion', 'images_to_video', 'text_to_video']
      keys.forEach((k) => {
        if (editingProvider[k]) enabled.add(k)
      })
      setEnabledServices(enabled)
    }
  }, [editingProvider])

  const buildInitialValues = () => {
    const base = {
      name: editingProvider?.name || '',
    }
    const services: Record<ServiceType, Partial<ServiceConfig>> = {
      text_to_image: editingProvider?.text_to_image || emptyService(),
      image_to_image: editingProvider?.image_to_image || emptyService(),
      video_motion: editingProvider?.video_motion || emptyService(),
      images_to_video: editingProvider?.images_to_video || emptyService(),
      text_to_video: editingProvider?.text_to_video || emptyService(),
    }
    
    const creditConfig: Record<string, { credits: number, is_per_second: string }> = {
      text_to_image: { credits: 0, is_per_second: 'false' },
      image_to_image: { credits: 0, is_per_second: 'false' },
      video_motion: { credits: 0, is_per_second: 'false' },
      images_to_video: { credits: 0, is_per_second: 'false' },
      text_to_video: { credits: 0, is_per_second: 'false' },
    }

    if (creditsData?.credits) {
      creditsData.credits.forEach((c) => {
        if (creditConfig[c.feature_key]) {
          creditConfig[c.feature_key] = {
            credits: c.credits,
            is_per_second: c.is_per_second ? 'true' : 'false',
          }
        }
      })
    }

    return { ...base, ...services, creditConfig }
  }

  const toggleService = (key: ServiceType) => {
    setEnabledServices((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
    setActiveTab(key)
  }

  const handleSubmit = async (values: any) => {
    const payload: CreateAIProviderRequest = { name: values.name }
    const keys: ServiceType[] = ['text_to_image', 'image_to_image', 'video_motion', 'images_to_video', 'text_to_video']
    
    keys.forEach((k) => {
      if (enabledServices.has(k)) {
        payload[k] = values[k] as ServiceConfig
      }
    })

    try {
      let savedProviderId = ''
      if (isEditing && (editingProvider?.id || editingProvider?._id)) {
        const idToUpdate = editingProvider.id || editingProvider._id!
        await updateProvider({ id: idToUpdate, data: payload }).unwrap()
        savedProviderId = idToUpdate
        toast.success(t('ai_provider_updated_successfully'))
      } else {
        const response = await createProvider(payload).unwrap()
        savedProviderId = response.provider?.id || response.provider?._id || ''
        toast.success(t('ai_provider_created_successfully'))
      }

      if (savedProviderId) {
        const promises = keys.filter(k => enabledServices.has(k)).map(k => {
          const config = values.creditConfig[k]
          // We don't have serviceTabs here but we can pass names or just use keys
          return upsertCredit({
            provider_id: savedProviderId,
            feature_key: k,
            display_name: k.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
            credits: Number(config.credits) || 0,
            is_per_second: config.is_per_second === 'true'
          }).unwrap().catch(() => {})
        })
        await Promise.all(promises)
      }

      onSuccess()
    } catch {
      toast.error(t('ai_provider_save_failed'))
    }
  }
  return {
    mainTab,
    setMainTab,
    activeTab,
    setActiveTab,
    enabledServices,
    isLoading,
    buildInitialValues,
    toggleService,
    handleSubmit,
    isEditing
  }
}
