'use client'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ROUTES } from '@/constants/routes'
import { platformColors, platformIcons } from '@/data/socialMedia'
import { cn } from '@/lib/utils'
import { ConnectedAccountsProps } from '@/types/socialMedia'
import { ChartNetwork, ImageIcon, Plus, TrendingUp, Users, RefreshCw, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useTranslation } from 'react-i18next'
import React from 'react'
import { useValidateSocialTokenMutation } from '@/redux/api/socialApi'
import { toast } from 'sonner'
import { Skeleton } from '@/components/ui/skeleton'

export const ConnectedAccounts = ({ accounts, isLoading }: ConnectedAccountsProps) => {
  const { t } = useTranslation()
  const router = useRouter()
  const [validateToken] = useValidateSocialTokenMutation()
  const [refreshingId, setRefreshingId] = React.useState<string | null>(null)

  // Group and aggregate accounts by platform
  const groupedAccounts = React.useMemo(() => {
    const map: Record<string, any> = {}
    
    accounts.forEach((acc: any) => {
      const plat = acc.platform?.toLowerCase()
      if (!plat) return
      
      if (!map[plat]) {
        map[plat] = {
          ...acc,
          _accounts: [acc],
          postCount: acc.postCount || 0,
          followerCount: acc.followerCount || 0,
          engagementRateSum: parseFloat(acc.engagementRate || '0'),
          engagementRateCount: acc.engagementRate ? 1 : 0,
          is_active: acc.is_active !== false,
        }
      } else {
        map[plat]._accounts.push(acc)
        map[plat].postCount += (acc.postCount || 0)
        map[plat].followerCount += (acc.followerCount || 0)
        if (acc.engagementRate) {
          map[plat].engagementRateSum += parseFloat(acc.engagementRate)
          map[plat].engagementRateCount += 1
        }
        if (acc.is_active !== false) {
          map[plat].is_active = true
        }
      }
    })

    return Object.values(map).map((platAcc: any) => {
      const avgRate = platAcc.engagementRateCount > 0
        ? (platAcc.engagementRateSum / platAcc.engagementRateCount).toFixed(1)
        : '0.0'
      return {
        ...platAcc,
        engagementRate: avgRate,
      }
    })
  }, [accounts])

  const handleRefreshGroup = async (e: React.MouseEvent, platAcc: any) => {
    e.stopPropagation()
    const id = platAcc.id || platAcc._id
    setRefreshingId(id)
    try {
      const promises = platAcc._accounts.map((acc: any) =>
        validateToken(acc.id || acc._id).unwrap()
      )
      const results = await Promise.all(promises)
      const allValid = results.every((res: any) => res.valid)
      if (allValid) {
        toast.success(t('channel_data_refreshed', { defaultValue: 'Channel data refreshed successfully' }))
      } else {
        const failedMsg = results.find((res: any) => !res.valid)?.message
        toast.warning(
          failedMsg ||
          t('token_validation_failed', { defaultValue: 'Token validation failed' }),
        )
      }
    } catch (err: any) {
      toast.error(
        err?.data?.message ||
        t('failed_to_refresh_channel', { defaultValue: 'Failed to refresh channel data' }),
      )
    } finally {
      setRefreshingId(null)
    }
  }

  return (
    <Card className="p-6 rounded-border-radius dark:bg-white/3! border-none glass-card overflow-hidden bg-white">
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 flex justify-center items-center rounded-[9px] bg-primary shrink-0">
              <ChartNetwork className="w-5.5 h-5.5 text-white!" />
            </div>
            <div>
              <h3 className="sm:text-xl text-lg mb-0 font-extrabold text-title-color dark:text-white tracking-tight flex items-center gap-2">
                {t('connection_hub', { defaultValue: 'Connection Hub' })}
              </h3>
              <p className="text-base text-subtitle-color">
                {t('manage_your_social_profiles', { defaultValue: 'Manage your connected social media profiles' })}
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push(ROUTES.SOCIAL_MEDIA.CONNECT_PLATFORMS)}
            className="gap-2 rounded-xl primary-btn  text-white! hover:text-primary text-xs font-semibold w-full sm:w-auto justify-center mt-2 sm:mt-0"
          >
            <Plus className="w-3.5 h-3.5" />
            {t('add_channel', { defaultValue: 'Add Channel' })}
          </Button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-5 sm:gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="relative flex items-center justify-between py-5 px-4 rounded-border-radius-inner bg-subcard dark:bg-white/3 border border-glass-border"
              >
                <div className="flex items-center gap-3.5 min-w-0 w-full">
                  {/* Left: Brand Icon Box Skeleton */}
                  <Skeleton className="w-11 h-11 rounded-full shrink-0" />

                  {/* Middle: Name + Status Skeleton */}
                  <div className="min-w-0 flex-1 space-y-2">
                    <Skeleton className="h-4 w-20 rounded" />
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <Skeleton className="w-1.5 h-1.5 rounded-full" />
                      <Skeleton className="h-3 w-10 rounded" />
                    </div>
                  </div>
                </div>

                {/* Right: Action Button Skeleton */}
                <Skeleton className="w-8 h-8 rounded-full shrink-0" />
              </div>
            ))}
          </div>
        ) : groupedAccounts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <ChartNetwork className="w-12 h-12 text-muted-foreground mb-3" />
            <p className="text-title-color dark:text-white font-semibold text-lg">{t('no_connected_accounts', { defaultValue: 'No connected accounts yet' })}</p>
            <p className="text-base text-subtitle-color mt-1">{t('connect_first_account', { defaultValue: 'Connect your first social media account to get started' })}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-5 sm:gap-4 max-h-[475px] overflow-auto no-scrollbar">
            {groupedAccounts.map((account: any) => {
              const IconComponent = platformIcons[account.platform] || ChartNetwork
              const color = platformColors[account.platform] || 'var(--primary)'
              const accountId = account.id || account._id
              const isActive = account.is_active !== false
              const isRefreshing = refreshingId === accountId

              return (
                <div
                  key={accountId}
                  onClick={() => router.push(ROUTES.SOCIAL_MEDIA.CHANNELS)}
                  className="relative flex items-center justify-between py-5 px-4 rounded-border-radius-inner bg-subcard dark:bg-white/3 border border-glass-border  transition-all duration-300 group cursor-pointer overflow-hidden"
                >
                  {/* Normal State Content (visible when not hovered, blurred when hovered) */}
                  <div className="flex items-center gap-3.5 min-w-0 transition-all duration-300 group-hover:blur-sm group-hover:opacity-10">
                    {/* Left: Brand Icon Box */}
                    <div className="w-11 h-11 flex items-center justify-center shrink-0">
                      {account.platform in platformIcons ? (
                        <IconComponent
                          className="w-11 h-11"
                          filled={true}
                        />
                      ) : (
                        <div
                          className="w-11 h-11 rounded-full flex items-center justify-center shrink-0 border"
                          style={{
                            backgroundColor: `${color}15`,
                            borderColor: `${color}30`,
                            boxShadow: `0 0 12px ${color}10`,
                          }}
                        >
                          <IconComponent
                            className="w-5 h-5"
                            style={{ color }}
                          />
                        </div>
                      )}
                    </div>

                    {/* Middle: Name + Status */}
                    <div className="min-w-0">
                      <h4 className="text-[15px] font-bold text-title-color dark:text-white truncate capitalize">
                        {account.platform === 'youtube' ? 'Shorts' : account.platform}
                      </h4>
                      {isActive ? (
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          <span className="text-[11px] font-semibold text-emerald-400">Live</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-neutral-400" />
                          <span className="text-[11px] font-semibold text-subtitle-color">Disconnected</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Hover State: Blurred Background & Stats Overlay */}
                  <div className="absolute inset-0 bg-subcard rounded-border-radius-inner dark:bg-slate-900 backdrop-blur-3xl opacity-0 group-hover:opacity-100 transition-all duration-500 z-10 flex items-center justify-center py-3">
                    <div className="flex w-full items-center justify-between divide-x divide-glass-border/60 px-1">
                      {/* Posts */}
                      <div className="flex-1 flex flex-col items-center justify-center py-1 min-w-0">
                        <div className="bg-blue-500/10 text-blue-500 h-8 w-8 rounded-full flex items-center justify-center mb-1 shrink-0">
                          <ImageIcon className="w-4 h-4" />
                        </div>
                        <span className="text-base font-bold text-title-color dark:text-white leading-none mb-1 w-full text-center truncate px-1">
                          {account.postCount || 0}
                        </span>
                        <span className="text-sm text-muted-foreground leading-tight capitalize leading-none w-full text-center truncate px-1">{t('posts')}</span>
                      </div>

                      {/* Followers */}
                      <div className="flex-1 flex flex-col items-center justify-center py-1 min-w-0">
                        <div className="bg-emerald-500/10 text-emerald-500 h-8 w-8 rounded-full flex items-center justify-center mb-1 shrink-0">
                          <Users className="w-4 h-4" />
                        </div>
                        <span className="text-base font-bold text-title-color dark:text-white leading-none mb-1 w-full text-center truncate px-1">
                          {account.followerCount >= 1000
                            ? `${(account.followerCount / 1000).toFixed(1)}K`
                            : account.followerCount || 0}
                        </span>
                        <span className="text-sm text-muted-foreground capitalize leading-tight w-full text-center truncate px-1">{t('followers')}</span>
                      </div>

                      {/* Engagement */}
                      <div className="flex-1 flex flex-col items-center justify-center py-1 min-w-0">
                        <div className="bg-purple-500/10 text-purple-500 h-8 w-8 rounded-full flex items-center justify-center mb-1 shrink-0">
                          <TrendingUp className="w-4 h-4" />
                        </div>
                        <span className="text-sm font-bold text-title-color dark:text-white leading-tight mb-1 w-full text-center truncate px-1">
                          {account.engagementRate || '0'}%
                        </span>
                        <span className="text-sm text-muted-foreground leading-tight w-full text-center truncate px-1">{t('engagement')}</span>
                      </div>

                      {/* Refresh */}
                      <div className="flex-1 flex flex-col items-center justify-center py-1">
                        {isActive ? (
                          <button
                            onClick={(e) => handleRefreshGroup(e, account)}
                            disabled={isRefreshing}
                            className="bg-blue-500/10 hover:bg-blue-500/20 text-blue-500 h-8 w-8 rounded-full border border-blue-500/20 flex items-center justify-center mb-1 transition-all cursor-pointer"
                          >
                            {isRefreshing ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <RefreshCw className="w-4 h-4" />
                            )}
                          </button>
                        ) : (
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              router.push(ROUTES.SOCIAL_MEDIA.CHANNELS)
                            }}
                            className="bg-red-500/10 hover:bg-red-500/20 text-red-500 h-8 w-8 rounded-full border border-red-500/20 flex items-center justify-center mb-1 transition-all cursor-pointer"
                          >
                            <RefreshCw className="w-4 h-4" />
                          </button>
                        )}
                        <span className="text-[11px] text-blue-500 font-bold capitalize leading-none">
                          {isActive ? t('refresh', { defaultValue: 'Refresh' }) : t('reconnect', { defaultValue: 'Reconnect' })}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Action Button (Visible only when NOT hovered) */}
                  <div className="shrink-0 ml-2 relative z-0 group-hover:opacity-0 transition-opacity duration-300">
                    {isActive ? (
                      <button
                        onClick={(e) => handleRefreshGroup(e, account)}
                        disabled={isRefreshing}
                        className=" h-8 w-8   rounded-full bg-primary/10 border border-primary/30 text-primary hover:bg-primary/20 transition-all flex items-center justify-center gap-1.5 disabled:opacity-75 cursor-pointer"
                      >
                        {isRefreshing ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <RefreshCw className="w-3.5 h-3.5" />
                        )}

                      </button>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          router.push(ROUTES.SOCIAL_MEDIA.CHANNELS)
                        }}
                        className="px-3 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500/20 text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer"
                      >
                        {t('reconnect', { defaultValue: 'Reconnect' })}
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </Card>
  )
}
