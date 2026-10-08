'use client'

import { MemberModal } from '@/components/feature/members/MemberModal'
import { CopyEmailCell } from '@/components/reusable/CopyEmailCell'
import { DeleteConfirmationModal } from '@/components/reusable/DeleteConfirmationModal'
import { StatusSwitch } from '@/components/reusable/StatusSwitch'
import { TableLayout } from '@/components/reusable/TableLayout'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useDebounce } from '@/hooks/useDebounce'
import { usePermission } from '@/hooks/usePermission'
import { PERMISSIONS } from '@/constants/permissions'
import { cn, getAvatarColorClass } from '@/lib/utils'
import { useDeleteUsersMutation, useGetUsersQuery, useUpdateUserStatusMutation } from '@/redux/api/userApi'
import { ApiError, Column, User } from '@/types'
import { formatDate, getMediaUrl } from '@/utils'
import { Users, Pencil, Plus, Trash2 } from 'lucide-react'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

export default function UsersPage() {
  const { t } = useTranslation()
  const { hasPermission } = usePermission()

  const canCreate = hasPermission(PERMISSIONS.CREATE_MEMBERS)
  const canUpdate = hasPermission(PERMISSIONS.UPDATE_MEMBERS)
  const canDelete = hasPermission(PERMISSIONS.DELETE_MEMBERS)
  const canView = hasPermission(PERMISSIONS.VIEW_MEMBERS)
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search, 500)
  const [sortColumn, setSortColumn] = useState('created_at')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  const { data, isLoading, refetch } = useGetUsersQuery({
    page,
    limit,
    search: debouncedSearch,
    sort_by: sortColumn,
    sort_order: sortOrder,
  })

  const [deleteUsers, { isLoading: isDeleting }] = useDeleteUsersMutation()
  const [updateUserStatus] = useUpdateUserStatusMutation()

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [idToDelete, setIdToDelete] = useState<string | null>(null)

  const handleEdit = (user: User) => {
    setSelectedUser(user)
    setIsModalOpen(true)
  }

  const handleCreate = () => {
    setSelectedUser(null)
    setIsModalOpen(true)
  }

  const handleDelete = (id: string) => {
    setIdToDelete(id)
    setIsDeleteModalOpen(true)
  }

  const confirmDelete = async () => {
    if (!idToDelete) return
    try {
      const res = await deleteUsers([idToDelete]).unwrap()
      toast.success(res.message || t('user_deleted_successfully'))
      setIsDeleteModalOpen(false)
    } catch (error) {
      const apiError = error as ApiError
      toast.error(apiError?.data?.message || t('failed_to_delete_user'))
    }
  }

  const handleBulkDelete = async (ids: string[]) => {
    try {
      const res = await deleteUsers(ids).unwrap()
      toast.success(res.message || t('users_deleted_successfully'))
    } catch (error) {
      const apiError = error as ApiError
      toast.error(apiError?.data?.message || t('failed_to_delete_users'))
    }
  }

  const handleStatusChange = React.useCallback(
    async (id: string, currentStatus: boolean) => {
      try {
        const res = await updateUserStatus({ id, status: !currentStatus }).unwrap()
        toast.success(res.message || t(!currentStatus ? 'user_activated' : 'user_deactivated'))
      } catch (error) {
        const apiError = error as ApiError
        toast.error(apiError?.data?.message || t('failed_to_update_status'))
      }
    },
    [updateUserStatus, t],
  )

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortColumn(column)
      setSortOrder('asc')
    }
    setPage(1)
  }

  const columns: Column<User>[] = [
    {
      header: t('member'),
      className: 'xl1199:min-w-[300px] min-w-[200px]',
      accessorKey: 'name',
      cell: (row) => (
        <div className="flex items-center space-x-3">
          <Avatar className="h-10 w-10">
            <AvatarImage className='rounded-radius' src={getMediaUrl(row.avatar! || '')} />
            <AvatarFallback className={cn('text-xs font-semibold', getAvatarColorClass(row.name))}>
              {row.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="font-medium text-base text-text-color dark:text-white">{row.name}</span>
            <CopyEmailCell email={row.email} />
          </div>
        </div>
      ),
      sortable: true,
    },
    {
      header: t('role'),
      className: 'xl1199:min-w-[175px]',
      accessorKey: 'role',
      sortable: true,
      cell: (row) => {
        if (!row.role) return 'N/A';

        const role = row.role.toLowerCase();
        let styles = 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800/50 dark:text-gray-400 dark:border-gray-700';
        let dotColor = 'bg-gray-500';

        if (role.includes('admin')) {
          styles = 'bg-purple-50 text-purple-700 border-purple-100 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800';
          dotColor = 'bg-purple-500';
        } else if (role.includes('assigner')) {
          styles = 'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800';
          dotColor = 'bg-emerald-500';
        } else if (role.includes('user')) {
          styles = 'bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800';
          dotColor = 'bg-blue-500';
        }

        return (
          <Badge className={cn('gap-1.5 px-3 font-semibold rounded-full border shadow-none capitalize', styles)}>
            {t(row.role)}
          </Badge>
        );
      },
    },
    {
      header: t('status'),
      className: 'xl1199:min-w-[135px]',
      accessorKey: 'isActive',
      sortable: true,
      cell: (row) => (
        <StatusSwitch
          isActive={row.isActive}
          canManage={!!canUpdate}
          onToggle={() => handleStatusChange(row._id, row.isActive)}
        />
      ),
    },
    {
      header: t('last_login'),
      className: 'xl1199:min-w-[187px]',
      accessorKey: 'lastLogin',
      sortable: true,
      cell: (row) => (
        <span className="text-muted-foreground text-sm">{row.lastLogin ? formatDate(row.lastLogin) : t('never')}</span>
      ),
    },
    {
      header: t('actions'),
      className: 'xl1199:min-w-[175px]',
      cell: (row) => (
        <div className="flex items-center gap-2">
          {canUpdate && (
            <Button
              variant="ghost"
              size="icon"
              className=" h-8 w-8 bg-edit-color/10 hover:text-white text-text-edit  hover:bg-edit-color"
              onClick={() => handleEdit(row)}
              title={t('edit')}
            >
              <Pencil className="h-4 w-4" />
            </Button>
          )}
          {canDelete && (
            <Button
              variant="ghost"
              size="icon"
              className="text-destructive h-8 w-8 bg-destructive/10 hover:bg-destructive hover:text-white"
              onClick={() => handleDelete(row._id)}
              title={t('delete')}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
          {!canUpdate && !canDelete && (
            <span className="text-xs text-muted-foreground italic px-2">{t('view_only')}</span>
          )}
        </div>
      ),
    },
  ]

  return (
    <>
      <TableLayout
        headerIcon={<Users />}
        title={t('members')}
        subtitle={t('manage_members')}
        showBackButton={false}
        primaryAction={
          canCreate
            ? {
                label: t('create_member'),
                onClick: handleCreate,
                icon: <Plus className="h-4 w-4" strokeWidth={3} />,
                className: 'btn-color',
              }
            : undefined
        }
        columns={columns}
        data={data?.users || []}
        totalResults={data?.total || 0}
        currentPage={data?.page || 1}
        totalPages={data?.totalPages || 0}
        onPageChange={setPage}
        isLoading={isLoading}
        emptyMessage={t('no_users_found')}
        sortColumn={sortColumn}
        sortOrder={sortOrder}
        onSort={handleSort}
        enableSelection={canDelete}
        onBulkDelete={(rows) => {
          const ids = rows.map((r) => r._id)
          handleBulkDelete(ids)
        }}
        rowsPerPage={limit}
        onRowsPerPageChange={(l) => {
          setLimit(l)
          setPage(1)
        }}
        showRowsPerPageAtTop={true}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder={t('search_members')}
      />

      <MemberModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} user={selectedUser} />

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title={t('delete_user_title') || t('delete_confirmation')}
        description={t('delete_user_description') || t('delete_confirmation_message')}
        isLoading={isDeleting}
      /> 
    </>
  )
}
