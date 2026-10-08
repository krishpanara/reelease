'use client'

import { ChannelWiseChart } from '@/components/feature/social-media/dashboard/ChannelWiseChart'
import { ConnectedAccounts } from '@/components/feature/social-media/dashboard/ConnectedAccounts'
import { StatsCards } from '@/components/feature/social-media/dashboard/StatsCards'
import { TopEngagementPosts } from '@/components/feature/social-media/dashboard/TopEngagementPosts'
import { UpcomingPosts } from '@/components/feature/social-media/dashboard/UpcomingPosts'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { ROUTES } from '@/constants/routes'
import { adminDashboardItemVariants, adminStatsConfig } from '@/data/dashboard'
import { cn } from '@/lib/utils'
import { useGetSocialDashboardQuery } from '@/redux/api/socialApi'
import { AdminDashboardStats } from '@/types'
import { getMediaUrl } from '@/utils'
import { motion, Variants } from 'framer-motion'
import { ArrowRight, Image as ImageIcon, Sparkle, Video } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useTranslation } from 'react-i18next'
import { DashboardWelcome } from './components/DashboardWelcome'
import { PopularFeaturesChart } from './components/PopularFeaturesChart'
import { RecentSocialActivity } from './components/RecentSocialActivity'
import { RevenueChart } from './components/RevenueChart'
import { RecentActivity } from './RecentActivity'
import { useRouter } from 'next/navigation'
import React, { useState } from 'react'

