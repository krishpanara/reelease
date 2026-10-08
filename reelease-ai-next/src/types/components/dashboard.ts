import { DashboardStats } from "@/types"


export interface DashboardChartsProps {
  subscriptionData: Record<string, number>
  rolesData: Record<string, number>
  revenueData?: {
    month: string
    totalRevenue: number
    transactionCount: number
  }[]
}

export interface UserDashboardProps {
  stats: DashboardStats
}

export interface AdminDashboardProps {
  stats: DashboardStats
}

export interface RecentActivityProps {
  recentUsers: {
    id: string
    name: string
    email: string
    created_at: string
    avatar: string | null
    role: string
  }[]
}

export interface DailyPrompt {
  prompt: string
  category: string
  toolName: string
  toolRoute: string
  icon: any
  bgGradient: string
}

export interface DailyPromptContentProps {
  keyIndex: number
  prompt: string
  category: string
  copied: boolean
  isLoading: boolean
  onCopy: () => void
}

export interface DailyPromptFooterProps {
  toolName: string
  toolRoute: string
  icon: React.ComponentType<{ className?: string }>
}

export interface DailyPromptHeaderProps {
  isLoading: boolean
  isRotating: boolean
  onShuffle: () => void
}

export interface DailyPromptStaticConfig {
  promptKey: string
  defaultPrompt: string
  categoryKey: string
  defaultCategory: string
  toolNameKey: string
  defaultToolName: string
  toolRoute: string
  icon: any
  bgGradient: string
}

export interface CategoryPromptConfig {
  category: string
  toolName: string
  toolRoute: string
  icon: any
  bgGradient: string
  systemPrompt: string
}