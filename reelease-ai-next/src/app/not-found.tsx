'use client'

import StatusPage from '@/components/reusable/StatusPage'
import { FileQuestion } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import useSettings from '@/hooks/useSettings'
import { getMediaUrl } from '@/utils'

export default function NotFound() {
  const { t } = useTranslation()
  const { settings } = useSettings()

  return (
    <StatusPage
      title={settings?.page_404_title || t('error_404_title')}
      description={settings?.page_404_content || t('error_404_desc')}
      image={getMediaUrl(settings?.page_404_image_url)}
      errorCode="404"
      icon={FileQuestion}
      showHome={true}
    />
  )
}

