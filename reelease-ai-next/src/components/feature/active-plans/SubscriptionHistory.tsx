'use client'

import { useEffect, useRef } from 'react'

import { DataTable } from '@/components/reusable/DataTable'
import { Button } from '@/components/ui/button'
import { subscriptionHistoryFilters } from '@/data/subscription'
import { cn } from '@/lib/utils'
import { Column, HistoryRow, SubscriptionHistoryProps } from '@/types'
import { formatDate } from '@/utils'
import { HistoryStatusBadge } from './StatusBadge'

const SubscriptionHistory = ({
  filteredHistory,
  historyFilter,
  setHistoryFilter,
  sub,
  t,
}: SubscriptionHistoryProps) => {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return
    const activeButton = containerRef.current.querySelector('[data-active="true"]')
    if (activeButton) {
      activeButton.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center',
      })
    }
  }, [historyFilter])


  const columns: Column<HistoryRow>[] = [
    {
      header: t('plan'),
      accessorKey: 'plan',
      className: 'font-semibold text-foreground truncate max-w-[200px] min-w-[150px]',
    },
    {
      header: t('members'),
      accessorKey: 'members',
      className: 'text-muted-foreground min-w-[100px]',
    },
    {
      header: t('billing_cycle'),
      accessorKey: 'billing_cycle',
      className: 'text-muted-foreground min-w-[120px]',
      cell: (row) => t(row.billing_cycle),
    },
    {
      header: t('amount'),
      accessorKey: 'amount',
      className: 'font-semibold text-foreground whitespace-nowrap min-w-[100px]',
      cell: (row) => `$${row.amount.toFixed(2)}`,
    },
    {
      header: t('status'),
      accessorKey: 'status',
      className: 'min-w-[130px]',
      cell: (row) => <HistoryStatusBadge status={row.status} isCanceled={row.cancel_at_period_end} />,
    },
    {
      header: t('subscription_date'),
      accessorKey: 'subscription_date',
      className: 'text-muted-foreground whitespace-nowrap min-w-[150px]',
      cell: (row) => formatDate(row.subscription_date),
    },
    {
      header: t('expiry_date'),
      accessorKey: 'expiry_date',
      className: 'text-muted-foreground whitespace-nowrap min-w-[150px]',
      cell: (row) => formatDate(row.expiry_date),
    },
  ]

  return (
    <div className=" rounded-border-radius glass-card glass-dark-card dark:bg-white/3  overflow-hidden bg-white">
      <div className="sm:px-6 px-4 pt-5 pb-4 border-b border-glass-border">
        <h2 className="text-3xl font-black text-title-color dark:text-white 
        leading-none">{t('subscription_history')}</h2>
        <p className="text-base text-subtitle-color mt-0.5  ">{t('past_subscriptions')}</p>
      </div>

      <div className="px-6 pt-4 pb-4 flex items-center justify-between gap-2 flex-wrap">
        <span className="text-xs font-semibold text-subtitle-color mr-1">{t('filter_by_status')}</span>
        <div ref={containerRef} className="flex items-center gap-2 overflow-x-auto no-scrollbar max-w-full py-1">
          {subscriptionHistoryFilters.map((f) => {
            const isActive = historyFilter === f
            return (
              <Button
                key={f}
                onClick={() => setHistoryFilter(f as any)}
                data-active={isActive ? 'true' : 'false'}
                className={cn(
                  'px-3 py-1 rounded-full text-xs font-bold h-9! border border-glass-border shrink-0',
                  isActive
                    ? 'primary-btn text-white!'
                    : 'bg-white dark:bg-white/3! border-border text-subtitle-color dark:text-white/30',
                )}
              >
                {t(f)}
              </Button>
            )
          })}
        </div>
      </div>

      <DataTable
        columns={columns}
        data={filteredHistory}
        emptyMessage={t('no_subscription_history')}
        isLoading={false}
      />
    </div>
  )
}

export default SubscriptionHistory
