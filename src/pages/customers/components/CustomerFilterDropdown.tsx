import { Filter } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/utils/cn'
import type { CustomerStatus } from '@/types'

interface CustomerFilterDropdownProps {
  value: CustomerStatus | 'all'
  onChange: (value: CustomerStatus | 'all') => void
  className?: string
}

const statusFilterOptions = [
  { value: 'all', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
] as const

export function CustomerFilterDropdown({ value, onChange, className }: CustomerFilterDropdownProps) {
  return (
    <Select value={value} onValueChange={(val) => onChange(val as CustomerStatus | 'all')}>
      <SelectTrigger
        className={cn(
          'w-40 bg-secondary hover:bg-secondary/80 text-white border-secondary',
          'focus:ring-secondary focus:ring-offset-0',
          className
        )}
      >
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4" />
          <SelectValue placeholder="Filter" />
        </div>
      </SelectTrigger>
      <SelectContent>
        {statusFilterOptions.map((option) => (
          <SelectItem
            key={option.value}
            value={option.value}
            className="cursor-pointer"
          >
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
