'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ROUTES } from '@/constants/routes'
import { dashboardItemVariants, dashboardParentVariants, featureRoutes } from '@/data/dashboard'
import { useGetUserSubscriptionQuery } from '@/redux/api/subscriptionApi'
import { UserDashboardProps } from '@/types/components/dashboard'
import { getMediaUrl } from '@/utils'
import { motion } from 'framer-motion'
import {
  ArrowRight,
  BookOpen,
  Calendar,
  ChevronRight,
  Image as ImageIcon,
  ImagePlay,
  Layers,
  Shield,
  Sparkle,
  User,
  Video,
  Zap,
} from 'lucide-react'
import { default as Image, default as NextImage } from 'next/image'
import Link from 'next/link'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { DashboardPlanCard } from './components/DashboardPlanCard'
import { DashboardDailyPrompt } from './components/DashboardDailyPrompt'
import { DashboardWelcome } from './components/DashboardWelcome'
import { StatsCards } from '@/components/feature/social-media/dashboard/StatsCards'
import { ConnectedAccounts } from '@/components/feature/social-media/dashboard/ConnectedAccounts'
import { UpcomingPosts } from '@/components/feature/social-media/dashboard/UpcomingPosts'
import { ChannelWiseChart } from '@/components/feature/social-media/dashboard/ChannelWiseChart'
import { TopEngagementPosts } from '@/components/feature/social-media/dashboard/TopEngagementPosts'
import { useAppSelector } from '@/redux/hooks'
import { useGetSocialDashboardQuery } from '@/redux/api/socialApi'
import { featureStyles, iconMap } from '@/data/plan'

