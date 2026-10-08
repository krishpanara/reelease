'use client'

import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { Plus } from 'lucide-react'
import { useRouter } from 'next/navigation'

import { useFacebookSDK } from '@/components/providers/FacebookSDKProvider'
import { Button } from '@/components/ui/button'
import DeleteConfirmationModal from '@/components/reusable/DeleteConfirmationModal'
import { Skeleton } from '@/components/ui/skeleton'
import { ROUTES } from '@/constants/routes'
import {
  useConnectFacebookAccountMutation,
  useConnectLinkedInAccountMutation,
  useConnectTwitterAccountMutation,
  useDisconnectSocialAccountMutation,
  useGetChannelStatsQuery,
  useGetLinkedInSDKConfigQuery,
  useGetSocialAccountsQuery,
  useGetTwitterSDKConfigQuery,
  useGetYouTubeSDKConfigQuery,
  useSetChannelPausedMutation,
  useValidateSocialTokenMutation,
  useConnectYouTubeAccountMutation,
  useConnectThreadsAccountMutation,
  useGetThreadsSDKConfigQuery,
} from '@/redux/api/socialApi'
import { useGetPublicSettingsQuery } from '@/redux/api/adminSettingApi'
import { useGetUserSubscriptionQuery } from '@/redux/api/subscriptionApi'
import { useAppSelector } from '@/redux/hooks'
import {
  Channel,
  ChannelSortOption,
  ChannelsContentProps,
  ChannelStatsPeriod,
  ChannelViewMode,
} from '@/types/components/features'
import { cn } from '@/lib/utils'
import { resolveChannelLimit } from '@/utils/channelLimit'
import { channelMatchesSearch, getTopPerformingChannels, normalizeChannelPlatform } from '@/utils/channelHelpers'

import { ChannelStats } from './ChannelStats'
import { ChannelControlBar } from './ChannelControlBar'
import { ChannelCard } from './ChannelCard'
import AddChannelPlaceholderCard from './AddChannelPlaceholderCard'
import ChannelsSidebar from './ChannelsSidebar'

