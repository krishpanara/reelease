'use client'

import { TableLayoutProps, TableRowData } from '@/types'
import { DataTable } from './DataTable'
import { PageHeader } from './PageHeader'
/**
 * A standardized layout component for pages featuring a header and a data table.
 */
export function TableLayout<T extends TableRowData>({
  title,
  subtitle,
  headerIcon,
  primaryAction,
  endContent,
  children,
  showBackButton = true,
  ...dataTableProps
}: TableLayoutProps<T> & { children?: React.ReactNode; showBackButton?: boolean }) {
  const showHeader = !!(title || primaryAction || endContent)

  return (
    <div className="animate-in fade-in duration-700">
      {showHeader && (
        <div className=" bg-(--light-body) mb-6">
          <PageHeader
            title={title || ''}
            subtitle={subtitle}
            icon={headerIcon}
            primaryAction={primaryAction}
            endContent={endContent}
            showBackButton={showBackButton}
          />
        </div>
      )}
      <div className="space-y-6 px-0">
        {children}
        <DataTable {...dataTableProps} />
      </div>
    </div>
  )
}
