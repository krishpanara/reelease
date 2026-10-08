import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdownMenu'
import Input from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useAppDirection } from '@/hooks/useAppDirection'
import { cn } from '@/lib/utils'
import { Column, DataTableProps, TableRowData } from '@/types'
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  ChevronDown,
  Download,
  FileDown,
  FileSpreadsheet,
  FileText,
  Search,
  Trash2,
  Upload,
} from 'lucide-react'
import { ReactNode, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { DeleteConfirmationModal } from './DeleteConfirmationModal'
import { ImportModal } from './ImportModal'
import { Pagination } from './Pagination'
import Spinner from './Spinner'
import { Skeleton } from '@/components/ui/skeleton'

export function DataTable<T extends TableRowData>({
  columns,
  data,
  currentPage = 1,
  totalPages = 1,
  totalResults = 0,
  onPageChange,
  isLoading = false,
  emptyMessage,
  sortColumn,
  sortOrder,
  onSort,
  enableSelection = false,
  onSelectionChange,
  onBulkDelete,
  onRowsPerPageChange,
  rowsPerPage,
  showRowsPerPageAtTop = false,
  searchValue,
  onSearchChange,
  searchPlaceholder,
  onExportPDF,
  onExportExcel,
  onExportCSV,
  onImport,
  onDownloadTemplate,
  isRowSelectable,
  showBulkDeleteConfirmation = true,
  extraActions,
}: DataTableProps<T>) {
  const { t } = useTranslation()
  const [selectedRows, setSelectedRows] = useState<T[]>([])
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showImportModal, setShowImportModal] = useState(false)
  const [isSearchFocused, setIsSearchFocused] = useState(false)

  const direction = useAppDirection()

  const defaultEmptyMessage = emptyMessage || t('no_results')

  const hasExport = !!(onExportPDF || onExportExcel || onExportCSV)
  const hasImport = !!onImport
  const showToolbar = !!(onSearchChange || hasExport || hasImport || showRowsPerPageAtTop || extraActions)

  useEffect(() => {
    onSelectionChange?.(selectedRows)
  }, [selectedRows, onSelectionChange])

  useEffect(() => {
    setTimeout(() => {
      setSelectedRows([])
    }, 0)
  }, [data])

  const handleHeaderClick = (col: Column<T>) => {
    if (col.sortable && onSort) {
      const key = col.sortKey || (col.accessorKey as string)
      if (key) {
        onSort(key)
      }
    }
  }

  const renderSortIcon = (col: Column<T>) => {
    if (!col.sortable) return null

    const key = col.sortKey || (col.accessorKey as string)
    if (!key) return null

    if (sortColumn === key) {
      return sortOrder === 'asc' ? <ArrowUp className="ml-1 h-3 w-3" /> : <ArrowDown className="ml-1 h-3 w-3" />
    }

    return <ArrowUpDown className="ml-1 h-3 w-3 opacity-50" />
  }

  const toggleAll = () => {
    const selectableRows = isRowSelectable ? data.filter(isRowSelectable) : data
    const allSelectableSelected = selectableRows.length > 0 && selectableRows.every((r) => isRowSelected(r))

    if (allSelectableSelected) {
      setSelectedRows(selectedRows.filter((r) => !selectableRows.includes(r)))
    } else {
      const otherSelected = selectedRows.filter((r) => !selectableRows.includes(r))
      setSelectedRows([...otherSelected, ...selectableRows])
    }
  }

  const toggleRow = (row: T) => {
    if (isRowSelectable && !isRowSelectable(row)) return
    const rowId = (row).id || (row)._id
    const isSelected = selectedRows.some((r) => {
      const rId = r.id || r._id
      if (rowId && rId) return rId === rowId
      return r === row
    })

    if (isSelected) {
      setSelectedRows(
        selectedRows.filter((r) => {
          const rId = r.id || r._id
          if (rowId && rId) return rId !== rowId
          return r !== row
        }),
      )
    } else {
      setSelectedRows([...selectedRows, row])
    }
  }

  const isRowSelected = (row: T) => {
    const rowId = (row)._id
    return selectedRows.some((r) => {
      const rId = r.id || r._id
      if (rowId && rId) return rId === rowId
      return r === row
    })
  }

  return (
    <div className="space-y-3">
      {/* Toolbar Card: Search + Rows-per-page + Export */}
      {showToolbar && (
        <div className="flex items-center justify-between gap-3 mb-6 lg:flex-nowrap flex-wrap">
          <div className="flex w-full justify-between gap-3">
            {/* Search Input */}
            {onSearchChange && (
              <div
                className={cn(
                  'relative transition-all duration-300 ease-in-out w-full sm:w-[700px]',
                )}
              >
                <Search className="absolute rtl:right-3! left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                <Input
                  placeholder={searchPlaceholder || t('search')}
                  value={searchValue || ''}
                  onChange={(e) => onSearchChange(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setIsSearchFocused(false)}
                  className="pl-9 rtl:pr-9!  h-10 sm:h-12 w-full bg-white/3 border border-glass-border rounded-radius text-left rtl:text-right"
                />
              </div>
            )}
            {extraActions}
          </div>

          <div className="flex items-center gap-4">
            {enableSelection && selectedRows.length > 0 && (
              <Button
                variant="destructive"
                className="sm:h-12 h-10 px-4 gap-2 rounded-radius font-semibold text-sm whitespace-nowrap cursor-pointer animate-in fade-in duration-200"
                onClick={() => {
                  if (showBulkDeleteConfirmation) {
                    setShowDeleteConfirm(true)
                  } else {
                    onBulkDelete?.(selectedRows)
                  }
                }}
              >
                <Trash2 className="w-4 h-4" />
                <span>{`Delete(${selectedRows.length})`}</span>
              </Button>
            )}
            {/* Import Button */}
            {hasImport && (
              <>
                <Button
                  variant="outline"
                  className="sm:h-12 h-10 px-4 gap-2 rounded-radius text-subtitle-color glass-button font-medium text-sm whitespace-nowrap cursor-pointer"
                  onClick={() => setShowImportModal(true)}
                >
                  <Upload className="w-4 h-4" />
                  {t('import', { defaultValue: 'Import' })}
                </Button>
                <ImportModal
                  isOpen={showImportModal}
                  onClose={() => setShowImportModal(false)}
                  onImport={(file) => {
                    onImport!(file)
                    setShowImportModal(false)
                  }}
                  onDownloadTemplate={onDownloadTemplate}
                  title={t('import_data', { defaultValue: 'Import Data' })}
                />
              </>
            )}

            {/* Export Dropdown */}
            {hasExport && (
              <DropdownMenu dir={direction}>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="sm:h-12 h-10 px-4 gap-2 rounded-radius text-subtitle-color glass-button font-medium text-sm whitespace-nowrap"
                  >
                    <Download className="w-4 h-4" />
                    {t('export', { defaultValue: 'Export' })}
                    <ChevronDown className="w-3.5 h-3.5 opacity-60" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-44 rounded-[8px] bg-white dark:bg-modal-bg-color">
                  {onExportPDF && (
                    <DropdownMenuItem onClick={onExportPDF} className="gap-2 cursor-pointer">
                      <FileText className="w-4 h-4 text-red-500" />
                      {t('export_pdf', { defaultValue: 'Export as PDF' })}
                    </DropdownMenuItem>
                  )}
                  {onExportExcel && (
                    <DropdownMenuItem onClick={onExportExcel} className="gap-2 cursor-pointer">
                      <FileSpreadsheet className="w-4 h-4 text-green-600" />
                      {t('export_excel', { defaultValue: 'Export as Excel' })}
                    </DropdownMenuItem>
                  )}
                  {onExportCSV && (
                    <DropdownMenuItem onClick={onExportCSV} className="gap-2 cursor-pointer">
                      <FileDown className="w-4 h-4 text-blue-500" />
                      {t('export_csv', { defaultValue: 'Export as CSV' })}
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      )}

      <div className="rounded-border-radius border border-glass-border text-foreground">
        <Table>
          <TableHeader>
            <TableRow>
              {enableSelection && (
                <TableHead className=" h-14 text-center px-6 left-0 z-20">
                  <div className="flex justify-center items-center">
                    <Checkbox
                      checked={(() => {
                        const selectableRows = isRowSelectable ? data.filter(isRowSelectable) : data
                        return selectableRows.length > 0 && selectableRows.every((r) => isRowSelected(r))
                      })()}
                      indeterminate={(() => {
                        const selectableRows = isRowSelectable ? data.filter(isRowSelectable) : data
                        const selectedInSelectable = selectableRows.filter((r) => isRowSelected(r))
                        return selectedInSelectable.length > 0 && selectedInSelectable.length < selectableRows.length
                      })()}
                      onChange={toggleAll}
                      disabled={
                        data.length === 0 || (isRowSelectable ? data.filter(isRowSelectable).length === 0 : false)
                      }
                    />
                  </div>
                </TableHead>
              )}
              {columns.map((col, index) => (
                <TableHead
                  key={index}
                  className={cn(
                    'h-14 text-sm  font-semibold text-subtitle-color! uppercase px-6',
                    col.className,
                    col.sortable && 'cursor-pointer select-none',
                  )}
                  onClick={() => handleHeaderClick(col)}
                >
                  <div className="flex items-center space-x-2">
                    <span className="text-[13px] font-semiblod whitespace-nowrap text-subtitle-color/60">
                      {col.header}
                    </span>
                    {renderSortIcon(col)}
                  </div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              [...Array(5)].map((_, rowIndex) => (
                <TableRow key={rowIndex} className="h-12 hover:bg-transparent!">
                  {enableSelection && (
                    <TableCell className="py-3 text-center w-5 px-6 left-0 z-10 min-w-[70px]!">
                      <div className="flex justify-center items-center">
                        <Skeleton className="h-4 w-4 bg-slate-200/80 dark:bg-white/10 rounded" />
                      </div>
                    </TableCell>
                  )}
                  {columns.map((col, colIndex) => {
                    const widths = ['w-2/3', 'w-1/2', 'w-3/4', 'w-5/12']
                    const widthClass = widths[colIndex % widths.length]
                    return (
                      <TableCell key={colIndex} className={cn('py-3 px-6', col.className)}>
                        <Skeleton className={cn("h-8 bg-slate-200/80 dark:bg-white/10", widthClass)} />
                      </TableCell>
                    )
                  })}
                </TableRow>
              ))
            ) : data.length ? (
              data.map((row, rowIndex) => (
                <TableRow
                  key={(row).id || (row)._id || rowIndex}
                  className={cn(
                    'group h-10  hover:bg-transparent!',
                    isRowSelected(row) && 'bg-primary/5',
                  )}
                >
                  {enableSelection && (
                    <TableCell
                      className={cn(
                        'py-3 text-center w-5 px-6  left-0 z-10',
                        'min-w-[70px]! ',
                        isRowSelected(row) && 'bg-primary/1',
                      )}
                    >
                      <div className="flex justify-center items-center">
                        <Checkbox
                          checked={isRowSelected(row)}
                          onChange={() => toggleRow(row)}
                          disabled={isRowSelectable && !isRowSelectable(row)}
                        />
                      </div>
                    </TableCell>
                  )}
                  {columns.map((col, colIndex) => (
                    <TableCell key={colIndex} className={cn('py-3 text-sm font-medium px-6', col.className)}>
                      {col.cell
                        ? col.cell(row, rowIndex)
                        : col.accessorKey
                          ? (row[col.accessorKey as keyof T] as ReactNode)
                          : null}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length + (enableSelection ? 1 : 0)}
                  className="h-32 text-center text-sm text-subtitle-color"
                >
                  {defaultEmptyMessage}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      {onPageChange && totalPages > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={onPageChange}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={onRowsPerPageChange}
          showRowsPerPage={!showRowsPerPageAtTop}
          totalResults={totalResults || (totalPages <= 1 ? data.length : 0)}
        />
      )}

      <DeleteConfirmationModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={() => {
          onBulkDelete?.(selectedRows)
          setShowDeleteConfirm(false)
        }}
        title={t('confirm_bulk_delete', { defaultValue: 'Confirm Bulk Delete' })}
        description={t('bulk_delete_warning', {
          count: selectedRows.length,
          defaultValue: `Are you sure you want to delete ${selectedRows.length} selected items? This action cannot be undone.`,
        })}
      />
    </div>
  )
}
