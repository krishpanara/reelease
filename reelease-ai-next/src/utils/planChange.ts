import { Plan } from '@/types'

export type PlanChangeMode = 'upgrade' | 'downgrade' | 'topup' | null

export function getCurrentPlanAmount(subscription: { plan?: Plan; plan_id?: Plan | string } | null | undefined): number {
  if (!subscription) return 0
  const plan = typeof subscription.plan_id === 'object' ? subscription.plan_id : subscription.plan
  return plan?.amount ?? plan?.price ?? 0
}

export function getCurrentPlanId(subscription: { plan?: Plan; plan_id?: Plan | string } | null | undefined): string | null {
  if (!subscription) return null
  const plan = typeof subscription.plan_id === 'object' ? subscription.plan_id : subscription.plan
  return plan?.id || plan?._id || (typeof subscription.plan_id === 'string' ? subscription.plan_id : null) || null
}

export function hasActiveSubscription(subscription: { status?: string } | null | undefined): boolean {
  if (!subscription) return false
  return subscription.status === 'active' || subscription.status === 'trial' || subscription.status === 'trialing'
}

export function filterPlansByMode(
  plans: Plan[],
  currentAmount: number,
  currentPlanId: string | null,
  mode: PlanChangeMode,
): Plan[] {
  if (!mode) {
    return plans.filter((p) => p.plan_type !== 'top_up')
  }

  if (mode === 'topup') {
    return plans.filter((p) => p.plan_type === 'top_up')
  }

  return plans.filter((p) => {
    if (p.plan_type === 'top_up') return false
    const planId = p.id || p._id
    if (planId === currentPlanId) return false
    const amount = p.amount ?? p.price ?? 0
    if (mode === 'upgrade') return amount > currentAmount
    if (mode === 'downgrade') return amount < currentAmount
    return true
  })
}

export function expandPlansForDisplay(plans: Plan[]): Array<Plan & { unique_id: string; _display_billing: string }> {
  return plans.flatMap((p) => {
    const planId = p.id || p._id
    const plan = { ...p, id: planId }

    if (plan.plan_type === 'subscription') {
      const results: Array<Plan & { unique_id: string; _display_billing: string }> = []
      if (plan.billing_cycle === 'monthly' || plan.billing_cycle === 'both') {
        results.push({ ...plan, unique_id: `${planId}-monthly`, _display_billing: 'monthly' })
      }
      if (plan.billing_cycle === 'yearly' || plan.billing_cycle === 'both') {
        results.push({ ...plan, unique_id: `${planId}-yearly`, _display_billing: 'yearly' })
      }
      return results
    }
    if (plan.plan_type === 'prepaid') {
      return [{ ...plan, unique_id: `${planId}-prepaid`, _display_billing: 'one-time' }]
    }
    if (plan.plan_type === 'lifetime') {
      return [{ ...plan, unique_id: `${planId}-lifetime`, _display_billing: 'one-time' }]
    }
    if (plan.plan_type === 'top_up') {
      return [{ ...plan, unique_id: `${planId}-topup`, _display_billing: 'one-time' }]
    }
    return [{ ...plan, unique_id: planId, _display_billing: 'one-time' }]
  })
}
