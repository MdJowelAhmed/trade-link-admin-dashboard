import { cn } from '@/utils/cn'

// Loading Spinner Component
interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function LoadingSpinner({ size = 'md', className }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
  }

  return (
    <svg
      className={cn('animate-spin', sizeClasses[size], className)}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  )
}

// Loading Skeleton Component
interface LoadingSkeletonProps {
  className?: string
  count?: number
}

export function LoadingSkeleton({ className, count = 1 }: LoadingSkeletonProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className={cn('bg-muted animate-pulse rounded', className)}
        />
      ))}
    </>
  )
}

// Card Skeleton Component
interface CardSkeletonProps {
  count?: number
  className?: string
}

export function CardSkeleton({ count = 1, className }: CardSkeletonProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className={cn('bg-muted animate-pulse rounded-lg', className)}
        />
      ))}
    </>
  )
}

// Table Row Skeleton Component
interface TableRowSkeletonProps {
  columns: number
  rows?: number
}

export function TableRowSkeleton({ columns, rows = 5 }: TableRowSkeletonProps) {
  return (
    <>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <tr key={`skeleton-row-${rowIndex}`} className="border-b">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <td key={`skeleton-col-${colIndex}`} className="px-4 py-3">
              <div className="h-5 bg-muted animate-pulse rounded" />
            </td>
          ))}
        </tr>
      ))}
    </>
  )
}

// Full Page Loader Component
interface FullPageLoaderProps {
  message?: string
}

export function FullPageLoader({ message = 'Loading...' }: FullPageLoaderProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-4">
        <LoadingSpinner size="lg" />
        {message && <p className="text-sm text-muted-foreground">{message}</p>}
      </div>
    </div>
  )
}

// Inline Loader Component
interface InlineLoaderProps {
  message?: string
  size?: 'sm' | 'md' | 'lg'
}

export function InlineLoader({ message, size = 'md' }: InlineLoaderProps) {
  return (
    <div className="flex items-center gap-2">
      <LoadingSpinner size={size} />
      {message && <span className="text-sm text-muted-foreground">{message}</span>}
    </div>
  )
}

// Grid Skeleton Loader (for card grids)
interface GridSkeletonProps {
  count?: number
  className?: string
  itemClassName?: string
}

export function GridSkeleton({ count = 8, className, itemClassName }: GridSkeletonProps) {
  return (
    <div className={cn('grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4', className)}>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className={cn('h-72 bg-primary animate-pulse rounded-lg', itemClassName)}
        />
      ))}
    </div>
  )
}
