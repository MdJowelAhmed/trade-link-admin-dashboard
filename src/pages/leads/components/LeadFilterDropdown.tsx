import { Filter } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/utils/cn'
import { JobPostStatus } from '@/types'

interface LeadFilterDropdownProps {
  value: JobPostStatus | 'all'
  onChange: (value: JobPostStatus | 'all') => void
  className?: string
}

const statusFilterOptions = [
  { value: 'all', label: 'All' },
  { value: JobPostStatus.OPEN, label: 'Open' },
  { value: JobPostStatus.CLOSED, label: 'Closed' },
  { value: JobPostStatus.HIRED, label: 'Hired' },
  { value: JobPostStatus.COMPLETED, label: 'Completed' },
  { value: JobPostStatus.EXPIRED, label: 'Expired' },
] as const

export function LeadFilterDropdown({
  value,
  onChange,
  className,
}: LeadFilterDropdownProps) {
  return (
    <Select
      value={value}
      onValueChange={(val) => onChange(val as JobPostStatus | 'all')}
    >
      <SelectTrigger
        className={cn(
          'w-40 bg-card hover:bg-card/80 text-black border-card',
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

