import { ThreadsIcon } from '@/components/ui/threadsIcon'
import { ActivitySummaryStat, HealthGaugeItem, SecurityCenterItem } from '@/types'
import {
  ProfileActivitySummaryItem,
  ProfileHealthGauge,
  ProfileSecurityItem,
  ProfileTeamRoleItem,
  ProfileTimelineItem
} from '@/types'
import {
  Activity,
  FolderOpen,
  Key,
  Link2,
  Lock,
  Send,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Users,
  Video
} from 'lucide-react'

import {
  Banknote,
  Crown,
  Facebook,
  Instagram,
  Linkedin,
  Shield,
  Sliders,
  Twitter,
  Youtube
} from 'lucide-react'
import React from 'react'

export const activitySummaryConfig: ProfileActivitySummaryItem[] = [
  {
    key: 'posts_published',
    labelKey: 'posts_published',
    defaultLabel: 'Posts Published',
    value: '1,248',
    trend: '18.2%',
    trendType: 'up',
    icon: Video,
    colorClass: 'text-purple-500 bg-purple-500/10 border-purple-500/20'
  },
  {
    key: 'connected_platforms',
    labelKey: 'connected_platforms_label',
    defaultLabel: 'Connected Platforms',
    value: '6',
    trend: '20%',
    trendType: 'up',
    icon: Link2,
    colorClass: 'text-blue-500 bg-blue-500/10 border-blue-500/20'
  },
  {
    key: 'ai_generations',
    labelKey: 'ai_generations_label',
    defaultLabel: 'AI Generations',
    value: '12,432',
    trend: '32.4%',
    trendType: 'up',
    icon: Sparkles,
    colorClass: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20'
  },
  {
    key: 'campaigns_sent',
    labelKey: 'campaigns_sent_label',
    defaultLabel: 'Campaigns Sent',
    value: '823',
    trend: '15.6%',
    trendType: 'up',
    icon: Send,
    colorClass: 'text-pink-500 bg-pink-500/10 border-pink-500/20'
  }
]

export const recentActivityConfig: ProfileTimelineItem[] = [
  {
    id: 'act_1',
    titleKey: 'act_connected_instagram',
    defaultTitle: 'Connected Instagram Account',
    timeKey: 'time_2_hours_ago',
    defaultTime: '2 hours ago',
    icon: Link2,
    colorClass: 'text-purple-500 bg-purple-500/10 border-purple-500/20'
  },
  {
    id: 'act_2',
    titleKey: 'act_published_campaign',
    defaultTitle: 'Published Campaign',
    timeKey: 'time_yesterday_11_30',
    defaultTime: 'Yesterday, 11:30 AM',
    icon: Send,
    colorClass: 'text-blue-500 bg-blue-500/10 border-blue-500/20'
  },
  {
    id: 'act_3',
    titleKey: 'act_changed_password',
    defaultTitle: 'Changed Password',
    timeKey: 'time_3_days_ago',
    defaultTime: '3 days ago',
    icon: Lock,
    colorClass: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20'
  },
  {
    id: 'act_4',
    titleKey: 'act_added_member',
    defaultTitle: 'Added Team Member',
    timeKey: 'time_last_week',
    defaultTime: 'Last week',
    icon: Users,
    colorClass: 'text-orange-500 bg-orange-500/10 border-orange-500/20'
  },
  {
    id: 'act_5',
    titleKey: 'act_created_studio',
    defaultTitle: 'Created New Studio',
    timeKey: 'time_may_16',
    defaultTime: 'May 16, 2025',
    icon: FolderOpen,
    colorClass: 'text-pink-500 bg-pink-500/10 border-pink-500/20'
  }
]

export const teamRolesConfig: ProfileTeamRoleItem[] = [
  {
    roleNameKey: 'role_admins',
    defaultRoleName: 'Admins',
    count: 3,
    colorClass: 'bg-purple-500/10 border-purple-500/20 text-purple-400'
  },
  {
    roleNameKey: 'role_editors',
    defaultRoleName: 'Editors',
    count: 8,
    colorClass: 'bg-blue-500/10 border-blue-500/20 text-blue-400'
  },
  {
    roleNameKey: 'role_creators',
    defaultRoleName: 'Content Creators',
    count: 7,
    colorClass: 'bg-orange-500/10 border-orange-500/20 text-orange-400'
  }
]

