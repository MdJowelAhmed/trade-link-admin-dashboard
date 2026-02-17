import { Eye, CheckCircle, XCircle, Pencil } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { TradePerson } from '@/types'

interface TradePersonActionButtonsProps {
  tradePerson: TradePerson
  onView: (tradePerson: TradePerson) => void
  onUpdateAmount: (tradePerson: TradePerson) => void
  onApprove: (tradePerson: TradePerson) => void
  onReject: (tradePerson: TradePerson) => void
}

export function TradePersonActionButtons({
  tradePerson,
  onView,
  onUpdateAmount,
  onApprove,
  onReject,
}: TradePersonActionButtonsProps) {
  return (
    <div className="flex items-center justify-end gap-2">
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={() => onView(tradePerson)}
        className="h-8 w-8 hover:bg-gray-100"
        title="View Details"
      >
        <Eye className="h-4 w-4 text-gray-500" />
      </Button>
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={() => onUpdateAmount(tradePerson)}
        className="h-8 w-8 hover:bg-blue-50"
        title="Update Amount"
      >
        <Pencil className="h-4 w-4 text-blue-600" />
      </Button>
      {tradePerson.status === 'pending' && (
        <>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => onApprove(tradePerson)}
            className="h-8 w-8 hover:bg-green-50"
            title="Approve"
          >
            <CheckCircle className="h-4 w-4 text-green-600" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => onReject(tradePerson)}
            className="h-8 w-8 hover:bg-red-50"
            title="Reject"
          >
            <XCircle className="h-4 w-4 text-red-600" />
          </Button>
        </>
      )}
    </div>
  )
}
