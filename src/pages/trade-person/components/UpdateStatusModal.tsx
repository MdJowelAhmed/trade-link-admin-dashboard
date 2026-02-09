import { ModalWrapper } from '@/components/common'
import { Button } from '@/components/ui/button'
import type { TradePerson } from '@/types'

interface UpdateStatusModalProps {
  open: boolean
  onClose: () => void
  tradePerson: TradePerson | null
  status: 'approved' | 'rejected' | null
  onConfirm: (id: string, status: 'approved' | 'rejected') => Promise<void>
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
      title={status === 'approved' ? 'Approve Trade Person' : 'Reject Trade Person'}
      description={`Are you sure you want to ${status === 'approved' ? 'approve' : 'reject'} ${tradePerson.businessName}?`}
      size="md"
      className="bg-white"
    >
      <div className="flex justify-end gap-2 py-4 border-t">
        <Button
          type="button"
          onClick={handleConfirm}
          isLoading={isLoading}
          variant={status === 'approved' ? 'default' : 'destructive'}
          className=" "
        >
          {status === 'approved' ? 'Approve' : 'Reject'}
        </Button>
      </div>
    </ModalWrapper>
  )
}
