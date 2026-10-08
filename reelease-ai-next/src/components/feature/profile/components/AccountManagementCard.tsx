import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ROUTES } from '@/constants/routes'
import { getPlatformIcon, platformColors } from '@/data/profile'
import { cn } from '@/lib/utils'
import { AccountManagementCardProps } from '@/types'
import { Crown, Link2, Plus, Shield, Settings } from 'lucide-react'
import Link from 'next/link'
import { useTranslation } from 'react-i18next'

export const AccountManagementCard = ({
  accounts,
  uniquePlatforms,
  isSuperAdmin,
  planName,
  renewsDate,
  currentPlan,
  lastLoginFormattedDate,
  lastLoginFormattedTime,
  currentDevice,
  totalMediaCount,
  onManagePasswordClick,
}: AccountManagementCardProps) => {
  const { t } = useTranslation()

  return (
    <Card className="xl:col-span-7 border-glass-border glass-card bg-white dark:bg-slate-900/30 rounded-border-radius p-5 sm:p-6 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between border-b border-glass-border pb-4 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 dark:bg-primary/40 flex items-center justify-center text-primary">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-title-color dark:text-white tracking-tight">
                {t('account_management', { defaultValue: 'Account Management' })}
              </h3>
              <p className="text-base text-subtitle-color  font-medium mt-0.5">
                {t('account_management_desc', { defaultValue: 'Manage your account settings, security, and connections.' })}
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {/* Social Connections */}
          <div className="bg-slate-50 dark:bg-white/3 p-4 rounded-border-radius-inner border border-glass-border flex items-center justify-between gap-4 transition-all duration-300">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                <Link2 className="w-4.5 h-4.5 text-primary" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-title-color dark:text-white">
                  {t('social_connections', { defaultValue: 'Social Connections' })}
                </h4>
                <p className="text-xs text-subtitle-color mt-0.5 font-semibold">
                  {accounts.length === 1
                    ? t('active_link', { defaultValue: '1 active platform link' })
                    : t('active_links', {
                      count: accounts.length,
                      defaultValue: '{{count}} active platform links',
                    })}
                </p>
              </div>
            </div>

            {/* Social Platform Icons list */}
            <div className="hidden sm:flex items-center gap-3">
              {uniquePlatforms.map((platform) => {
                const colorClass = platformColors[platform] || 'text-primary'
                return (
                  <div key={platform} className={cn('p-1.5 rounded-lg border', colorClass)}>
                    {getPlatformIcon(platform)}
                  </div>
                )
              })}
              <Link href={ROUTES.SOCIAL_MEDIA.CHANNELS}>
                <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-white/5 flex items-center justify-center border border-dashed border-glass-border hover:bg-primary/5 hover:border-primary/20 transition-all cursor-pointer">
                  <Plus className="w-4 h-4 text-subtitle-color" />
                </div>
              </Link>
            </div>

            <Button
              asChild
              variant="outline"
              className="h-8 rounded-lg border-glass-border dark:bg-transparent text-xs font-bold cursor-pointer hover:bg-slate-100 dark:hover:bg-white/5"
            >
              <Link href={ROUTES.SOCIAL_MEDIA.CHANNELS}>{t('manage', { defaultValue: 'Manage' })}</Link>
            </Button>
          </div>

          {/* System Administrator / Subscription details */}
          <div className="bg-slate-50 dark:bg-white/3 p-4 rounded-border-radius-inner border border-glass-border flex items-center justify-between gap-4 transition-all duration-300">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center shrink-0">
                <Crown className="w-4.5 h-4.5 text-purple-500" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-title-color dark:text-white">
                  {isSuperAdmin
                    ? t('system_administrator', { defaultValue: 'System Administrator' })
                    : `${planName} ${t('subscription', { defaultValue: 'Subscription' })}`}
                </h4>
                <p className="text-xs text-subtitle-color mt-0.5 font-semibold">
                  {isSuperAdmin
                    ? t('unrestricted_admin_access', { defaultValue: 'Lifetime access with full system permissions.' })
                    : currentPlan
                      ? t('renews_on', { date: renewsDate, defaultValue: 'Renews on {{date}}' })
                      : t('upgrade_to_pro_desc', {
                        defaultValue: 'Unlock unlimited video downloads and extra storage.',
                      })}
                </p>
              </div>
            </div>
            {isSuperAdmin ? (
              <Badge className="bg-emerald-500/10 border border-emerald-500/25 text-emerald-500 dark:text-emerald-400 font-extrabold text-[10px] px-2.5 py-0.5 rounded-md  tracking-wider">
                {t('status_administrator', { defaultValue: 'Administrator' })}
              </Badge>
            ) : (
              <Button
                asChild
                variant="outline"
                className="h-8 rounded-lg border-glass-border dark:bg-transparent text-xs font-bold cursor-pointer"
              >
                <Link href={ROUTES.PLANS}>{t('upgrade', { defaultValue: 'Upgrade' })}</Link>
              </Button>
            )}
          </div>

          {/* Security & Privacy */}
          <div className="bg-slate-50 dark:bg-white/3 p-4 rounded-border-radius-inner border border-glass-border flex items-center justify-between gap-4 transition-all duration-300">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                <Shield className="w-4.5 h-4.5 text-emerald-500" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-title-color dark:text-white">
                  {t('security_privacy', { defaultValue: 'Security & Privacy' })}
                </h4>
                <p className="text-xs text-subtitle-color mt-0.5 font-semibold">
                  {t('security_privacy_desc', {
                    defaultValue: 'Change password and manage your authentication preferences.',
                  })}
                </p>
              </div>
            </div>
            <Button
              onClick={onManagePasswordClick}
              variant="outline"
              className="h-8 rounded-lg border-glass-border dark:bg-transparent text-xs font-bold cursor-pointer"
            >
              {t('manage', { defaultValue: 'Manage' })}
            </Button>
          </div>
        </div>
      </div>

      {/* Grid with 3 details boxes inside Account Management */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 pt-4 border-t border-glass-border">
        <div className="bg-subcard dark:bg-white/3 border border-glass-border p-3.5 rounded-border-radius-inner text-left">
          <span className="text-sm  text-subtitle-color font-black  block">
            {t('last_login', { defaultValue: 'Last Login' })}
          </span>
          <span className="text-sm font-extrabold text-title-color dark:text-white mb-1  mt-1.5 block">
            {lastLoginFormattedDate}
          </span>
          <span className="text-xs text-subtitle-color block mt-0.5 leading-none">
            {lastLoginFormattedTime}
          </span>
        </div>

        <div className="bg-subcard dark:bg-white/3 border border-glass-border p-3.5 rounded-border-radius-inner text-left">
          <span className="text-sm  text-subtitle-color font-black  block">
            {t('active_sessions', { defaultValue: 'Active Sessions' })}
          </span>
          <span className="text-sm font-extrabold text-title-color dark:text-white mt-1.5 block leading-relaxed">
            1 session
          </span>
          <span className="text-xs text-subtitle-color block mt-0.5 leading-none">
            {currentDevice}
          </span>
        </div>

        <div className="bg-subcard dark:bg-white/3 border border-glass-border p-3.5 rounded-border-radius-inner text-left flex flex-col justify-between">
          <div>
            <span className="text-sm  text-subtitle-color font-black  block">
              {t('media_library', { defaultValue: 'Media Library' })}
            </span>
            <span className="text-sm font-extrabold text-title-color dark:text-white mt-1.5 block leading-relaxed">
              {t('total_assets_count', { count: totalMediaCount, defaultValue: '{{count}} Uploaded Assets' })}
            </span>
          </div>
          <Link
            href={ROUTES.MEDIA_LIBRARY}
            className="text-xs text-primary hover:underline text-left mt-1 block"
          >
            {t('view_library', { defaultValue: 'View Library' })}
          </Link>
        </div>
      </div>
    </Card>
  )
}
