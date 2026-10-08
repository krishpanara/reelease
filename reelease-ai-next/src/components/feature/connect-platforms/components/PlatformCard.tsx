import { Button } from '@/components/ui/button'
import SafeImage from '@/components/ui/SafeImage'
import { cn } from '@/lib/utils'
import { PlatformCardProps } from '@/types'
import { Loader2, Plus } from 'lucide-react'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useRouter } from 'next/navigation'
import { ROUTES } from '@/constants/routes'
import { getPlatformGradient } from '@/data/connectPlatformsData'
import { SocialAccount } from '@/types/socialMedia'
import { Skeleton } from '@/components/ui/skeleton'

const platformStyles: Record<string, {
  iconBg: string
  topBarBg: string
  btnText: string
  placeholderBg: string
  placeholderIconColor: string
}> = {
  facebook: {
    iconBg: 'bg-[#1877F2] rounded-full',
    topBarBg: 'bg-[#1877F2]',
    btnText: 'Add Page',
    placeholderBg: 'bg-[#1877F2]/10 border-[#1877F2]/20',
    placeholderIconColor: 'text-[#1877F2]',
  },
  instagram: {
    iconBg: 'bg-gradient-to-tr from-[#FFB700] via-[#FF007A] to-[#8C00FF] rounded-full',
    topBarBg: 'bg-gradient-to-r from-[#833AB4] via-[#FD1D1D] to-[#F56040]',
    btnText: 'Add Profile',
    placeholderBg: 'bg-gradient-to-tr from-[#FFB700]/10 via-[#FF007A]/10 to-[#8C00FF]/10 border-[#FF007A]/20',
    placeholderIconColor: 'text-[#FF007A]',
  },
  twitter: {
    iconBg: 'bg-black dark:bg-white/10 rounded-full',
    topBarBg: 'bg-black dark:bg-white/40',
    btnText: 'Add Account',
    placeholderBg: 'bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10',
    placeholderIconColor: 'text-black dark:text-white',
  },
  linkedin: {
    iconBg: 'bg-[#0A66C2] rounded-full',
    topBarBg: 'bg-[#0A66C2]',
    btnText: 'Add Page',
    placeholderBg: 'bg-[#0A66C2]/10 border-[#0A66C2]/20',
    placeholderIconColor: 'text-[#0A66C2]',
  },
  youtube: {
    iconBg: 'bg-[#FF0000] rounded-full',
    topBarBg: 'bg-[#FF0000]',
    btnText: 'Connect Channel',
    placeholderBg: 'bg-[#FF0000]/10 border-[#FF0000]/20',
    placeholderIconColor: 'text-[#FF0000]',
  },
  threads: {
    iconBg: 'bg-black dark:bg-white/10 rounded-full',
    topBarBg: 'bg-black dark:bg-white/40',
    btnText: 'Connect Profile',
    placeholderBg: 'bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10',
    placeholderIconColor: 'text-black dark:text-white',
  },
}

