import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
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

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {status === 'APPROVED' ? 'Approve Professional' : 'Reject Professional'}
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to {status === 'APPROVED' ? 'approve' : 'reject'}{' '}
            {professional?.name}?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleConfirm}
            isLoading={isLoading}
            variant={status === 'APPROVED' ? 'default' : 'destructive'}
          >
            {status === 'APPROVED' ? 'Approve' : 'Reject'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
