import { ModalWrapper } from '@/components/common'
import { Button } from '@/components/ui/button'
import type { TradePerson } from '@/types'

interface UpdateStatusModalProps {
  open: boolean
  onClose: () => void
  tradePerson: TradePerson | null
  status: 'APPROVED' | 'REJECTED' | null
  onConfirm: (id: string, status: 'APPROVED' | 'REJECTED') => Promise<void>
  isLoading?: boolean
}

export function UpdateStatusModal({
  open,
  onClose,
  tradePerson,
  status,
  onConfirm,
  isLoading = false,
}: UpdateStatusModalProps) {
  const handleConfirm = async () => {
    if (!tradePerson || !status) return
    await onConfirm(tradePerson.id, status)
  }

  if (!tradePerson || !status) return null

  return (
    <ModalWrapper
      open={open}
      onClose={onClose}
      title={status === 'APPROVED' ? 'Approve Trade Person' : 'Reject Trade Person'}
      description={`Are you sure you want to ${status === 'APPROVED' ? 'approve' : 'reject'} ${tradePerson.businessName}?`}
      size="md"
      className="bg-white"
    >
      <div className="flex justify-end gap-2 py-4 border-t">
        <Button
          type="button"
          onClick={handleConfirm}
          isLoading={isLoading}
          variant={status === 'APPROVED' ? 'default' : 'destructive'}
          className=" "
        >
          {status === 'APPROVED' ? 'Approve' : 'Reject'}
        </Button>
      </div>
    </ModalWrapper>
  )
}