const PlatformCard = ({ platform, accounts, isConnecting, onConnect, isLoading }: PlatformCardProps) => {
  const { t } = useTranslation()
  const router = useRouter()
  const Icon = platform.icon

  // Filter accounts for this platform
  const platformAccounts = useMemo(() => {
    return (accounts as SocialAccount[]).filter(
      (acc) => acc.platform?.toLowerCase() === platform.id.toLowerCase()
    )
  }, [accounts, platform.id])

  // Deduplicate by account_id, prioritizing active status
  const uniquePlatformAccounts = useMemo(() => {
    return Object.values(
      platformAccounts.reduce((acc: Record<string, SocialAccount>, curr: SocialAccount) => {
        const existing = acc[curr.account_id]
        if (!existing || (!existing.is_active && curr.is_active)) {
          acc[curr.account_id] = curr
        }
        return acc
      }, {})
    )
  }, [platformAccounts])

  // Only show active accounts in this view
  const activeAccounts = useMemo(() => {
    return uniquePlatformAccounts.filter((acc) => acc.is_active)
  }, [uniquePlatformAccounts])

  const style = useMemo(() => {
    const normalizedId = platform.id.toLowerCase()
    if (platformStyles[normalizedId]) {
      return platformStyles[normalizedId]
    }
    return {
      iconBg: 'bg-primary rounded-full',
      topBarBg: 'bg-primary',
      btnText: 'Connect',
      placeholderBg: 'bg-primary/10 border-primary/20',
      placeholderIconColor: 'text-primary',
    }
  }, [platform.id])

  const placeholderDescription = useMemo(() => {
    if (platform.id === 'youtube') {
      return 'Connect your YouTube channel to start publishing.'
    }
    if (platform.id === 'threads') {
      return 'Connect your Threads profile to get started.'
    }
    const type = platform.id === 'facebook' || platform.id === 'linkedin' ? 'page' : 'profile'
    return `Connect your ${platform.name} ${type} to start publishing.`
  }, [platform.id, platform.name])

  const handleManageClick = () => {
    router.push(ROUTES.SOCIAL_MEDIA.CHANNELS)
  }

  const isConnected = activeAccounts.length > 0
  const needsAttention = !isConnected && platformAccounts.length > 0
  const isCustomIcon = ['facebook', 'instagram', 'twitter', 'x', 'linkedin', 'linkedin_page', 'youtube', 'threads'].includes(platform.id.toLowerCase())

  return (
    <div className="group relative flex flex-col p-4 sm:p-6 rounded-border-radius bg-white dark:bg-white/3 border border-glass-border  hover:-translate-y-1 transition-all duration-300 overflow-hidden  hover:shadow-md/5">

      {/* Top Border Bar */}
      <div className={cn("absolute top-0 left-0 right-0 h-[4px]", style.topBarBg)} />

      {/* Card Header */}
      <div className="flex items-center justify-between mb-5 relative z-10 w-full">
        <div className="flex items-center gap-3">
          {isCustomIcon ? (
            <Icon
              className="w-11 h-11 shrink-0 transition-transform duration-300 group-hover:scale-105"
              filled={true}
            />
          ) : (
            <div className={cn("w-11 h-11 flex items-center justify-center text-white shrink-0 shadow-sm transition-transform duration-300 group-hover:scale-105 rounded-full overflow-hidden", style.iconBg)}>
              <Icon className="w-5 h-5 text-white" />
            </div>
          )}
          <div className="flex flex-col text-left">
            <h4 className="font-bold text-base text-slate-800 dark:text-zinc-100 leading-tight">{platform.name}</h4>
          </div>
        </div>
        <div>
          {isConnected ? (
            <span className="text-2xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/15">
              {t('active', { defaultValue: 'Active' })}
            </span>
          ) : needsAttention ? (
            <span className="text-2xs font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/15">
              {t('needs_attention', { defaultValue: 'Needs Attention' })}
            </span>
          ) : (
            <span className="text-2xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-500 dark:bg-zinc-800 dark:text-zinc-400 border border-slate-200/50 dark:border-zinc-700">
              {t('not_connected', { defaultValue: 'Not Connected' })}
            </span>
          )}
        </div>
      </div>

      {/* Card Body/Content */}
      {isLoading ? (
        <div className="flex-1 flex flex-col mb-5 relative z-10 w-full">
          {/* Skeleton Header */}
          <Skeleton className="w-20 h-4 bg-slate-200/80 dark:bg-white/10 mb-2.5 rounded" />
          {/* List of Skeleton Profiles */}
          <div className="space-y-2 h-[96px] overflow-hidden pr-1">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="flex items-center justify-between p-2 rounded-border-radius-inner bg-subcard dark:bg-white/3 border border-glass-border text-xs"
              >
                <div className="flex items-center gap-2 w-full">
                  <Skeleton className="w-7 h-7 rounded-full bg-slate-200/80 dark:bg-white/10 shrink-0" />
                  <div className="flex flex-col gap-1.5 w-full">
                    <Skeleton className="w-2/3 h-2.5 bg-slate-200/80 dark:bg-white/10 rounded" />
                    <Skeleton className="w-1/3 h-2 bg-slate-200/80 dark:bg-white/10 rounded" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : isConnected ? (
        <div className="flex-1 flex flex-col mb-5 relative z-10 w-full">
          {/* Left-aligned Accounts count header */}
          <p className="text-[13px] font-bold text-slate-500 dark:text-zinc-400 text-left mb-2.5">
            {t('accounts', { defaultValue: 'Accounts' })} ({activeAccounts.length})
          </p>

          {/* List of Connected Profiles */}
          <div className="space-y-2 h-[96px] overflow-y-auto pr-1 no-scrollbar">
            {activeAccounts.map((acc: SocialAccount) => (
              <div
                key={acc.id}
                className="flex items-center justify-between p-2 rounded-border-radius-inner bg-subcard dark:bg-white/3 border border-glass-border text-xs"
              >
                <div className="flex items-center gap-2 min-w-0">
                  {acc.profile_picture ? (
                    <SafeImage
                      src={acc.profile_picture}
                      fallbackName={acc.account_name || acc.account_username || 'U'}
                      isStandardImg
                      alt={acc.account_name}
                      className="w-7 h-7 rounded-full object-cover shrink-0 border border-glass-border"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary shrink-0">
                      {(acc.account_name || 'A').charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="flex flex-col text-left min-w-0">
                    <span className="font-semibold text-title-color truncate leading-tight">
                      {acc.account_name}
                    </span>
                    {platform.id === 'twitter' && acc.account_username && (
                      <span className="text-3xs text-subtitle-color truncate mt-0.5">
                        @{acc.account_username}
                      </span>
                    )}

                  </div>
                </div>
                {/* Green Check Circle */}
                <div className="w-4 h-4 rounded-full border border-emerald-500/80 flex items-center justify-center text-emerald-500 bg-emerald-500/5 shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-2 h-2">
                    <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center min-h-[148px] mb-5 relative z-10 w-full">
          {/* Circular graphics for placeholder */}
          <div className={cn("w-14 h-14 rounded-full flex items-center justify-center relative mb-3.5 border transition-transform duration-300 group-hover:scale-105", style.placeholderBg)}>
            {isCustomIcon ? (
              <Icon className="w-8 h-8 shrink-0" filled={true} />
            ) : (
              <Icon className={cn("w-6 h-6", style.placeholderIconColor)} />
            )}
            <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 flex items-center justify-center shadow-sm text-slate-700 dark:text-zinc-300">
              <Plus className="w-3.5 h-3.5 font-bold" />
            </div>
          </div>

          <div className="text-center">
            <p className="text-[13px] font-bold text-slate-700 dark:text-zinc-300">
              {platform.id === 'facebook' || platform.id === 'linkedin'
                ? t('no_page_connected', { defaultValue: 'No Page Connected' })
                : platform.id === 'instagram' || platform.id === 'threads'
                  ? t('no_profile_connected', { defaultValue: 'No Profile Connected' })
                  : platform.id === 'youtube'
                    ? t('no_channel_connected', { defaultValue: 'No Channel Connected' })
                    : t('no_account_connected', { defaultValue: 'No Account Connected' })
              }
            </p>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 leading-normal max-w-[210px] mx-auto">
              {placeholderDescription}
            </p>
          </div>
        </div>
      )}

      {/* Card Footer / Buttons */}
      <div className="flex items-center gap-2 mt-auto pt-4 border-t border-glass-border relative z-10 w-full">
        {/* Action Buttons */}
        {isConnected ? (
          <>
            {/* Manage button */}
            <Button
              variant="outline"
              onClick={handleManageClick}
              className="h-10 px-4 rounded-xl border  border-glass-border dark:bg-transparent! text-xs font-semibold flex-1 flex items-center justify-center"
            >
              {t('manage', { defaultValue: 'Manage' })}
            </Button>

            {/* Add more button */}
            <Button
              onClick={() => onConnect(platform.id)}
              disabled={isConnecting}
              style={{ background: getPlatformGradient(platform.id) }}
              className="h-10 px-4 rounded-xl text-xs font-semibold flex-1 flex items-center justify-center text-white! hover:opacity-90 transition-all duration-200 shadow-md dark:shadow-white/10 border-none"
            >
              {isConnecting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                style.btnText
              )}
            </Button>
          </>
        ) : (
          /* Connect button (takes remaining width) */
          <Button
            onClick={() => onConnect(platform.id)}
            disabled={isConnecting}
            style={{ background: getPlatformGradient(platform.id) }}
            className="h-10 px-4 rounded-xl text-xs font-bold w-full flex items-center justify-center text-white! hover:opacity-90 transition-all duration-200 shadow-sm border-none"
          >
            {isConnecting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              style.btnText
            )}
          </Button>
        )}
      </div>
    </div>
  )
}

export default PlatformCard