export const securityConfig: ProfileSecurityItem[] = [
  {
    key: 'password_status',
    labelKey: 'password_status',
    defaultLabel: 'Password Status',
    statusKey: 'status_strong',
    defaultStatus: 'Strong',
    descKey: 'desc_password_last_changed',
    defaultDesc: 'Last changed 12 days ago',
    icon: ShieldCheck,
    colorClass: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20'
  },
  {
    key: 'two_factor_auth',
    labelKey: 'two_factor_auth',
    defaultLabel: 'Two-Factor Auth',
    statusKey: 'status_enabled',
    defaultStatus: 'Enabled',
    descKey: 'desc_tfa_since',
    defaultDesc: 'Since May 2, 2025',
    icon: Lock,
    colorClass: 'text-amber-500 bg-amber-500/10 border-amber-500/20'
  },
  {
    key: 'api_keys',
    labelKey: 'api_keys',
    defaultLabel: 'API Keys',
    statusKey: 'status_api_active',
    defaultStatus: '3 Active',
    descKey: 'desc_api_rotated',
    defaultDesc: 'Last rotated 5 days ago',
    icon: Key,
    colorClass: 'text-blue-500 bg-blue-500/10 border-blue-500/20'
  },
  {
    key: 'trusted_devices',
    labelKey: 'trusted_devices',
    defaultLabel: 'Trusted Devices',
    statusKey: 'status_devices_count',
    defaultStatus: '5 Devices',
    descKey: 'desc_manage_devices',
    defaultDesc: 'Manage devices',
    icon: Smartphone,
    colorClass: 'text-purple-500 bg-purple-500/10 border-purple-500/20'
  }
]

export const healthGaugesConfig: ProfileHealthGauge[] = [
  {
    key: 'content_score',
    labelKey: 'content_score',
    defaultLabel: 'Content Score',
    percentage: 92,
    statusKey: 'status_excellent',
    defaultStatus: 'Excellent',
    color: 'success'
  },
  {
    key: 'publishing_consistency',
    labelKey: 'publishing_consistency',
    defaultLabel: 'Publishing Consistency',
    percentage: 88,
    statusKey: 'status_very_good',
    defaultStatus: 'Very Good',
    color: 'info'
  },
  {
    key: 'ai_utilization',
    labelKey: 'ai_utilization',
    defaultLabel: 'AI Utilization',
    percentage: 95,
    statusKey: 'status_excellent',
    defaultStatus: 'Excellent',
    color: 'success'
  },
  {
    key: 'engagement_rate',
    labelKey: 'engagement_rate',
    defaultLabel: 'Engagement Rate',
    percentage: 76,
    statusKey: 'status_good',
    defaultStatus: 'Good',
    color: 'warning'
  }
]

export const platformColors: Record<string, string> = {
  facebook: 'text-[#1877F2] bg-[#1877F2]/10 border-[#1877F2]/20',
  instagram: 'text-[#E4405F] bg-[#E4405F]/10 border-[#E4405F]/20',
  linkedin: 'text-[#0A66C2] bg-[#0A66C2]/10 border-[#0A66C2]/20',
  twitter: 'text-[#1DA1F2] bg-[#1DA1F2]/10 border-[#1DA1F2]/20',
  twitter_x: 'text-[#1DA1F2] bg-[#1DA1F2]/10 border-[#1DA1F2]/20',
  youtube: 'text-[#FF0000] bg-[#FF0000]/10 border-[#FF0000]/20'
}

export const PLATFORMS_CONFIG = [
  { key: 'youtube', name: 'YouTube', icon: Youtube, color: '#FF0000' },
  { key: 'instagram', name: 'Instagram', icon: Instagram, color: '#E4405F' },
  { key: 'facebook', name: 'Facebook', icon: Facebook, color: '#1877F2' },
  { key: 'linkedin', name: 'LinkedIn', icon: Linkedin, color: '#0A66C2' },
  { key: 'twitter', name: 'Twitter / X', icon: Twitter, color: '#1DA1F2' }
]

