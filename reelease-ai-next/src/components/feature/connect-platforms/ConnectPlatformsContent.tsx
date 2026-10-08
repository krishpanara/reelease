'use client'

import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { Link2 } from 'lucide-react'
import { useFacebookSDK } from '@/components/providers/FacebookSDKProvider'
import {
  useConnectFacebookAccountMutation,
  useConnectThreadsAccountMutation,
  useConnectLinkedInAccountMutation,
  useConnectTwitterAccountMutation,
  useConnectYouTubeAccountMutation,
  useGetLinkedInSDKConfigQuery,
  useGetSocialAccountsQuery,
  useGetThreadsSDKConfigQuery,
  useGetTwitterSDKConfigQuery,
  useGetYouTubeSDKConfigQuery,
  useGetChannelStatsQuery,
} from '@/redux/api/socialApi'
import { useGetPublicSettingsQuery } from '@/redux/api/adminSettingApi'
import { useGetUserSubscriptionQuery } from '@/redux/api/subscriptionApi'
import { useAppSelector } from '@/redux/hooks'
import { resolveChannelLimit } from '@/utils/channelLimit'

import PlatformGrid from './components/PlatformGrid'
import WorkspaceOverview from './components/WorkspaceOverview'
import SetupGuide from './components/SetupGuide'
import FooterInfo from './components/FooterInfo'
import { WorkspaceOverviewStats } from '@/types/connectPlatforms'
import { availablePlatforms } from '@/data/connectPlatformsData'
import { PageHeader } from '@/components/reusable/PageHeader'

