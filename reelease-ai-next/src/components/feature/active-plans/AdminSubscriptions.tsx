'use client'

import { CopyEmailCell } from '@/components/reusable/CopyEmailCell'
import { TableLayout } from '@/components/reusable/TableLayout'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdownMenu'
import { getCurrencySymbol, subscriptionStatus } from '@/data/subscription'
import { useAppDirection } from '@/hooks/useAppDirection'
import { useApproveManualSubscriptionMutation, useDeleteSubscriptionsMutation, useGetAllSubscriptionsQuery, useRejectManualSubscriptionMutation } from '@/redux/api/subscriptionApi'
import { Column, Subscription } from '@/types'
import { formatDate } from '@/utils'
import { Calendar, Check, CreditCard, Filter, Pen, TicketCheck, User as UserIcon, X } from 'lucide-react'
import Image from 'next/image'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { StatusBadge } from './StatusBadge'
import AssignPlanModal from './AssignPlanModal'
import SubscriptionStats from './SubscriptionStats'
import { usePermission } from '@/hooks/usePermission'
import { cn } from '@/lib/utils'
import { useDebounce } from '@/hooks/useDebounce'

const AdminSubscriptions = () => {
  const { t } = useTranslation()
  const { hasPermission } = usePermission()
  const canUpdate = hasPermission('update.subscriptions')

  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const direction = useAppDirection()

  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false)
  const [editingSubscription, setEditingSubscription] = useState<Subscription | null>(null)
  const debouncedSearch = useDebounce(search, 500)
  const { data: subscriptionsData, isLoading } = useGetAllSubscriptionsQuery({
    page,
    limit,
    search:debouncedSearch,
    status: statusFilter,
  })

  const [deleteSubscriptions] = useDeleteSubscriptionsMutation()
  const [approveManual] = useApproveManualSubscriptionMutation()
  const [rejectManual] = useRejectManualSubscriptionMutation()

  const subscriptions = subscriptionsData?.data?.subscriptions || []
  const pagination = subscriptionsData?.data?.pagination

  const handleApprove = async (id: string) => {
    try {
      await approveManual(id).unwrap()
      toast.success(t('subscription_approved_success'))
    } catch (err: any) {
      toast.error(err?.data?.message || t('subscription_approved_error'))
    }
  }

  const handleReject = async (id: string) => {
    try {
      await rejectManual(id).unwrap()
      toast.success(t('subscription_rejected_success'))
    } catch (err: any) {
      toast.error(err?.data?.message || t('subscription_rejected_error'))
    }
  }

  const handleEdit = (row: Subscription) => {
    setEditingSubscription(row)
    setIsAssignModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsAssignModalOpen(false)
    setEditingSubscription(null)
  }

  const renderActions = (row: Subscription) => {
    const isManualPending = row.payment_gateway === 'manual' && row.status === 'pending'
    return (
      <div className="flex items-center gap-2">
        {isManualPending && canUpdate && (
          <>
            <Button
              variant="ghost"
              size="icon"
              className="w-8 h-8 text-primary hover:text-black hover:bg-primary bg-primary/20"
              onClick={() => handleApprove(row._id || row.id)}
              title={t('approve')}
            >
              <Check className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="w-8 h-8 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
              onClick={() => handleReject(row._id || row.id)}
              title={t('reject')}
            >
              <X className="w-4 h-4" />
            </Button>
          </>
        )}
        {canUpdate && (
          <Button
            variant="ghost"
            size="icon"
            className="w-8 h-8 bg-edit-color/10 hover:text-white text-text-edit hover:bg-edit-color"
            onClick={() => handleEdit(row)}
            title={t('update_subscription')}
          >
            <Pen className="w-4 h-4" />
          </Button>
        )}
      </div>
    )
  }

  const columns: Column<Subscription>[] = [
    {
      header: t('user'),
      className: 'xl1199:min-w-[220px] min-w-[180px]',
      cell: (row: any) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-radius bg-primary/10! text-primary dark:bg-light-button flex items-center justify-center overflow-hidden">
            {row.user?.avatar ? (
              <Image
                src={row.user.avatar}
                alt={row.user.name}
                width={40}
                height={40}
                unoptimized
                className="w-full h-full object-cover"
              />
            ) : (
              <UserIcon className="w-4 h-4 text-primary" />
            )}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-bold text-sm truncate">{row.user?.name || t('unknown_user')}</span>
            {row.user?.email ? <CopyEmailCell email={row.user.email} /> : null}
          </div>
        </div>
      ),
    },
    {
      header: t('plan'),
      className: 'xl1199:min-w-[130px] min-w-[100px]',
      cell: (row: any) => (
        <div className="flex flex-col">
          <Badge
            variant="outline"
            className="bg-primary/5 border-primary/20 text-primary font-bold whitespace-nowrap w-fit"
          >
            {row.plan?.name || t('unknown_plan')}
          </Badge>
        </div>
      ),
    },
    {
      header: t('billing_cycle'),
      className: 'xl1199:min-w-[130px] min-w-[100px]',
      cell: (row: Subscription) => (
        <div className="font-medium text-sm whitespace-nowrap">
          {row.plan?.billing_cycle ? t(row.plan.billing_cycle) : t('one_time')}
        </div>
      ),
    },
    {
      header: t('amount'),
      className: 'xl1199:min-w-[130px] min-w-[100px]',
      cell: (row: Subscription) => (
          <div className="font-medium text-sm whitespace-nowrap">
            {getCurrencySymbol(row?.currency)} {row.amount_paid || 0}
          </div>
      ),
    },
    {
      header: t('status'),
      className: 'xl1199:min-w-[120px] min-w-[100px]',
      cell: (row: Subscription) => <StatusBadge status={row.status} />,
    },
    {
      header: t('gateway'),
      className: 'xl1199:min-w-[120px] min-w-[100px]',
      cell: (row: Subscription) => (
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-muted-foreground capitalize text-sm font-medium whitespace-nowrap">
            <CreditCard className="w-3.5 h-3.5 text-muted-foreground" />
            {row.payment_gateway?.replace('_', ' ')}
          </div>
          {row.payment_reference && (
            <span className="text-[10px] text-muted-foreground truncate max-w-[100px]" title={row.payment_reference}>
              {row.payment_reference}
            </span>
          )}
        </div>
      ),
    },
    {
      header: t('expiration'),
      className: 'xl1199:min-w-[140px] min-w-[120px]',
      cell: (row: Subscription) => (
        <div className="text-xs font-medium text-muted-foreground flex items-center gap-1.5 whitespace-nowrap">
          <Calendar className="w-3 h-3" />
          {row.current_period_end ? formatDate(row.current_period_end) : t('no_expiration')}
        </div>
      ),
    },
    {
      header: t('action'),
      cell: (row: Subscription) => renderActions(row),
    },
  ]

  return (
    <div className="space-y-6">
      <TableLayout
        showBackButton={false}
        headerIcon={<TicketCheck />}
        title={t('active_plans')}
        subtitle={t('manage_user_subscriptions')}
        extraActions={
          <div className="flex items-center gap-3">
            <DropdownMenu dir={direction}>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'h-10 px-4 rounded-radius transition-all duration-300',
                    statusFilter
                      ? 'bg-primary! dark:text-black text-white border-primary!'
                      : ' dark:bg-white/3! border-glass-border',
                  )}
                >
                  <Filter className={cn('w-4 h-4', statusFilter ? 'dark:text-black text-white' : 'text-muted-foreground')} />
                  {statusFilter ? t(statusFilter) : t('all_status')}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 rounded-[8px] bg-white dark:bg-modal-bg-color">
                <DropdownMenuItem
                  onClick={() => setStatusFilter('')}
                  className="flex items-center justify-between"
                >
                  {t('all_status')}
                  {statusFilter === '' && <Check className="w-4 h-4 text-primary" />}
                </DropdownMenuItem>
                {subscriptionStatus.map((s) => (
                  <DropdownMenuItem
                    key={s}
                    onClick={() => setStatusFilter(s)}
                    className="flex items-center justify-between"
                  >
                    {t(s)}
                    {statusFilter === s && <Check className="w-4 h-4 text-primary" />}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <Button
              onClick={() => setIsAssignModalOpen(true)}
              className="rounded-radius h-10 px-6 text-sm  primary-btn  text-white!"
            >
              {t('assign_plan')}
            </Button>

          </div>
        }
        columns={columns}
        data={subscriptions}
        currentPage={page}
        totalPages={pagination?.totalPages || 0}
        totalResults={pagination?.total || 0}
        onPageChange={setPage}
        isLoading={isLoading}
        rowsPerPage={limit}
        onRowsPerPageChange={(l) => {
          setLimit(l)
          setPage(1)
        }}
        showRowsPerPageAtTop={true}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder={t('search_subscriptions')}
      >
        <SubscriptionStats statsData={(subscriptionsData?.data as any)?.stats} />
      </TableLayout>

      <AssignPlanModal
        isOpen={isAssignModalOpen}
        onClose={handleCloseModal}
        editingSubscription={editingSubscription}
      />
    </div>
  )
}

export default AdminSubscriptions
