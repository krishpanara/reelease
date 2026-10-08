import { ReactNode } from "react"


export type TableRowData = {
  id?: string | number
  _id?: string | number
}

export interface DeleteConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  description: string
  isLoading?: boolean
}

export interface RowsPerPageSelectorProps {
  rowsPerPage: number
  onRowsPerPageChange: (rows: number) => void
}

export interface CustomTooltipProps {
  children: React.ReactNode
  title: React.ReactNode
  side?: 'top' | 'right' | 'bottom' | 'left'
  align?: 'start' | 'center' | 'end'
  className?: string
}   

export interface DataCardGridProps<T> {
  data: T[]
  renderCard: (item: T) => ReactNode
  renderSkeleton?: (index: number) => ReactNode
  currentPage?: number
  totalPages?: number
  totalResults?: number
  onPageChange?: (page: number) => void
  isLoading?: boolean
  emptyMessage?: string
  onRowsPerPageChange?: (limit: number) => void
  rowsPerPage?: number
  searchValue?: string
  onSearchChange?: (value: string) => void
  searchPlaceholder?: string
  gridClassName?: string
  hasImages?: boolean
}