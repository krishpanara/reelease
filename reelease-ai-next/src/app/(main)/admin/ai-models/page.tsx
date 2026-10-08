'use client'

import { useState } from 'react'
import {
  useGetCaptionModelsQuery,
  useDeleteCaptionModelMutation,
  useDeleteCaptionModelsMutation,
  useSetDefaultModelMutation,
  useToggleModelActiveMutation,
} from '@/redux/api/aiCaptionModelApi'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Plus, Trash2, Star, Edit, MessageSquare, Filter, Check } from 'lucide-react'
import { toast } from 'sonner'
import ModelDialog from '@/components/admin/ai-models/ModelDialog'
import { PageHeader } from '@/components/reusable/PageHeader'
import { t } from 'i18next'
import { useDebounce } from '@/hooks/useDebounce'
import { DataTable } from '@/components/reusable/DataTable'
import { cn } from '@/lib/utils'
import { useAppDirection } from '@/hooks/useAppDirection'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdownMenu'
import { ApiError, Column } from '@/types'
import DeleteConfirmationModal from '@/components/reusable/DeleteConfirmationModal'

export default function AIModelsPage() {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [sortColumn, setSortColumn] = useState('created_at')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [providerFilter, setProviderFilter] = useState<string>('all')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingModel, setEditingModel] = useState<string | null>(null)
  const debouncedSearch = useDebounce(search, 500)
  const { data, isLoading, refetch } = useGetCaptionModelsQuery({
    search: debouncedSearch,
    provider: providerFilter !== 'all' ? providerFilter : undefined,
    page,
    limit,
    sort_by: sortColumn,
    sort_order: sortOrder,
  })
  const direction = useAppDirection()

  const [deleteModel , {isLoading : isDeleting}] = useDeleteCaptionModelMutation()
  const [deleteModels] = useDeleteCaptionModelsMutation()
  const [setDefault] = useSetDefaultModelMutation()
  const [toggleActive] = useToggleModelActiveMutation()

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [idToDelete, setIdToDelete] = useState<string | null>(null)

  const handleDelete = (id: string) => {
    setIdToDelete(id)
    setIsDeleteModalOpen(true)
  }

  const confirmDelete = async () => {
    if (!idToDelete) return
    try {
      const res = await deleteModel(idToDelete).unwrap()
      toast.success(res.message || t('user_deleted_successfully'))
      setIsDeleteModalOpen(false)
    } catch (error) {
      const apiError = error as ApiError
      toast.error(apiError?.data?.message || t('failed_to_delete_user'))
    }
  }

  const handleBulkDelete = async (ids: string[]) => {
    try {
      const res = await deleteModels(ids).unwrap()
      toast.success(res.message || 'AI caption models deleted successfully')
    } catch (error) {
      const apiError = error as ApiError
      toast.error(apiError?.data?.message || 'Failed to delete AI caption models')
    }
  }

  const handleSetDefault = async (id: string) => {
    try {
      await setDefault(id).unwrap()
      toast.success('Default model updated successfully')
    } catch (error: any) {
      toast.error(error?.data?.message || 'Failed to set default model')
    }
  }

  const handleToggleActive = async (id: string) => {
    try {
      await toggleActive(id).unwrap()
      toast.success('Model status updated successfully')
    } catch (error: any) {
      toast.error(error?.data?.message || 'Failed to update model status')
    }
  }

  const handleEdit = (id: string) => {
    setEditingModel(id)
    setIsDialogOpen(true)
  }

  const handleCreate = () => {
    setEditingModel(null)
    setIsDialogOpen(true)
  }
  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortColumn(column)
      setSortOrder('asc')
    }
    setPage(1)
  }

  const maskApiKey = (apiKey: string) => {
    if (!apiKey || apiKey.length <= 4) return apiKey
    return '•'.repeat(apiKey.length - 4) + apiKey.slice(-4)
  }

  const models: AICaptionModel[] = data?.data || []

  const columns: Column<AICaptionModel>[] = [
    {
      header: t('model_name'),
      accessorKey: 'name',
      className: 'xl1199:min-w-[220px] min-w-[180px]',
      sortable: true,
      cell: (row) => (
        <div className="flex flex-col">
          <span className="font-semibold text-text-color dark:text-white">{row.name}</span>
          <span className="text-xs text-muted-foreground text-nowrap">ID: {row.id}</span>
        </div>
      ),
    },

    {
      header: t('provider'),
      accessorKey: 'provider',
      className: 'xl1199:min-w-[150px]',
      sortable: true,
      cell: (row) => {
        const isGemini = row.provider === 'gemini'

        return (
          <Badge
            className={cn(
              'rounded-full px-3 py-1 font-semibold border shadow-none',
              isGemini
                ? 'bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800'
                : 'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800',
            )}
          >
            {isGemini ? 'Gemini' : 'OpenAI'}
          </Badge>
        )
      },
    },

    {
      header: t('api_key'),
      accessorKey: 'api_key',
      className: 'xl1199:min-w-[220px]',
      cell: (row) => <span className="font-mono text-sm text-muted-foreground">{maskApiKey(row.api_key)}</span>,
    },

    {
      header: t('credit_cost'),
      accessorKey: 'credit_cost',
      className: 'xl1199:min-w-[140px]',
      sortable: true,
      cell: (row) => (
        <span className="font-medium text-text-color dark:text-white">
          {row.credit_cost} {t('credits')}
        </span>
      ),
    },

    {
      header: t('status'),
      accessorKey: 'is_active',
      className: 'xl1199:min-w-[130px]',
      sortable: true,
      cell: (row) => <Switch checked={row.is_active} onCheckedChange={() => handleToggleActive(row.id)} />,
    },

    {
      header: t('default'),
      accessorKey: 'is_default',
      className: 'xl1199:min-w-[150px]',
      sortable: true,
      cell: (row) =>
        row.is_default ? (
          <Badge variant="outline" className="rounded-full px-3 py-1 font-semibold">
            <Star className="mr-1 h-3 w-3 fill-yellow-400 text-yellow-400" />
            {t('default')}
          </Badge>
        ) : (
          <span className="text-xs text-muted-foreground">—</span>
        ),
    },

    {
      header: t('actions'),
      className: 'xl1199:min-w-[220px]',
      cell: (row) => (
        <div className="flex items-center gap-2">
          {!row.is_default && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 bg-yellow-400/10 hover:text-white text-yellow-400 hover:bg-yellow-400"
              onClick={() => handleSetDefault(row.id)}
            >
              <Star className="h-4 w-4" />
            </Button>
          )}

          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 bg-edit-color/10 hover:text-white text-text-edit hover:bg-edit-color"
            onClick={() => handleEdit(row.id)}
            title={t('edit')}
          >
            <Edit className="h-4 w-4" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="text-destructive h-8 w-8 bg-destructive/10 hover:bg-destructive hover:text-white"
            onClick={() => handleDelete(row.id)}
            disabled={row.is_default}
            title={t('delete')}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        icon={<MessageSquare className="w-6 h-6 text-primary animate-pulse" />}
        title={t('ai_caption_model', { defaultValue: 'AI Caption Models' })}
        subtitle={t('ai_caption_model_desc', { defaultValue: 'Manage AI models for caption generation' })}
        showBackButton={false}
        endContent={
          <div className="flex primary-btn font-bold!  items-center! justify-center sm:justify-end w-full sm:w-auto">
            <Button onClick={handleCreate} className="font-bold! h-12 text-sm text-white!">
              Add Model
              <Plus className=" h-4 w-4 font-bold!" />
            </Button>
          </div>
        }
      />

      <DataTable
        columns={columns}
        data={models}
        currentPage={data?.page || 1}
        totalPages={data?.totalPages || 0}
        onPageChange={setPage}
        rowsPerPage={limit}
        onRowsPerPageChange={(l) => {
          setLimit(l)
          setPage(1)
        }}
        onBulkDelete={(rows) => {
          const ids = rows.map((r) => r.id)
          handleBulkDelete(ids)
        }}
        enableSelection={true}
        sortColumn={sortColumn}
        sortOrder={sortOrder}
        onSort={handleSort}
        totalResults={data?.total || 0}
        searchValue={search}
        onSearchChange={setSearch}
        showRowsPerPageAtTop={true}
        isLoading={isLoading}
        emptyMessage={t('no_data_found', { defaultValue: 'No Data Found' })}
        extraActions={
          <DropdownMenu dir={direction}>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="h-10 px-4 glass-button border-light-border-color rounded-radius">
                <Filter className="w-4 h-4" />
                {providerFilter ? t(providerFilter) : t('All Providers')}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 rounded-[8px] bg-white dark:bg-modal-bg-color">
              {['', 'gemini', 'openai'].map((s) => (
                <DropdownMenuItem
                  key={s}
                  onClick={() => setProviderFilter(s)}
                  className="flex items-center justify-between"
                >
                  {s ? t(s) : t('All Providers')}
                  {providerFilter === s && <Check className="w-4 h-4 text-primary" />}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        }
      />

      <ModelDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        modelId={editingModel}
        onSuccess={() => refetch()}
      />
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title={t('delete_user_title') || t('delete_confirmation')}
        description={t('delete_user_description') || t('delete_confirmation_message')}
        isLoading={isDeleting}
      />
    </div>
  )
}