export const AdminDashboard = ({
  stats,
  revenueFilter = 'this_month',
  onRevenueFilterChange
}: {
  stats: AdminDashboardStats
  revenueFilter?: string
  onRevenueFilterChange?: (filter: string) => void
}) => {
  const { t } = useTranslation()
  const router = useRouter()
  const [socialPeriod, setSocialPeriod] = useState('month')
  const parentVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1, ease: 'easeOut', duration: 0.8 },
    },
  }

  const statistics = stats?.statistics || {}
  const charts = stats?.charts || {}
  const activities = stats?.recentActivities || {}

  const { data: socialData, isLoading: isSocialLoading } = useGetSocialDashboardQuery(socialPeriod)
  const socialDashboard = socialData?.data || {}
  const fallbackStats = {
    totalAccounts: 0, accountsTrend: 0, totalPosts: 0, postsTrend: 0,
    publishedToday: 0, scheduledCount: 0, engagement30d: 0, engagementTrend: 0
  }

  return (
    <motion.div variants={parentVariants} initial="hidden" animate="show" className="space-y-6 lg:space-y-10 relative">
      {/* Row 1: Welcome Card + Stats Cards */}
      <div className="grid grid-cols-1 2xl:grid-cols-12 gap-6">
        <div className="2xl:col-span-6 h-auto">
          <DashboardWelcome />
        </div>
        <div className="2xl:col-span-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-3 gap-6 h-full">
            {adminStatsConfig.map((item, index) => {
              const value = statistics[item.key] || 0
              return (
                <motion.div key={index} variants={adminDashboardItemVariants} className="h-full">
                  <Card onClick={() => router.push(item.route)} className="p-4 rounded-border-radius-inner! shadow-none!  gradient-border light-only-border transition-all duration-300 hover:border-primary/30 hover:-translate-y-1 hover:shadow-2xl hover:shadow-primary/5 group h-full flex flex-col justify-center relative overflow-hidden cursor-pointer bg-white">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                    <div className="flex items-center gap-4 relative z-10">
                      <div className={cn('p-3 rounded-[9px] flex items-center justify-center shrink-0 transition-all duration-500 group-hover:scale-110 group-hover:rotate-6', item.bg, item.color)}>
                        <item.icon className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-base font-bold text-subtitle-color dark:text-white/70 mb-1">
                          {t(item.labelKey, { defaultValue: item.defaultLabel })}
                        </p>
                        <h4 className="text-2xl font-bold tracking-normal text-title-color  dark:text-white transition-all">
                          {item.prefix}
                          {value.toLocaleString()}
                        </h4>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Connected Accounts */}
      <motion.div variants={adminDashboardItemVariants}>
        <ConnectedAccounts accounts={socialDashboard.accounts || []} isLoading={isSocialLoading} />
      </motion.div>

      {/* Stats Cards (Platforms activities) */}
      <motion.div variants={adminDashboardItemVariants}>
        <StatsCards stats={socialDashboard.stats || fallbackStats} isLoading={isSocialLoading} />
      </motion.div>

      {/* Row 2: Revenue Chart + Recent Social Activity */}
      <div className="grid grid-cols-1 2xl:grid-cols-12 gap-6">
        <motion.div variants={adminDashboardItemVariants} className="2xl:col-span-8 lg:h-[430px]">
          <RevenueChart data={charts.revenuePerMonth || []} isDark={true} value={revenueFilter} onChange={onRevenueFilterChange} />
        </motion.div>
        <motion.div variants={adminDashboardItemVariants} className="2xl:col-span-4 lg:min-h-[430px]">
          <RecentSocialActivity activities={activities.recentSocialActivity || []} />
        </motion.div>
      </div>

      {/* Row 3: Recent Users | Popular AI Features | Top Engagement Posts */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <motion.div variants={adminDashboardItemVariants} className="min-h-[400px] xl:h-[450px] 2xl:col-span-1">
          <RecentActivity recentUsers={activities.recentUsers || []} />
        </motion.div>
        <motion.div variants={adminDashboardItemVariants} className="min-h-[400px] xl:h-[450px] 2xl:col-span-1">
          <PopularFeaturesChart data={charts.serviceUsagePieChart || []} isDark={true} />
        </motion.div>
        <motion.div variants={adminDashboardItemVariants} className="min-h-[400px] lg:h-[450px]">
          <TopEngagementPosts posts={socialDashboard.topEngagementPosts || []} isLoading={isSocialLoading} />
        </motion.div>
      </div>

      {/* Social Media Activities: Upcoming Posts | Channel wise Posts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <motion.div variants={adminDashboardItemVariants}>
          <UpcomingPosts posts={socialDashboard.upcomingPosts || []} isLoading={isSocialLoading} />
        </motion.div>
        <motion.div variants={adminDashboardItemVariants}>
          <ChannelWiseChart channelData={socialDashboard.channelData || []} isLoading={isSocialLoading} period={socialPeriod} onPeriodChange={setSocialPeriod} />
        </motion.div>
      </div>

      {/* Row 4: Recent AI Templates */}
      <motion.section variants={adminDashboardItemVariants} className="w-full">
        <Card className="p-px rounded-border-radius border-none glass-card glass-dark-card shadow-none overflow-hidden w-full transition-all duration-300 dark:bg-white/3">
          <div className="p-4 sm:p-6 flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 flex justify-center items-center rounded-[9px] bg-primary shrink-0">
                  <Sparkle className=" w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-title-color dark:text-white flex items-center gap-2 pb-0">
                    {t('recent_ai_templates', { defaultValue: 'Recent AI Templates' })}
                  </h2>
                  <p className="text-base text-subtitle-color">
                    {t('ready_to_use_templates_desc', { defaultValue: 'Ready-to-use templates to save time and create better content.' })}
                  </p>
                </div>

              </div>
              <Link
                href={`${ROUTES.AI_TEMPLATES}`}
                className="text-sm font-semibold text-primary hover:text-primary/80 transition-colors inline-flex items-center gap-1.5 self-start sm:self-center shrink-0"
              >
                {t('view_all_templates', { defaultValue: 'View All Templates' })}
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {(activities.recentTemplates || []).slice(0, 5).map((template: any, index: number) => (
                <Link key={index} href={`${ROUTES.AI_TEMPLATES}`}>
                  <Card className="overflow-hidden border border-border/60 dark:border-white/10 hover-gradient-border group cursor-pointer hover:border-primary/40 transition-all duration-300 flex flex-col h-full">
                    <div className="relative h-60 overflow-hidden dark:bg-black/20 bg-white/10">
                      {template.type === 'video' ? (
                        <video
                          src={getMediaUrl(template.attachment_id?.file_path)}
                          className="w-full h-full object-cover rounded-border-radius group-hover:scale-95 transition-transform duration-700"
                          autoPlay
                          muted
                          loop
                          playsInline
                        />
                      ) : (
                        <Image
                          src={getMediaUrl(template.attachment_id?.file_path) || '/images/placeholder.png'}
                          alt={template.title}
                          fill
                          unoptimized
                          className="object-cover object-top group-hover:scale-95 rounded-border-radius transition-transform duration-700"
                        />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                      <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5 translate-y-6 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 ease-out">
                        <Badge className="bg-black/55 backdrop-blur-md text-white border border-white/20 hover:bg-black/70 transition-all shadow-md text-xs font-medium px-3 py-1 mb-2.5">
                          {template.category_id?.name || t('uncategorized')}
                        </Badge>
                        <h3 className="text-white font-bold text-base sm:text-lg leading-snug line-clamp-2 drop-shadow-md">
                          {template.title}
                        </h3>
                      </div>
                      <div className="absolute top-3 right-4 bg-black/40 backdrop-blur-md p-1.5 rounded-lg">
                        {template.type === 'video' ? (
                          <Video className="w-3.5 h-3.5 text-white" />
                        ) : (
                          <ImageIcon className="w-3.5 h-3.5 text-white" />
                        )}
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </Card>
      </motion.section>
    </motion.div>
  )
}
