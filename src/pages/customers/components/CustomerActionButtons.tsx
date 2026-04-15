import { Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import type { Customer, CustomerStatus } from '@/types'

interface CustomerActionButtonsProps {
  customer: Customer
  onView: (customer: Customer) => void
  onRequestStatusChange: (
    customer: Customer,
    nextStatus: CustomerStatus
  ) => void
  isStatusSwitchDisabled?: boolean
}

export function CustomerActionButtons({
  customer,
  onView,
  onRequestStatusChange,
  isStatusSwitchDisabled = false,
}: CustomerActionButtonsProps) {
  const isActive = customer.status === 'active'

  return (
    <div className="flex items-center justify-end gap-2">
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={() => onView(customer)}
        className="h-8 w-8 hover:bg-gray-100"
        title="View Details"
      >
        <Eye className="h-5 w-5 text-gray-600" />
      </Button>
      <div
        className="flex items-center gap-2 pl-1"
        title={isActive ? 'Customer is active' : 'Customer is inactive'}
      >
       
        <Switch
          checked={isActive}
          disabled={isStatusSwitchDisabled}
          onCheckedChange={(checked) =>
            onRequestStatusChange(
              customer,
              checked ? 'active' : 'inactive'
            )
          }
          aria-label={
            isActive ? 'Deactivate customer' : 'Activate customer'
          }
        />
      </div>
    </div>
  )
}