export const getPlatformIcon = (platform: string) => {
  switch (platform.toLowerCase()) {
    case 'facebook':
      return React.createElement(Facebook, { className: "w-4 h-4" })
    case 'instagram':
      return React.createElement(Instagram, { className: "w-4 h-4" })
    case 'linkedin':
      return React.createElement(Linkedin, { className: "w-4 h-4" })
    case 'twitter':
    case 'twitter_x':
      return React.createElement(Twitter, { className: "w-4 h-4" })
    case 'youtube':
      return React.createElement(Youtube, { className: "w-4 h-4" })
    case 'threads':
      return React.createElement(ThreadsIcon, { className: "w-4 h-4" })
    default:
      return React.createElement(Link2, { className: "w-4 h-4" })
  }
}

export const getComputedStats = (
  t: any,
  isSuperAdmin: boolean,
  adminStatsData: any,
  socialDashboard: any,
  uniquePlatforms: string[],
  currency: string
): ActivitySummaryStat[] => {
  return isSuperAdmin
    ? [
      {
        key: 'total_users',
        labelKey: 'total_users',
        defaultLabel: 'Total Users',
        value: adminStatsData?.statistics?.totalUsers?.toLocaleString() || '0',
        trend: '12%',
        icon: Users,
        colorClass: 'text-blue-500 bg-blue-500/10 border-blue-500/20'
      },
      {
        key: 'active_subscribers',
        labelKey: 'active_subscribers',
        defaultLabel: 'Active Subscribers',
        value: adminStatsData?.statistics?.activeSubscribers?.toLocaleString() || '0',
        trend: '8%',
        icon: Crown,
        colorClass: 'text-purple-500 bg-purple-500/10 border-purple-500/20'
      },
      {
        key: 'total_revenue',
        labelKey: 'total_revenue',
        defaultLabel: 'Total Revenue',
        value: adminStatsData?.statistics?.totalRevenue ? `${currency}${adminStatsData.statistics.totalRevenue.toLocaleString()}` : `${currency}0`,
        trend: '15%',
        icon: Banknote,
        colorClass: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20'
      },
      {
        key: 'total_posts_published',
        labelKey: 'total_posts_published',
        defaultLabel: 'Total Published',
        value: adminStatsData?.statistics?.totalPublishedPost?.toLocaleString() || '0',
        trend: '24%',
        icon: Send,
        colorClass: 'text-pink-500 bg-pink-500/10 border-pink-500/20'
      }
    ]
    : [
      {
        key: 'posts_published',
        labelKey: 'posts_published',
        defaultLabel: 'Posts Published',
        value: socialDashboard?.stats?.totalPosts?.toLocaleString() || '0',
        trend: '18%',
        icon: Video,
        colorClass: 'text-blue-500 bg-blue-500/10 border-blue-500/20'
      },
      {
        key: 'connected_channels_count',
        labelKey: 'connected_channels_count',
        defaultLabel: 'Connected Platforms',
        value: uniquePlatforms.length.toString(),
        trend: '5%',
        icon: Link2,
        colorClass: 'text-purple-500 bg-purple-500/10 border-purple-500/20'
      },
      {
        key: 'upcoming_queue',
        labelKey: 'upcoming_queue',
        defaultLabel: 'Upcoming Queue',
        value: socialDashboard?.stats?.scheduledCount?.toLocaleString() || '0',
        trend: '10%',
        icon: Sliders,
        colorClass: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20'
      },
      {
        key: 'engagement_rate',
        labelKey: 'engagement_rate',
        defaultLabel: 'Engagement',
        value: socialDashboard?.stats?.engagement30d ? `${socialDashboard.stats.engagement30d}%` : '0%',
        trend: '14%',
        icon: Activity,
        colorClass: 'text-pink-500 bg-pink-500/10 border-pink-500/20'
      }
    ]
}

