import React from 'react'
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react'
import { cn } from '@/utils/cn'
import type { TableColumn, SortConfig } from '@/types'
import { motion, AnimatePresence } from 'framer-motion'

interface DataTableProps<T> {
  columns: TableColumn<T>[]
  data: T[]
  sortConfig?: SortConfig | null
  onSort?: (key: string) => void
  actions?: (row: T) => React.ReactNode
  emptyMessage?: string
  isLoading?: boolean
  className?: string
  rowKeyExtractor: (row: T) => string
  onRowClick?: (row: T) => void
}

export function DataTable<T>({
  columns,
  data,
  sortConfig,
  onSort,
  actions,
  emptyMessage = 'No data found',
  isLoading = false,
  className,
  rowKeyExtractor,
  onRowClick,
}: DataTableProps<T>) {
  const getSortIcon = (key: string) => {
    if (!sortConfig || sortConfig.key !== key) {
      return <ArrowUpDown className="h-4 w-4 opacity-50" />
    }
    return sortConfig.direction === 'asc' ? (
      <ArrowUp className="h-4 w-4" />
    ) : (
      <ArrowDown className="h-4 w-4" />
    )
  }

  const getCellValue = (row: T, column: TableColumn<T>) => {
    const keys = String(column.key).split('.')
    let value: unknown = row
    for (const key of keys) {
      value = (value as Record<string, unknown>)?.[key]
    }
    return value
  }

  return (
    <div className={cn('relative overflow-hidden rounded-xl border', className)}>
      <div className="overflow-x-auto scrollbar-thin">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b bg-primary text-white">
              {columns.map((column) => (
                <th
                  key={String(column.key)}
                  className={cn(
                    'px-4 py-3 text-left text-sm font-semibold text-white',
                    column.sortable && 'cursor-pointer select-none  transition-colors',
                    column.width && `w-[${column.width}]`
                  )}
                  onClick={() => column.sortable && onSort?.(String(column.key))}
                >
                  <div className="flex items-center gap-2">
                    {column.label}
                    {column.sortable && getSortIcon(String(column.key))}
                  </div>
                </th>
              ))}
              {actions && (
                <th className="px-4 py-3 text-right text-sm font-semibold text-white w-[100px]">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            <AnimatePresence mode="wait">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <tr key={`skeleton-${index}`} className="border-b">
                    {columns.map((column, colIndex) => (
                      <td key={colIndex} className="px-4 py-3">
                        <div className="h-5 bg-muted animate-pulse rounded" />
                      </td>
                    ))}
                    {actions && (
                      <td className="px-4 py-3">
                        <div className="h-5 bg-muted animate-pulse rounded w-20 ml-auto" />
                      </td>
                    )}
                  </tr>
                ))
              ) : data.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length + (actions ? 1 : 0)}
                    className="px-4 py-12 text-center text-muted-foreground"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <svg
                        className="h-12 w-12 text-muted-foreground/50"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                        />
                      </svg>
                      <span>{emptyMessage}</span>
                    </div>
                  </td>
                </tr>
              ) : (
                data.map((row, rowIndex) => (
                  <motion.tr
                    key={rowKeyExtractor(row)}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2, delay: rowIndex * 0.02 }}
                    className={cn(
                      'border-b transition-colors hover:bg-muted/50',
                      onRowClick && 'cursor-pointer'
                    )}
                    onClick={() => onRowClick?.(row)}
                  >
                    {columns.map((column) => (
                      <td
                        key={String(column.key)}
                        className="px-4 py-3 text-sm"
                      >
                        {column.render
                          ? column.render(getCellValue(row, column), row)
                          : String(getCellValue(row, column) ?? '')}
                      </td>
                    ))}
                    {actions && (
                      <td className="px-4 py-3 text-right">
                        <div onClick={(e) => e.stopPropagation()}>
                          {actions(row)}
                        </div>
                      </td>
                    )}
                  </motion.tr>
                ))
              )}
            </AnimatePresence>
          </tbody>
        </table>
      </div>
    </div>
  )
}

