import React from 'react'
import { useTranslation } from 'react-i18next'
import { Camera, Mail } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn, getAvatarColorClass } from '@/lib/utils'
import { HeaderProfileCardProps } from '@/types'

export const HeaderProfileCard = ({
  user,
  isSuperAdmin,
  planName,
  avatarSrc,
  hasAvatar,
  onEditClick,
  onDashboardClick
}: HeaderProfileCardProps) => {
  const { t } = useTranslation()

  return (
    <div className="relative border-glass-border border bg-white dark:bg-slate-900/30 backdrop-blur-xl rounded-border-radius overflow-hidden p-6 sm:p-8 transition-all duration-300">
      {/* Elegant glowing background animations */}
      <div className="absolute -top-12 -left-12 w-64 h-64 rounded-full opacity-10 blur-3xl pointer-events-none bg-primary" />
      <div className="absolute -bottom-12 -right-12 w-64 h-64 rounded-full opacity-10 blur-3xl pointer-events-none bg-secondary" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-6">
          {/* Profile Avatar Wrapper */}
          <div className="relative group shrink-0">
            <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white dark:border-slate-800 relative  transition-transform duration-500 hover:scale-[1.02]">
              <Avatar className="w-full h-full">
                {hasAvatar && avatarSrc && (
                  <AvatarImage src={avatarSrc} className="object-cover" />
                )}
                <AvatarFallback className={cn('text-3xl font-extrabold', getAvatarColorClass(user.name))}>
                  {user.name?.charAt(0).toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <div
                className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer"
                onClick={onEditClick}
              >
                <Camera className="w-6 h-6 text-white" />
              </div>
            </div>
            <Button
              size="icon"
              className="absolute -bottom-1 -right-1 rounded-full h-8 w-8 bg-white! dark:bg-slate-800! border border-glass-border shadow-md cursor-pointer"
              onClick={onEditClick}
            >
              <Camera className="w-3.5 h-3.5 text-black! dark:text-white!" />
            </Button>
          </div>

          {/* Profile Identity info */}
          <div className="space-y-2 flex-1">
            <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-3">
              <h2 className="text-2xl sm:text-3xl font-black text-title-color dark:text-white tracking-tight">
                {user.name}
              </h2>
              <Badge className="bg-primary/10 border border-primary/20 text-primary text-xs font-extrabold tracking-wider px-3 py-0.5 rounded-full capitalize">
                {isSuperAdmin ? t('admin_badge', { defaultValue: 'System Admin' }) : planName}
              </Badge>
            </div>
            <p className="text-sm text-subtitle-color dark:text-slate-300 max-w-xl leading-relaxed font-medium">
              {t('profile_bio_placeholder', {
                defaultValue:
                  'Mastering the art of automated short-form content. Connect accounts to publish instantly.',
              })}
            </p>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-6 gap-y-2 pt-1">
              <span className="text-xs text-subtitle-color   font-bold flex items-center gap-1.5">
                <Mail className="w-4 h-4 text-primary" />
                {user.email}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row md:flex-col gap-3 shrink-0 w-full md:w-48">
          <Button
            onClick={onEditClick}
            className="h-10 px-6 rounded-xl primary-btn text-white! font-bold text-xs border-0 cursor-pointer transition-all duration-300 hover:scale-105 active:scale-95 leading-none w-full"
          >
            {t('edit_profile', { defaultValue: 'Edit Profile' })}
          </Button>
          <Button
            onClick={onDashboardClick}
            variant="outline"
            className="h-10 px-6 rounded-xl bg-slate-50 dark:bg-white/5 border border-glass-border text-subtitle-color dark:text-slate-200 font-bold text-xs cursor-pointer transition-all duration-300 hover:scale-105 active:scale-95 leading-none w-full"
          >
            {t('view_dashboard_activity', { defaultValue: 'View Dashboard' })}
          </Button>
        </div>
      </div>
    </div>
  )
}
