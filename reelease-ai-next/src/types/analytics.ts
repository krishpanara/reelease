import { EnrichedAccount } from './socialMedia'

export interface AnalyticsPostMetadata {
  likes?: number | string
  like_count?: number | string
  comments?: number | string
  comment_count?: number | string
  shares?: number | string
  share_count?: number | string
  [key: string]: string | number | boolean | undefined | null | Record<string, unknown> | unknown
}

export interface AnalyticsPost {
  _id?: string
  id?: string
  platform: string
  published_at?: string
  scheduled_at?: string
  created_at?: string
  caption?: string
  media_urls?: string[]
  likeCount?: number
  commentCount?: number
  shareCount?: number
  engagementCount?: number
  metadata?: AnalyticsPostMetadata
}

export interface ChannelDistribution {
  platform: string
  total: number
}

export interface AnalyticsDashboardData {
  accounts: EnrichedAccount[]
  topEngagementPosts: AnalyticsPost[]
  channelData: ChannelDistribution[]
}

export interface PeriodOption {
  value: string
  labelKey: string
  defaultLabel: string
}

export interface FiltersBarProps {
  selectedPlatform: string
  setSelectedPlatform: (platform: string) => void
  period: string
  setPeriod: (period: string) => void
  availablePlatforms: string[]
  periods: PeriodOption[]
  t: (key: string, options?: { defaultValue?: string }) => string
}

export interface StatsCardsProps {
  totalFollowers: number
  totalPostsCount: number
  totalEngagement: number
  avgEngagementRate: string
  t: (key: string, options?: { defaultValue?: string }) => string
}

export interface ChartsRowProps {
  filteredTopPosts: AnalyticsPost[]
  channelData: ChannelDistribution[]
  selectedPlatform: string
  period: string
  resolvedTheme?: string
  t: (key: string, options?: { defaultValue?: string }) => string
}

export interface TopContentTableProps {
  filteredTopPosts: AnalyticsPost[]
  t: (key: string, options?: { defaultValue?: string }) => string
}

export interface PostingTimesProps {
  t: (key: string, options?: { defaultValue?: string }) => string
}

export interface ChannelsSummaryProps {
  filteredAccounts: EnrichedAccount[]
  t: (key: string, options?: { defaultValue?: string }) => string
}
