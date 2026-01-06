import { useState } from 'react'
import { Filter, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/utils/cn'
import type { ClientStatus } from '@/types'

interface ClientFilterDropdownProps {
  value: ClientStatus | 'all'
  onChange: (value: ClientStatus | 'all') => void
  className?: string
}

const statusFilterOptions = [
  { value: 'all', label: 'All Status' },
  { value: 'verified', label: 'Verified' },
  { value: 'unverified', label: 'Unverified' },
  { value: 'requested', label: 'Requested' },
] as const

export function ClientFilterDropdown({ value, onChange, className }: ClientFilterDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            'bg-secondary hover:bg-secondary/80 text-white border-secondary hover:text-white',
            'flex items-center gap-2',
            className
          )}
        >
          <Filter className="h-4 w-4" />
          Filter
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {statusFilterOptions.map((option) => (
          <DropdownMenuItem
            key={option.value}
            onClick={() => {
              onChange(option.value as ClientStatus | 'all')
              setIsOpen(false)
            }}
            className={cn(
              'cursor-pointer',
              value === option.value && 'bg-gray-100 font-semibold'
            )}
          >
            {option.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

