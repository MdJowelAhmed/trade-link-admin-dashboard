import { ChevronDown } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/utils/cn'
import type { TradePersonStatus } from '@/types'

interface TradePersonFilterDropdownProps {
  value: TradePersonStatus | 'all'
  onChange: (value: TradePersonStatus | 'all') => void
  className?: string
}

const statusFilterOptions = [
  { value: 'all', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
] as const

export function TradePersonFilterDropdown({ value, onChange, className }: TradePersonFilterDropdownProps) {
  const selectedOption = statusFilterOptions.find(opt => opt.value === value)
  
  return (
    <Select value={value} onValueChange={(val) => onChange(val as TradePersonStatus | 'all')}>
      <SelectTrigger
        className={cn(
          'w-32 bg-white border border-gray-200 text-gray-700 rounded-full',
          'focus:ring-0 focus:ring-offset-0 focus:border-gray-300',
          'hover:bg-gray-50 transition-colors',
          className
        )}
      >
        <div className="flex items-center gap-2">
          <SelectValue placeholder="Pending">
            {selectedOption?.label || 'Pending'}
          </SelectValue>
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
