'use client'

import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { getPostAccentTheme, getPostPlatforms } from '@/utils/calendarHelpers'
import { PlatformAccentTextProps } from '@/types/socialMedia'

const INSTAGRAM_GRADIENT_CLASS =
  'bg-gradient-to-r from-[#FFB700] via-[#FF006B] to-[#AD00FF] bg-clip-text text-transparent'



export function PlatformAccentText({ post, children, className, as: Tag = 'span' }: PlatformAccentTextProps) {
  const platforms = getPostPlatforms(post)
  const theme = getPostAccentTheme(post)
  const useInstagramGradient = platforms.includes('instagram')

  if (useInstagramGradient) {
    return <Tag className={cn('font-bold', INSTAGRAM_GRADIENT_CLASS, className)}>{children}</Tag>
  }

  return (
    <Tag className={cn('font-bold', className)} style={{ color: theme.accent }}>
      {children}
    </Tag>
  )
}

export function usePostUsesInstagramGradient(post: any): boolean {
  return getPostPlatforms(post).includes('instagram')
}
