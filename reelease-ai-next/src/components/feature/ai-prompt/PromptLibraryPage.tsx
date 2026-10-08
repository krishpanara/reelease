'use client'

import { DeleteConfirmationModal } from '@/components/reusable/DeleteConfirmationModal'
import { PageHeader } from '@/components/reusable/PageHeader'
import { Pagination } from '@/components/reusable/Pagination'
import { PERMISSIONS } from '@/constants/permissions'
import { useDebounce } from '@/hooks/useDebounce'
import { usePermission } from '@/hooks/usePermission'
import {
  useCreatePromptMutation,
  useDeletePromptsMutation,
  useGetPromptCategoriesQuery,
  useGetPromptsQuery,
  useUpdatePromptMutation,
} from '@/redux/api/aiPromptApi'
import { BookOpen, Plus } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { PromptCard, PromptSkeleton } from './PromptCard'
import PromptFormModal from './PromptFormModal'
import { PromptLibraryEmptyState } from './PromptLibraryEmptyState'
import { PromptLibraryStats } from './PromptLibraryStats'
import { PromptLibraryToolbar } from './PromptLibraryToolbar'
import { AiPrompt } from '@/types/components/ai-prompts'

// --- Main Page ---
const PromptLibraryPage = () => {
  const { t } = useTranslation()
  const { hasPermission } = usePermission()
  const canManage = hasPermission(PERMISSIONS.MANAGE_PROMPTS_TEMPLATES)

  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(12)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')

  const debouncedSearch = useDebounce(search, 400)

  const [isFormOpen, setIsFormOpen] = useState(false)
  const [selectedPrompt, setSelectedPrompt] = useState<AiPrompt | null>(null)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [promptToDelete, setPromptToDelete] = useState<AiPrompt | null>(null)

  const { data, isLoading } = useGetPromptsQuery({
    page,
    limit,
    search: debouncedSearch || undefined,
    category: categoryFilter || undefined,
  })

  const [createPrompt, { isLoading: isCreating }] = useCreatePromptMutation()
  const [updatePrompt, { isLoading: isUpdating }] = useUpdatePromptMutation()
  const [deletePrompts, { isLoading: isDeleting }] = useDeletePromptsMutation()

  const { data: categoriesData = [] } = useGetPromptCategoriesQuery()

  const prompts = data?.prompts || []
  const totalPages = data?.totalPages || 1
  const total = data?.total || 0

  // Derive unique categories from API for sidebar filter and stats
  const categoriesList = Array.isArray(categoriesData) ? categoriesData : categoriesData?.categories || []
  const categories = categoriesList.map((c: any) => c.name || c).sort()

  const handleOpenCreate = () => {
    setSelectedPrompt(null)
    setIsFormOpen(true)
  }

  const handleOpenEdit = (prompt: AiPrompt) => {
    setSelectedPrompt(prompt)
    setIsFormOpen(true)
  }

  const handleOpenDelete = (prompt: AiPrompt) => {
    setPromptToDelete(prompt)
    setIsDeleteOpen(true)
  }

  const handleSave = async (data: Partial<AiPrompt>) => {
    try {
      if (selectedPrompt) {
        await updatePrompt({ id: selectedPrompt._id || selectedPrompt.id!, ...data }).unwrap()
        toast.success(t('prompt_updated_successfully', { defaultValue: 'Prompt updated successfully' }))
      } else {
        await createPrompt(data).unwrap()
        toast.success(t('prompt_created_successfully', { defaultValue: 'Prompt created successfully' }))
      }
      setIsFormOpen(false)
    } catch (err: any) {
      toast.error(err?.data?.message || t('something_went_wrong'))
    }
  }

  const handleDeleteConfirm = async () => {
    if (!promptToDelete) return
    try {
      await deletePrompts({ ids: [promptToDelete._id || promptToDelete.id!] }).unwrap()
      toast.success(t('prompt_deleted_successfully', { defaultValue: 'Prompt deleted successfully' }))
      setIsDeleteOpen(false)
      setPromptToDelete(null)
    } catch (err: any) {
      toast.error(err?.data?.message || t('something_went_wrong'))
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        showBackButton={false}
        icon={<BookOpen className="w-6 h-6 text-primary animate-pulse" />}
        title={t('prompt_library', { defaultValue: 'Prompt Library' })}
        subtitle={t('prompt_library_desc', {
          defaultValue: 'Manage and reuse your AI prompt templates across all tools.',
        })}
        primaryAction={
          canManage
            ? {
              label: t('add_prompt', { defaultValue: 'Add Prompt' }),
              onClick: handleOpenCreate,
              icon: <Plus className="w-5 h-5" />,
              className: 'bg-primary hover:bg-primary/90 text-white rounded-xl p-button-padding',
            }
            : undefined
        }
      />

      <PromptLibraryStats total={total} categoriesCount={categories.length} currentPageCount={prompts.length} />

      {/* Toolbar */}
      <PromptLibraryToolbar
        search={search}
        setSearch={setSearch}
        categoryFilter={categoryFilter}
        setCategoryFilter={setCategoryFilter}
        categories={categories}
        onResetPage={() => setPage(1)}
      />

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 9 }).map((_, i) => (
            <PromptSkeleton key={i} />
          ))}
        </div>
      ) : prompts.length === 0 ? (
        <PromptLibraryEmptyState search={search} categoryFilter={categoryFilter} handleOpenCreate={handleOpenCreate} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {prompts.map((p) => (
            <PromptCard
              key={p._id || p.id}
              prompt={p}
              onEdit={canManage ? handleOpenEdit : undefined}
              onDelete={canManage ? handleOpenDelete : undefined}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pt-6 border-t border-glass-border">
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
            rowsPerPage={limit}
            onRowsPerPageChange={(l) => {
              setLimit(l)
              setPage(1)
            }}
            totalResults={total}
            showRowsPerPage={true}
          />
        </div>
      )}

      {/* Modals */}
      <PromptFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSave={handleSave}
        prompt={selectedPrompt}
        isLoading={isCreating || isUpdating}
      />

      <DeleteConfirmationModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDeleteConfirm}
        isLoading={isDeleting}
        title={t('delete_prompt_title', { defaultValue: 'Delete Prompt' })}
        description={t('delete_prompt_description', {
          defaultValue: 'Are you sure you want to delete this prompt? This action cannot be undone.',
        })}
      />
    </div>
  )
}

export default PromptLibraryPage
