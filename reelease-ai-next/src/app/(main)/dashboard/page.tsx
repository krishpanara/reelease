'use client'

import { AdminDashboard, UserDashboard, DashboardSkeleton } from '@/components/feature/dashboard'
import Spinner from '@/components/reusable/Spinner'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { usePermission } from '@/hooks/usePermission'
import { useGetDashboardStatsQuery, useGetAdminDashboardStatsQuery } from '@/redux/api/dashboardApi'
import { format } from 'date-fns'
import { CalendarIcon } from 'lucide-react'
import { useState } from 'react'
import { DateRange } from 'react-day-picker'
import { useTranslation } from 'react-i18next'

const DashboardPage = () => {
  const { t } = useTranslation()
  const { role } = usePermission()
  const [timeFilter, setTimeFilter] = useState('this_year')
  const [date, setDate] = useState<DateRange | undefined>({
    from: new Date(),
    to: new Date(),
  })

  const isPrivileged = role === 'super_admin' || role === 'admin'

  const { data: userStats, isLoading: isUserLoading, isError: isUserError } = useGetDashboardStatsQuery({
    page: 1,
    limit: 20,
    timeFilter,
    startDate: date?.from?.toISOString(),
    endDate: date?.to?.toISOString(),
  }, { skip: isPrivileged })

  const [revenueFilter, setRevenueFilter] = useState('this_month')

  const { data: adminStats, isLoading: isAdminLoading, isError: isAdminError } = useGetAdminDashboardStatsQuery({
    timeFilter,
    startDate: date?.from?.toISOString(),
    endDate: date?.to?.toISOString(),
    revenueFilter,
  }, { skip: !isPrivileged })

  const isLoading = isPrivileged ? isAdminLoading : isUserLoading
  const isError = isPrivileged ? isAdminError : isUserError

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative overflow-hidden mb-3">
        <div className="relative z-10 space-y-2 flex gap-2">
          <h1 className="text-3xl mb-0 font-bold text-title-color dark:text-white title-color text-start flex items-center gap-2">
            {t('dashboard')}
          </h1>
          <img alt="greeting" loading="lazy" width="36" height="36" decoding="async" data-nimg="1" className="w-8 h-8 sm:w-9 sm:h-9 object-contain ml-0.5" src="/images/greeting.gif" />
        </div>

        <div className="flex items-center gap-3 relative z-20">
          <Select value={timeFilter} onValueChange={setTimeFilter}>
            <SelectTrigger className="w-[160px] px-3 h-10 glass-card rounded-radius border border-glass-border focus:ring-0! focus:shadow-[unset]! focus-visible:shadow-[unset]!">
              <SelectValue placeholder={t('select_period')} />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-modal-bg-color border-2 border-white/10 rounded-radius border border-glass-border backdrop-blur-3xl">
              <SelectItem value="today">{t('today')}</SelectItem>
              <SelectItem value="this_week">{t('this_week')}</SelectItem>
              <SelectItem value="this_month">{t('this_month')}</SelectItem>
              <SelectItem value="this_year">{t('this_year')}</SelectItem>
              <SelectItem value="custom">{t('custom')}</SelectItem>
            </SelectContent>
          </Select>

          {timeFilter === 'custom' && (
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="date"
                  variant={'outline'}
                  className={
                    'w-[260px] justify-start text-left font-normal bg-card/10 backdrop-blur-3xl border-white/10 rounded-xl'
                  }
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date?.from ? (
                    date.to ? (
                      <>
                        {format(date.from, 'LLL dd, y')} - {format(date.to, 'LLL dd, y')}
                      </>
                    ) : (
                      format(date.from, 'LLL dd, y')
                    )
                  ) : (
                    <span>{t('pick_a_date')}</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-card/90 backdrop-blur-3xl border-white/10 shadow-2xl overflow-hidden rounded-2xl" align="end">
                <div>
                  <Calendar
                    initialFocus
                    mode="range"
                    defaultMonth={date?.from}
                    selected={date}
                    onSelect={setDate}
                    numberOfMonths={1}
                    className="rounded-md border-0 bg-white dark:bg-black"
                  />
                </div>
              </PopoverContent>
            </Popover>
          )}
        </div>
      </div>

      {isLoading ? (
        <DashboardSkeleton />
      ) : isError ? (
        <div className="p-8 text-center text-destructive font-bold bg-destructive/10 rounded-3xl border border-destructive/20 animate-in fade-in duration-500">
          {t('failed_to_load_dashboard')}
        </div>
      ) : isPrivileged && adminStats ? (
        <AdminDashboard stats={adminStats} revenueFilter={revenueFilter} onRevenueFilterChange={setRevenueFilter} />
      ) : (
        !isPrivileged && userStats && <UserDashboard stats={userStats} />
      )}
    </div>
  )
}

export default DashboardPage
