import React, { ComponentType, ReactNode } from 'react'
import { BulkResult, BulkRow } from './bulk'
import { CalendarPlatformId } from '@/utils/calendarHelpers'
import { Channel, ChannelStatsPeriod, ChannelStatsProps } from './components/features'
import { Caption } from './caption'

export interface SocialAccount {
  id: string
  platform: 'facebook' | 'instagram' | 'youtube'
  account_id: string
  account_name: string
  account_username?: string
  profile_picture?: string
  page_id?: string
  page_name?: string
  is_active: boolean
}

export interface PlatformConfig {
  id: string
  name: string
  icon: React.ComponentType<{ className?: string }>
  color: string
  bgColor?: string
  borderColor?: string
  description?: string
  features?: string[]
  isAvailable?: boolean
}

export interface PlatformCardProps {
  platform: PlatformConfig
  isConnected: boolean
  isConnecting: boolean
  connectedAccounts: SocialAccount[]
  onConnect: (platformId: string) => void
  onDisconnect: (accountId: string, accountName: string) => void
}

export interface SocialConfigFormProps {
  initialValues?: {
    facebook_app_id: string
    facebook_app_secret: string
    facebook_api_version: string
    threads_app_id?: string
    threads_app_secret?: string
    linkedin_client_id?: string
    linkedin_client_secret?: string
    twitter_consumer_key?: string
    twitter_consumer_secret?: string
    twitter_oauth_token?: string
    twitter_oauth_token_secret?: string
    twitter_client_id?: string
    twitter_client_secret?: string
    youtube_client_id?: string
    youtube_client_secret?: string
  }
  onSuccess?: () => void
}

export interface CalendarFiltersDrawerProps {
  showFiltersPanel: boolean
  selectedContentTypes: string[]
  toggleContentTypeFilter: (id: string) => void
  selectedStatus: string
  setSelectedStatus: (id: string) => void
  showDraftsFilter?: boolean
}

export interface MonthlyGridViewProps {
  monthDays: Date[]
  selectedDate: Date
  setSelectedDate: (date: Date) => void
  setView: (view: 'month' | 'week') => void
  postsByDate: Record<string, any[]>
  setSelectedPost: (post: any) => void
}

export interface PlatformFilterBarProps {
  selectedPlatforms: string[]
  togglePlatformFilter: (id: string) => void
  selectedContentTypes: string[]
  selectedStatus: string
  search: string
  clearAllFilters: () => void
}

export interface WeeklyPlannerViewProps {
  weekDays: Date[]
  postsByDate: Record<string, any[]>
  rowRefs: React.MutableRefObject<Record<string, HTMLDivElement | null>>
  setSelectedPost: (post: any) => void
  setDeleteId: (id: string) => void
  getPostLink: (post: any) => string | null
  router: any
}

export interface WeeklyPostCardProps {
  post: any
  setSelectedPost: (post: any) => void
  setDeleteId: (id: string) => void
  getPostLink: (post: any) => string | null
}

export interface SocialPublishModalProps {
  isOpen: boolean
  onClose: () => void
  attachment: any
  contentType: 'post' | 'story' | 'reel'
}

export interface SocialPostCardProps {
  post: any
  t: (key: string, options?: any) => string
  getPostLink: (post: any) => string | null
  onViewDetails: (post: any) => void
  onDelete: (id: string) => void
}
export interface SocialPostReviewModalProps {
  post: any
  t: (key: string, options?: any) => string
  onClose: () => void
  getPostLink: (post: any) => string | null
}

export interface AccountMultiSelectProps {
  accounts: any[]
  selected: string[]
  onChange: (ids: string[]) => void
}

export interface BulkRowItemProps {
  row: BulkRow
  index: number
  accounts: any[]
  onChange: (id: string, field: string, value: any) => void
  onRemove: (id: string) => void
}

export interface ConfirmClearModalProps {
  isOpen: boolean
  onConfirm: () => void
  onCancel: () => void
  rowCount: number
}

export interface ResultsModalProps {
  result: BulkResult
  onClose: () => void
}

export interface CalendarPlatformTabsProps {
  activePlatform: CalendarPlatformId
  onPlatformChange: (platform: CalendarPlatformId) => void
}
export interface CalendarSidebarProps {
  view: 'month' | 'week'
  posts: any[]
  weekPosts: any[]
  selectedDate: Date
  onPostClick: (post: any) => void
}

export interface ContentOverviewChartProps {
  data: { platform: string; label: string; count: number; color: string }[]
}

export interface MonthlySummaryChartProps {
  total: number
  changePct: number
  engagementRate: number
  engagementChangePct: number
  dailyCounts: number[]
  prevMonthLabel: string
}

export interface PlatformAccentTextProps {
  post: any
  children: ReactNode
  className?: string
  as?: 'span' | 'p'
}

export interface UpcomingPostsListProps {
  posts: any[]
  onPostClick: (post: any) => void
  viewAllHref?: string
}

export interface WeeklyTimeSlotPostProps {
  post: any
  onClick: () => void
}

