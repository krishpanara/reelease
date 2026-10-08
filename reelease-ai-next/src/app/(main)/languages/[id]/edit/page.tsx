'use client'

import { useGetLanguageByIdQuery, useUpdateLanguageMutation } from '@/redux/api/languageApi'
import { useParams, useRouter } from 'next/navigation'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { ApiError } from '@/types/api'
import { LanguageForm } from '@/components/feature/languages/LanguageForm'
import DataLoader from '@/components/reusable/DataLoader'

import { usePermission } from '@/hooks/usePermission'
import { PERMISSIONS } from '@/constants/permissions'
import { useEffect } from 'react'
import { ROUTES } from '@/constants/routes'

export default function EditLanguagePage() {
  const { t } = useTranslation()
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  const { hasPermission } = usePermission()

  useEffect(() => {
    if (!hasPermission(PERMISSIONS.UPDATE_LANGUAGES)) {
      router.replace(ROUTES.LANGUAGES)
    }
  }, [hasPermission, router])

  const { data: languageData, isLoading: isFetching } = useGetLanguageByIdQuery(id)
  const [updateLanguage, { isLoading: isUpdating }] = useUpdateLanguageMutation()

  if (!hasPermission(PERMISSIONS.UPDATE_LANGUAGES)) return null

  const handleSubmit = async (formData: FormData) => {
    try {
      const res = await updateLanguage({ id, data: formData }).unwrap()
      toast.success(res.message || t('language_updated_successfully'))
      router.push(ROUTES.LANGUAGES)
    } catch (error) {
      const apiError = error as ApiError
      toast.error(apiError?.data?.message || t('something_went_wrong'))
    }
  }

  if (isFetching) return <DataLoader fullPage variant="spinner" />

  return (
    <div>
      <LanguageForm 
        initialValues={languageData?.data} 
        onSubmit={handleSubmit} 
        isLoading={isUpdating} 
        isEdit 
      />
    </div>
  )
}
