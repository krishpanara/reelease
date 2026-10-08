'use client'

import React, { useState } from 'react'
import { useGetSocialDashboardQuery } from '@/redux/api/socialApi'
import { useTranslation } from 'react-i18next'
import { useSearchParams } from 'next/navigation'
import { useTheme } from 'next-themes'
import { periods, availablePlatforms } from '@/data/analyticsData'
import { EnrichedAccount } from '@/types/socialMedia'
import { AnalyticsPost, ChannelDistribution } from '@/types/analytics'
import AnalyticsSkeleton from './AnalyticsSkeleton'
import FiltersBar from './FiltersBar'
import StatsCards from './StatsCards'
import ChartsRow from './ChartsRow'
import TopContentTable from './TopContentTable'
import PostingTimesCard from './PostingTimesCard'
import ChannelsSummaryCard from './ChannelsSummaryCard'

export default function AnalyticsContent() {
  const { t } = useTranslation()
  const searchParams = useSearchParams()
  const platform = searchParams.get('platform')
  const { resolvedTheme } = useTheme()
  const [period, setPeriod] = useState('month')
  const [selectedPlatform, setSelectedPlatform] = useState(platform || 'all')

  const { data, isLoading, isError } = useGetSocialDashboardQuery(period)

  if (isLoading) {
    return <AnalyticsSkeleton />
  }

  if (isError || !data?.data) {
    return (
      <div className="p-8 text-center text-destructive font-bold bg-destructive/10 rounded-3xl border border-destructive/20">
        {t('failed_to_load_dashboard', { defaultValue: 'Failed to load dashboard data' })}
      </div>
    )
  }

  const dashboardData = data.data
  const accounts: EnrichedAccount[] = dashboardData.accounts || []
  const topPosts: AnalyticsPost[] = dashboardData.topEngagementPosts || []
  const channelData: ChannelDistribution[] = dashboardData.channelData || []

  // Filter accounts and top posts based on selected platform
  const filteredAccounts = selectedPlatform === 'all'
    ? accounts
    : accounts.filter((acc) => acc.platform.toLowerCase() === selectedPlatform)

  const filteredTopPosts = selectedPlatform === 'all'
    ? topPosts
    : topPosts.filter((post) => post.platform.toLowerCase() === selectedPlatform)

  // Calculations for Stats Card
  const totalFollowers = filteredAccounts.reduce((sum: number, acc) => sum + (acc.followerCount || 0), 0)
  const totalPostsCount = filteredAccounts.reduce((sum: number, acc) => sum + (acc.postCount || 0), 0)
  const avgEngagementRate = filteredAccounts.length > 0
    ? (filteredAccounts.reduce((sum: number, acc) => sum + parseFloat(acc.engagementRate || '0'), 0) / filteredAccounts.length).toFixed(1)
    : '0.0'

  // Estimate total engagement on selected platform
  const totalEngagement = filteredTopPosts.reduce((sum: number, post) => sum + (post.engagementCount || 0), 0)

  return (
    <div className="space-y-6">
      {/* Filters Bar */}
      <FiltersBar
        selectedPlatform={selectedPlatform}
        setSelectedPlatform={setSelectedPlatform}
        period={period}
        setPeriod={setPeriod}
        availablePlatforms={availablePlatforms}
        periods={periods}
        t={t}
      />

      {/* Stats Cards Grid */}
      <StatsCards
        totalFollowers={totalFollowers}
        totalPostsCount={totalPostsCount}
        totalEngagement={totalEngagement}
        avgEngagementRate={avgEngagementRate}
        t={t}
      />

      {/* Charts Row */}
      <ChartsRow
        filteredTopPosts={filteredTopPosts}
        channelData={channelData}
        selectedPlatform={selectedPlatform}
        period={period}
        resolvedTheme={resolvedTheme}
        t={t}
      />

      {/* Top Performing Content Section */}
      <TopContentTable
        filteredTopPosts={filteredTopPosts}
        t={t}
      />

      {/* Best Time to Post card & Channel list */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Recommended Schedule / Best Time to Post */}
        <PostingTimesCard t={t} />

        {/* Connected Channels Summary */}
        <ChannelsSummaryCard
          filteredAccounts={filteredAccounts}
          t={t}
        />
      </div>
    </div>
  )
}
