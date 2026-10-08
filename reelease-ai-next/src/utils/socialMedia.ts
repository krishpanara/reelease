// Timezone-safe local date string formatter YYYY-MM-DD
export const getLocalDateString = (d: Date) => {
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const dateVal = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${dateVal}`
}

// Get local date string YYYY-MM-DD for posts
export const getPostLocalDateStr = (post: any) => {
  const dateVal = post.scheduled_at || post.published_at || post.created_at
  if (!dateVal) return ''
  return getLocalDateString(new Date(dateVal))
}

// Generate premium stable titles matching reference designs
export const getPostTitle = (post: any) => {
  if (post.caption) {
    const firstLine = post.caption.split('\n')[0].trim()
    if (firstLine && firstLine.length > 5 && firstLine.length < 40 && !firstLine.startsWith('http')) {
      return firstLine
    }
  }

  const isScheduled = post.status === 'scheduled' || (post.status === 'pending' && post.scheduled_at)
  const statusWord = isScheduled
    ? 'queued'
    : post.status === 'published'
      ? 'published'
      : post.status === 'failed'
        ? 'failed'
        : 'pending'
  const platformName =
    post.platform === 'twitter' || post.platform === 'x'
      ? 'X'
      : post.platform === 'linkedin'
        ? 'LinkedIn'
        : post.platform === 'youtube'
          ? 'YouTube'
          : post.platform === 'facebook'
            ? 'Facebook'
            : post.platform === 'instagram'
              ? 'Instagram'
              : 'Social'

  const types: Record<string, string[]> = {
    post: ['update', 'overview', 'highlight', 'share'],
    story: ['story', 'moment', 'highlight', 'daily'],
    reel: ['reel', 'video recap', 'clip', 'promo'],
  }

  const list = types[post?.content_type?.toLowerCase()] || ['update', 'share']
  const idString = post._id || post.id || 'abc'
  let sum = 0
  for (let i = 0; i < idString.length; i++) sum += idString.charCodeAt(i)
  const suffix = list[sum % list.length]

  const isAi = post.caption && post.caption.toLowerCase().includes('ai')
  return `${isAi ? 'AI ' : ''}${platformName} ${statusWord} ${suffix}`
}

// Helper to format time in 12-hour AM/PM format
export const formatTime12 = (dateVal: string | Date) => {
  const d = new Date(dateVal)
  let hours = d.getHours()
  const minutes = d.getMinutes()
  const ampm = hours >= 12 ? 'PM' : 'AM'
  hours = hours % 12
  hours = hours ? hours : 12 // the hour '0' should be '12'
  const minStr = minutes < 10 ? '0' + minutes : minutes
  const hrStr = hours < 10 ? '0' + hours : hours
  return `${hrStr}:${minStr} ${ampm}`
}

// Helper to get stable mock stats for published cards
export const getPostStats = (post: any) => {
  const idString = post._id || post.id || 'abc'
  let sum = 0
  for (let i = 0; i < idString.length; i++) sum += idString.charCodeAt(i)
  const views = ((sum * 17) % 800) + 120
  const likes = ((sum * 9) % 300) + 40
  return {
    views: views >= 1000 ? `${(views / 1000).toFixed(1)}k` : `${views}`,
    likes,
  }
}
