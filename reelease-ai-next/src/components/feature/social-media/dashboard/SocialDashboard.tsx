'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { useGetSocialDashboardQuery } from '@/redux/api/socialApi'
import Spinner from '@/components/reusable/Spinner'
import { StatsCards } from './StatsCards'
import { WorkflowSection } from './WorkflowSection'
import { ConnectedAccounts } from './ConnectedAccounts'
import { UpcomingPosts } from './UpcomingPosts'
import { ChannelWiseChart } from './ChannelWiseChart'
import { TopEngagementPosts } from './TopEngagementPosts'
import { containerVariants, fallbackStats, itemVariants } from '@/data/socialMedia'

const SocialDashboard = () => {
  const { t } = useTranslation()
  const [period, setPeriod] = useState('month')
  const { data, isLoading, isError } = useGetSocialDashboardQuery(period)

  if (isLoading) {
    return <Spinner />
  }

  if (isError || !data?.data) {
    return (
      <div className="p-8 text-center text-destructive font-bold bg-destructive/10 rounded-3xl border border-destructive/20">
        {t('failed_to_load_dashboard', { defaultValue: 'Failed to load dashboard data' })}
      </div>
    )
  }

  const dashboardData = data.data

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      {/* Row 1: Stats Cards (full width) */}
      <motion.div variants={itemVariants}>
        <StatsCards stats={dashboardData.stats || fallbackStats} />
      </motion.div>

      {/* Row 2: Publishing Workflow (full width) */}
      <motion.div variants={itemVariants}>
        <WorkflowSection workflow={dashboardData.workflow || []} />
      </motion.div>

      {/* Row 3: Latest Connected Accounts (full width) */}
      <motion.div variants={itemVariants}>
        <ConnectedAccounts accounts={dashboardData.accounts || []} />
      </motion.div>

      {/* Row 4: Upcoming Posts | Channel Chart | Top Engagements (3 columns) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <motion.div variants={itemVariants}>
          <UpcomingPosts posts={dashboardData.upcomingPosts || []} />
        </motion.div>
        <motion.div variants={itemVariants}>
          <ChannelWiseChart
            channelData={dashboardData.channelData || []}
            period={period}
            onPeriodChange={setPeriod}
          />
        </motion.div>
        <motion.div variants={itemVariants}>
          <TopEngagementPosts posts={dashboardData.topEngagementPosts || []} />
        </motion.div>
      </div>
    </motion.div>
  )
}

export default SocialDashboard