const ConnectPlatformsContent = () => {
  const { t } = useTranslation()
  const { isSDKReady, appId } = useFacebookSDK()
  const { data: accountsResp, isLoading: isAccountsLoading, refetch } = useGetSocialAccountsQuery({ include_inactive: true })
  const allAccounts = accountsResp?.data || []
  const { data: channelStatsData } = useGetChannelStatsQuery('month')

  const user = useAppSelector((s) => s.auth.user)
  const isSuperAdmin =
    user?.role === 'super_admin' ||
    (user?.roleId as any)?.name === 'super_admin' ||
    (user?.role as any)?.name === 'super_admin'
  const { data: subscriptionResp } = useGetUserSubscriptionQuery(undefined, { skip: isSuperAdmin })
  const { data: publicSettingsResp } = useGetPublicSettingsQuery(undefined)

  const isAdmin = useMemo(() => {
    const roleName = typeof user?.role === 'object' && user?.role ? (user.role as any).name : user?.role
    const roleIdName = typeof user?.roleId === 'object' && user?.roleId ? (user.roleId as any).name : user?.roleId

    return roleName === 'super_admin' || roleIdName === 'super_admin' || roleName === 'admin' || roleIdName === 'admin'
  }, [user])

  const channelLimit = useMemo(
    () => resolveChannelLimit(subscriptionResp, publicSettingsResp?.data),
    [subscriptionResp, publicSettingsResp],
  )

  const [connectFacebook] = useConnectFacebookAccountMutation()
  const [connectThreads] = useConnectThreadsAccountMutation()
  const [connectLinkedIn] = useConnectLinkedInAccountMutation()
  const [connectTwitter] = useConnectTwitterAccountMutation()
  const [connectYouTube] = useConnectYouTubeAccountMutation()

  const [connectingPlatform, setConnectingPlatform] = useState<string | null>(null)

  const { data: linkedInConfig } = useGetLinkedInSDKConfigQuery(undefined, {
    skip: !!connectingPlatform && connectingPlatform !== 'linkedin',
  })
  const { data: twitterConfig } = useGetTwitterSDKConfigQuery(undefined, {
    skip: !!connectingPlatform && connectingPlatform !== 'twitter',
  })
  const { data: youtubeConfig } = useGetYouTubeSDKConfigQuery(undefined, {
    skip: !!connectingPlatform && connectingPlatform !== 'youtube',
  })
  const { data: threadsConfig } = useGetThreadsSDKConfigQuery(undefined, {
    skip: !!connectingPlatform && connectingPlatform !== 'threads',
  })

  // Dynamic Workspace Overview Stats
  const workspaceStats = useMemo<WorkspaceOverviewStats>(() => {
    const activeAccountsList = allAccounts.filter((acc: any) => acc.is_active)
    const activePlatforms = new Set(activeAccountsList.map((acc: any) => acc.platform?.toLowerCase()))

    const connectedCount = activePlatforms.size
    const activeCount = activeAccountsList.length

    // Auto-Publish Active: active & not paused
    const autoPublishCount = activeAccountsList.filter((acc: any) => !acc.is_paused).length

    // Publishing Ready: same as active
    const readyCount = activeCount
    const noOfPlatforms = availablePlatforms?.length

    let totalPosts = 0
    let totalReachVal = 0

    if (channelStatsData) {
      activeAccountsList.forEach((acc: any) => {
        const stats = channelStatsData[acc.id]
        if (stats) {
          totalPosts += stats.postsThisMonth || 0
          totalReachVal += stats.engagement || 0
        }
      })
    }

    const formatReach = (v: number) => {
      if (v >= 1000000) return `${(v / 1000000).toFixed(1)}M`
      if (v >= 1000) return `${(v / 1000).toFixed(1)}K`
      return String(v)
    }

    return {
      connectedPlatforms: `${connectedCount}/${noOfPlatforms}`,
      activeAccounts: activeCount,
      publishingReady: readyCount,
      autoPublishActive: autoPublishCount,
      totalPostsThisMonth: totalPosts,
      totalReach: formatReach(totalReachVal),
      progressPercentage: (connectedCount / noOfPlatforms) * 100,
    }
  }, [allAccounts, channelStatsData])

  const handleConnect = async (platformId: string) => {
    // Check limit
    const activeAccountsCount = allAccounts.filter((acc: any) => acc.is_active).length
    if (!isAdmin && activeAccountsCount >= channelLimit) {
      toast.error(
        t('channel_limit_reached', {
          defaultValue: 'You have reached your channel limit. Upgrade your plan to connect more.',
        }),
      )
      return
    }

    if (platformId === 'facebook' || platformId === 'instagram') {
      if (!appId) {
        toast.error(t('meta_id_required'))
        return
      }
      if (!isSDKReady) {
        toast.error('Facebook SDK is still loading. Please wait a moment and try again.')
        return
      }
      if (window.location.protocol === 'http:' && !['localhost', '127.0.0.1'].includes(window.location.hostname)) {
        toast.error(
          'Facebook login requires a secure HTTPS connection (or localhost/127.0.0.1). Please access the site using HTTPS or localhost.',
        )
        return
      }
      setConnectingPlatform(platformId)

      const scopes =
        'pages_manage_posts,pages_read_engagement,instagram_basic,instagram_content_publish,pages_show_list,public_profile'

      window.FB.login(
        (response: any) => {
          if (response.authResponse) {
            connectFacebook({
              accessToken: response.authResponse.accessToken,
              platform: platformId,
            })
              .unwrap()
              .then((res: any) => {
                toast.success(res.message || 'Account connected successfully!')
                refetch()
                setConnectingPlatform(null)
              })
              .catch((err: any) => {
                toast.error(err.data?.message || 'Failed to connect account.')
                setConnectingPlatform(null)
              })
          } else {
            toast.error('Login cancelled or failed.')
            setConnectingPlatform(null)
          }
        },
        {
          scope: scopes,
        },
      )
    } else if (platformId === 'threads') {
      if (!threadsConfig?.authUrl) {
        toast.error('Threads App ID is required. Please check your settings.')
        return
      }
      setConnectingPlatform(platformId)

      const redirectUri = threadsConfig.redirectUri
      const fullAuthUrl = threadsConfig.authUrl

      const width = 600
      const height = 700
      const left = window.screenX + (window.outerWidth - width) / 2
      const top = window.screenY + (window.outerHeight - height) / 2
      const popup = window.open(fullAuthUrl, 'Threads Login', `width=${width},height=${height},left=${left},top=${top}`)

      const handleMessage = async (event: MessageEvent) => {
        if (event.data?.type === 'THREADS_AUTH_CALLBACK') {
          window.removeEventListener('message', handleMessage)
          popup?.close()
          if (event.data.error) {
            toast.error(event.data.error_description || 'Threads login failed')
            setConnectingPlatform(null)
            return
          }
          try {
            const res = await connectThreads({
              code: event.data.code,
              redirectUri,
            }).unwrap()
            toast.success(res.message || 'Threads account connected!')
            refetch()
          } catch (err: any) {
            toast.error(err.data?.message || 'Failed to connect Threads')
          } finally {
            setConnectingPlatform(null)
          }
        }
      }
      window.addEventListener('message', handleMessage)
    } else if (platformId === 'linkedin') {
      if (!linkedInConfig?.authUrl) {
        toast.error('LinkedIn Client ID is required. Please check your settings.')
        return
      }
      setConnectingPlatform(platformId)
      const { authUrl, redirectUri } = linkedInConfig
      const width = 600
      const height = 600
      const left = window.screenX + (window.outerWidth - width) / 2
      const top = window.screenY + (window.outerHeight - height) / 2
      const popup = window.open(authUrl, 'LinkedIn Login', `width=${width},height=${height},left=${left},top=${top}`)
      const handleMessage = async (event: MessageEvent) => {
        if (event.data?.type === 'LINKEDIN_AUTH_CALLBACK') {
          window.removeEventListener('message', handleMessage)
          popup?.close()
          if (event.data.error) {
            toast.error(event.data.error_description || 'LinkedIn login failed')
            setConnectingPlatform(null)
            return
          }
          try {
            const res = await connectLinkedIn({
              code: event.data.code,
              redirectUri,
            }).unwrap()
            toast.success(res.message || 'LinkedIn account connected!')
            refetch()
          } catch (err: any) {
            toast.error(err.data?.message || 'Failed to connect LinkedIn')
          } finally {
            setConnectingPlatform(null)
          }
        }
      }
      window.addEventListener('message', handleMessage)
    } else if (platformId === 'twitter') {
      if (!twitterConfig?.authUrl) {
        toast.error('Twitter Client ID is required for OAuth 2.0. Please check your settings.')
        return
      }
      setConnectingPlatform(platformId)
      const { authUrl, redirectUri } = twitterConfig
      const width = 600
      const height = 600
      const left = window.screenX + (window.outerWidth - width) / 2
      const top = window.screenY + (window.outerHeight - height) / 2
      const popup = window.open(authUrl, 'Twitter Login', `width=${width},height=${height},left=${left},top=${top}`)
      const handleMessage = async (event: MessageEvent) => {
        if (event.data?.type === 'TWITTER_AUTH_CALLBACK') {
          window.removeEventListener('message', handleMessage)
          popup?.close()
          if (event.data.error) {
            toast.error('Twitter login failed')
            setConnectingPlatform(null)
            return
          }
          try {
            const res = await connectTwitter({
              code: event.data.code,
              redirectUri,
            }).unwrap()
            toast.success(res.message || 'Twitter account connected!')
            refetch()
          } catch (err: any) {
            toast.error(err.data?.message || 'Failed to connect Twitter')
          } finally {
            setConnectingPlatform(null)
          }
        }
      }
      window.addEventListener('message', handleMessage)
    } else if (platformId === 'youtube') {
      if (!youtubeConfig?.authUrl) {
        toast.error('YouTube Client ID is required. Please check your settings.')
        return
      }
      setConnectingPlatform(platformId)
      const { authUrl, redirectUri } = youtubeConfig
      const width = 600
      const height = 600
      const left = window.screenX + (window.outerWidth - width) / 2
      const top = window.screenY + (window.outerHeight - height) / 2
      const popup = window.open(authUrl, 'YouTube Login', `width=${width},height=${height},left=${left},top=${top}`)
      const handleMessage = async (event: MessageEvent) => {
        if (event.data?.type === 'YOUTUBE_AUTH_CALLBACK') {
          window.removeEventListener('message', handleMessage)
          popup?.close()
          if (event.data.error) {
            toast.error(event.data.error_description || 'YouTube login failed')
            setConnectingPlatform(null)
            return
          }
          try {
            const res = await connectYouTube({
              code: event.data.code,
              redirectUri,
            }).unwrap()
            toast.success(res.message || 'YouTube account connected!')
            refetch()
          } catch (err: any) {
            toast.error(err.data?.message || 'Failed to connect YouTube')
          } finally {
            setConnectingPlatform(null)
          }
        }
      }
      window.addEventListener('message', handleMessage)
    } else {
      toast.info(t('coming_soon', { defaultValue: 'Coming soon!' }))
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        icon={<Link2 className="w-6 h-6 text-primary animate-pulse" />}
        title={t('connect_platforms', { defaultValue: 'Connect Platforms' })}
        subtitle={t('connect_platforms_desc', {
          defaultValue:
            'Connect your social media and content platforms to automate publishing, track performance, and manage everything in one place.',
        })}
        showBackButton={false}
      />

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Left Column: Platform Grid */}
        <div className="lg:col-span-3 space-y-6">
          <PlatformGrid accounts={allAccounts} connectingPlatform={connectingPlatform} onConnect={handleConnect} isLoading={isAccountsLoading} />
        </div>

        {/* Right Column: Widgets */}
        <div className="lg:col-span-1 space-y-6">
          <WorkspaceOverview stats={workspaceStats} />
          {/* <SetupGuide /> */}
        </div>
      </div>

      {/* Footer Info Banner */}
      <FooterInfo />
    </div>
  )
}

export default ConnectPlatformsContent
