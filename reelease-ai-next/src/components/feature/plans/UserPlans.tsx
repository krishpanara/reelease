'use client'

import { PageHeader } from '@/components/reusable/PageHeader'
import { Skeleton } from '@/components/ui/skeleton'
import { useGetActivePlansQuery } from '@/redux/api/planApi'
import { useGetUserSubscriptionQuery } from '@/redux/api/subscriptionApi'
import { useAppSelector } from '@/redux/hooks'
import { Plan } from '@/types'
import {
  expandPlansForDisplay,
  getCurrentPlanAmount,
  hasActiveSubscription
} from '@/utils/planChange'
import {
  Loader2,
  Package
} from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay } from 'swiper/modules'
import { PlanCard } from './components/PlanCard'
import PaymentModal from './PaymentModal'

const UserPlans = () => {
  const { t } = useTranslation()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: plansResponse, isLoading } = useGetActivePlansQuery()
  const { user } = useAppSelector((state) => state.auth)
  const isSuperAdmin =
    user?.role === 'super_admin' ||
    (user?.roleId as any)?.name === 'super_admin' ||
    (user?.role as any)?.name === 'super_admin'
  const { data: subscriptionResp } = useGetUserSubscriptionQuery(undefined, { skip: isSuperAdmin })


  const activeSubscription = subscriptionResp?.data
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null)
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)
  const [confirmedBillingCycle, setConfirmedBillingCycle] = useState<'monthly' | 'yearly' | 'one-time'>('monthly')

  const plans = (plansResponse as any)?.data || []
  const userHasActiveSub = hasActiveSubscription(activeSubscription)
  const currentPlanAmount = getCurrentPlanAmount(activeSubscription)

  const filteredPlans = useMemo(
    () => {
      if (userHasActiveSub) {
        return plans
      }
      return plans.filter((p: Plan) => p.plan_type !== 'top_up')
    },
    [plans, userHasActiveSub],
  )

  const displayedPlans = useMemo(() => expandPlansForDisplay(filteredPlans), [filteredPlans])

  const replaceExistingOnPurchase = !!(userHasActiveSub && selectedPlan && selectedPlan.plan_type !== 'top_up')

  useEffect(() => {
    const modeParam = searchParams.get('mode')
    if (modeParam === 'upgrade' || modeParam === 'downgrade' || modeParam === 'topup') {
      router.replace('/plans')
    }
  }, [searchParams, router])

  if (isLoading) {
    return (
      <div className="space-y-12 animate-pulse p-1">
        {/* Page Header Skeleton */}
        <div className="space-y-2">
          <Skeleton className="w-48 h-8 bg-slate-200/80 dark:bg-white/10 rounded-lg" />
          <Skeleton className="w-[500px] max-w-full h-4 bg-slate-200/80 dark:bg-white/10 rounded" />
        </div>

        {/* Swiper slider of plan card skeletons */}
        <div className="w-full relative px-1 group/swiper">
          <Swiper
            modules={[Autoplay]}
            spaceBetween={20}
            slidesPerView={1}
            grabCursor={true}
            watchSlidesProgress={true}
            observer={true}
            observeParents={true}
            breakpoints={{
              480: { slidesPerView: 1, spaceBetween: 20 },
              640: { slidesPerView: 2, spaceBetween: 24 },
              1024: { slidesPerView: 3, spaceBetween: 24 },
              1536: { slidesPerView: 4, spaceBetween: 24 },
            }}
            autoplay={{
              delay: 3000,
              disableOnInteraction: false,
            }}
            className="pb-4 overflow-visible plan-swiper"
          >
            {Array.from({ length: 4 }).map((_, i) => (
              <SwiperSlide key={i} className="!h-auto flex flex-col">
                <div className="group relative h-[580px] flex flex-col bg-white/3 border dark:border-white/10 border-black/10 rounded-border-radius overflow-hidden transition-all duration-500">
                  {/* Glass border effects */}
                  <div className="absolute inset-0 border border-white/20 dark:border-white/5 rounded-border-radius pointer-events-none z-10" />

                  {/* Main card body */}
                  <div className="relative z-10 sm:p-6 p-4 flex flex-col h-full bg-white dark:bg-white/3">
                    {/* Header */}
                    <div className="flex items-start gap-3 mb-8">
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-radius flex items-center justify-center dark:bg-white/5 bg-white border border-glass-border">
                            <Skeleton className="w-6 h-6 bg-slate-200/80 dark:bg-white/10 rounded" />
                          </div>
                          <div>
                            <Skeleton className="w-24 h-5 mb-2 bg-slate-200/80 dark:bg-white/10 rounded" />
                            <Skeleton className="w-12 h-3.5 bg-slate-200/80 dark:bg-white/10 rounded-full" />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Price Display */}
                    <div className="sm:mb-8 mb-4 relative py-6 px-4 rounded-border-radius-inner dark:bg-gradient-to-br from-white/[0.05] to-transparent border border-glass-border dark:border-white/5 flex flex-col items-center">
                      <div className="absolute inset-0 bg-primary/5" />
                      <div className="relative flex flex-col items-center">
                        <div className="flex items-baseline gap-1">
                          <Skeleton className="w-4 h-6 bg-slate-200/80 dark:bg-white/10 rounded" />
                          <Skeleton className="w-20 h-10 bg-slate-200/80 dark:bg-white/10 rounded" />
                          <Skeleton className="w-10 h-4 bg-slate-200/80 dark:bg-white/10 rounded" />
                        </div>
                      </div>
                    </div>

                    {/* Feature Sections Wrapper */}
                    <div className="space-y-8 mb-6 grow">
                      {/* Usage Limits */}
                      <div className="space-y-4">
                        <div className="text-base flex items-center gap-2 font-semibold">
                          <Skeleton className="w-5 h-5 bg-slate-200/80 dark:bg-white/10 rounded" />
                          <Skeleton className="w-24 h-4 bg-slate-200/80 dark:bg-white/10 rounded" />
                        </div>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between p-3 rounded-border-radius-inner bg-black/3 dark:bg-white/3 border border-glass-border dark:border-white/5">
                            <Skeleton className="w-28 h-4 bg-slate-200/80 dark:bg-white/10 rounded" />
                            <Skeleton className="w-8 h-4 bg-slate-200/80 dark:bg-white/10 rounded" />
                          </div>
                        </div>
                      </div>

                      {/* AI Capabilities Grid */}
                      <div className="space-y-4">
                        <div className="text-base flex items-center gap-2 font-semibold">
                          <Skeleton className="w-5 h-5 bg-slate-200/80 dark:bg-white/10 rounded" />
                          <Skeleton className="w-28 h-4 bg-slate-200/80 dark:bg-white/10 rounded" />
                        </div>
                        <div className="grid sm425:grid-cols-3 grid-cols-5 gap-3">
                          {Array.from({ length: 8 }).map((_, idx) => (
                            <div key={idx} className="flex items-center justify-center aspect-square rounded-border-radius-inner border dark:bg-white/5 bg-black/3 border-glass-border">
                              <Skeleton className="w-5 h-5 bg-slate-200/80 dark:bg-white/10 rounded" />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className="mt-auto pt-5 border-t border-glass-border">
                      <Skeleton className="w-full h-12 bg-slate-200/80 dark:bg-white/10 rounded-border-radius-inner" />
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    )
  }

  const handleSubscribeClick = (plan: Plan) => {
    setSelectedPlan(plan)
    const initialCycle = plan.plan_type === 'subscription' ? (plan as any)._display_billing : 'one-time'
    setConfirmedBillingCycle(initialCycle)
    setIsPaymentModalOpen(true)
  }

  const handlePaymentSuccess = () => {
    setIsPaymentModalOpen(false)
    setSelectedPlan(null)
    router.push('/subscriptions')
  }

  const isPlanActive = (planId: string) => {
    if (!activeSubscription) return false
    const isActiveStatus = activeSubscription.status === 'active' || activeSubscription.status === 'trialing'
    const subscriptionPlanId =
      activeSubscription.plan?.id ||
      activeSubscription.plan?._id ||
      (typeof activeSubscription.plan_id === 'string'
        ? activeSubscription.plan_id
        : (activeSubscription.plan_id as any)?.id || (activeSubscription.plan_id as any)?._id)
    return isActiveStatus && subscriptionPlanId === planId
  }

  const sectionTitle = () => {
    if (!userHasActiveSub) return t('choose_your_plan', { defaultValue: 'Choose Your Plan' })
    return t('manage_your_plan', { defaultValue: 'Manage Your Plan' })
  }

  const sectionDescription = () => {
    if (!userHasActiveSub) {
      return t('flexible_plans_desc', {
        defaultValue: 'Select the perfect plan for your business needs. Upgrade or downgrade at any time.',
      })
    }
    return t('plan_change_select_action', {
      defaultValue: 'You have an active plan. Choose to upgrade, downgrade, or top-up your credits.',
    })
  }

  const getSubscribeButtonText = (plan: Plan) => {
    if (userHasActiveSub) {
      if (plan.plan_type === 'top_up') {
        return t('topup_now', { defaultValue: 'Top-up' })
      }
      const planAmount = plan.amount ?? plan.price ?? 0
      if (planAmount > currentPlanAmount) {
        return t('upgrade_now', { defaultValue: 'Upgrade' })
      } else if (planAmount < currentPlanAmount) {
        return t('downgrade_now', { defaultValue: 'Downgrade' })
      }
    }
    return undefined
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      <PageHeader
        icon={<Package className="w-6 h-6 text-primary animate-pulse" />}
        title={t(sectionTitle())}
        subtitle={t(sectionDescription())}
        showBackButton={false}
      />

      <div className="space-y-12">
        {displayedPlans.length === 0 ? (
          <div className="px-4 text-center py-20 glass-card glass-dark-card rounded-border-radius border border-glass-border">
            <p className="text-xl font-medium text-subtitle-color">
              {t('no_plans_available', { defaultValue: 'No plans available for this billing cycle.' })}
            </p>
          </div>
        ) : (
          <div className="w-full relative px-1 group/swiper">
            <Swiper
              modules={[Autoplay]}
              spaceBetween={20}
              slidesPerView={1}
              grabCursor={true}
              watchSlidesProgress={true}
              observer={true}
              observeParents={true}
              breakpoints={{
                480: { slidesPerView: 1, spaceBetween: 20 },
                640: { slidesPerView: 2, spaceBetween: 24 },
                1024: { slidesPerView: 3, spaceBetween: 24 },
                1536: { slidesPerView: 4, spaceBetween: 24 },
              }}
              autoplay={{
                delay: 3000,
                disableOnInteraction: false,
              }}
              className="pb-4 overflow-visible plan-swiper"
            >
              {displayedPlans.map((plan: any) => {
                const isPro = plan.is_default
                const price = plan.amount
                let billingCycleLabel = 'mo'
                if (plan.plan_type === 'subscription' && plan._display_billing === 'yearly') billingCycleLabel = 'yr'
                if (plan.plan_type === 'lifetime') billingCycleLabel = t('lifetime')
                if (plan.plan_type === 'prepaid' || plan.plan_type === 'top_up') billingCycleLabel = t('one_time')
                const isActive = isPlanActive(plan.id)

                return (
                  <SwiperSlide key={plan.unique_id} className="!h-auto flex flex-col box-border">
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 h-full flex flex-col">
                      <PlanCard
                        plan={plan}
                        price={price || 0}
                        billingCycleLabel={billingCycleLabel}
                        isPro={isPro}
                        isActive={isActive}
                        isDisabled={false}
                        onSubscribe={() => handleSubscribeClick(plan)}
                        buttonText={getSubscribeButtonText(plan)}
                        t={t}
                      />
                    </div>
                  </SwiperSlide>
                )
              })}
            </Swiper>
          </div>
        )}
      </div>

      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => {
          setIsPaymentModalOpen(false)
          setSelectedPlan(null)
        }}
        plan={selectedPlan}
        billingCycle={confirmedBillingCycle}
        replaceExisting={replaceExistingOnPurchase}
        onSuccess={handlePaymentSuccess}
      />
    </div>
  )
}

export default UserPlans
