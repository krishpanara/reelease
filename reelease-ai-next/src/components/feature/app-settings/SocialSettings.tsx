'use client'

import SocialConfigForm from '@/components/feature/social-media/channels/SocialConfigForm'
import Spinner from '@/components/reusable/Spinner'
import { useGetAdminSettingsQuery } from '@/redux/api/adminSettingApi'

const SocialSettings = () => {
  const { data: settingsData, isLoading: isFetching, refetch } = useGetAdminSettingsQuery(undefined)

  if (isFetching) {
    return <Spinner className="h-auto py-20" size="md" />
  }

  const settings = settingsData?.settings || {}

  const initialValues = {
    facebook_app_id: settings.facebook_app_id || '',
    facebook_app_secret: settings.facebook_app_secret || '',
    facebook_api_version: settings.facebook_api_version || 'v19.0',
    threads_app_id: settings.threads_app_id || '',
    threads_app_secret: settings.threads_app_secret || '',
    linkedin_client_id: settings.linkedin_client_id || '',
    linkedin_client_secret: settings.linkedin_client_secret || '',
    twitter_consumer_key: settings.twitter_consumer_key || '',
    twitter_consumer_secret: settings.twitter_consumer_secret || '',
    twitter_oauth_token: settings.twitter_oauth_token || '',
    twitter_oauth_token_secret: settings.twitter_oauth_token_secret || '',
    twitter_client_id: settings.twitter_client_id || '',
    twitter_client_secret: settings.twitter_client_secret || '',
    youtube_client_id: settings.youtube_client_id || '',
    youtube_client_secret: settings.youtube_client_secret || '',
  }

  return (
    <div className="space-y-6">
      <SocialConfigForm initialValues={initialValues} onSuccess={() => refetch()} />
    </div>
  )
}

export default SocialSettings
