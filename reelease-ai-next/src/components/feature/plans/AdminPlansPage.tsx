'use client'

import { DeleteConfirmationModal } from '@/components/reusable/DeleteConfirmationModal'
import { PageHeader } from '@/components/reusable/PageHeader'
import { ROUTES } from '@/constants/routes'
import {
  useDeletePlanMutation,
  useGetPlansQuery,
  useSyncPlansToGatewaysMutation,
} from '@/redux/api/planApi'
import { ApiError, Plan } from '@/types'
import { Clock, Package, Plus, RefreshCw } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import AdminPlanCard from './AdminPlanCard'
import TrialConfigModal from './plan-modal/TrialConfigModal'
import { Button } from '@/components/ui/button'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay } from 'swiper/modules'
import Input from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'
import { Search } from 'lucide-react'
import { useDebounce } from '@/hooks/useDebounce'

const AdminPlansPage = () => {
  const { t } = useTranslation()
  const router = useRouter()
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(12)
  const [search, setSearch] = useState('')
  const [isSearchFocused, setIsSearchFocused] = useState(false)
  const debouncedSearch = useDebounce(search, 500)
  const [sortColumn, setSortColumn] = useState('createdAt')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isTrialModalOpen, setIsTrialModalOpen] = useState(false)
  const [plansToDelete, setPlansToDelete] = useState<string[]>([])

  const { data: plansResponse, isLoading } = useGetPlansQuery({
    page,
    limit,
    search: debouncedSearch,
    sort_by: sortColumn,
    sort_order: sortOrder.toUpperCase(),
  })

  const [deletePlan, { isLoading: isDeleting }] = useDeletePlanMutation()
  const [syncToGateways, { isLoading: isSyncing }] = useSyncPlansToGatewaysMutation()

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse p-1">
        {/* Page Header Skeleton */}
        <div className="flex justify-between items-center w-full">
          <div className="space-y-2">
            <Skeleton className="w-48 h-8 bg-slate-200/80 dark:bg-white/10 rounded-lg" />
            <Skeleton className="w-96 h-4 bg-slate-200/80 dark:bg-white/10 rounded" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="w-24 h-10 bg-slate-200/80 dark:bg-white/10 rounded-full" />
            <Skeleton className="w-28 h-10 bg-slate-200/80 dark:bg-white/10 rounded-full" />
            <Skeleton className="w-24 h-10 bg-slate-200/80 dark:bg-white/10 rounded-full" />
          </div>
        </div>

        <div className="px-1 space-y-6">
          <Skeleton className="w-full sm:w-[700px] h-12 bg-slate-200/80 dark:bg-white/10 rounded-radius" />

          {/* Swiper slider of plan card skeletons */}
          <div className="w-full relative group/swiper">
            <Swiper
              modules={[Autoplay]}
              spaceBetween={20}
              slidesPerView={1}
              grabCursor={true}
              watchSlidesProgress={true}
              observer={true}
              observeParents={true}
              breakpoints={{
                480: { slidesPerView: 1, spaceBetween: 20 },
                640: { slidesPerView: 2, spaceBetween: 24 },
                1024: { slidesPerView: 3, spaceBetween: 24 },
                1536: { slidesPerView: 4, spaceBetween: 24 },
              }}
              autoplay={{
                delay: 3000,
                disableOnInteraction: false,
              }}
              className="pb-4 overflow-visible plan-swiper"
            >
              {Array.from({ length: 4 }).map((_, i) => (
                <SwiperSlide key={i} className="!h-auto flex flex-col">
                  <div className="group relative h-[580px] flex flex-col bg-white/3 border dark:border-white/10 border-black/10 rounded-border-radius overflow-hidden transition-all duration-500">
                    {/* Background overlay grid */}
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] z-0" />
                    
                    {/* Glass border effects */}
                    <div className="absolute inset-0 border border-white/20 dark:border-white/5 rounded-border-radius pointer-events-none z-10" />

                    {/* Main card body */}
                    <div className="relative z-10 sm:p-6 p-4 flex flex-col h-full bg-white dark:bg-white/3">
                      {/* Header info */}
                      <div className="flex items-start gap-3 mb-8">
                        <div className="space-y-2">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-radius flex items-center justify-center dark:bg-white/5 bg-white border border-glass-border">
                              <Skeleton className="w-6 h-6 bg-slate-200/80 dark:bg-white/10 rounded" />
                            </div>
                            <div>
                              <Skeleton className="w-24 h-5 mb-2 bg-slate-200/80 dark:bg-white/10 rounded" />
                              <Skeleton className="w-12 h-3.5 bg-slate-200/80 dark:bg-white/10 rounded-full" />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Price block */}
                      <div className="sm:mb-8 mb-4 relative py-6 px-4 rounded-border-radius-inner dark:bg-gradient-to-br from-white/[0.05] to-transparent border border-glass-border dark:border-white/5 flex flex-col items-center">
                        <div className="absolute inset-0 bg-primary/5" />
                        <div className="relative flex flex-col items-center">
                          <div className="flex items-baseline gap-1">
                            <Skeleton className="w-4 h-6 bg-slate-200/80 dark:bg-white/10 rounded" />
                            <Skeleton className="w-20 h-10 bg-slate-200/80 dark:bg-white/10 rounded" />
                            <Skeleton className="w-10 h-4 bg-slate-200/80 dark:bg-white/10 rounded" />
                          </div>
                        </div>
                      </div>

                      {/* Feature Sections Wrapper */}
                      <div className="space-y-8 mb-6 grow">
                        {/* Usage Limits */}
                        <div className="space-y-4">
                          <div className="text-base flex items-center gap-2 font-semibold">
                            <Skeleton className="w-5 h-5 bg-slate-200/80 dark:bg-white/10 rounded" />
                            <Skeleton className="w-24 h-4 bg-slate-200/80 dark:bg-white/10 rounded" />
                          </div>
                          <div className="space-y-3">
                            <div className="flex items-center justify-between p-3 rounded-border-radius-inner bg-black/3 dark:bg-white/3 border border-glass-border dark:border-white/5">
                              <Skeleton className="w-28 h-4 bg-slate-200/80 dark:bg-white/10 rounded" />
                              <Skeleton className="w-8 h-4 bg-slate-200/80 dark:bg-white/10 rounded" />
                            </div>
                          </div>
                        </div>

                        {/* AI Capabilities Grid */}
                        <div className="space-y-4">
                          <div className="text-base flex items-center gap-2 font-semibold">
                            <Skeleton className="w-5 h-5 bg-slate-200/80 dark:bg-white/10 rounded" />
                            <Skeleton className="w-28 h-4 bg-slate-200/80 dark:bg-white/10 rounded" />
                          </div>
                          <div className="grid sm425:grid-cols-3 grid-cols-5 gap-3">
                            {Array.from({ length: 8 }).map((_, idx) => (
                              <div key={idx} className="flex items-center justify-center aspect-square rounded-border-radius-inner border dark:bg-white/5 bg-black/3 border-glass-border">
                                <Skeleton className="w-5 h-5 bg-slate-200/80 dark:bg-white/10 rounded" />
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Buttons */}
                      <div className="mt-auto pt-5 border-t border-glass-border flex gap-3 w-full">
                        <Skeleton className="flex-1 h-12 bg-slate-200/80 dark:bg-white/10 rounded-border-radius-inner" />
                        <Skeleton className="w-12 h-12 bg-slate-200/80 dark:bg-white/10 rounded-border-radius-inner" />
                      </div>
                    </div>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </div>
      </div>
    )
  }

  const plans = plansResponse?.data || []

  const handleDeleteConfirm = async () => {
    if (plansToDelete.length === 0) return
    try {
      if (plansToDelete.length === 1) {
        await deletePlan(plansToDelete[0]).unwrap()
      } else {
        // Fallback if bulk delete is added later
      }
      toast.success(t('plan_deleted_successfully'))
      setIsDeleteModalOpen(false)
      setPlansToDelete([])
    } catch (error) {
      const apiError = error as ApiError
      toast.error(apiError?.data?.message || t('something_went_wrong'))
    }
  }

  const handleSyncGateways = async () => {
    try {
      await syncToGateways().unwrap()
      toast.success(t('synced_to_gateways_successfully'))
    } catch (error) {
      console.error('Sync failed:', error)
      const apiError = error as ApiError
      toast.error(apiError?.data?.message || t('sync_to_gateways_failed'))
    }
  }

  const handleEdit = (plan: Plan) => {
    router.push(`${ROUTES.PLANS}/edit/${plan._id || plan.id}`)
  }

  const handleDelete = (plan: Plan) => {
    setPlansToDelete([plan._id || plan.id])
    setIsDeleteModalOpen(true)
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      <PageHeader
        icon={<Package className="w-6 h-6 text-primary " />}
        title={t('plans_management')}
        subtitle={t('manage_subscription_plans_and_pricing', {
          defaultValue:
            'Manage subscription plans, pricing, usage limits, and AI feature access for your platform users.',
        })}
        showBackButton={false}
        primaryAction={{
          label: t('add_plan'),
          onClick: () => router.push(`${ROUTES.PLANS}/create`),
          icon: <Plus className="w-5 h-5" />,
        }}
        endContent={
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant="outline"
              onClick={handleSyncGateways}
              disabled={isSyncing}
              className=" h-10 px-4 rounded-full text-sm border-white/10 bg-white/5 hover:bg-white/10 transition-all font-medium gap-2"
            >
              <RefreshCw className={`w-4 h-4 text-primary ${isSyncing ? 'animate-spin' : ''}`} />
              {isSyncing ? t('syncing_gateways') : t('sync_to_gateways')}
            </Button>
            <Button
              variant="outline"
              onClick={() => setIsTrialModalOpen(true)}
              className=" h-10 px-4 text-sm rounded-full border-white/10 bg-white/5 hover:bg-white/10 transition-all font-medium gap-2"
            >
              <Clock className="w-4 h-4 text-primary" />
              {t('trial_period')}
            </Button>
          </div>
        }
      />

      <div className="px-1 space-y-6">
        {/* <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex flex-row gap-3 flex-1">
            <div className={cn('relative transition-all duration-300 ease-in-out w-full sm:max-w-sm')}>
              <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <Input
                placeholder={t('search_plans')}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="ps-9 h-11 w-full bg-white/3 border border-glass-border rounded-xl focus:ring-primary/20 transition-all"
              />
            </div>
          </div>
        </div> */}
        <div className="flex w-full justify-between gap-3">
          {
            <div
              className={cn(
                'relative transition-all duration-300 ease-in-out',
                isSearchFocused ? 'w-full sm:w-[1000px]' : 'w-full sm:w-[700px]',
              )}
            >
              <Search className="absolute rtl:right-3! left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <Input
                placeholder={t('search_plans')}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
                className="pl-9 rtl:pr-9!  h-10 sm:h-12 w-full bg-white/3 border border-glass-border rounded-radius text-left rtl:text-right"
              />
            </div>
          }
        </div>

        <div className="w-full relative group/swiper">
          <Swiper
            modules={[Autoplay]}
            spaceBetween={20}
            slidesPerView={1}
            grabCursor={true}
            watchSlidesProgress={true}
            observer={true}
            observeParents={true}
            breakpoints={{
              480: { slidesPerView: 1, spaceBetween: 20 },
              640: { slidesPerView: 2, spaceBetween: 24 },
              1024: { slidesPerView: 3, spaceBetween: 24 },
              1536: { slidesPerView: 4, spaceBetween: 24 },
            }}
            autoplay={{
              delay: 3000,
              disableOnInteraction: false,
            }}
            className="pb-4 overflow-visible plan-swiper"
          >
            {plans.map((plan: any) => (
              <SwiperSlide key={plan._id || plan.id} className="!h-auto flex flex-col">
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 h-full flex flex-col">
                  <AdminPlanCard plan={plan} onEdit={handleEdit} onDelete={handleDelete} />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>

      <TrialConfigModal isOpen={isTrialModalOpen} onClose={() => setIsTrialModalOpen(false)} />

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false)
          setPlansToDelete([])
        }}
        onConfirm={handleDeleteConfirm}
        isLoading={isDeleting}
        title={t('delete_plan_title')}
        description={t('delete_plan_description')}
      />
    </div>
  )
}

export default AdminPlansPage

