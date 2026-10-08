'use client'

import { StatusSwitch } from '@/components/reusable/StatusSwitch'
import { TableLayout } from '@/components/reusable/TableLayout'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { usePermission } from '@/hooks/usePermission'
import {
  useDeleteLanguagesMutation,
  useGetLanguagesQuery,
  useUpdateLanguageStatusMutation,
} from '@/redux/api/languageApi'
import { DeleteConfirmationModal } from '@/components/reusable/DeleteConfirmationModal'
import { ApiError } from '@/types/api'
import { PERMISSIONS } from '@/constants/permissions'
import { Language } from '@/types/language'
import { BookOpen, Globe, Languages, Pencil, Plus, Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import Image from 'next/image'
import { useDebounce } from '@/hooks/useDebounce'
import { Column } from '@/types'

export const LanguagesView = () => {
  const { t } = useTranslation()
  const router = useRouter()
  const { hasPermission } = usePermission()

  const canCreate = hasPermission(PERMISSIONS.CREATE_LANGUAGES)
  const canUpdate = hasPermission(PERMISSIONS.UPDATE_LANGUAGES)
  const canDelete = hasPermission(PERMISSIONS.DELETE_LANGUAGES)
  const canView = hasPermission(PERMISSIONS.VIEW_LANGUAGES) || canCreate || canUpdate || canDelete

  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [search, setSearch] = useState('')
  const [sortColumn, setSortColumn] = useState<string>('sort_order')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const debouncedSearch = useDebounce(search, 500)
  const { data, isLoading, refetch } = useGetLanguagesQuery({
    page,
    limit,
    search: debouncedSearch,
    sort_by: sortColumn,
    sort_order: sortOrder.toUpperCase(),
  })
  const [updateLanguageStatus] = useUpdateLanguageStatusMutation()
  const [deleteLanguages, { isLoading: isDeleting }] = useDeleteLanguagesMutation()
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [langToDelete, setLangToDelete] = useState<string | null>(null)

  const handleStatusChange = useCallback(
    async (lang: Language) => {
      try {
        await updateLanguageStatus({ id: lang.id || (lang as any)._id }).unwrap()
        toast.success(t('status_updated_successfully'))
        await refetch()
      } catch (error) {
        const apiError = error as ApiError
        toast.error(apiError?.data?.message || t('failed_to_update_status'))
      }
    },
    [updateLanguageStatus, t, refetch],
  )

  const handleDeleteClick = (id: string) => {
    setLangToDelete(id)
    setIsDeleteModalOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!langToDelete) return
    try {
      await deleteLanguages({ ids: [langToDelete] }).unwrap()
      toast.success(t('language_deleted_successfully'))
      setIsDeleteModalOpen(false)
      setLangToDelete(null)
      refetch()
    } catch (error) {
      const apiError = error as ApiError
      toast.error(apiError?.data?.message || t('something_went_wrong'))
    }
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

  const columns: Column<Language>[] = [
    {
      header: t('flag'),
      accessorKey: 'flag',
      className: 'w-[100px] lg991:min-w-[130px]',
      cell: (row: Language) => {
        const flagPath = row.flag || ''
        const flagUrl = flagPath.startsWith('http')
          ? flagPath
          : flagPath
            ? `${flagPath.replace(/^\//, '')}?v=${new Date(
                row.updated_at || row.created_at || Date.now(),
              ).getTime()}`
            : null

        return (
          <div className="h-10 w-10 rounded-radius bg-muted/20 border border-glass-border flex items-center justify-center overflow-hidden">
            {flagUrl ? (
              <Image
                width={40}
                height={40}
                unoptimized
                src={process.env.NEXT_PUBLIC_STORAGE_URL+'/'+flagUrl}
                alt={row.name}
                className="h-full w-full object-cover"
                onError={(e) => {
                  ; (e.target as HTMLImageElement).src = '/images/placeholder-flag.png'
                }}
              />
            ) : (
              <Globe className="h-5 w-5 text-muted-foreground/30" />
            )}
          </div>
        )
      },
    },
    {
      header: t('name'),
      className: 'lg991:min-w-[140px]',
      accessorKey: 'name',
      sortable: true,
      cell: (row: Language) => <span className="font-semibold text-sm">{row.name}</span>,
    },
    {
      header: t('locale'),
      className: 'lg991:min-w-[120px]',
      accessorKey: 'locale',
      sortable: true,
      cell: (row: Language) => (
        <code className="px-2 py-1 bg-muted dark:bg-white/5 rounded-[6px] text-xs font-bold text-muted-foreground dark:text-white">{row.locale}</code>
      ),
    },
    {
      header: t('rtl'),
      className: 'lg991:min-w-[110px]',
      accessorKey: 'is_rtl',
      sortable: true,
      cell: (row: Language) => (
        <Badge
          variant={row.is_rtl ? 'default' : 'outline'}
          className="rounded-full px-3 text-[10px] font-bold uppercase tracking-wider"
        >
          {row.is_rtl ? t('yes') : t('no')}
        </Badge>
      ),
    },
    {
      header: t('status'),
      className: 'lg991:min-w-[110px]',
      accessorKey: 'is_active',
      sortable: true,
      cell: (row: Language) => (
        <StatusSwitch isActive={row.is_active} canManage={canUpdate} onToggle={() => handleStatusChange(row)} />
      ),
    },
    {
      header: t('actions'),
      className: 'text-right min-w-[150px] lg991:min-w-[180px]',
      cell: (row: Language) => (
        <div className="flex items-center justify-strat gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="text-primary h-9 w-9 bg-primary/5 hover:bg-primary hover:text-white rounded-radius"
            onClick={() => router.push(`/languages/translations/${row.id || (row as any)._id}`)}
            title={t('manage_translations')}
          >
            <BookOpen className="h-4 w-4" />
          </Button>

          {canUpdate && (
            <Button
              variant="ghost"
              size="icon"
              className="text-text-edit h-9 w-9 bg-edit-color/5 hover:bg-edit-color hover:text-white rounded-radius"
              onClick={() => router.push(`/languages/${row.id || (row as any)._id}/edit`)}
              title={t('edit')}
            >
              <Pencil className="h-4 w-4" />
            </Button>
          )}

          {canDelete && (
            <Button
              variant="ghost"
              size="icon"
              className="text-destructive h-9 w-9 bg-destructive/5 hover:bg-destructive hover:text-white rounded-radius"
              disabled={row.is_default || isDeleting}
              onClick={() => handleDeleteClick(row.id || (row as any)._id)}
              title={t('delete')}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      ),
    },
  ].filter(col => {
    if (col.header === t('actions')) {
      return canUpdate || canDelete || hasPermission(PERMISSIONS.VIEW_LANGUAGES) // translation button uses VIEW or general module access
    }
    return true
  })

  return (
    <>

      <TableLayout
        headerIcon={<Languages />}

        showBackButton={false}
        title={t('language_library')}
        subtitle={t('manage_languages_desc')}
        primaryAction={
          canCreate
            ? {
              label: t('add_new'),
              onClick: () => router.push('/languages/new'),
              icon: <Plus className="w-5 h-5" />,
            }
            : undefined
        }
        columns={columns}
        data={data?.data?.languages || []}
        currentPage={page}
        totalPages={data?.data?.pagination?.totalPages || 0}
        totalResults={data?.data?.pagination?.totalItems || 0}
        onPageChange={setPage}
        isLoading={isLoading}
        emptyMessage={t('no_languages_found')}
        searchValue={search}
        onSearchChange={(val) => {
          setSearch(val)
          setPage(1)
        }}
        searchPlaceholder={t('search_languages')}
        rowsPerPage={limit}
        onRowsPerPageChange={(l) => {
          setLimit(l)
          setPage(1)
        }}
        sortColumn={sortColumn}
        sortOrder={sortOrder}
        onSort={handleSort}
      />
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        title={t('delete_language')}
        description={t('confirm_delete_language')}
        isLoading={isDeleting}
      />
    </>
  )
}
