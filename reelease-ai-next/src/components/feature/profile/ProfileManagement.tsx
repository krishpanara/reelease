'use client'

import { PageHeader } from '@/components/reusable/PageHeader'
import Spinner from '@/components/reusable/Spinner'
import { Button } from '@/components/ui/button'
import { ROUTES } from '@/constants/routes'
import { useGetAttachmentsQuery } from '@/redux/api/attachmentApi'
import {
  useChangePasswordMutation,
  useDeactivateAccountMutation,
  useGetProfileQuery,
  useUpdateProfileMutation
} from '@/redux/api/authApi'
import { baseApi } from '@/redux/api/baseApi'
import { useGetBlogsQuery } from '@/redux/api/blogApi'
import { useGetAdminDashboardStatsQuery } from '@/redux/api/dashboardApi'
import { useGetSocialAccountsQuery, useGetSocialDashboardQuery } from '@/redux/api/socialApi'
import { useGetPostHistoryQuery } from '@/redux/api/socialPublishApi'
import { useGetUserSubscriptionQuery } from '@/redux/api/subscriptionApi'
import { useGetUserSettingsQuery } from '@/redux/api/userSettingsApi'
import { useAppDispatch, useAppSelector } from '@/redux/hooks'
import { clearAuth, setAuth } from '@/redux/slices/authSlice'
import { ApiError } from '@/types'
import { TimelineItem } from '@/types/components/profile'
import { authUtils, getMediaUrl } from '@/utils'
import { formatDistanceToNow } from 'date-fns'
import {
  ArrowLeft,
  FolderOpen,
  Link2,
  ShieldCheck,
  Sparkles,
  User,
  Video
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import React, { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { AccountManagementCard } from './components/AccountManagementCard'
import { ActivitySummaryCard } from './components/ActivitySummaryCard'
import { ChangePasswordModal } from './components/ChangePasswordModal'
import { DeactivateAccountModal } from './components/DeactivateAccountModal'
import { EditProfileModal } from './components/EditProfileModal'
import { HeaderProfileCard } from './components/HeaderProfileCard'
import { PlatformCoverageCard } from './components/PlatformCoverageCard'
import { RecentActivityTimeline } from './components/RecentActivityTimeline'
import { SecurityCenterCard } from './components/SecurityCenterCard'
import { SubscriptionUsageCard } from './components/SubscriptionUsageCard'
import { WorkspaceHealthCard } from './components/WorkspaceHealthCard'
import { getComputedHealthGauges, getComputedStats, getSecurityCenterConfig } from '@/data/profile'

export default function ProfileManagement() {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const router = useRouter()

  // API Queries & Mutations
  const { data, isLoading: isFetching } = useGetProfileQuery()
  const [updateProfile, { isLoading: isUpdating }] = useUpdateProfileMutation()
  const [changePassword, { isLoading: isChangingPassword }] = useChangePasswordMutation()
  const [deactivateAccount, { isLoading: isDeactivating }] = useDeactivateAccountMutation()
  const { data: accountsData } = useGetSocialAccountsQuery(undefined)

  const { user: authUser, token } = useAppSelector((state) => state.auth)
  const user = data?.user || authUser

  const isSuperAdmin =
    user?.role === 'super_admin' ||
    (user?.roleId as any)?.name === 'super_admin' ||
    (user?.role as any)?.name === 'super_admin'

  const { data: subscription } = useGetUserSubscriptionQuery(undefined, { skip: isSuperAdmin })
  const { data: userSettingsData } = useGetUserSettingsQuery({}, { skip: isSuperAdmin })
  const userSettings = userSettingsData?.userSettings || {}

  // Additional dynamic queries
  const { data: adminStatsData } = useGetAdminDashboardStatsQuery(undefined, { skip: !isSuperAdmin })
  const { data: blogsData } = useGetBlogsQuery({ page: 1, limit: 5 }, { skip: !isSuperAdmin })
  const { data: socialDashboardResponse } = useGetSocialDashboardQuery('month', { skip: isSuperAdmin })
  const socialDashboard = socialDashboardResponse?.data || {}
  const { data: postHistoryData } = useGetPostHistoryQuery({ page: 1, limit: 5 }, { skip: isSuperAdmin })
  const { data: attachmentsDataResponse } = useGetAttachmentsQuery({ limit: 1 })

  // Local state for modals and avatar preview
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false)
  const [isDeactivateModalOpen, setIsDeactivateModalOpen] = useState(false)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDeactivateConfirm = async () => {
    try {
      await deactivateAccount().unwrap()
      toast.success(t('account_deactivated_success', { defaultValue: 'Your account has been deactivated successfully.' }))

      // Clear auth credentials and log out the user
      authUtils.clearAuth()
      dispatch(clearAuth())
      dispatch(baseApi.util.resetApiState())
      setIsDeactivateModalOpen(false)
      router.replace(ROUTES.LANDING)
    } catch (error) {
      const apiError = error as ApiError
      toast.error(apiError?.data?.message || t('deactivation_failed', { defaultValue: 'Failed to deactivate account' }))
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleChangePassword = async (values: any, { resetForm }: any) => {
    try {
      const response = await changePassword({
        currentPassword: values.oldPassword,
        newPassword: values.newPassword,
      }).unwrap()
      resetForm()
      toast.success(
        response.message ||
        t('password_changed_successfully', { defaultValue: 'Password changed successfully' })
      )
      setIsPasswordModalOpen(false)
    } catch (error) {
      const apiError = error as ApiError
      toast.error(
        apiError?.data?.message ||
        t('failed_to_change_password', { defaultValue: 'Failed to change password' })
      )
    }
  }

  const handleSubmit = async (values: any, { resetForm }: any) => {
    try {
      const formData = new FormData()
      formData.append('name', values.name)
      formData.append('email', values.email)
      if (selectedFile) {
        formData.append('avatar', selectedFile)
      }

      const response = await updateProfile(formData).unwrap()

      if (response.user) {
        authUtils.setUser(response.user)
        dispatch(setAuth({ user: response.user, token: token || authUtils.getToken() }))
      }

      setSelectedFile(null)
      setAvatarPreview(null)
      resetForm({ values })

      toast.success(response.message || t('profile_updated'))
      setIsEditModalOpen(false)
    } catch (error) {
      const apiError = error as ApiError
      toast.error(apiError?.data?.message || t('failed_to_update_profile'))
    }
  }

  if (isFetching) {
    return <Spinner className="min-h-[60vh]" />
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <p className="text-muted-foreground">{t('something_went_wrong')}</p>
        <Link href={ROUTES.DASHBOARD}>
          <Button variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t('back_to_dashboard')}
          </Button>
        </Link>
      </div>
    )
  }

  // Parse active subscription details
  const currentPlan = subscription?.data
  const planName = currentPlan?.plan_id?.name || t('free_creator', { defaultValue: 'Free Creator' })
  const amount = currentPlan?.plan_id?.amount || 0
  const currency = currentPlan?.plan_id?.currency === 'INR' ? '₹' : '$'
  const expiry = currentPlan?.current_period_end || currentPlan?.expires_at
  const renewsDate = expiry
    ? new Date(expiry).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : 'N/A'

  // Parse social accounts
  const accounts = accountsData?.data || []
  const uniquePlatforms = Array.from(
    new Set(accounts.map((acc: any) => acc.platform?.toLowerCase()).filter(Boolean))
  ) as string[]

  const avatarSrc = avatarPreview || getMediaUrl(user.avatar) || undefined
  const hasAvatar = !!(avatarPreview || user.avatar)

  // Dynamic Last Login
  const lastLoginDate = user?.lastLogin ? new Date(user.lastLogin) : new Date()
  const lastLoginFormattedDate = lastLoginDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  const lastLoginFormattedTime = lastLoginDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', timeZoneName: 'short' })

  // Active Session / Device info
  const getDeviceName = () => {
    if (typeof window === 'undefined') return 'Web Browser'
    const ua = navigator.userAgent
    if (/mobile/i.test(ua)) return 'Mobile Device'
    if (/iPad|Android|Touch/i.test(ua)) return 'Tablet Device'
    if (/Macintosh/i.test(ua)) return 'macOS Device'
    if (/Windows/i.test(ua)) return 'Windows PC'
    if (/Linux/i.test(ua)) return 'Linux Workstation'
    return 'Desktop PC'
  }
  const currentDevice = getDeviceName()

  // Dynamic Activity Summary Stats
  const computedStats = getComputedStats(
    t,
    isSuperAdmin,
    adminStatsData,
    socialDashboard,
    uniquePlatforms,
    currency
  )

  // Dynamic Recent Timeline
  const recentActivitiesTimeline: TimelineItem[] = []
  if (isSuperAdmin) {
    const recentUsers = adminStatsData?.recentActivities?.recentUsers || []
    const recentTemplates = adminStatsData?.recentActivities?.recentTemplates || []
    const recentBlogs = blogsData?.blogs || []

    const combined: { id: string; title: string; date: Date; icon: any; colorClass: string }[] = []

    const parseDate = (dStr: any) => {
      if (!dStr) return null
      const d = new Date(dStr)
      return isNaN(d.getTime()) ? null : d
    }

    recentUsers.forEach((u: any) => {
      const d = parseDate(u.created_at || u.createdAt)
      if (d) {
        combined.push({
          id: `user_${u._id || u.id}`,
          title: t('user_registered', { name: u.name, defaultValue: `New member ${u.name} registered` }),
          date: d,
          icon: User,
          colorClass: 'text-blue-500 bg-blue-500/10 border-blue-500/20'
        })
      }
    })

    recentTemplates.forEach((temp: any) => {
      const d = parseDate(temp.created_at || temp.createdAt)
      if (d) {
        combined.push({
          id: `template_${temp._id || temp.id}`,
          title: t('template_created', { title: temp.title, defaultValue: `Created template: ${temp.title}` }),
          date: d,
          icon: Sparkles,
          colorClass: 'text-purple-500 bg-purple-500/10 border-purple-500/20'
        })
      }
    })

    recentBlogs.forEach((blog: any) => {
      const d = parseDate(blog.created_at || blog.createdAt)
      if (d) {
        combined.push({
          id: `blog_${blog._id || blog.id}`,
          title: t('blog_created', { title: blog.title, defaultValue: `Created blog: ${blog.title}` }),
          date: d,
          icon: FolderOpen,
          colorClass: 'text-amber-500 bg-amber-500/10 border-amber-500/20'
        })
      }
    })

    // Sort descending by date
    combined.sort((a, b) => b.date.getTime() - a.date.getTime())

    // Convert date to relative time for display, limit to 5 items
    combined.slice(0, 5).forEach((item) => {
      recentActivitiesTimeline.push({
        id: item.id,
        title: item.title,
        time: formatDistanceToNow(item.date, { addSuffix: true }),
        icon: item.icon,
        colorClass: item.colorClass
      })
    })
  } else {
    const historyPosts = postHistoryData?.data || []
    if (historyPosts.length > 0) {
      historyPosts.slice(0, 5).forEach((post: any) => {
        const platformName = post.platform ? post.platform.charAt(0).toUpperCase() + post.platform.slice(1) : ''
        recentActivitiesTimeline.push({
          id: post._id || post.id,
          title: t('published_to_platform', { platform: platformName, defaultValue: `Published video on ${platformName}` }),
          time: post.published_at ? formatDistanceToNow(new Date(post.published_at), { addSuffix: true }) : t('recently', { defaultValue: 'Recently' }),
          icon: Video,
          colorClass: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20'
        })
      })
    } else {
      if (user?.created_at || user?.createdAt) {
        recentActivitiesTimeline.push({
          id: 'user_created',
          title: t('account_created', { defaultValue: 'Account created successfully' }),
          time: formatDistanceToNow(new Date(user.created_at || user.createdAt), { addSuffix: true }),
          icon: User,
          colorClass: 'text-blue-500 bg-blue-500/10 border-blue-500/20'
        })
      }
      uniquePlatforms.slice(0, 2).forEach((platform) => {
        const platformName = platform.charAt(0).toUpperCase() + platform.slice(1)
        recentActivitiesTimeline.push({
          id: `conn_${platform}`,
          title: t('connected_platform', { platform: platformName, defaultValue: `Connected ${platformName} channel` }),
          time: t('active', { defaultValue: 'Active' }),
          icon: Link2,
          colorClass: 'text-purple-500 bg-purple-500/10 border-purple-500/20'
        })
      })
      if (user?.updated_at || user?.updatedAt) {
        recentActivitiesTimeline.push({
          id: 'profile_updated',
          title: t('profile_setup_completed', { defaultValue: 'Profile details updated' }),
          time: formatDistanceToNow(new Date(user.updated_at || user.updatedAt), { addSuffix: true }),
          icon: ShieldCheck,
          colorClass: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20'
        })
      }
    }
  }

  // Subscription & Limits details
  const maxChannels = subscription?.data?.plan_id?.channel_limit || 0
  const connectedChannels = uniquePlatforms.length
  const maxChannelsStr = maxChannels > 0 ? maxChannels.toString() : '6'
  const channelsPercentage = maxChannels > 0 ? Math.min(100, Math.round((connectedChannels / maxChannels) * 100)) : 100

  const totalCredits = user?.total_credits || subscription?.data?.plan_id?.total_credits || 0
  const usedCredits = user?.used_credits || 0
  const creditsPercentage = totalCredits > 0 ? Math.min(100, Math.round((usedCredits / totalCredits) * 100)) : 0

  const getRenewalText = () => {
    if (isSuperAdmin) {
      return t('renewal_admin_status', { defaultValue: 'N/A - Lifetime Admin' })
    }
    if (!subscription?.data) {
      return t('no_active_subscription', { defaultValue: 'No active subscription plan' })
    }
    const dateStr = subscription.data.current_period_end || subscription.data.expires_at
    if (!dateStr) return t('renewal_not_available', { defaultValue: 'Renewal date: N/A' })
    const date = new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
    return t('renews_on', { date, defaultValue: `Renews on ${date}` })
  }

  // Security Center config
  const securityCenterConfig = getSecurityCenterConfig(user)

  // Workspace Health configuration
  const totalMediaCount = attachmentsDataResponse?.total || 0
  const computedHealthGauges = getComputedHealthGauges(
    isSuperAdmin,
    adminStatsData,
    creditsPercentage,
    maxChannels,
    connectedChannels,
    socialDashboard,
    totalMediaCount
  )

  return (
    <div className="mx-auto space-y-6 ">
      {/* Page Header */}
      <PageHeader
        icon={<User className="w-8 h-8" />}
        title={t('profile_settings', { defaultValue: 'Profile Settings' })}
        subtitle={t('update_your_profile_information', {
          defaultValue: 'Update your profile information and manage your account.',
        })}
        showBackButton={false}
        onBack={() => router.push(ROUTES.DASHBOARD)}
      />

      {/* Header Profile Card */}
      <HeaderProfileCard
        user={user}
        isSuperAdmin={isSuperAdmin}
        planName={planName}
        avatarSrc={avatarSrc}
        hasAvatar={hasAvatar}
        onEditClick={() => setIsEditModalOpen(true)}
        onDashboardClick={() => router.push(ROUTES.DASHBOARD)}
      />

      {/* Account Management & Activity Summary */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        <AccountManagementCard
          accounts={accounts}
          uniquePlatforms={uniquePlatforms}
          isSuperAdmin={isSuperAdmin}
          planName={planName}
          renewsDate={renewsDate}
          currentPlan={currentPlan}
          lastLoginFormattedDate={lastLoginFormattedDate}
          lastLoginFormattedTime={lastLoginFormattedTime}
          currentDevice={currentDevice}
          totalMediaCount={totalMediaCount}
          onManagePasswordClick={() => setIsPasswordModalOpen(true)}
        />

        <ActivitySummaryCard computedStats={computedStats} />
      </div>

      {/* Recent Account Activity (Timeline) */}
      <RecentActivityTimeline
        recentActivitiesTimeline={recentActivitiesTimeline}
        onViewAllClick={() => router.push(ROUTES.DASHBOARD)}
      />

      {/* Subscription & Usage, Workspace Health & Platform Coverage */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        <div className="xl:col-span-7 flex flex-col gap-6">
          <SubscriptionUsageCard
            isSuperAdmin={isSuperAdmin}
            planName={planName}
            creditsPercentage={creditsPercentage}
            usedCredits={usedCredits}
            totalCredits={totalCredits}
            channelsPercentage={channelsPercentage}
            connectedChannels={connectedChannels}
            maxChannelsStr={maxChannelsStr}
            adminStatsData={adminStatsData}
            getRenewalText={getRenewalText}
          />

          <WorkspaceHealthCard
            computedHealthGauges={computedHealthGauges}
            onReportClick={() => router.push(ROUTES.DASHBOARD)}
          />
        </div>

        <div className="xl:col-span-5 flex flex-col gap-6">
          <PlatformCoverageCard uniquePlatforms={uniquePlatforms} />
        </div>
      </div>

      {/* Security Center */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        <SecurityCenterCard securityCenterConfig={securityCenterConfig} />
      </div>

      {/* Modals */}
      <EditProfileModal
        isOpen={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        user={user}
        avatarSrc={avatarSrc}
        hasAvatar={hasAvatar}
        isUpdating={isUpdating}
        onFileChange={handleFileChange}
        onSubmit={handleSubmit}
        onCancel={() => {
          setAvatarPreview(null)
          setSelectedFile(null)
          setIsEditModalOpen(false)
        }}
        fileInputRef={fileInputRef}
      />

      <ChangePasswordModal
        isOpen={isPasswordModalOpen}
        onOpenChange={setIsPasswordModalOpen}
        isChanging={isChangingPassword}
        onSubmit={handleChangePassword}
        onCancel={() => setIsPasswordModalOpen(false)}
      />

      <DeactivateAccountModal
        isOpen={isDeactivateModalOpen}
        onOpenChange={setIsDeactivateModalOpen}
        isDeactivating={isDeactivating}
        onConfirm={handleDeactivateConfirm}
        onCancel={() => setIsDeactivateModalOpen(false)}
      />
    </div>
  )
}