export const getSecurityCenterConfig = (
  user: any
): SecurityCenterItem[] => {
  return [
    {
      key: 'acc_status',
      labelKey: 'account_status',
      defaultLabel: 'Account Status',
      statusKey: user?.isActive ? 'active' : 'inactive',
      defaultStatus: user?.isActive ? 'Active' : 'Inactive',
      descKey: 'account_status_desc',
      defaultDesc: 'Your account is active and verified.',
      icon: ShieldCheck,
      colorClass: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20'
    },
    {
      key: 'sec_pw',
      labelKey: 'password_status',
      defaultLabel: 'Password Status',
      statusKey: 'secure',
      defaultStatus: 'Secure & Active',
      descKey: 'password_status_desc',
      defaultDesc: 'Strong encryption enabled.',
      icon: Lock,
      colorClass: 'text-blue-500 bg-blue-500/10 border-blue-500/20'
    },
    {
      key: 'role_perms',
      labelKey: 'role_permissions',
      defaultLabel: 'Role & Permissions',
      statusKey: user?.role || 'user',
      defaultStatus: user?.role?.toUpperCase() || 'USER',
      descKey: 'role_permissions_desc',
      defaultDesc: `${user?.role?.toUpperCase()} with ${user?.permissions?.length || 0} permissions`,
      icon: Shield,
      colorClass: 'text-purple-500 bg-purple-500/10 border-purple-500/20'
    }
  ]
}

export const getComputedHealthGauges = (
  isSuperAdmin: boolean,
  adminStatsData: any,
  creditsPercentage: number,
  maxChannels: number,
  connectedChannels: number,
  socialDashboard: any,
  totalMediaCount: number
): HealthGaugeItem[] => {
  return isSuperAdmin
    ? [
      {
        key: 'g_subscribers',
        labelKey: 'subscriber_ratio',
        defaultLabel: 'Subscribers',
        percentage: adminStatsData?.statistics?.totalUsers > 0 ? Math.min(100, Math.round((adminStatsData.statistics.activeSubscribers / adminStatsData.statistics.totalUsers) * 100)) : 45,
        statusKey: 'optimal',
        defaultStatus: 'Optimal',
        color: 'success'
      },
      {
        key: 'g_publishing',
        labelKey: 'publishing_rate',
        defaultLabel: 'Publishing',
        percentage: adminStatsData?.statistics?.totalMedia > 0 ? Math.min(100, Math.round((adminStatsData.statistics.totalPublishedPost / adminStatsData.statistics.totalMedia) * 100)) : 65,
        statusKey: 'good',
        defaultStatus: 'Good',
        color: 'info'
      },
      {
        key: 'g_templates',
        labelKey: 'template_engagement',
        defaultLabel: 'Templates',
        percentage: adminStatsData?.statistics?.totalTemplates > 0 ? Math.min(100, Math.round((adminStatsData.statistics.totalPublishedPost / adminStatsData.statistics.totalTemplates) * 100)) : 75,
        statusKey: 'healthy',
        defaultStatus: 'Healthy',
        color: 'warning'
      },
      {
        key: 'g_uptime',
        labelKey: 'system_uptime',
        defaultLabel: 'System Uptime',
        percentage: 99,
        statusKey: 'excellent',
        defaultStatus: 'Excellent',
        color: 'primary'
      }
    ]
    : [
      {
        key: 'g_credits',
        labelKey: 'ai_credits_used',
        defaultLabel: 'Credits Used',
        percentage: creditsPercentage || 0,
        statusKey: creditsPercentage > 85 ? 'warning' : 'optimal',
        defaultStatus: creditsPercentage > 85 ? 'Running Low' : 'Optimal',
        color: creditsPercentage > 85 ? 'warning' : 'success'
      },
      {
        key: 'g_reach',
        labelKey: 'channel_reach',
        defaultLabel: 'Channel Reach',
        percentage: maxChannels > 0 ? Math.min(100, Math.round((connectedChannels / maxChannels) * 100)) : 100,
        statusKey: 'good',
        defaultStatus: 'Good',
        color: 'info'
      },
      {
        key: 'g_engagement',
        labelKey: 'engagement_rate',
        defaultLabel: 'Engagement',
        percentage: socialDashboard?.stats?.engagement30d ? Math.min(100, Math.round(socialDashboard.stats.engagement30d)) : 82,
        statusKey: 'healthy',
        defaultStatus: 'Healthy',
        color: 'warning'
      },
      {
        key: 'g_media',
        labelKey: 'media_utilization',
        defaultLabel: 'Media Usage',
        percentage: totalMediaCount > 0 ? Math.min(100, totalMediaCount * 5) : 40,
        statusKey: 'active',
        defaultStatus: 'Active',
        color: 'primary'
      }
    ]
}

