'use client'

import { DashboardChartsProps } from '@/types/components/dashboard'
import { useTheme } from 'next-themes'
import { RevenueChart } from './components/RevenueChart'
import { RoleDistributionChart } from './components/RoleDistributionChart'
import { SubscriptionChart } from './components/SubscriptionChart'

export const DashboardCharts = ({
  subscriptionData,
  rolesData,
  revenueData,
}: DashboardChartsProps) => {
  const { theme, systemTheme } = useTheme()
  const isDark = theme === 'dark' || (theme === 'system' && systemTheme === 'dark')

  return (
    <div className="grid gap-6 md:gap-8 grid-cols-1 md:grid-cols-12">
      <div className="col-span-1 md:col-span-12 xl:col-span-6">
        <SubscriptionChart data={subscriptionData} isDark={isDark} />
      </div>
      <div className="col-span-1 md:col-span-12 xl:col-span-6">
        <RevenueChart data={revenueData || []} isDark={isDark} />
      </div>
      <div className="col-span-1 md:col-span-12">
        <RoleDistributionChart data={rolesData} isDark={isDark} />
      </div>
    </div>
  )
}
