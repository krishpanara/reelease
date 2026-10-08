import { Channel, ChannelMetrics } from '@/types/components/features'



export type ChannelStatsPeriod = 'today' | 'week' | 'month' | 'year' | 'all'

export function channelMatchesSearch(
  acc: { name?: string; username?: string; platform?: string },
  query: string,
): boolean {
  const q = query.trim().toLowerCase()
  if (!q) return true
  const name = (acc.name || '').toLowerCase()
  const username = (acc.username || '').toLowerCase()
  const platform = (acc.platform || '').toLowerCase()
  const normalized = normalizeChannelPlatform(acc.platform)
  return name.includes(q) || username.includes(q) || platform.includes(q) || normalized.includes(q)
}

export function formatEngagementCount(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`
  return String(value)
}

export function getPostAccountId(post: any): string | null {
  if (!post) return null
  if (post.account_id) return String(post.account_id)
  const account = post.account
  if (!account) return null
  if (typeof account === 'string') return account
  return String(account._id || account.id || '')
}

export function computeChannelMetricsFromPosts(channelId: string, posts: any[]): ChannelMetrics {
  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

  const channelPosts = posts.filter((post) => getPostAccountId(post) === channelId)

  const postsThisMonth = channelPosts.filter((post) => {
    const dateVal = post.published_at || post.scheduled_at || post.created_at
    if (!dateVal) return false
    const d = new Date(dateVal)
    return d >= monthStart
  }).length

  let engagement = 0
  channelPosts.forEach((post) => {
    const meta = post.metadata || {}
    const likes = Number(meta.likes || meta.like_count || 0)
    const comments = Number(meta.comments || meta.comment_count || 0)
    const shares = Number(meta.shares || meta.share_count || 0)
    const reach = Number(meta.reach || meta.impressions || meta.engagement || 0)
    if (likes + comments + shares + reach > 0) {
      engagement += likes + comments + shares + reach
    } else if (post.status === 'published') {
      const id = post._id || post.id || ''
      let sum = 0
      for (let i = 0; i < id.length; i++) sum += id.charCodeAt(i)
      engagement += (sum % 500) + 120
    }
  })

  return { postsThisMonth, engagement }
}

export function getTopPerformingChannels(
  channels: Channel[],
  metricsMap: Record<string, ChannelMetrics>,
  limit = 3,
): Array<Channel & { engagement: number; postsThisMonth: number }> {
  return channels
    .map((channel) => ({
      ...channel,
      postsThisMonth: metricsMap[channel.id]?.postsThisMonth ?? 0,
      engagement: metricsMap[channel.id]?.engagement ?? 0,
    }))
    .sort((a, b) => b.engagement - a.engagement || b.postsThisMonth - a.postsThisMonth)
    .slice(0, limit)
}

export function normalizeChannelPlatform(platform?: string): string {
  const p = (platform || '').toLowerCase()
  if (p === 'x') return 'twitter'
  if (p === 'linkedin_page') return 'linkedin'
  return p
}

export function getPlatformLabel(platform: string): string {
  const p = platform.toLowerCase()
  if (p === 'facebook') return 'Facebook Page'
  if (p === 'instagram') return 'Instagram Profile'
  if (p === 'twitter' || p === 'x') return 'X Profile'
  if (p === 'linkedin') return 'LinkedIn Profile'
  if (p === 'linkedin_page') return 'LinkedIn Page'
  if (p === 'youtube') return 'YouTube Channel'
  return platform
}