const ChannelsContent = () => {
  const { t } = useTranslation()
  const router = useRouter()
  const { isSDKReady, appId } = useFacebookSDK()
  const { data: accountsData, isLoading: isAccountsLoading, refetch } = useGetSocialAccountsQuery(undefined)
  const { data: cardStatsData, isLoading: isStatsLoading, refetch: refetchStats } = useGetChannelStatsQuery('month')
  const [performancePeriod, setPerformancePeriod] = useState<ChannelStatsPeriod>('month')
  const { data: performanceStatsData, refetch: refetchPerformanceStats } = useGetChannelStatsQuery(performancePeriod)
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

  const [connectFacebook] = useConnectFacebookAccountMutation()
  const [connectLinkedIn] = useConnectLinkedInAccountMutation()
  const [connectTwitter] = useConnectTwitterAccountMutation()
  const [connectYouTube] = useConnectYouTubeAccountMutation()
  const [connectThreads] = useConnectThreadsAccountMutation()
  const [disconnectAccount] = useDisconnectSocialAccountMutation()
  const [validateToken] = useValidateSocialTokenMutation()
  const [setChannelPaused] = useSetChannelPausedMutation()

  const [connectingPlatform, setConnectingPlatform] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<ChannelViewMode>('grid')
  const [searchQuery, setSearchQuery] = useState('')
  const [platformFilter, setPlatformFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [sortBy, setSortBy] = useState<ChannelSortOption>('name_asc')
  const [loadingMetricsId, setLoadingMetricsId] = useState<string | null>(null)
  const [pausingChannelId, setPausingChannelId] = useState<string | null>(null)
  const [isReconnectingAll, setIsReconnectingAll] = useState(false)

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [channelToDelete, setChannelToDelete] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

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

  const channelStatsMap = cardStatsData || {}
  const performanceStatsMap = performanceStatsData || {}

  const channelLimit = useMemo(
    () => resolveChannelLimit(subscriptionResp, publicSettingsResp?.data),
    [subscriptionResp, publicSettingsResp],
  )

  const accounts = useMemo(() => {
    const rawAccounts = accountsData?.data || []
    return rawAccounts.map((acc: any) => ({
      id: String(acc.id || acc._id),
      account_id: acc.account_id,
      name: acc.account_name || acc.name || acc.platform,
      username: acc.account_username || acc.username || acc.name || '',
      platform: acc.platform,
      status: (acc.is_paused || acc.status === 'PAUSED' ? 'PAUSED' : acc.status || 'ACTIVE') as Channel['status'],
      profile_picture: acc.profile_picture || null,
      connected_at: acc.connected_at || acc.created_at || new Date().toISOString(),
      permissions: acc.permissions || [],
    })) as Channel[]
  }, [accountsData])

  const hasActiveFilters = searchQuery.trim() !== '' || platformFilter !== 'all' || statusFilter !== 'all'

  const clearFilters = () => {
    setSearchQuery('')
    setPlatformFilter('all')
    setStatusFilter('all')
  }

  const filteredAccounts = useMemo(() => {
    return accounts.filter((acc) => {
      if (platformFilter !== 'all' && normalizeChannelPlatform(acc.platform) !== platformFilter) {
        return false
      }
      if (statusFilter !== 'all' && acc.status !== statusFilter) {
        return false
      }
      if (!channelMatchesSearch(acc, searchQuery)) {
        return false
      }
      return true
    })
  }, [accounts, searchQuery, platformFilter, statusFilter])

  const sortedAccounts = useMemo(() => {
    const list = [...filteredAccounts]
    switch (sortBy) {
      case 'name_desc':
        return list.sort((a, b) => b.name.localeCompare(a.name))
      case 'platform':
        return list.sort((a, b) =>
          normalizeChannelPlatform(a.platform).localeCompare(normalizeChannelPlatform(b.platform)),
        )
      case 'recent':
        return list.sort((a, b) => new Date(b.connected_at).getTime() - new Date(a.connected_at).getTime())
      case 'status':
        return list.sort((a, b) => a.status.localeCompare(b.status))
      case 'name_asc':
      default:
        return list.sort((a, b) => a.name.localeCompare(b.name))
    }
  }, [filteredAccounts, sortBy])

  const stats = useMemo(() => {
    const total = accounts.length
    const active = accounts.filter((a) => a.status === 'ACTIVE').length
    const paused = accounts.filter((a) => a.status === 'PAUSED').length
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    const recent = accounts.filter((a) => new Date(a.connected_at) > thirtyDaysAgo).length
    const expired = accounts.filter((a) => a.status === 'EXPIRED').length
    return { total, active, paused, recent, expired }
  }, [accounts])

  const topPerforming = useMemo(
    () => getTopPerformingChannels(accounts, performanceStatsMap, 3),
    [accounts, performanceStatsMap],
  )

  const refetchAllStats = () => {
    refetchStats()
    refetchPerformanceStats()
  }

  const refreshChannelToken = async (channelId: string) => {
    setLoadingMetricsId(channelId)
    try {
      const result = await validateToken(channelId).unwrap()
      refetchAllStats()
      if (result.valid) {
        toast.success(t('channel_data_refreshed', { defaultValue: 'Channel data refreshed successfully' }))
      } else {
        toast.warning(result.message || t('token_validation_failed', { defaultValue: 'Token validation failed' }))
      }
    } catch (err: any) {
      refetchAllStats()
      toast.error(
        err?.data?.message || t('failed_to_refresh_channel', { defaultValue: 'Failed to refresh channel data' }),
      )
    } finally {
      setLoadingMetricsId(null)
    }
  }

  const handleReauth = (channelId: string) => {
    const channel = accounts.find((acc) => acc.id === channelId)
    if (channel) {
      handleConnect(channel.platform, channelId, channel.account_id)
    }
  }

  const handleReconnectAll = async () => {
    if (accounts.length === 0) return
    setIsReconnectingAll(true)
    let successCount = 0
    try {
      for (const channel of accounts) {
        try {
          const result = await validateToken(channel.id).unwrap()
          if (result.valid) successCount++
        } catch {
          // continue
        }
      }
      refetchAllStats()
      if (successCount > 0) {
        toast.success(t('all_channels_refreshed', { defaultValue: 'All channels refreshed' }))
      } else {
        toast.warning(t('token_validation_failed', { defaultValue: 'Token validation failed' }))
      }
    } finally {
      setIsReconnectingAll(false)
    }
  }

  const handleExportChannels = () => {
    const exportData = accounts.map((ch) => ({
      name: ch.name,
      username: ch.username,
      platform: ch.platform,
      status: ch.status,
      metrics: channelStatsMap[ch.id],
    }))
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'channels-export.json'
    link.click()
    URL.revokeObjectURL(url)
    toast.success(t('channels_exported', { defaultValue: 'Channels exported successfully' }))
  }

  const handleChannelGroups = () => {
    toast.info(t('channel_groups_coming_soon', { defaultValue: 'Channel groups coming soon' }))
  }

  const handleGoToDashboard = () => {
    router.push(ROUTES.DASHBOARD)
  }
  const handleGoToAnalytics = (platform?: string) => {
    if (platform) {
      router.push(`${ROUTES.SOCIAL_MEDIA.ANALYTICS}?platform=${platform}`)
    } else {
      router.push(ROUTES.SOCIAL_MEDIA.ANALYTICS)
    }
  }

  const handleOpenChannel = (channelId: string) => {
    const channel = accounts.find((a) => a.id === channelId)
    if (!channel) return

    let url = ''
    const platform = channel.platform.toLowerCase()
    const username = channel.username
    const accountId = channel.account_id

    switch (platform) {
      case 'facebook':
        url = `https://facebook.com/${accountId}`
        break
      case 'instagram':
        url = `https://instagram.com/${username}`
        break
      case 'twitter':
        url = `https://x.com/${username}`
        break
      case 'linkedin':
      case 'linkedin_page':
        url = `https://linkedin.com`
        break
      case 'youtube':
        url = `https://www.youtube.com/channel/${accountId}`
        break
      case 'threads':
        url = `https://www.threads.com/@${username}`
        break
      default:
        url = '#'
    }

    if (url && url !== '#') {
      window.open(url, '_blank', 'noopener,noreferrer')
    }
  }

  const handlePause = async (channelId: string) => {
    const channel = accounts.find((a) => a.id === channelId)
    if (!channel) return
    const paused = channel.status !== 'PAUSED'
    setPausingChannelId(channelId)
    try {
      const res = await setChannelPaused({ accountId: channelId, paused }).unwrap()
      toast.success(
        res.message ||
        (paused
          ? t('channel_paused', { defaultValue: 'Channel paused successfully' })
          : t('channel_resumed', { defaultValue: 'Channel resumed successfully' })),
      )
      refetch()
    } catch (err: any) {
      toast.error(err?.data?.message || t('failed_to_update_channel', { defaultValue: 'Failed to update channel' }))
    } finally {
      setPausingChannelId(null)
    }
  }

  const handleConnect = async (platformId: string, reconnectingChannelId?: string, reconnectingAccountId?: string) => {
    if (!reconnectingChannelId && !isAdmin && accounts.length >= channelLimit) {
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
        // router.push(ROUTES.SOCIAL_MEDIA.SOCIAL_APP_CONFIG)
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
      window.FB.login(
        (response: any) => {
          if (response.authResponse) {
            connectFacebook({
              accessToken: response.authResponse.accessToken,
              platform: platformId,
              reconnectingChannelId,
              reconnectingAccountId,
            })
              .unwrap()
              .then((res: any) => {
                toast.success(res.message || 'Account connected successfully!')
                refetch()
                refetchAllStats()
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
          scope:
            'pages_manage_posts,pages_read_engagement,instagram_basic,instagram_content_publish,pages_show_list,public_profile',
        },
      )
    } else if (platformId === 'linkedin' || platformId === 'linkedin_page') {
      if (!linkedInConfig?.authUrl) {
        toast.error('LinkedIn Client ID is required. Please check your settings.')
        // router.push(ROUTES.SOCIAL_MEDIA.SOCIAL_APP_CONFIG)
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
              reconnectingChannelId,
              reconnectingAccountId,
            }).unwrap()
            toast.success(res.message || 'LinkedIn account connected!')
            refetch()
            refetchStats()
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
        // router.push(ROUTES.SOCIAL_MEDIA.SOCIAL_APP_CONFIG)
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
              reconnectingChannelId,
              reconnectingAccountId,
            }).unwrap()
            toast.success(res.message || 'Twitter account connected!')
            refetch()
            refetchStats()
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
              reconnectingChannelId,
              reconnectingAccountId,
            }).unwrap()
            toast.success(res.message || 'YouTube account connected!')
            refetch()
            refetchStats()
          } catch (err: any) {
            toast.error(err.data?.message || 'Failed to connect YouTube')
          } finally {
            setConnectingPlatform(null)
          }
        }
      }
      window.addEventListener('message', handleMessage)
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
              reconnectingChannelId,
              reconnectingAccountId,
            }).unwrap()
            toast.success(res.message || 'Threads account connected!')
            refetch()
            refetchAllStats()
          } catch (err: any) {
            toast.error(err.data?.message || 'Failed to connect Threads')
          } finally {
            setConnectingPlatform(null)
          }
        }
      }
      window.addEventListener('message', handleMessage)
    } else {
      toast.info('Coming soon!')
    }
  }

  const handleDeleteRequest = (id: string) => {
    setChannelToDelete(id)
    setIsDeleteModalOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!channelToDelete) return
    setIsDeleting(true)
    try {
      await disconnectAccount(channelToDelete).unwrap()
      toast.success(t('account_disconnected', { defaultValue: 'Account disconnected successfully' }))
      refetch()
      refetchAllStats()
      setIsDeleteModalOpen(false)
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to disconnect account')
    } finally {
      setIsDeleting(false)
      setChannelToDelete(null)
    }
  }

  const isLoading = isAccountsLoading || isStatsLoading
  const showAddPlaceholder = accounts.length < channelLimit

  if (isLoading && accounts.length === 0) {
    return (
      <div className="flex flex-col xl:flex-row gap-6">
        <div className="flex-1 space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-28 rounded-2xl bg-slate-200/80 dark:bg-white/10" />
            ))}
          </div>
          <Skeleton className="h-12 rounded-xl bg-slate-200/80 dark:bg-white/10" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-64 rounded-2xl bg-slate-200/80 dark:bg-white/10" />
            ))}
          </div>
        </div>
        <div className="w-full xl:w-[300px] space-y-4">
          <Skeleton className="h-48 rounded-2xl bg-slate-200/80 dark:bg-white/10" />
          <Skeleton className="h-56 rounded-2xl bg-slate-200/80 dark:bg-white/10" />
          <Skeleton className="h-64 rounded-2xl bg-slate-200/80 dark:bg-white/10" />
        </div>
      </div>
    )
  }

  return (
    <div className="animate-in fade-in duration-500 ">
      <div className="flex flex-col 2xl:flex-row gap-6 items-start">
        {/* Left: stats, filters, channel cards */}
        <div className="flex-1 min-w-0 w-full space-y-6">
          <ChannelStats {...stats} />

          <ChannelControlBar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            platformFilter={platformFilter}
            onPlatformFilterChange={setPlatformFilter}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            sortBy={sortBy}
            onSortChange={setSortBy}
            onClearFilters={clearFilters}
            hasActiveFilters={hasActiveFilters}
          />

          {accounts.length === 0 && !hasActiveFilters ? (
            <div className="glass-card bg-white dark:bg-white/3 rounded-2xl sm:p-16 p-8 flex flex-col items-center justify-center text-center border border-dashed border-glass-border">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Plus className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-lg font-bold text-title-color mb-2">{t('no_channels_found')}</h3>
              <p className="text-base text-subtitle-color mb-6 max-w-sm">
                {t('channels_desc', {
                  defaultValue:
                    "You haven't connected any social media channels yet. Connect your first account to start publishing.",
                })}
              </p>
              <Button
                onClick={() => router.push(ROUTES.SOCIAL_MEDIA.CONNECT_PLATFORMS)}
                className="primary-btn text-white! h-10 rounded-xl font-bold"
              >
                {t('connect_new_channels')}
              </Button>
            </div>
          ) : sortedAccounts.length === 0 ? (
            <div className="glass-card rounded-border-radius sm:p-12 p-6 dark:bg-white/3 flex flex-col items-center justify-center text-center border border-dashed border-glass-border">
              <h3 className="text-lg font-bold text-foreground">
                {t('no_results_found', { defaultValue: 'No results found' })}
              </h3>
              <p className="text-sm text-muted-foreground mb-6 max-w-sm">
                {t('no_channels_match_filters', {
                  defaultValue: 'No channels match your current filters. Try adjusting your search or filters.',
                })}
              </p>
              <Button
                variant="outline"
                onClick={clearFilters}
                className="rounded-xl primary-btn text-white h-11 font-bold"
              >
                {t('clear_filters', { defaultValue: 'Clear Filters' })}
              </Button>
            </div>
          ) : (
            <div
              className={cn(
                'gap-4 transition-all duration-300',
                viewMode === 'grid'
                  ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl1700:grid-cols-3 2xl:grid-cols-4'
                  : 'flex flex-col overflow-x-auto pb-3 no-scrollbar',
              )}
            >
              {showAddPlaceholder && (
                <AddChannelPlaceholderCard onClick={() => router.push(ROUTES.SOCIAL_MEDIA.CONNECT_PLATFORMS)} viewMode={viewMode} />
              )}
              {sortedAccounts.map((channel) => {
                const channelMetrics = channelStatsMap[channel.id] || {
                  postsThisMonth: 0,
                  engagement: 0,
                }
                return (
                  <ChannelCard
                    key={channel.id}
                    channel={channel}
                    viewMode={viewMode}
                    onOpen={handleOpenChannel}
                    // onAnalytics={handleGoToDashboard}
                    onAnalytics={handleGoToAnalytics}
                    onReconnect={refreshChannelToken}
                    onReauth={handleReauth}
                    onPause={handlePause}
                    onDelete={handleDeleteRequest}
                    metrics={channelMetrics}
                    isMetricsLoading={loadingMetricsId === channel.id || isStatsLoading}
                    isPauseLoading={pausingChannelId === channel.id}
                  />
                )
              })}
            </div>
          )}
        </div>

        {/* Right: quick actions, top performing, channel health */}
        <ChannelsSidebar
          topChannels={topPerforming}
          performancePeriod={performancePeriod}
          onPerformancePeriodChange={setPerformancePeriod}
          total={stats.total}
          active={stats.active}
          paused={stats.paused}
          expired={stats.expired}
          onConnectNew={() => router.push(ROUTES.SOCIAL_MEDIA.CONNECT_PLATFORMS)}
          onReconnectAll={handleReconnectAll}
          onExport={handleExportChannels}
          onChannelGroups={handleChannelGroups}
          onViewAnalytics={handleGoToAnalytics}
          onViewHealthDetails={handleGoToDashboard}
          isReconnectingAll={isReconnectingAll}
        />
      </div>


      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title={t('delete_channel_title', { defaultValue: 'Delete Channel' })}
        description={t('delete_channel_desc', {
          defaultValue: 'Are you sure you want to delete this channel? This action cannot be undone.',
        })}
        isLoading={isDeleting}
      />
    </div>
  )
}

export default ChannelsContent
