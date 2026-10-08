import { Monitor, MoonStar, Sun } from 'lucide-react'

// whitelist routes that are NOT in the sidebar but are valid and allowed
export const hiddenAllowedPaths = [
  '/profile',
  '/payment-success',
  '/subscription/success',
  '/subscription/cancel',
  '/social/select-pages',
  '/blog',
  '/languages',
  '/social-media/socialappconfig',
  '/social-media/calendar',
]

export const themes = [
  {
    id: 'light',
    label: 'Light',
    icon: Sun,
  },
  {
    id: 'dark',
    label: 'Dark',
    icon: MoonStar,
  },
  {
    id: 'system',
    label: 'System',
    icon: Monitor,
  },
]
