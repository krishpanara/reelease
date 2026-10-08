'use client'

import { DeleteConfirmationModal } from '@/components/reusable/DeleteConfirmationModal'
import { TableLayout } from '@/components/reusable/TableLayout'
import { Button } from '@/components/ui/button'
import { useDeleteTagMutation, useGetTagsQuery } from '@/redux/api/tagApi'
import { Column, Tag } from '@/types'
import { Hash, Pencil, Plus, Trash2 } from 'lucide-react'
import { forwardRef, useImperativeHandle, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { useDebounce } from '@/hooks/useDebounce'
import TagModal from './TagModal'
import { formatDate } from '@/utils'

const TagManagement = forwardRef(({ search, onSearchChange }: { search: string, onSearchChange: (val: string) => void }, ref) => {
  const { t } = useTranslation()
  const [page, setPage] = useState(1)
  const [sortColumn, setSortColumn] = useState<string>('created_at')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const debouncedSearch = useDebounce(search, 500)
  
  const { data: tagsResponse, isLoading } = useGetTagsQuery({
    page,
    search: debouncedSearch,
    limit: 10,
    sort_by: sortColumn,
    sort_order: sortOrder.toUpperCase(),
  })
  const [deleteTag, { isLoading: isDeleting }] = useDeleteTagMutation()
  
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [tagToDelete, setTagToDelete] = useState<string | null>(null)
  
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedTag, setSelectedTag] = useState<Tag | null>(null)

  const tags = tagsResponse?.tags || []
  const totalPages = tagsResponse?.totalPages || 0

  useImperativeHandle(ref, () => ({
    handleCreate: () => {
      setSelectedTag(null)
      setIsModalOpen(true)
    }
  }))

  const handleDeleteConfirm = async () => {
    if (!tagToDelete) return
    try {
      await deleteTag(tagToDelete).unwrap()
      toast.success(t('tag_deleted_successfully'))
      setIsDeleteModalOpen(false)
      setTagToDelete(null)
    } catch (error: any) {
      toast.error(error?.data?.message || t('something_went_wrong'))
    }
  }

  const handleEdit = (tag: Tag) => {
    setSelectedTag(tag)
    setIsModalOpen(true)
  }

  const columns: Column<Tag>[] = [
    {
      header: t('title'),
      className: '[@media(max-width:1415px)]:min-w-[250px]',
      accessorKey: 'title',
      sortable: true,
      cell: (row: Tag) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
            <Hash className="w-4 h-4" />
          </div>
          <span className="font-medium truncate break-all whitespace-normal line-clamp-2 max-w-75">{row.title}</span>
        </div>
      ),
    },
    {
      header: t('created_at'),
      accessorKey: 'created_at',
      sortable: true,
      cell: (row: Tag) => (
        <span className="text-muted-foreground">{formatDate(row.created_at)}</span>
      ),
    },
    {
      header: t('action'),
      cell: (row: Tag) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 bg-edit-color/10 text-text-edit hover:bg-edit-color hover:text-white"
            onClick={() => handleEdit(row)}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 bg-destructive/10 text-destructive hover:bg-destructive hover:text-white"
            onClick={() => {
              setTagToDelete(row._id || row.id)
              setIsDeleteModalOpen(true)
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ]

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortColumn(column)
      setSortOrder('asc')
    }
    setPage(1)
  }

  return (
    <>
      <TableLayout
        columns={columns}
        data={tags}
        currentPage={page}
        totalPages={totalPages}
        totalResults={tagsResponse?.total || 0}
        rowsPerPage={10}
        onPageChange={setPage}
        isLoading={isLoading}
        sortColumn={sortColumn}
        sortOrder={sortOrder}
        onSort={handleSort}
      />

      <TagModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} tag={selectedTag} />

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        isLoading={isDeleting}
        title={t('delete_tag')}
        description={t('delete_tag_description')}
      />
    </>
  )
})

TagManagement.displayName = 'TagManagement'

export default TagManagement