export const colorMap = {
  success: 'text-emerald-500 dark:text-emerald-400',
  info: 'text-blue-500 dark:text-blue-400',
  warning: 'text-amber-500 dark:text-amber-400',
  error: 'text-red-500 dark:text-red-400',
  primary: 'text-primary'
}

export const cardThemes = [
  {
    // Blue theme (Index 0)
    cardBg: 'bg-blue-500/5  border border-[#e2e8f0]/50 dark:border-slate-800/50 hover:border-blue-200 dark:hover:border-blue-900/50',
    iconBg: 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-100/50 dark:border-blue-900/30 shadow-sm shadow-blue-100/30 dark:shadow-none',
    color: '#3b82f6',
  },
  {
    // Purple theme (Index 1)
    cardBg: 'bg-purple-500/5  border border-[#e2e8f0]/50 dark:border-slate-800/50 hover:border-purple-200 dark:hover:border-purple-900/50',
    iconBg: 'bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 border border-purple-100/50 dark:border-purple-900/30 shadow-sm shadow-purple-100/30 dark:shadow-none',
    color: '#8b5cf6',
  },
  {
    // Green theme (Index 2)
    cardBg: 'bg-emerald-500/5  border border-[#e2e8f0]/50 dark:border-slate-800/50 hover:border-emerald-200 dark:hover:border-emerald-900/50',
    iconBg: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-100/50 dark:border-emerald-900/30 shadow-sm shadow-emerald-100/30 dark:shadow-none',
    color: '#10b981',
  },
  {
    // Pink theme (Index 3)
    cardBg: 'bg-pink-500/5  border border-[#e2e8f0]/50 dark:border-slate-800/50 hover:border-pink-200 dark:hover:border-pink-900/50',
    iconBg: 'bg-pink-50 dark:bg-pink-950/40 text-pink-600 dark:text-pink-400 border border-pink-100/50 dark:border-pink-900/30 shadow-sm shadow-pink-100/30 dark:shadow-none',
    color: '#ec4899',
  }
]

export const waves = [
  {
    stroke: "M 0 12 C 15 2, 25 2, 40 12 C 55 18, 65 18, 80 12 C 90 6, 95 6, 100 10",
    fill: "M 0 12 C 15 2, 25 2, 40 12 C 55 18, 65 18, 80 12 C 90 6, 95 6, 100 10 L 100 20 L 0 20 Z"
  },
  {
    stroke: "M 0 8 C 15 16, 25 16, 40 8 C 55 2, 65 2, 80 8 C 90 14, 95 14, 100 10",
    fill: "M 0 8 C 15 16, 25 16, 40 8 C 55 2, 65 2, 80 8 C 90 14, 95 14, 100 10 L 100 20 L 0 20 Z"
  },
  {
    stroke: "M 0 14 C 15 4, 25 4, 40 14 C 55 19, 65 19, 80 14 C 90 8, 95 8, 100 12",
    fill: "M 0 14 C 15 4, 25 4, 40 14 C 55 19, 65 19, 80 14 C 90 8, 95 8, 100 12 L 100 20 L 0 20 Z"
  },
  {
    stroke: "M 0 10 C 15 2, 30 2, 45 10 C 60 16, 70 16, 85 10 C 95 6, 100 6, 100 8",
    fill: "M 0 10 C 15 2, 30 2, 45 10 C 60 16, 70 16, 85 10 C 95 6, 100 6, 100 8 L 100 20 L 0 20 Z"
  }
]