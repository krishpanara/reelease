'use client'

import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { aiFeatureKeys, featureStyles, iconMap } from '@/data/plan'
import { cn } from '@/lib/utils'
import { useGetProfileQuery } from '@/redux/api/authApi'
import { UserAIFeatureUsageProps } from '@/types'
import { Check, CreditCard, Gem, Info, Zap } from 'lucide-react'
import Image from 'next/image'
import { useTranslation } from 'react-i18next'

const UserAIFeatureUsage = ({ sub }: UserAIFeatureUsageProps) => {
  const { t } = useTranslation()
  const { data: profileData } = useGetProfileQuery()

  const user = profileData?.user || {}
  const plan = typeof sub.plan_id === 'object' ? sub.plan_id : null

  // Prioritize user's actual credits, fallback to plan only if user data not loaded
  const totalCredits = user.total_credits !== undefined ? user.total_credits : (plan?.total_credits || 0)
  const captionCredits = user.caption_credits !== undefined ? user.caption_credits : (plan?.caption_credits || 0)
  const usedCredits = user.used_credits || 0
  const remainingCredits = Math.max(0, totalCredits - usedCredits)
  const usagePercentage = totalCredits > 0 ? Math.min(100, (usedCredits / totalCredits) * 100) : 0

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mt-6">
      {/* Credits Usage Card */}
      <Card className="lg:col-span-1 sm:p-6 p-4 bg-white/2 border-glass-border rounded-2xl flex flex-col justify-between group">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <CreditCard className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-title-color dark:text-white text-sm">{t('credits_usage')}</h3>
            </div>
            <div className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold border border-primary">
              {usagePercentage.toFixed(0)}%
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-muted-foreground font-medium">{t('consumed')}</span>
              <span className="text-title-color dark:text-white font-semibold">
                {usedCredits} / {totalCredits}
              </span>
            </div>
            <Progress value={usagePercentage} className="h-3 bg-primary/10" />
            <p className="text-xs text-subtitle-color font-semibold flex items-center gap-1">
              <Info className="w-3 h-3" />
              {t('credits_reset_cycle', { cycle: t(sub.billing_cycle || 'monthly') })}
            </p>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-white/5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-black text-primary tracking-wide">{remainingCredits}</p>
              <p className="text-sm text-subtitle-color font-bold tracking-wide">{t('credits_available')}</p>
            </div>
            <div className="w-12 h-12 rounded-full flex items-center justify-center group-hover:border-primary transition-colors">
              <Gem className="w-6 h-6 text-primary animate-pulse" />
            </div>
          </div>
        </div>
      </Card>

      {/* Caption Credits Card */}
      <Card className="lg:col-span-1 sm:p-6 p-4 bg-white/2 border-glass-border rounded-2xl flex flex-col justify-between group">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                </svg>
              </div>
              <h3 className="font-bold text-title-color dark:text-white text-sm">Caption Credits</h3>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-muted-foreground font-medium">Available</span>
              <span className="text-title-color dark:text-white font-semibold">
                {captionCredits}
              </span>
            </div>
            <p className="text-xs text-subtitle-color flex items-center gap-1">
              <Info className="w-3 h-3" />
              Used for AI caption generation
            </p>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-white/5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-black text-blue-500 tracking-wide">{captionCredits}</p>
              <p className="text-sm text-subtitle-color font-bold tracking-wide">Caption Credits Left</p>
            </div>
            <div className="w-12 h-12 rounded-full flex items-center justify-center group-hover:border-blue-500 transition-colors">
              <svg className="w-6 h-6 text-blue-500 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
              </svg>
            </div>
          </div>
        </div>
      </Card>

      {/* Top-up Credits Card */}
      {(user.top_up_credits !== undefined && (user.top_up_credits > 0 || user.top_up_expires_at)) && (
        <Card className="lg:col-span-1 sm:p-6 p-4 bg-white/2 border-glass-border rounded-2xl flex flex-col justify-between group">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="font-bold text-title-color dark:text-white text-sm">Top-up Credits</h3>
              </div>
              {user.top_up_credits > 0 && (
                <span className="text-[10px] bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded-full font-bold border border-emerald-500">
                  Active
                </span>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground font-medium">Remaining</span>
                <span className="text-title-color dark:text-white font-semibold">
                  {user.top_up_credits ?? 0}
                </span>
              </div>
              {user.top_up_expires_at && (
                <p className="text-xs text-subtitle-color flex items-center gap-1">
                  <Info className="w-3 h-3" />
                  Expires: {new Date(user.top_up_expires_at).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-white/5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-black text-emerald-500 tracking-wide">{user.top_up_credits ?? 0}</p>
                <p className="text-sm text-subtitle-color font-bold tracking-wide">Top-up Left</p>
              </div>
              <div className="w-12 h-12 rounded-full flex items-center justify-center group-hover:border-emerald-500 transition-colors">
                <svg className="w-6 h-6 text-emerald-500 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            </div>
          </div>
        </Card>
      )}
      <Card className="lg:col-span-2 sm:p-6 p-4 bg-white/2 border-glass-border rounded-border-radius group">
        <div className="flex items-center gap-2 mb-6">
          <div className="p-2 rounded-lg bg-purple-500/10 text-purple-500">
            <Zap className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-title-color dark:text-white text-sm">{t('included_ai_features')}</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 relative z-10">
          {aiFeatureKeys.map((f) => {
            const isEnabled = plan?.ai_features?.[f.key]
            const style = featureStyles[f.key]
            const iconPath = iconMap[f.key]

            return (
              <div
                key={f.key}
                className={cn(
                  'flex items-center gap-4 sm:p-3 p-2 rounded-full border border-glass-border transition-all duration-300',
                  isEnabled
                    ? 'bg-black/2  dark:bg-white/2 dark:border-white/10 opacity-100'
                    : 'bg-black/2  dark:bg-white/2 dark:border-white/10',
                )}
              >
                <div
                  className={cn('p-2.5 rounded-full relative overflow-hidden', !isEnabled && 'dark:bg-white/20! bg-black/20!')}
                  style={
                    isEnabled
                      ? {
                        background: style?.gradient || 'var(--primary)',
                        boxShadow: `0 0 10px ${style?.glow || 'rgba(var(--primary-rgb), 0.1)'}`,
                      }
                      : {}
                  }
                >
                  <Image
                    width={24}
                    height={24}
                    unoptimized
                    className="w-6 h-6 object-contain relative z-10"
                    src={iconPath}
                    alt="icon"
                  />
                  {isEnabled && (
                    <div
                      className="absolute inset-0 rounded-full blur-lg opacity-40 group-hover:opacity-80 transition-opacity"
                      style={{ background: style?.gradient || 'var(--primary)' }}
                    />
                  )}
                </div>
                <div className="flex flex-col flex-1">
                  <span className={cn('text-sm font-bold', isEnabled ? 'text-title-color dark:text-white' : 'text-gray-500 dark:text-gray-400')}>{t(f.label)}</span>
                  <span className="text-xs tracking-wide text-subtitle-color">
                    {isEnabled ? t('unlimited_access') : t('not_included')}
                  </span>
                </div>
                {isEnabled && (
                  <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center mr-2 border border-green-400">
                    <Check className="w-3 h-3 text-green-500" />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </Card>
    </div>
  )
}

export default UserAIFeatureUsage
