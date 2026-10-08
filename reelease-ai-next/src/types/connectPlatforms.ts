import { ComponentType } from 'react'

export interface PlatformConfig {
  id: string
  name: string
  icon: ComponentType<{ className?: string; style?: React.CSSProperties; filled?: boolean }>
  color: string
  type: string
  description: string
}

export interface SetupStep {
  id: string
  index: number
  labelKey: string
  descriptionKey: string
  status: 'completed' | 'in_progress' | 'pending'
}

export interface WorkspaceOverviewStats {
  connectedPlatforms: string
  activeAccounts: number
  publishingReady: number
  autoPublishActive: number
  totalPostsThisMonth: number
  totalReach: string
  progressPercentage: number
}

export interface PlatformCardProps {
  platform: PlatformConfig
  accounts: any[]
  isConnecting: boolean
  onConnect: (platformId: string) => void
  isLoading?: boolean
}

export interface WorkspaceOverviewProps {
  stats: WorkspaceOverviewStats
}

export interface PlatformGridProps {
  accounts: any[]
  connectingPlatform: string | null
  onConnect: (platformId: string) => void
  isLoading?: boolean
}