export interface AddChannelModalProps {
  isOpen: boolean
  onClose: () => void
  onConnect: (platformId: string) => void
  isConnecting: string | null
  configuredPlatforms?: Record<string, boolean>
}

export interface AddChannelPlaceholderCardProps {
  onClick: () => void
  viewMode: 'grid' | 'list'
}

export interface ChannelHealthCardProps {
  total: number
  active: number
  paused: number
  expired?: number
  onViewDetails?: () => void
}

export interface ChannelsPageHeaderActionsProps {
  onAddChannels?: () => void
}

export interface TopChannel extends Channel {
  engagement: number
  postsThisMonth: number
}

export interface ChannelsSidebarProps {
  topChannels: TopChannel[]
  performancePeriod: ChannelStatsPeriod
  onPerformancePeriodChange: (period: ChannelStatsPeriod) => void
  total: number
  active: number
  paused: number
  expired?: number
  onConnectNew: () => void
  onReconnectAll: () => void
  onExport: () => void
  onChannelGroups: () => void
  onViewAnalytics: () => void
  onViewHealthDetails?: () => void
  isReconnectingAll?: boolean
}

export interface ChannelsStatsRowProps extends ChannelStatsProps {
  onConnectNew: () => void
  onReconnectAll: () => void
  onExport: () => void
  onChannelGroups: () => void
  isReconnectingAll?: boolean
}

export interface ChannelsTableProps {
  rows: ChannelTableRow[]
  showAddRow?: boolean
  onAddChannel?: () => void
  onOpen: (id: string) => void
  onReconnect: (id: string) => void
  onReauth: (id: string) => void
  onDelete: (id: string) => void
  loadingMetricsId?: string | null
  isLoading?: boolean
}

export interface StatCardProps {
  title: string
  description: string
  value: number
  icon: ComponentType<{ className?: string }>
  iconClassName: string
  iconGlowClassName: string
}

export interface QuickActionsCardProps {
  onConnectNew: () => void
  onReconnectAll: () => void
  onExport: () => void
  onChannelGroups: () => void
  isReconnectingAll?: boolean
  className?: string
}

export interface ChannelData {
  platform: string
  total: number
  published: number
  scheduled: number
}

export interface ChannelWiseChartProps {
  channelData: ChannelData[]
  period?: string
  onPeriodChange?: (period: string) => void
  isLoading?: boolean
}

export interface EnrichedAccount {
  id?: string
  _id?: string
  account_name: string
  account_username?: string
  platform: string
  profile_picture?: string
  is_active: boolean
  postCount: number
  followerCount: number
  engagementRate: string
  connectedDaysAgo: number
}

export interface ConnectedAccountsProps {
  accounts: EnrichedAccount[]
  isLoading?: boolean
}

export interface StatItem {
  key: string
  labelKey: string
  defaultLabel: string
  icon: React.ComponentType<any>
  color: string
  bg: string
  format?: (val: number) => string
  route: string
}

export interface StatsCardsProps {
  stats: {
    totalAccounts: number
    accountsTrend: number
    totalPosts: number
    postsTrend: number
    publishedToday: number
    scheduledCount: number
    engagement30d: number
    engagementTrend: number
  }
  isLoading?: boolean
}

export interface TopEngagementPostsProps {
  posts: any[]
  isLoading?: boolean
}

export interface UpcomingPostsProps {
  posts: any[]
  isLoading?: boolean
}

export interface WorkflowStep {
  id: string
  label: string
  icon: string
  status: 'completed' | 'in_progress' | 'pending'
  description: string
}

export interface WorkflowSectionProps {
  workflow: WorkflowStep[]
}

export interface CaptionCardProps {
  caption: Caption
  onEdit: (caption: Caption) => void
  onDelete: (id: string) => void
}

export interface CaptionModalProps {
  isOpen: boolean
  onClose: () => void
  caption?: Caption | null
}

export interface ChannelPreviewPlaceholderProps {
  message: string
}

export interface GetCaptionModalProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (caption: string) => void
  platform?: string
}

export interface NetworkPreviewProps {
  account: any
  caption: string
  media?: any
  mediaList?: any[]
  storyText?: string
  storyTextColor?: string
  storyTextBg?: string
  storyTextSize?: string
  storyTextPosition?: string
  storyBgColor?: string
  selectedMusic?: { name: string; url: string } | null
  activeTab?: 'feed' | 'story' | 'reel'
  platformStyle?: any
  contentType?: string
}


export interface PostDate {
  caption: string
  status: string
  scheduled_at: Date
  published_at:Date
  created_at: Date
  platform: string
  platforms:string[]
  content_type: string
  _id: string
  id: string
}

export type ChannelTableRow = Channel & {
  postsThisMonth: number
  engagement: number
}

export type Platform = 'facebook' | 'linkedin' | 'twitter' | 'x' | 'youtube' | 'instagram';

export interface Post {
  platform: Platform;
}

export interface CountdownMore {
  days: number
  hrs: number
  mins: number
  isMoreThan24Hours: true
  secs?: never
}

export interface CountdownLess {
  days?: never
  hrs: number
  mins: number
  secs: number
  isMoreThan24Hours: false
}

export type CountdownResult = CountdownMore | CountdownLess | null