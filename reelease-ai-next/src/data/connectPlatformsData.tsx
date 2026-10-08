import { ThreadsIcon } from '@/components/ui/threadsIcon'
import { XIcon as Twitter } from '@/components/ui/XIcon'
import { FacebookIcon as Facebook } from '@/components/ui/FacebookIcon'
import { InstagramIcon as Instagram } from '@/components/ui/InstagramIcon'
import { LinkedInIcon as Linkedin } from '@/components/ui/LinkedInIcon'
import { YouTubeIcon as Youtube } from '@/components/ui/YouTubeIcon'

export const availablePlatforms = [
  {
    id: 'facebook',
    name: 'Facebook',
    description: 'Connect and manage Facebook pages within this workspace.',
    icon: Facebook,
    color: '#1877F2',
    type: 'Page Integration',
  },
  {
    id: 'instagram',
    name: 'Instagram',
    description: 'Connect and manage Instagram accounts within this workspace.',
    icon: Instagram,
    color: '#E4405F',
    type: 'Profile Integration',
  },
  {
    id: 'twitter',
    name: 'Twitter (X)',
    description: 'Connect and manage Twitter (X) accounts within this workspace.',
    icon: Twitter,
    color: '#1DA1F2',
    type: 'Profile Integration',
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    description: 'Connect and manage LinkedIn Profile or Pages within this workspace.',
    icon: Linkedin,
    color: '#0A66C2',
    type: 'Integration',
  },
  {
    id: 'youtube',
    name: 'YouTube',
    description: 'Connect and manage YouTube channels within this workspace.',
    icon: Youtube,
    color: '#FF0000',
    type: 'Channel Integration',
  },
  {
    id: 'threads',
    name: 'Threads',
    description: 'Connect and manage Threads profiles within this workspace.',
    icon: ThreadsIcon,
    color: '#9B9B9B',
    type: 'Profile Integration',
  },
]

export const setupGuideSteps = [
  {
    id: 'connect-platform',
    index: 1,
    labelKey: 'connect_platform_step',
    descriptionKey: 'connect_platform_step_desc',
    status: 'completed',
  },
  {
    id: 'configure-settings',
    index: 2,
    labelKey: 'configure_settings_step',
    descriptionKey: 'configure_settings_step_desc',
    status: 'in_progress',
  },
  {
    id: 'test-connection',
    index: 3,
    labelKey: 'test_connection_step',
    descriptionKey: 'test_connection_step_desc',
    status: 'pending',
  },
  {
    id: 'start-publishing',
    index: 4,
    labelKey: 'start_publishing_step',
    descriptionKey: 'start_publishing_step_desc',
    status: 'pending',
  },
] as const

export const getPlatformGradient = (id: string) => {
  switch (id) {
    case 'facebook':
      return 'linear-gradient(135deg, #1877F2 0%, #1565C0 100%)'
    case 'instagram':
      return 'linear-gradient(135deg, #833AB4 0%, #FD1D1D 50%, #F56040 100%)'
    case 'twitter':
      return 'linear-gradient(135deg, #1DA1F2 0%, #0D8CD8 100%)'
    case 'linkedin':
      return 'linear-gradient(135deg, #0A66C2 0%, #084C92 100%)'
    case 'youtube':
      return 'linear-gradient(135deg, #FF0000 0%, #CC0000 100%)'
    case 'threads':
      return 'linear-gradient(135deg, #101010 0%, #222222 100%)'
    default:
      return 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)'
  }
}

export const getPlatformGlow = (id: string) => {
  switch (id) {
    case 'facebook':
      return 'hover:shadow-[0_8px_25px_rgba(24,119,242,0.45)] dark:hover:shadow-[0_8px_30px_rgba(24,119,242,0.6)]'
    case 'instagram':
      return 'hover:shadow-[0_8px_25px_rgba(253,29,29,0.45)] dark:hover:shadow-[0_8px_30px_rgba(253,29,29,0.6)]'
    case 'twitter':
      return 'hover:shadow-[0_8px_25px_rgba(29,161,242,0.45)] dark:hover:shadow-[0_8px_30px_rgba(29,161,242,0.6)]'
    case 'linkedin':
      return 'hover:shadow-[0_8px_25px_rgba(10,102,194,0.45)] dark:hover:shadow-[0_8px_30px_rgba(10,102,194,0.6)]'
    case 'youtube':
      return 'hover:shadow-[0_8px_25px_rgba(255,0,0,0.45)] dark:hover:shadow-[0_8px_30px_rgba(255,0,0,0.6)]'
    case 'threads':
      return 'hover:shadow-[0_8px_25px_rgba(0,0,0,0.35)]'
    default:
      return 'hover:shadow-[0_8px_25px_rgba(var(--primary-rgb),0.45)]'
  }
}