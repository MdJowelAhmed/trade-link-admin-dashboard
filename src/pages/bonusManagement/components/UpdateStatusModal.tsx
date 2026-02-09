import { ModalWrapper } from '@/components/common'
import { Button } from '@/components/ui/button'
import type { BackendProfessional } from '@/redux/api/bonusManageApi'

interface UpdateStatusModalProps {
  open: boolean
  onClose: () => void
  professional: BackendProfessional | null
  status: 'APPROVED' | 'REJECTED' | null
  onConfirm: (id: string, status: 'APPROVED' | 'REJECTED') => Promise<void>
  isLoading?: boolean
}

export function UpdateStatusModal({
  open,
  onClose,
  professional,
  status,
  onConfirm,
  isLoading = false,
}: UpdateStatusModalProps) {
  const handleConfirm = async () => {
    if (!professional || !status) return
    await onConfirm(professional._id, status)
  }

  if (!professional || !status) return null

  return (
    <ModalWrapper
      open={open}
      onClose={onClose}
      title={status === 'APPROVED' ? 'Approve Professional' : 'Reject Professional'}
      description={`Are you sure you want to ${status === 'APPROVED' ? 'approve' : 'reject'} ${professional.name}?`}
      size="md"
      className="bg-white"
    >
      <div className="flex justify-end gap-2 py-4 border-t">
        {/* <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
          Cancel
        </Button> */}
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
