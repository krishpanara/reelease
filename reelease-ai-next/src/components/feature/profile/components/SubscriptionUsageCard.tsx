import { Button } from '@/components/ui/button'
import { CreditCard } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { ROUTES } from '@/constants/routes'
import { cn } from '@/lib/utils'
import { SubscriptionUsageCardProps } from '@/types'
import Link from 'next/link'
import { useTranslation } from 'react-i18next'

export const SubscriptionUsageCard = ({
  isSuperAdmin,
  planName,
  creditsPercentage,
  usedCredits,
  totalCredits,
  channelsPercentage,
  connectedChannels,
  maxChannelsStr,
  adminStatsData,
  getRenewalText
}: SubscriptionUsageCardProps) => {
  const { t } = useTranslation()

  return (
    <Card className="w-full border-glass-border glass-card bg-white dark:bg-slate-900/30 rounded-border-radius p-5 sm:p-6 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between border-b border-glass-border pb-4 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-border-radius-inner bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100/50 dark:border-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-title-color dark:text-white tracking-tight">
                {t('subscription_usage', { defaultValue: 'Subscription & Usage' })}
              </h3>
              <p className="text-base text-subtitle-color  font-medium mt-0.5">
                {t('subscription_usage_desc', { defaultValue: 'Overview of your plan and resource usage.' })}
              </p>
            </div>
          </div>
        </div>

        <div className={cn(
          "grid grid-cols-1 gap-4 items-center",
          isSuperAdmin ? "sm:grid-cols-3" : "sm:grid-cols-4"
        )}>
          {/* Current Plan */}
          <div className="bg-subcard dark:bg-white/2 border border-glass-border p-4 rounded-border-radius-inner text-left h-full flex flex-col justify-between">
            <div>
              <span className="text-sm  text-subtitle-color   font-black  block">
                {t('current_plan', { defaultValue: 'Current Plan' })}
              </span>
              <span className="text-base font-black text-title-color dark:text-white mt-2 block capitalize">
                {planName}
              </span>
            </div>
            {isSuperAdmin ? (
              <span className="text-sm text-emerald-500 dark:text-emerald-400 font-bold block mt-4">
                {t('unlimited_license', { defaultValue: 'Unlimited Admin License' })}
              </span>
            ) : (
              <Button
                asChild
                variant="outline"
                className="h-8 mt-4 rounded-lg w-full text-xs font-bold border-glass-border dark:bg-transparent cursor-pointer"
              >
                <Link href={ROUTES.PLANS}>
                  {t('manage_plan', { defaultValue: 'Manage Plan' })}
                </Link>
              </Button>
            )}
          </div>

          {/* Credits Used progress - ONLY FOR USERS */}
          {!isSuperAdmin && (
            <div className="bg-subcard dark:bg-white/2 border border-glass-border p-4 rounded-border-radius-inner text-left h-full flex flex-col justify-between sm:col-span-1">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-sm  text-subtitle-color   font-black  block">
                    {t('credits_used', { defaultValue: 'Credits Used' })}
                  </span>
                  <span className="text-xs font-black text-title-color dark:text-white">{creditsPercentage}%</span>
                </div>
                <Progress value={creditsPercentage} className="h-1.5 mt-3 bg-slate-200 dark:bg-slate-800" />
              </div>
              <span className="text-sm text-subtitle-color   font-semibold mt-4 block">
                {usedCredits.toLocaleString()} / {totalCredits === 0 ? '0' : totalCredits.toLocaleString()}
              </span>
            </div>
          )}

          {/* Channels Connected progress */}
          <div className="bg-subcard dark:bg-white/2 border border-glass-border p-4 rounded-border-radius-inner text-left h-full flex flex-col justify-between sm:col-span-1">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-sm  text-subtitle-color   font-black  block">
                  {t('channels_connected', { defaultValue: 'Channels Connected' })}
                </span>
                <span className="text-xs font-black text-title-color dark:text-white">{channelsPercentage}%</span>
              </div>
              <Progress value={channelsPercentage} className="h-1.5 mt-3 bg-slate-200 dark:bg-slate-800" />
            </div>
            <div className="flex items-end justify-between mt-4">
              <span className="text-xs font-black text-title-color dark:text-white leading-none">{connectedChannels}</span>
              <span className="text-sm text-subtitle-color   font-semibold leading-none">
                {connectedChannels} / {maxChannelsStr}
              </span>
            </div>
          </div>

          {/* Renewal Date (User) or Platform Users count (Super Admin) */}
          {isSuperAdmin ? (
            <div className="bg-subcard dark:bg-white/2 border border-glass-border p-4 rounded-border-radius-inner text-left h-full flex flex-col justify-between">
              <div>
                <span className="text-sm  text-subtitle-color   font-black  block">
                  {t('platform_users', { defaultValue: 'Platform Users' })}
                </span>
                <span className="text-base font-black text-title-color dark:text-white mt-2 block">
                  {adminStatsData?.statistics?.totalUsers?.toLocaleString() || '0'}
                </span>
              </div>
              <span className="text-sm text-emerald-500 dark:text-emerald-400 font-bold block mt-4">
                {t('active_subscribers_count', {
                  count: adminStatsData?.statistics?.activeSubscribers || 0,
                  defaultValue: `${adminStatsData?.statistics?.activeSubscribers || 0} Active Subscribers`
                })}
              </span>
            </div>
          ) : (
            <div className="bg-subcard dark:bg-white/2 border border-glass-border p-4 rounded-border-radius-inner text-left h-full flex flex-col justify-between">
              <div>
                <span className="text-sm  text-subtitle-color   font-black  block">
                  {t('renewal_date', { defaultValue: 'Renewal Date' })}
                </span>
                <span className="text-sm font-extrabold text-title-color dark:text-white mt-2 block">
                  {getRenewalText()}
                </span>
              </div>
              <span className="text-sm text-emerald-500 dark:text-emerald-400 font-bold block mt-4">
                {t('active', { defaultValue: 'Active' })}
              </span>
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}