export const UserDashboard = ({ stats }: UserDashboardProps) => {
  const { t } = useTranslation()
  const { user } = useAppSelector((state) => state.auth)
  const isSuperAdmin =
    user?.role === 'super_admin' ||
    (user?.roleId as any)?.name === 'super_admin' ||
    (user?.role as any)?.name === 'super_admin'
  const { data: subscription } = useGetUserSubscriptionQuery(undefined, { skip: isSuperAdmin })

  const [templateType, setTemplateType] = useState<'image' | 'video'>('image')
  const [socialPeriod, setSocialPeriod] = useState('month')

  const { data: socialData, isLoading: isSocialLoading } = useGetSocialDashboardQuery(socialPeriod)
  const socialDashboard = socialData?.data || {}
  const fallbackStats = {
    totalAccounts: 0,
    accountsTrend: 0,
    totalPosts: 0,
    postsTrend: 0,
    publishedToday: 0,
    scheduledCount: 0,
    engagement30d: 0,
    engagementTrend: 0,
  }

  const filteredTemplates = (stats.templates.data || []).filter((template) => template.type === templateType).slice(0, 8)

  return (
    <motion.div variants={dashboardParentVariants} initial="hidden" animate="show" className="space-y-4 relative">
      {/* Row 1: Welcome, Quick Actions, & Plan */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-12 gap-6 mb-4">
        <div className="md:col-span-2 lg:col-span-4 2xl:col-span-6">
          <DashboardWelcome />
        </div>
        <div className="md:col-span-1 lg:col-span-2 2xl:col-span-3">
          <DashboardDailyPrompt />
        </div>
        <div className="md:col-span-1 lg:col-span-2 2xl:col-span-3 ">
          <DashboardPlanCard currentPurchasePlan={subscription?.data || null} t={t} />
        </div>
      </div>

      {/* Connected Accounts */}
      <motion.div variants={dashboardItemVariants}>
        <ConnectedAccounts accounts={socialDashboard.accounts || []} isLoading={isSocialLoading} />
      </motion.div>

      {/* Stats Cards (Platforms activities) */}
      <motion.div variants={dashboardItemVariants}>
        <StatsCards stats={socialDashboard.stats || fallbackStats} isLoading={isSocialLoading} />
      </motion.div>

      {/* Row 2: AI Tools Features */}
      <motion.section variants={dashboardItemVariants} className="space-y-6 mb-6">
        <div className="flex mb-3 items-center justify-between">
          <h2 className="text-2xl font-bold text-title-color dark:text-white flex items-center gap-2">
            <Sparkle className="w-6 h-6 text-primary" />
            {t('ai_tools_features', { defaultValue: 'AI Tools & Features' })}
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
          {stats.aiFeatures.map((feature, index) => {
            const iconData = iconMap[feature.feature_key] || Zap
            return (
              <Card
                key={index}
                className="sm:p-6 p-4 glass-card gradient-border transition-all duration-500 group cursor-pointer relative overflow-hidden hover:-translate-y-1.5 hover:shadow-[0_12px_40px_-12px_rgba(0,0,0,0.15)] hover:bg-white/80 "
              >
                <div className="space-y-4 relative z-10">
                  <div
                    className="p-4 rounded-full w-fit  transition-transform duration-500 relative"
                    style={{
                      background: featureStyles[feature.feature_key]?.gradient || 'var(--primary)',
                      boxShadow: `0 0 10px ${featureStyles[feature.feature_key]?.glow || 'rgba(var(--primary-rgb), 0.1)'}`,
                    }}
                  >
                    {typeof iconData === 'string' ? (
                      <Image
                        src={iconData}
                        width={100}
                        height={100}
                        unoptimized
                        className="w-7 h-7 object-contain relative z-10"
                        alt={feature.display_name}
                      />
                    ) : (
                      React.createElement(iconData, { className: 'w-7 h-7 text-white relative z-10' })
                    )}
                    <div
                      className="absolute inset-0 rounded-full transition-opacity"
                      style={{ background: featureStyles[feature.feature_key]?.gradient || 'var(--primary)' }}
                    />
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-bold text-lg text-title-color dark:text-white mb-0">{feature.display_name}</h3>
                    <p className="text-sm text-subtitle-color line-clamp-2 whitespace-normal text-wrap">
                      {feature.description}
                    </p>
                  </div>
                  <Link href={featureRoutes[feature.feature_key] || ROUTES.AI_TEMPLATES}>
                    <div className="flex items-center justify-between pt-2 cursor-pointer group/link pt-0">
                      <Badge variant="outline" className="bg-primary/20 border-primary/20 text-primary">
                        {feature.credits} {t('credits')}
                      </Badge>
                      <div className="w-8 h-8 rounded-full border border-glass-border flex items-center justify-center group-hover/link:bg-primary dark:group-hover/link:text-white group-hover/link:text-white  group-hover/link:border-primary transition-all duration-500">
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    </div>
                  </Link>
                </div>
              </Card>
            )
          })}
        </div>
      </motion.section>

      {/* Row 3: Upcoming Posts | Channel Chart | Top Engagements */}
      <div className="grid grid-cols-1 xl1700:grid-cols-2 2xl:grid-cols-3 gap-4 sm:gap-6 mb-6">
        <motion.div variants={dashboardItemVariants}>
          <UpcomingPosts posts={socialDashboard.upcomingPosts || []} isLoading={isSocialLoading} />
        </motion.div>
        <motion.div variants={dashboardItemVariants}>
          <ChannelWiseChart channelData={socialDashboard.channelData || []} isLoading={isSocialLoading} period={socialPeriod} onPeriodChange={setSocialPeriod} />
        </motion.div>
        <motion.div variants={dashboardItemVariants} className="xl1700:col-span-2 2xl:col-span-1">
          <TopEngagementPosts posts={socialDashboard.topEngagementPosts || []} isLoading={isSocialLoading} />
        </motion.div>
      </div>

      {/* Row 3.5: Categories */}
      <motion.section variants={dashboardItemVariants} className="space-y-6 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <h2 className="text-2xl font-bold text-title-color dark:text-white flex items-center gap-2">
            <Shield className="w-6 h-6 text-primary" />
            {t('popular_categories', { defaultValue: 'Popular Categories' })}
          </h2>
          <Link href={ROUTES.AI_TEMPLATES} className="w-full sm:w-auto">
            <Button variant="ghost" className="text-primary! p-0! hover:bg-[unset]! text-base shrink-0 w-full sm:w-auto text-center sm:text-right">
              {t('view_all')}
            </Button>
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.categories.slice(0, 8).map((category, index) => (
            <Link key={index} href={`${ROUTES.AI_TEMPLATES}?category=${category.slug}`}>
              <Card className="p-5 glass-card gradient-border transition-all flex items-center justify-between gap-4 group h-full overflow-hidden hover:-translate-y-1.5 hover:shadow-[0_12px_40px_-12px_rgba(0,0,0,0.15)]S">
                <div className="space-y-1 flex-1">
                  <h4 className="font-bold text-lg text-title-color dark:text-white line-clamp-1 transition-colors whitespace-normal break-all">
                    {category.name}
                  </h4>
                  <p className="text-sm text-subtitle-color line-clamp-2 text-wrap whitespace-normal break-all">
                    {category.description ||
                      t('explore_templates_in_this_category', { defaultValue: 'Explore various AI templates.' })}
                  </p>
                </div>
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center shrink-0 overflow-hidden group-hover:scale-110 transition-transform duration-500">
                  {category.attachment_id ? (
                    <Image
                      width={100}
                      height={100}
                      unoptimized
                      src={getMediaUrl(category.attachment_id.file_path)}
                      alt={category.name}
                      className="w-full h-full object-cover object-top"
                    />
                  ) : (
                    <Layers className="w-8 h-8 text-primary" />
                  )}
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </motion.section>

      {/* Row 4: Featured Templates */}
      <motion.section variants={dashboardItemVariants} className="space-y-6 mb-6">
        <div className="flex flex-col mb-3 md:flex-row md:items-center justify-between gap-4">
          <h2 className="text-md sm:text-2xl font-bold text-title-color dark:text-white flex items-center gap-2">
            <ImagePlay className="sm:w-6 sm:h-6 w-4 h-4 text-primary" />
            {t('featured_templates', { defaultValue: 'Featured Templates' })}
          </h2>
          <div className="flex items-center gap-4">
            <Tabs value={templateType} onValueChange={(v) => setTemplateType(v as any)} className="w-full md:w-auto">
              <TabsList className="dark:bg-white/3! bg-white/20 border border-white/5 p-1.5 h-12 rounded-full! backdrop-blur-md">
                <TabsTrigger
                  value="image"
                  className="rounded-full! cursor-pointer px-6 py-1.5 text-sm font-medium transition-all duration-300 primary-btn-tab data-[state=active]:text-white!"
                >
                  {t('images')}
                </TabsTrigger>
                <TabsTrigger
                  value="video"
                  className="rounded-full! cursor-pointer px-6 py-1.5 text-sm font-medium transition-all duration-300 primary-btn-tab data-[state=active]:text-white!"
                >
                  {t('videos')}
                </TabsTrigger>
              </TabsList>
            </Tabs>
            <Link href={ROUTES.AI_TEMPLATES}>
              <Button variant="ghost" className=" text-primary! p-0! hover:bg-[unset]! text-base shrink-0">
                {t('view_all')}
              </Button>
            </Link>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredTemplates.map((template, index) => (
            <Link key={index} href={`${ROUTES.AI_TEMPLATES}`}>
              <Card className="overflow-hidden hover-gradient-border  group cursor-pointer hover:border-primary/40 transition-all duration-300 h-full flex flex-col">
                <div className="relative h-60 overflow-hidden dark:bg-black/20 bg-white/10">
                  {template.type === 'video' ? (
                    <video
                      src={getMediaUrl(template.attachment_id?.file_path)}
                      className="w-full h-full object-cover object-top rounded-border-radius group-hover:scale-95 transition-transform duration-700"
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
                  <div className="absolute top-4 right-4 bg-black/40 backdrop-blur-md p-2 rounded-lg">
                    {template.type === 'video' ? (
                      <Video className="w-4 h-4 text-white" />
                    ) : (
                      <ImageIcon className="w-4 h-4 text-white" />
                    )}
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </motion.section>

      {/* Row 5: Blogs */}
      <motion.section variants={dashboardItemVariants} className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <h2 className="text-md sm:text-2xl font-bold text-title-color dark:text-white flex items-center gap-2">
            <BookOpen className="sm:w-6 sm:h-6 w-4 h-4 text-primary" />
            {t('latest_blogs', { defaultValue: 'Latest News & Updates' })}
          </h2>
          <Link href={ROUTES.BLOGS} className="w-full sm:w-auto">
            <Button variant="ghost" className="text-primary! p-0! hover:bg-[unset]! text-base shrink-0 w-full sm:w-auto text-center sm:text-right">
              {t('view_all_blogs', { defaultValue: 'View All' })}
            </Button>
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {stats.blogs.slice(0, 12).map((blog, index) => {
            const thumbnail = blog.thumbnail_id
            return (
              <Link key={index} href={`${ROUTES.BLOGS}/${blog._id || blog.id}`}>
                <div className="group relative flex flex-col p-2 rounded-border-radius glass-card dark:bg-white/3 bg-white overflow-hidden transition-all duration-500 hover:-translate-y-2 h-full cursor-pointer">
                  {/* Image Section */}
                  <div className="relative flex-none aspect-[16/10] rounded-border-radius overflow-hidden bg-white/3  transition-all duration-500">
                    <div className="relative w-full h-full hover-gradient-border rounded-border-radius bg-white/3 overflow-hidden">
                      {thumbnail?.file_path ? (
                        <Image
                          fill
                          src={`${process.env.NEXT_PUBLIC_STORAGE_URL || ''}/${thumbnail.file_path}`}
                          alt={blog.title}
                          unoptimized
                          className="absolute inset-0 w-full h-full object-cover object-top rounded-border-radius transition-transform duration-700 group-hover:scale-95"
                        />
                      ) : (
                        <div className="w-full h-full bg-primary/5 flex items-center justify-center">
                          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="text-2xl font-bold text-primary">{blog.title.charAt(0)}</span>
                          </div>
                        </div>
                      )}
                      <div className="absolute inset-0  border rounded-border-radius" />

                      {/* Floating Badges */}
                      <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
                        <div className="flex flex-wrap gap-2">
                          {blog.categories.slice(0, 2).map((cat, i) => (
                            <Badge
                              key={i}
                              className="bg-black/55 backdrop-blur-md text-white border border-white/20 hover:bg-black/70 transition-all text-xs font-medium px-3 py-1 rounded-full capitalize"
                            >
                              {cat.name}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Content Section */}
                  <div className="p-4 flex flex-col flex-1 gap-2 pb-2!">
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-4 h-4" />
                        {new Date(blog.created_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </div>
                      <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />
                      <div className="flex items-center gap-1.5">
                        <User className="w-4 h-4" />
                        Admin
                      </div>
                    </div>

                    <h3 className="text-lg font-bold leading-tight line-clamp-2 text-title-color dark:text-white transition-colors">
                      {blog.title}
                    </h3>

                    <p className="text-xs text-subtitle-color line-clamp-3 leading-relaxed">{blog.description}</p>

                    <div className="mt-auto pt-2 flex items-center justify-between border-t border-glass-border">
                      <Button
                        variant="ghost"
                        className="text-primary hover:text-primary hover:bg-primary/10 rounded-full px-4  gap-2 group/btn"
                      >
                        <span className="text-sm font-bold tracking-wider">{t('read_more')}</span>
                        <ChevronRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
                      </Button>
                    </div>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </motion.section>
    </motion.div>
  )
}
