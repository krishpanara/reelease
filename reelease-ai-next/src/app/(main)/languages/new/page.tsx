'use client'

import { useCreateLanguageMutation } from '@/redux/api/languageApi'
import { useRouter } from 'next/navigation'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { ApiError } from '@/types/api'
import { LanguageForm } from '@/components/feature/languages/LanguageForm'

import { usePermission } from '@/hooks/usePermission'
import { PERMISSIONS } from '@/constants/permissions'
import { useEffect } from 'react'

export default function AddLanguagePage() {
  const { t } = useTranslation()
  const router = useRouter()
  const { hasPermission } = usePermission()
  const [createLanguage, { isLoading }] = useCreateLanguageMutation()

  useEffect(() => {
    if (!hasPermission(PERMISSIONS.CREATE_LANGUAGES)) {
      router.replace('/languages')
    }
  }, [hasPermission, router])

  if (!hasPermission(PERMISSIONS.CREATE_LANGUAGES)) return null

  const handleSubmit = async (formData: FormData) => {
    try {
      const res = await createLanguage(formData).unwrap()
      toast.success(res.message || t('language_created_successfully'))
      router.push('/languages')
    } catch (error) {
      const apiError = error as ApiError
      toast.error(apiError?.data?.message || t('something_went_wrong'))
    }
  }

  return (
    <div>
      <LanguageForm onSubmit={handleSubmit} isLoading={isLoading} />
    </div>
  )
}
