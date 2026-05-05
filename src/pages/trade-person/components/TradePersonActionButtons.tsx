import { useState } from 'react'
import { Eye, CheckCircle, Pencil, XCircle, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import type { TradePerson } from '@/types'

interface TradePersonActionButtonsProps {
  tradePerson: TradePerson
  onView: (tradePerson: TradePerson) => void
  onUpdateAmount: (tradePerson: TradePerson) => void
  onApprove: (tradePerson: TradePerson) => void
  onReject: (tradePerson: TradePerson) => void
  /** Parent opens confirm, then calls `DELETE /admin/professionals/:id` */
  onDelete?: (tradePerson: TradePerson) => void
  onSetAccountStatus: (
    tradePerson: TradePerson,
    status: 'ACTIVE' | 'INACTIVE'
  ) => void | Promise<void>
  isAccountStatusUpdating?: boolean
}

export function TradePersonActionButtons({
  tradePerson,
  onView,
  onUpdateAmount,
  onApprove,
  onReject,
  onDelete,
  onSetAccountStatus,
  isAccountStatusUpdating = false,
}: TradePersonActionButtonsProps) {
  const isActive = tradePerson.accountStatus === 'ACTIVE'
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [intendedStatus, setIntendedStatus] = useState<
    'ACTIVE' | 'INACTIVE' | null
  >(null)

  const openConfirm = (next: 'ACTIVE' | 'INACTIVE') => {
    if (next === tradePerson.accountStatus) return
    setIntendedStatus(next)
    setConfirmOpen(true)
  }

  const closeConfirm = () => {
    setConfirmOpen(false)
    setIntendedStatus(null)
  }

  return (
    <>
      <div className="flex items-center justify-end gap-2">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => onView(tradePerson)}
          className="h-8 w-8 hover:bg-gray-100"
          title="View Details"
        >
          <Eye className="h-5 w-5 text-gray-500" />
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => onUpdateAmount(tradePerson)}
          className="h-8 w-8 hover:bg-blue-50"
          title="Update Amount"
        >
          <Pencil className="h-5 w-5 text-blue-600" />
        </Button>
        <div
          className="flex items-center gap-2 pl-1"
          title={isActive ? 'Account is active' : 'Account is inactive'}
        >
          
          <Switch
            checked={isActive}
            disabled={isAccountStatusUpdating}
            onCheckedChange={(checked) =>
              openConfirm(checked ? 'ACTIVE' : 'INACTIVE')
            }
            aria-label={
              isActive ? 'Deactivate account' : 'Activate account'
            }
          />
        </div>
        {tradePerson.status === 'pending' && (
          <>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => onApprove(tradePerson)}
              className="h-8 w-8 hover:bg-green-50"
              title="Approve"
            >
              <CheckCircle className="h-5 w-5 text-green-600" />
            </Button>
            <Button
              variant="warning"
              size="icon-sm"
              onClick={() => onReject(tradePerson)}
              className="h-8 w-8 hover:bg-red-50"
              title="Reject"
            >
              <XCircle className="h-5 w-5 text-red-600" />
            </Button>
          </>
        )}
        {onDelete ? (
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={() => onDelete(tradePerson)}
            className="h-8 w-8 text-gray-500 hover:bg-red-50 hover:text-red-600"
            title="Delete trade person"
            aria-label={`Delete ${tradePerson.businessName}`}
          >
            <Trash2 className="h-5 w-5" />
          </Button>
        ) : null}
      </div>

      <ConfirmDialog
        open={confirmOpen && intendedStatus !== null}
        onClose={closeConfirm}
        onConfirm={() =>
          intendedStatus !== null
            ? onSetAccountStatus(tradePerson, intendedStatus)
            : Promise.resolve()
        }
        onSuccess={closeConfirm}
        title={
          intendedStatus === 'ACTIVE'
            ? 'Activate this account?'
            : intendedStatus === 'INACTIVE'
              ? 'Deactivate this account?'
              : 'Update account status'
        }
        description={
          intendedStatus === 'ACTIVE'
            ? `${tradePerson.businessName} will be able to use the platform as an active professional.`
            : intendedStatus === 'INACTIVE'
              ? `${tradePerson.businessName} will be set to inactive and may lose access until reactivated.`
              : ''
        }
        confirmText={
          intendedStatus === 'ACTIVE'
            ? 'Activate'
            : intendedStatus === 'INACTIVE'
              ? 'Deactivate'
              : 'Confirm'
        }
        variant={
          intendedStatus === 'ACTIVE'
            ? 'info'
            : 'warning'
        }
        isLoading={isAccountStatusUpdating}
      />
    </>
  )
}
