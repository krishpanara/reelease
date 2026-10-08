'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdownMenu'
import { ROUTES } from '@/constants/routes'
import { useAppDirection } from '@/hooks/useAppDirection'
import { cn, getAvatarColorClass } from '@/lib/utils'
import { useGetProfileQuery, useLogoutMutation } from '@/redux/api/authApi'
import { baseApi } from '@/redux/api/baseApi'
import { useGetUserSubscriptionQuery } from '@/redux/api/subscriptionApi'
import { useAppDispatch, useAppSelector } from '@/redux/hooks'
import { clearAuth } from '@/redux/slices/authSlice'
import { authUtils, getMediaUrl } from '@/utils'
import { CreditCard, Loader2, LogOut, Rocket, Settings, User } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

const UserDropdown = () => {
  const { t } = useTranslation()
  const router = useRouter()
  const dispatch = useAppDispatch()
  const direction = useAppDirection()
  const { user, isAuthenticated } = useAppSelector((state) => state.auth)

  useGetProfileQuery(undefined, {
    skip: !isAuthenticated,
    pollingInterval: 5 * 60 * 1000,
    refetchOnFocus: true,
  })

  const [logout, { isLoading }] = useLogoutMutation()
  const isSuperAdmin =
    user?.role === 'super_admin' ||
    (user?.roleId as any)?.name === 'super_admin' ||
    (user?.role as any)?.name === 'super_admin'
  const { data: subData } = useGetUserSubscriptionQuery(undefined, { skip: isSuperAdmin })
  const [showLogoutDialog, setShowLogoutDialog] = useState(false)

  const currentPlan = subData?.data?.plan || subData?.data?.plan_id

  const handleLogout = async () => {
    try {
      await logout().unwrap()
    } catch {
    } finally {
      authUtils.clearAuth()
      dispatch(clearAuth())
      dispatch(baseApi.util.resetApiState())
      setShowLogoutDialog(false)
      router.replace(ROUTES.LANDING)
      toast.success(t('logged_out_successfully'))
    }
  }

  return (
    <Dialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
      <DropdownMenu dir={direction}>
        <DropdownMenuTrigger asChild>
          <div
            title={user?.name || t('profile')}
            className="flex items-center gap-2 sm:gap-3 cursor-pointer transition-all"
          >
            <div className="relative group">
              <Avatar className="w-9! h-9! sm:w-11! sm:h-11! rounded-radius">
                {user?.avatar && (
                  <AvatarImage src={getMediaUrl(user.avatar)} alt={user.name || 'User'} className="object-cover" />
                )}
                <AvatarFallback
                  className={cn('flex items-center justify-center font-bold', getAvatarColorClass(user?.name))}
                >
                  {user?.name?.charAt(0).toUpperCase() || <User className="w-5 h-5" />}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="w-72 border border-border bg-white dark:bg-[#1A1C1E] rounded-[24px]! shadow-2xl p-4 animate-in fade-in zoom-in-95 duration-200"
        >
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <div className="relative p-1 rounded-full border-2 border-primary/20 mb-3">
                <Avatar className="w-10! h-10! rounded-full">
                  {user?.avatar && (
                    <AvatarImage src={getMediaUrl(user.avatar)} alt={user.name || 'User'} className="object-cover" />
                  )}
                  <AvatarFallback
                    className={cn('flex items-center justify-center font-bold text-2xl', getAvatarColorClass(user?.name))}
                  >
                    {user?.name?.charAt(0).toUpperCase() || <User className="w-10 h-10" />}
                  </AvatarFallback>
                </Avatar>
              </div>
              <p className="text-sm font-bold text-primary mb-4">
                {user?.role === 'admin' || user?.role === 'super_admin' ? t(user.role) : user?.name || t('guest')}
              </p>
            </div>

            {user?.role !== 'admin' && user?.role !== 'super_admin' && (
              <div className="w-full dark:bg-white/5 bg-black/5 rounded-[16px] p-4 mb-1 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-full shrink-0" style={{ background: 'linear-gradient(135deg, var(--secondary) 0%, var(--primary) 100%)' }}>
                    <Rocket className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex flex-col leading-tight overflow-hidden">
                    <span className="text-[11px] font-medium dark:text-white/50  text-black/50 tracking-tight">
                      {t('active_plan', { defaultValue: 'Active Plan' })}
                    </span>
                    <div className="flex items-center gap-1.5 overflow-hidden">
                      <span className="text-sm font-bold dark:text-white text-title-color truncate">
                        {typeof currentPlan === 'object' ? currentPlan?.name : currentPlan || t('no_plan')}
                      </span>
                      <Badge className="bg-emerald-500/20 text-emerald-400 border-none px-1.5 py-1 text-[10px] font-medium capitalize shrink-0">
                        {subData?.data?.status || 'active'}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t dark:border-white/5 border-black/5">
                  <div className="flex flex-col leading-tight">
                    <span className="text-base font-bold dark:text-white text-subtitle-color tabular-nums">
                      {typeof currentPlan === 'object' ? `${currentPlan?.currency === 'INR' ? '₹' : '$'}${currentPlan?.amount || 0}` : '₹0'}
                    </span>
                    <span className="text-[10px] text-black/40 dark:text-white/40 uppercase tracking-wide">
                      /{typeof currentPlan === 'object' ? (currentPlan?.billing_cycle === 'monthly' ? t('month') : t('year')) : t('month')}
                    </span>
                  </div>
                  {(subData?.data?.current_period_end || subData?.data?.expires_at) && (
                    <div className="text-right flex flex-col leading-tight">
                      <span className="text-xs font-bold text-rose-500 capitalize">
                        {Math.max(0, Math.ceil((new Date(subData.data.current_period_end || subData.data.expires_at || '').getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))} {t('days_left')}
                      </span>
                      <span className="text-[10px] text-black/40 dark:text-white/40 uppercase tracking-wide">{t('remaining')}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-1">
            <DropdownMenuItem className="cursor-pointer rounded-xl! py-2 px-4 dark:hover:bg-dark-border-alt hover:bg-black/5" asChild>
              <Link href={ROUTES.PROFILE} className="flex items-center w-full">
                <User className="h-5 w-5" />
                <span className="font-semibold text-sm">{t('profile')}</span>
              </Link>
            </DropdownMenuItem>

            {user?.role !== 'admin' && user?.role !== 'super_admin' && (
              <DropdownMenuItem className="cursor-pointer rounded-xl! py-2 px-4 dark:hover:bg-dark-border-alt hover:bg-black/5" asChild>
                <Link href={ROUTES.SUBSCRIPTIONS} className="flex items-center w-full">
                  <CreditCard className="h-5 w-5" />
                  <span className="font-semibold text-sm">{t('subscriptions')}</span>
                </Link>
              </DropdownMenuItem>
            )}
            {user?.role == 'admin' || user?.role == 'super_admin' && (
              <DropdownMenuItem className="cursor-pointer rounded-xl! py-3 px-4 dark:hover:bg-dark-border-alt hover:bg-black/5" asChild>
                <Link href={ROUTES.APP_SETTINGS.HOME} className="flex items-center w-full">
                  <Settings className="h-5 w-5" />
                  <span className="font-semibold text-sm">{t('settings')}</span>
                </Link>
              </DropdownMenuItem>)}

            <div className="pt-2 mt-2 border-t dark:border-white/5 border-black/5">
              <DropdownMenuItem
                onSelect={(e: { preventDefault: () => void }) => {
                  e.preventDefault()
                  setShowLogoutDialog(true)
                }}
                className="text-destructive focus:text-destructive cursor-pointer rounded-xl! py-3 px-4 dark:hover:bg-dark-border-alt hover:bg-black/5 dark:focus:bg-dark-border-alt focus:bg-black/5"
              >
                <LogOut className="h-5 w-5" />
                <span className="font-semibold text-sm">{t('sign_out')}</span>
              </DropdownMenuItem>
            </div>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      <DialogContent className="sm:max-w-lg! max-w-[calc(100%-2rem)]! rounded-border-radius! gap-0 overflow-hidden border-none shadow-2xl bg-light-body" >
        <div>
          <DialogHeader className="mb-6">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 ring-8 ring-primary/5 animate-scale-in">
              <div className="relative">
                <LogOut className="h-8 w-8 text-primary ps-1" />
              </div>
            </div>

            <DialogTitle className="text-center! text-xl font-bold tracking-tight">{t('sign_out')}</DialogTitle>

            <DialogDescription className="text-center! text-muted-foreground mt-2 text-[15px] leading-relaxed">
              {t('sign_out_confirm')}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="grid grid-cols-2 gap-3 sm:gap-3 sm:space-x-0">
            <Button
              variant="outline"
              onClick={() => setShowLogoutDialog(false)}
              className="w-full sm:h-12 h-10 rounded-radius border-glass-border bg-white/3 transition-all duration-200"
            >
              {t('cancel')}
            </Button>
            <Button
              variant="destructive"
              onClick={handleLogout}
              disabled={isLoading}
              className="w-full sm:h-12 h-10 rounded-radius text-base shadow-md transition-all duration-200"
            >
              {isLoading ? (
                <>
                  <Loader2 className="me-2 h-4 w-4 animate-spin" />
                  <span>{t('signing_out')}...</span>
                </>
              ) : (
                t('sign_out')
              )}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default UserDropdown
