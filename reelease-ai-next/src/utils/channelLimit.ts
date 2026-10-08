/** Resolves channel limit from subscription plan, matching backend checkChannelLimit fallback. */
type SubscriptionLike = {
  data?: { plan?: { channel_limit?: number | null }; plan_id?: { channel_limit?: number | null } | string }
}

type SettingsLike = { channel_limit?: number | null; data?: { channel_limit?: number | null } }

export function resolveChannelLimit(
  subscriptionResp: SubscriptionLike | undefined,
  publicSettingsResp?: SettingsLike | null,
): number {
  const sub = subscriptionResp?.data
  const plan = sub?.plan || (typeof sub?.plan_id === 'object' ? sub.plan_id : null)
  if (plan?.channel_limit !== null && plan?.channel_limit !== undefined) {
    return Number(plan.channel_limit)
  }
  const settings = publicSettingsResp?.data ?? publicSettingsResp
  if (settings?.channel_limit !== null && settings?.channel_limit !== undefined) {
    return Number(settings.channel_limit)
  }
  return 2
}
