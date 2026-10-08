import React from 'react'
import { XIcon as Twitter } from '@/components/ui/XIcon'
import { ThreadsIcon } from '@/components/ui/threadsIcon'
import { FacebookIcon as Facebook } from '@/components/ui/FacebookIcon'
import { InstagramIcon as Instagram } from '@/components/ui/InstagramIcon'
import { LinkedInIcon as Linkedin } from '@/components/ui/LinkedInIcon'
import { YouTubeIcon as YoutubeIcon } from '@/components/ui/YouTubeIcon'
import { PeriodOption } from '@/types/analytics'

export const platformIcons: Record<string, React.ComponentType<any>> = {
  facebook: Facebook,
  instagram: Instagram,
  linkedin: Linkedin,
  twitter: Twitter,
  youtube: YoutubeIcon,
  threads: ThreadsIcon,
}

export const platformColors: Record<string, string> = {
  facebook: '#1877F2',
  instagram: '#E4405F',
  linkedin: '#0A66C2',
  twitter: '#1DA1F2',
  youtube: '#FF0000',
  threads: '#1C1C1C',
}

export const periods: PeriodOption[] = [
  { value: 'today', labelKey: 'today', defaultLabel: 'Today' },
  { value: 'week', labelKey: 'this_week', defaultLabel: 'This Week' },
  { value: 'month', labelKey: 'this_month', defaultLabel: 'This Month' },
  { value: 'year', labelKey: 'this_year', defaultLabel: 'This Year' },
  { value: 'all', labelKey: 'all_time', defaultLabel: 'All Time' },
]

export const availablePlatforms = ['all', 'facebook', 'instagram', 'linkedin', 'twitter', 'youtube', 'threads']
