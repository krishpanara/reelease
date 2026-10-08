'use client'

import { DataCardGrid } from '@/components/reusable/DataCardGrid'
import { DeleteConfirmationModal } from '@/components/reusable/DeleteConfirmationModal'
import { PageHeader } from '@/components/reusable/PageHeader'
import { AITemplateCategoryModal } from '@/components/feature/ai-template-categories/AITemplateCategoryModal'
import { CategoryCard } from '@/components/feature/ai-template-categories/CategoryCard'
import { useDebounce } from '@/hooks/useDebounce'
import { useDeleteAiTemplateCategoryMutation, useGetAiTemplateCategoriesQuery, useUpdateAiTemplateCategoryMutation } from '@/redux/api/aiTemplateCategoryApi'
import { ApiError, AITemplateCategory } from '@/types'
import { Layers, Plus, Search } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { usePermission } from '@/hooks/usePermission'
import { PERMISSIONS } from '@/constants/permissions'
import Input from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'

export default function AITemplateCategoriesPage() {
  const { t } = useTranslation()
  const { hasPermission } = usePermission()

  const canCreate = hasPermission(PERMISSIONS.CREATE_TEMPLATE_CATEGORIES)
  const canUpdate = hasPermission(PERMISSIONS.UPDATE_TEMPLATE_CATEGORIES)
  const canDelete = hasPermission(PERMISSIONS.DELETE_TEMPLATE_CATEGORIES)
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(12)
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search, 500)
  const [sortColumn, setSortColumn] = useState('created_at')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  const { data, isLoading } = useGetAiTemplateCategoriesQuery({ 
    page,
    limit,
    search: debouncedSearch,
    sort_by: sortColumn,
    sort_order: sortOrder,
  })

  const [deleteCategory, { isLoading: isDeleting }] = useDeleteAiTemplateCategoryMutation()
  const [updateCategory] = useUpdateAiTemplateCategoryMutation()

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<AITemplateCategory | null>(null)

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [idToDelete, setIdToDelete] = useState<string | null>(null)

  const handleEdit = (category: AITemplateCategory) => {
    setSelectedCategory(category)
    setIsModalOpen(true)
  }

  const handleCreate = () => {
    setSelectedCategory(null)
    setIsModalOpen(true)
  }

  const handleDelete = (id: string) => {
    setIdToDelete(id)
    setIsDeleteModalOpen(true)
  }

  const confirmDelete = async () => {
    if (!idToDelete) return
    try {
      const res = await deleteCategory(idToDelete).unwrap()
      toast.success(((res as any).message as string) || t('category_deleted_successfully'))
      setIsDeleteModalOpen(false)
    } catch (error) {
      const apiError = error as ApiError
      toast.error(apiError?.data?.message || t('failed_to_delete_category'))
    }
  }

  const handleStatusChange = async (id: string, currentStatus: boolean, categoryData: any) => {
    try {
      const res = await updateCategory({ id, data: { ...categoryData, status: !currentStatus } }).unwrap()
      toast.success((res as any).message || t(!currentStatus ? 'category_activated' : 'category_deactivated'))
    } catch (error) {
      const apiError = error as ApiError
      toast.error(apiError?.data?.message || t('failed_to_update_status'))
    }
  }
  const categoriesData = Array.isArray(data) ? data : data?.categories || []
  const totalPages = (data as any)?.totalPages || 1
  const totalResults = (data as any)?.total || categoriesData.length

  return (
    <div className="space-y-6">
      <PageHeader
        icon={<Layers className="w-6 h-6 text-primary animate-pulse" />}
        showBackButton={false}
        title={t('categories_title', { defaultValue: 'Categories' })}
        subtitle={t('categories_desc', { defaultValue: 'Manage AI template categories' })}
        primaryAction={canCreate ? {
          label: t('add_category', { defaultValue: 'Add Category' }),
          onClick: handleCreate,
          icon: <Plus className="w-5 h-5" />,
          className: "bg-primary hover:bg-primary/90 text-white rounded-xl p-button-padding",
        } : undefined}
        endContent={
          <div className="relative w-full">
            <Search className="absolute left-3 rtl:right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              placeholder={t('search_categories', { defaultValue: 'Search categories...' })}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 rtl:pr-9 bg-white/3! border-glass-border focus:ring-primary/20 rounded-xl"
            />
          </div>
        }
      />

      <DataCardGrid
        data={categoriesData}
        isLoading={isLoading}
        currentPage={page}
        totalPages={totalPages}
        totalResults={totalResults}
        onPageChange={setPage}
        onRowsPerPageChange={(l) => { setLimit(l); setPage(1) }}
        rowsPerPage={limit}
        gridClassName="grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        renderSkeleton={(idx) => (
          <div key={idx} className="glass-card dark:bg-white/3 bg-white border border-glass-border rounded-border-radius p-5 flex flex-col h-[200px] animate-pulse">
            {/* Header section with Icon & Actions */}
            <div className="flex items-start justify-between gap-2 mb-2">
              <Skeleton className="w-12 h-12 rounded-[9px] bg-slate-200/80 dark:bg-white/10 shrink-0" />
              <div className="flex items-center gap-1">
                <Skeleton className="h-8 w-8 rounded-lg bg-slate-200/80 dark:bg-white/10" />
                <Skeleton className="h-8 w-8 rounded-lg bg-slate-200/80 dark:bg-white/10" />
              </div>
            </div>

            {/* Title & Status */}
            <div className="flex items-start justify-between gap-3">
              <Skeleton className="w-1/2 h-5 bg-slate-200/80 dark:bg-white/10 rounded" />
              <Skeleton className="w-9 h-5 rounded-full bg-slate-200/80 dark:bg-white/10" />
            </div>

            {/* Description */}
            <div className="space-y-2 pt-2 flex-1 mb-2">
              <Skeleton className="w-full h-3 bg-slate-200/80 dark:bg-white/10 rounded" />
              <Skeleton className="w-5/6 h-3 bg-slate-200/80 dark:bg-white/10 rounded" />
            </div>

            {/* Footer / Meta info */}
            <div className="flex items-center gap-2 pt-3 mt-auto border-t border-border">
              <Skeleton className="w-16 h-5 rounded bg-slate-200/80 dark:bg-white/10" />
            </div>
          </div>
        )}
        renderCard={(category) => (
          <CategoryCard
            category={category}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onStatusChange={handleStatusChange}
            canUpdate={canUpdate}
            canDelete={canDelete}
          />
        )}
      />

      <AITemplateCategoryModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} category={selectedCategory} />

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title={t('delete_category')}
        description={t('delete_category_description')}
        isLoading={isDeleting}
      />
    </div>
  )
}
