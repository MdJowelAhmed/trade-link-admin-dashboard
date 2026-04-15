import { Eye, CheckCircle, Loader2, Pencil, Power, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { TradePerson } from '@/types'

interface TradePersonActionButtonsProps {
  tradePerson: TradePerson
  onView: (tradePerson: TradePerson) => void
  onUpdateAmount: (tradePerson: TradePerson) => void
  onApprove: (tradePerson: TradePerson) => void
  onReject: (tradePerson: TradePerson) => void
  onToggleAccountStatus: (tradePerson: TradePerson) => void
  isAccountStatusUpdating?: boolean
}

export function TradePersonActionButtons({
  tradePerson,
  onView,
  onUpdateAmount,
  onApprove,
  onReject,
  onToggleAccountStatus,
  isAccountStatusUpdating = false,
}: TradePersonActionButtonsProps) {
  const isActive = tradePerson.accountStatus === 'ACTIVE'

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
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={() => onToggleAccountStatus(tradePerson)}
        disabled={isAccountStatusUpdating}
        className={
          isActive
            ? 'h-8 w-8 hover:bg-amber-50'
            : 'h-8 w-8 hover:bg-emerald-50'
        }
        title={isActive ? 'Set status to INACTIVE' : 'Set status to ACTIVE'}
      >
        {isAccountStatusUpdating ? (
          <Loader2 className="h-4 w-4 animate-spin text-slate-500" />
        ) : (
          <Power
            className={
              isActive
                ? 'h-4 w-4 text-amber-600'
                : 'h-4 w-4 text-emerald-600'
            }
          />
        )}
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
