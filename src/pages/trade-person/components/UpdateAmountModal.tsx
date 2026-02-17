import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ModalWrapper } from '@/components/common'
import { Button } from '@/components/ui/button'
import { FormInput } from '@/components/common'
import type { TradePerson } from '@/types'

const amountSchema = z.object({
  amount: z
    .number({ required_error: 'Amount is required' })
    .min(0, 'Amount must be greater than or equal to 0'),
})

type AmountFormData = z.infer<typeof amountSchema>

interface UpdateAmountModalProps {
  open: boolean
  onClose: () => void
  tradePerson: TradePerson | null
  onConfirm: (id: string, amount: number) => Promise<void>
  isLoading?: boolean
}

export function UpdateAmountModal({
  open,
  onClose,
  tradePerson,
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
      amount: (tradePerson as any)?.walletBalance ?? 0,
    },
  })

  useEffect(() => {
    if (tradePerson) {
      reset({ amount: (tradePerson as any)?.walletBalance ?? 0 })
    }
  }, [tradePerson, reset])

  const onSubmit = async (data: AmountFormData) => {
    if (!tradePerson) return
    await onConfirm(tradePerson.id, data.amount)
    reset()
  }

  if (!tradePerson) return null

  return (
    <ModalWrapper
      open={open}
      onClose={onClose}
      title="Update Wallet Amount"
      description={`Update the wallet balance for ${tradePerson.businessName}`}
      size="md"
      className="bg-white"
    >
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
        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button type="submit" isLoading={isLoading}>
            Update Amount
          </Button>
        </div>
      </form>
    </ModalWrapper>
  )
}
