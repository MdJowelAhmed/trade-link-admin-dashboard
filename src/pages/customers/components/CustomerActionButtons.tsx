import { EyeOff, Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { Customer } from '@/types'

interface CustomerActionButtonsProps {
  customer: Customer
  onView: (customer: Customer) => void
  onToggleStatus: (customer: Customer) => void
}

export function CustomerActionButtons({
  customer,
  onView,
  onToggleStatus,
}: CustomerActionButtonsProps) {
  return (
    <div className="flex items-center justify-end gap-2">
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={() => onView(customer)}
        className="h-8 w-8 hover:bg-gray-100"
        title="View Details"
      >
        <EyeOff className="h-4 w-4 text-gray-600" />
      </Button>
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={() => onToggleStatus(customer)}
        className="h-8 w-8 hover:bg-red-50"
        title={customer.status === 'active' ? 'Deactivate' : 'Activate'}
      >
        <Lock className="h-4 w-4 text-red-600" />
      </Button>
    </div>
  )
}
