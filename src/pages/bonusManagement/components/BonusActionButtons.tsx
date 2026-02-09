import {  CheckCircle, XCircle, Pencil } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { BackendProfessional } from '@/redux/api/bonusManageApi'

interface BonusActionButtonsProps {
  professional: BackendProfessional
  onUpdateAmount: (professional: BackendProfessional) => void
  onApprove: (professional: BackendProfessional) => void
  onReject: (professional: BackendProfessional) => void
}

export function BonusActionButtons({
  professional,
  onUpdateAmount,
  onApprove,
  onReject,
}: BonusActionButtonsProps) {
  return (
    <div className="flex items-center justify-end gap-2">
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={() => onUpdateAmount(professional)}
        className="h-8 w-8 hover:bg-blue-50"
        title="Update Amount"
      >
        {/* <DollarSign className="h-4 w-4 text-blue-600" /> */}
        <Pencil className="h-4 w-4 text-blue-600" />
      </Button>
      {professional.professional.approveStatus === 'PENDING' && (
        <>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => onApprove(professional)}
            className="h-8 w-8 hover:bg-green-50"
            title="Approve"
          >
            <CheckCircle className="h-4 w-4 text-green-600" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => onReject(professional)}
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
