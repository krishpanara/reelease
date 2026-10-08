import React from 'react'

export interface ProfileActivitySummaryItem {
  key: string
  labelKey: string
  defaultLabel: string
  value: string | number
  trend: string
  trendType: 'up' | 'down'
  icon: React.ComponentType<{ className?: string }>
  colorClass: string
}

export interface ProfileTimelineItem {
  id: string
  titleKey: string
  defaultTitle: string
  timeKey: string
  defaultTime: string
  icon: React.ComponentType<{ className?: string }>
  colorClass: string
}

export interface ProfileSecurityItem {
  key: string
  labelKey: string
  defaultLabel: string
  statusKey: string
  defaultStatus: string
  descKey: string
  defaultDesc: string
  icon: React.ComponentType<{ className?: string }>
  colorClass: string
}

export interface ProfileHealthGauge {
  key: string
  labelKey: string
  defaultLabel: string
  percentage: number
  statusKey: string
  defaultStatus: string
  color: 'success' | 'info' | 'warning' | 'error' | 'primary'
}

export interface ProfileTeamRoleItem {
  roleNameKey: string
  defaultRoleName: string
  count: number
  colorClass: string
}

import { LucideIcon } from 'lucide-react'

export interface CircularProgressProps {
  percentage: number
  color: 'success' | 'info' | 'warning' | 'error' | 'primary'
  size?: number
  strokeWidth?: number
}

export interface ActivitySummaryStat {
  key: string
  labelKey: string
  defaultLabel: string
  value: string
  trend: string
  icon: LucideIcon
  colorClass: string
}

export interface TimelineItem {
  id: string
  title: string
  time: string
  icon: LucideIcon
  colorClass: string
}

export interface SecurityCenterItem {
  key: string
  labelKey: string
  defaultLabel: string
  statusKey: string
  defaultStatus: string
  descKey: string
  defaultDesc: string
  icon: LucideIcon
  colorClass: string
}

export interface HealthGaugeItem {
  key: string
  labelKey: string
  defaultLabel: string
  percentage: number
  statusKey: string
  defaultStatus: string
  color: 'success' | 'info' | 'warning' | 'error' | 'primary'
}

export interface ProfileFormValues {
  name: string
  email: string
}

export interface PasswordFormValues {
  oldPassword: string
  newPassword: string
  confirmPassword: string
}

export interface AccountManagementCardProps {
  accounts: any[]
  uniquePlatforms: string[]
  isSuperAdmin: boolean
  planName: string
  renewsDate: string
  currentPlan: any
  lastLoginFormattedDate: string
  lastLoginFormattedTime: string
  currentDevice: string
  totalMediaCount: number
  onManagePasswordClick: () => void
}

export interface ActivitySummaryCardProps {
  computedStats: ActivitySummaryStat[]
}

export interface ChangePasswordModalProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  isChanging: boolean
  onSubmit: (values: PasswordFormValues, formikHelpers: any) => void
  onCancel: () => void
}

export interface DeactivateAccountModalProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  isDeactivating: boolean
  onConfirm: () => void
  onCancel: () => void
}

export interface EditProfileModalProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  user: any
  avatarSrc?: string
  hasAvatar: boolean
  isUpdating: boolean
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onSubmit: (values: ProfileFormValues, formikHelpers: any) => void
  onCancel: () => void
  fileInputRef: React.RefObject<HTMLInputElement | null>
}

export interface HeaderProfileCardProps {
  user: any
  isSuperAdmin: boolean
  planName: string
  avatarSrc?: string
  hasAvatar: boolean
  onEditClick: () => void
  onDashboardClick: () => void
}

export interface PlatformCoverageCardProps {
  uniquePlatforms: string[]
}

export interface RecentActivityTimelineProps {
  recentActivitiesTimeline: TimelineItem[]
  onViewAllClick: () => void
}

export interface SecurityCenterCardProps {
  securityCenterConfig: SecurityCenterItem[]
}

export interface SubscriptionUsageCardProps {
  isSuperAdmin: boolean
  planName: string
  creditsPercentage: number
  usedCredits: number
  totalCredits: number
  channelsPercentage: number
  connectedChannels: number
  maxChannelsStr: string
  adminStatsData: any
  getRenewalText: () => string
}

export interface WorkspaceHealthCardProps {
  computedHealthGauges: HealthGaugeItem[]
  onReportClick: () => void
}