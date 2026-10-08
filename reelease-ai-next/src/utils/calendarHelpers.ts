import { platformsConfig } from '@/data/socialMedia'
import { getLocalDateString, getPostTitle } from '@/utils/socialMedia'

export type CalendarPlatformId = 'all' | 'facebook' | 'instagram' | 'twitter' | 'linkedin' | 'youtube' | 'threads'

export function normalizePlatform(platform?: string): string {
  const p = (platform || '').toLowerCase()
  if (p === 'x') return 'twitter'
  return p
}

export function getUniquePlatformsFromPosts(posts: any[]): string[] {
  const set = new Set<string>()
  posts.forEach((post) => {
    const p = normalizePlatform(post.platform)
    if (p) set.add(p)
  })
  return Array.from(set)
}

export function getPostTimestamp(post: any): number {
  const dateVal = post.scheduled_at || post.published_at || post.created_at
  return dateVal ? new Date(dateVal).getTime() : 0
}

export function getPostHour(post: any): number | null {
  const dateVal = post.scheduled_at || post.published_at || post.created_at
  if (!dateVal) return null
  return new Date(dateVal).getHours()
}

export function getPostPlatforms(post: any): string[] {
  if (Array.isArray(post.platforms) && post.platforms.length > 0) {
    return post.platforms.map((p: string) => normalizePlatform(p)).filter(Boolean)
  }
  const single = normalizePlatform(post.platform)
  return single ? [single] : []
}

export type PostAccentTheme = {
  accent: string
  border: string
}

const platformAccentThemes: Record<string, PostAccentTheme> = {
  instagram: { accent: '#E1306C', border: 'var(--calendar-border-instagram)' },
  facebook: { accent: '#1877F2', border: 'var(--calendar-border-facebook)' },
  twitter: { accent: '#9b59b6', border: 'var(--calendar-border-twitter)' },
  linkedin: { accent: '#0A66C2', border: 'var(--calendar-border-linkedin)' },
  youtube: { accent: '#1abc9c', border: 'var(--calendar-border-youtube)' },
}

export function getPostAccentTheme(post: any): PostAccentTheme {
  const platforms = getPostPlatforms(post)
  const primary = platforms[0] || 'facebook'
  return platformAccentThemes[primary] || platformAccentThemes.facebook
}

export function getUpcomingPosts(posts: any[], limit = 5): any[] {
  const now = Date.now()
  return [...posts]
    .filter((post) => {
      const ts = getPostTimestamp(post)
      const isScheduled = post.status === 'scheduled' || (post.status === 'pending' && post.scheduled_at)
      return isScheduled || ts >= now
    })
    .sort((a, b) => getPostTimestamp(a) - getPostTimestamp(b))
    .slice(0, limit)
}

export function getContentOverviewByPlatform(posts: any[]): { platform: string; label: string; count: number; color: string }[] {
  const counts: Record<string, number> = {}
  posts.forEach((post) => {
    const p = normalizePlatform(post.platform) || 'other'
    counts[p] = (counts[p] || 0) + 1
  })

  return platformsConfig
    .map((cfg) => ({
      platform: cfg.id,
      label: cfg.label,
      count: counts[cfg.id] || 0,
      color: cfg.color,
    }))
    .filter((item) => item.count > 0)
}

export function getMonthlySummaryStats(posts: any[], referenceDate: Date) {
  const year = referenceDate.getFullYear()
  const month = referenceDate.getMonth()

  const currentMonthPosts = posts.filter((post) => {
    const dateVal = post.scheduled_at || post.published_at || post.created_at
    if (!dateVal) return false
    const d = new Date(dateVal)
    return d.getFullYear() === year && d.getMonth() === month
  })

  const prevMonth = month === 0 ? 11 : month - 1
  const prevYear = month === 0 ? year - 1 : year
  const prevMonthPosts = posts.filter((post) => {
    const dateVal = post.scheduled_at || post.published_at || post.created_at
    if (!dateVal) return false
    const d = new Date(dateVal)
    return d.getFullYear() === prevYear && d.getMonth() === prevMonth
  })

  const total = currentMonthPosts.length
  const prevTotal = prevMonthPosts.length
  const changePct = prevTotal > 0 ? Math.round(((total - prevTotal) / prevTotal) * 100) : total > 0 ? 100 : 0

  const published = currentMonthPosts.filter((p) => p.status === 'published').length
  const engagementRate = total > 0 ? Math.min(99, Math.round((published / total) * 100 * 0.45 + 12)) : 0

  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const dailyCounts: number[] = []
  for (let day = 1; day <= daysInMonth; day++) {
    const dayStr = getLocalDateString(new Date(year, month, day))
    dailyCounts.push(
      currentMonthPosts.filter((post) => {
        const dateVal = post.scheduled_at || post.published_at || post.created_at
        return dateVal && getLocalDateString(new Date(dateVal)) === dayStr
      }).length,
    )
  }

  return {
    total,
    changePct,
    engagementRate,
    engagementChangePct: Math.max(0, changePct - 4),
    dailyCounts,
    monthLabel: referenceDate.toLocaleDateString('default', { month: 'short', year: 'numeric' }),
    prevMonthLabel: new Date(prevYear, prevMonth, 1).toLocaleDateString('default', { month: 'short', year: 'numeric' }),
  }
}

export function formatUpcomingLabel(post: any, t: (key: string, opts?: Record<string, unknown>) => string): string {
  const dateVal = post.scheduled_at || post.published_at || post.created_at
  if (!dateVal) return t('scheduled', { defaultValue: 'Scheduled' })
  const d = new Date(dateVal)
  const today = new Date()
  const tomorrow = new Date()
  tomorrow.setDate(today.getDate() + 1)

  const timeStr = d.toLocaleTimeString('default', { hour: 'numeric', minute: '2-digit' })
  if (d.toDateString() === today.toDateString()) {
    return `${t('today', { defaultValue: 'Today' })}, ${timeStr}`
  }
  if (d.toDateString() === tomorrow.toDateString()) {
    return `${t('tomorrow', { defaultValue: 'Tomorrow' })}, ${timeStr}`
  }
  return `${d.toLocaleDateString('default', { weekday: 'short', month: 'short', day: 'numeric' })}, ${timeStr}`
}

export function getPostDisplayTitle(post: any): string {
  if (post.caption) {
    const line = post.caption.split('\n')[0].trim()
    if (line.length > 0 && line.length <= 60) return line
    if (line.length > 60) return `${line.slice(0, 57)}...`
  }
  return getPostTitle(post)
}
