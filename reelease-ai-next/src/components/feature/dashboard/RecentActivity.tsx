'use client'

import { CopyEmailCell } from '@/components/reusable/CopyEmailCell'
import { NoDataFound } from '@/components/reusable/NoDataFound'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { ROUTES } from '@/constants/routes'
import { cn, getAvatarColorClass } from '@/lib/utils'
import { formatDistanceToNow } from 'date-fns'
import { ArrowRight, Users, Users as UsersIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useTranslation } from 'react-i18next'

export const RecentActivity = ({ recentUsers }: { recentUsers: any[] }) => {
  const { t } = useTranslation()
  const router = useRouter()

  return (
    <Card className="p-px rounded-border-radius dark:bg-white/3 border-none glass-card glass-dark-card shadow-none overflow-hidden! group/users w-full h-full flex flex-col">
      <div className="p-4 sm:p-6 pb-2 sm:pb-3 h-full flex flex-col">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 shrink-0 px-1">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 flex justify-center items-center rounded-[9px] bg-primary shrink-0">
              <Users className="text-white! w-5.5 h-5.5" />
            </div>
            <div className='space-y-1'>
              <h3 className="sm:text-xl text-lg mb-0 font-extrabold text-title-color dark:text-white tracking-tight flex items-center gap-2">
                {t('recent_users')}
              </h3>
              <p className="text-base font-medium text-subtitle-color">{t('new_registrations')}</p>
            </div>
          </div>
          <button
            onClick={() => router.push(ROUTES.MEMBERS)}
            className="text-sm font-semibold text-primary hover:text-primary/80 transition-colors border border-glass-border px-3 py-0.5 rounded-xl w-full sm:w-auto text-center mt-2 sm:mt-0"
          >
            {t('see_all', { defaultValue: 'See all' })}
          </button>
        </div>

        <div className="flex-1 overflow-auto min-h-[290px] no-scrollbar">
          <div className="flex flex-col">
            {recentUsers.length > 0 ? (
              recentUsers.map((user) => (
                <div
                  key={user.id}
                  onClick={() => router.push(ROUTES.MEMBERS)}
                  className="flex items-center gap-3 sm:gap-4 py-3 border-b border-glass-border last:border-0 hover:bg-black/5 dark:hover:bg-white/5 transition-all duration-300 cursor-pointer px-2  group/user"
                >
                  <div className="relative shrink-0">
                    <Avatar className="h-10 w-10 sm:h-11 sm:w-11 rounded-full">
                      <AvatarImage src={user.avatar || undefined} />
                      <AvatarFallback className={cn('font-medium uppercase text-lg rounded-full', getAvatarColorClass(user.name))}>
                        {user.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col justify-center">
                    <div className="flex items-center justify-between gap-2 mb-0.5">
                      <p className="text-[15px] font-semibold truncate text-title-color dark:text-white">
                        {user.name}
                      </p>
                      <div className="text-[11px] sm:text-xs text-muted-foreground shrink-0 font-medium">
                        {t('joined', { defaultValue: 'Joined' })} {formatDistanceToNow(new Date(user.created_at), { addSuffix: true })}
                      </div>
                    </div>
                    <div className="flex items-center justify-between gap-2 mt-0.5">
                      <div className="text-[13px] text-subtitle-color font-medium truncate">
                        {user.email ? <CopyEmailCell email={user.email} truncate={true} /> : null}
                      </div>
                      {(() => {
                        const getRoleStyle = (role: string) => {
                          const r = (role || 'user').toLowerCase()
                          if (r.includes('admin'))
                            return 'bg-red-500/10 text-red-600 dark:bg-red-500/20 dark:text-red-400'
                          if (r.includes('assigner'))
                            return 'bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400'
                          if (r.includes('user'))
                            return 'bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400'
                          if (r.includes('member'))
                            return 'bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400'
                          return 'bg-primary/10 text-primary'
                        }
                        return (
                          <Badge
                            className={`text-[10px] sm:text-[11px] font-semibold px-2.5 py-0.5 rounded-full shadow-none capitalize border-none ${getRoleStyle(user.role)}`}
                          >
                            {user.role || 'User'}
                          </Badge>
                        )
                      })()}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <NoDataFound icon={UsersIcon} height="h-[375px]" />
            )}
          </div>
        </div>

        {recentUsers.length > 0 && (
          <div className="mt-3 pt-3 sm:pt-4 border-t border-glass-border shrink-0 flex justify-center">
            <button
              onClick={() => router.push(ROUTES.MEMBERS)}
              className="text-[14px] font-semibold text-primary hover:text-primary/80 transition-colors inline-flex items-center gap-1.5"
            >
              {t('view_all_customers', { defaultValue: 'View All Customers' })}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </Card>
  )
}
