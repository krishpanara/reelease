'use client'

import { PageHeader } from '@/components/reusable/PageHeader'
import { Button } from '@/components/ui/button'
import { ROUTES } from '@/constants/routes'
import {
  useCancelSubscriptionMutation,
  useGetUserSubscriptionQuery,
} from '@/redux/api/subscriptionApi'
import { ApiError, Subscription } from '@/types'
import { differenceInDays } from 'date-fns'
import { Package, TicketCheck } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { useAppSelector } from '@/redux/hooks'
import SubscriptionHistory from './SubscriptionHistory'
import UserSubscriptionOverview from './UserSubscriptionOverview'

const UserSubscription = () => {
  const { t } = useTranslation()
  const { user } = useAppSelector((state) => state.auth)
  const isSuperAdmin =
    user?.role === 'super_admin' ||
    (user?.roleId as any)?.name === 'super_admin' ||
    (user?.role as any)?.name === 'super_admin'
  const { data: subscriptionResp, isLoading } = useGetUserSubscriptionQuery(undefined, { skip: isSuperAdmin })

  const [cancelSubscription, { isLoading: isCancelling }] = useCancelSubscriptionMutation()
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false)
  const [historyFilter, setHistoryFilter] = useState<'all' | 'active' | 'expired' | 'cancelled'>('all')

  const subRaw = subscriptionResp?.data
  const historyRaw = (subscriptionResp as any)?.subscription_history?.data || []

  const isRecentIncomplete = (h: Subscription) =>
    h.status === 'incomplete' && differenceInDays(new Date(), new Date(h.created_at)) === 0

  const sub = subRaw?.status === 'incomplete' ? null : subRaw

  const history = historyRaw.filter(
    (h: Subscription) => h.status !== 'incomplete' || (h === subRaw && isRecentIncomplete(h))
  )

  const handleCancel = async () => {
    const subId = sub?.id || (sub as any)?._id
    if (!subId) return
    try {
      await cancelSubscription(subId).unwrap()
      toast.success(t('subscription_cancelled_successfully'))
      setIsCancelDialogOpen(false)
    } catch (error) {
      const apiError = error as ApiError
      toast.error(apiError?.data?.message || t('something_went_wrong'))
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  if (!sub) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] text-center space-y-6 animate-in fade-in bg-white dark:bg-white/3! border border-glass-border rounded-radius">
        <div className="w-24 h-24 rounded-border-radius bg-primary/10 flex items-center justify-center mb-4">
          <Package className="w-10 h-10 text-primary" />
        </div>
        <h2 className="text-3xl font-medium text-title-color dark:text-white">
          {t('no_active_subscription')}
        </h2>
        <p className="text-subtitle-color max-w-md text-base  ">
          {t('no_subscription_desc')}
        </p>
        <Button className="sm:h-12 h-10 p-button-padding! rounded-[8px] font-medium text-base primary-btn text-white!" asChild>
          <Link href={ROUTES.PLANS}>{t('view_plans')}</Link>
        </Button>
      </div>
    )
  }

  const daysRemaining =
    sub.days_remaining ??
    (sub.current_period_end ? Math.max(0, differenceInDays(new Date(sub.current_period_end), new Date())) : 0)

  const amountPaid = sub.amount_paid || sub.amount || 0

  const historyRows = history.map((h: Subscription) => {
    return (
      {
        plan: h.plan?.name || 'Basic Plan',
        members: h.member_count || 1,
        billing_cycle: h.plan_id?.billing_cycle || 'monthly',
        amount: h.amount_paid || h.amount || 0,
        status: h.status,
        subscription_date: h.current_period_start,
        expiry_date: h.current_period_end,
        cancel_at_period_end: h.cancel_at_period_end,
      }
    );
  })


  const filteredHistory = historyRows.filter((row: any) => {
    if (historyFilter === 'all') return true
    if (historyFilter === 'active') return row.status === 'active' && !row.cancel_at_period_end
    if (historyFilter === 'expired') return row.status === 'past_due' || row.status === 'incomplete_expired'
    if (historyFilter === 'cancelled') {
      return (
        row.status === 'cancelled' ||
        (row.status === 'active' && row.cancel_at_period_end)
      )
    }

    return true
  })

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      <PageHeader
        icon={<TicketCheck className="w-6 h-6 text-primary animate-pulse" />}
        title={t('active_plans')}
        subtitle={t('active_plans_desc')}
        showBackButton={false}
      />
      <UserSubscriptionOverview
        sub={sub}
        amountPaid={amountPaid}
        daysRemaining={daysRemaining}
        isCancelDialogOpen={isCancelDialogOpen}
        setIsCancelDialogOpen={setIsCancelDialogOpen}
        handleCancel={handleCancel}
        isCancelling={isCancelling}
        t={t}
      />

      <SubscriptionHistory
        filteredHistory={filteredHistory}
        historyFilter={historyFilter}
        setHistoryFilter={setHistoryFilter}
        sub={sub}
        t={t}
      />
    </div>
  )
}

export default UserSubscription
