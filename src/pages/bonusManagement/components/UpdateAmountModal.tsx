import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { FormInput } from '@/components/common'
import type { BackendProfessional } from '@/redux/api/bonusManageApi'

const amountSchema = z.object({
  amount: z
    .number({ required_error: 'Amount is required' })
    .min(0, 'Amount must be greater than or equal to 0'),
})

type AmountFormData = z.infer<typeof amountSchema>

interface UpdateAmountModalProps {
  open: boolean
  onClose: () => void
  professional: BackendProfessional | null
  onConfirm: (id: string, amount: number) => Promise<void>
  isLoading?: boolean
}

export function UpdateAmountModal({
  open,
  onClose,
  professional,
  onConfirm,
  isLoading = false,
}: UpdateAmountModalProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<AmountFormData>({
    resolver: zodResolver(amountSchema),
    defaultValues: {
      amount: professional?.walletBalance ?? 0,
    },
  })

  useEffect(() => {
    if (professional) {
      reset({ amount: professional.walletBalance })
    }
  }, [professional, reset])

  const onSubmit = async (data: AmountFormData) => {
    if (!professional) return
    await onConfirm(professional._id, data.amount)
    reset()
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update Wallet Amount</DialogTitle>
          <DialogDescription>
            Update the wallet balance for {professional?.name}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <FormInput
            label="Amount"
            type="number"
            placeholder="Enter amount"
            error={errors.amount?.message}
            required
            step="0.01"
            min="0"
            {...register('amount', { valueAsNumber: true })}
          />
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isLoading}>
              Update Amount
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
