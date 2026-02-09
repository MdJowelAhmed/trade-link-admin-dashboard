import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Gift, Save, Loader2 } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FormInput } from '@/components/common'
import { toast } from '@/utils/toast'
import { motion } from 'framer-motion'
import { useGetSignupBonusQuery, useUpdateSignupBonusMutation } from '@/redux/api/signupBonusApi'

const signupBonusSchema = z.object({
  value: z
    .number({ required_error: 'Value is required' })
    .min(0, 'Value must be greater than or equal to 0')
    .max(10000, 'Value must be less than or equal to 10,000'),
})

type SignupBonusFormData = z.infer<typeof signupBonusSchema>

export default function SignUpBonus() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const { data: response, isLoading, isFetching } = useGetSignupBonusQuery()
  const [updateSignupBonus] = useUpdateSignupBonusMutation()

  const signupBonus = response?.data

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<SignupBonusFormData>({
    resolver: zodResolver(signupBonusSchema),
    defaultValues: {
      value: signupBonus?.value ?? 0,
    },
    values: signupBonus ? { value: signupBonus.value } : undefined,
  })

  const onSubmit = async (data: SignupBonusFormData) => {
    try {
      setIsSubmitting(true)
      
      const result = await updateSignupBonus({ value: data.value }).unwrap()
      
      if (result.success) {
        toast({
          title: 'Signup Bonus Updated',
          description: result.message || 'Signup bonus has been updated successfully.',
        })
      }
    } catch (error: unknown) {
      const errorMessage = 
        (error && typeof error === 'object' && 'data' in error && 
         error.data && typeof error.data === 'object' && 'message' in error.data)
          ? String(error.data.message)
          : 'Failed to update signup bonus. Please try again.'
      
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (isLoading || isFetching) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-6"
      >
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6 max-w-3xl mx-auto"
    >
      <Card >
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Gift className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle>Signup Bonus</CardTitle>
                <CardDescription>
                  Manage the professional signup bonus credit amount
                </CardDescription>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Current Value Display */}
            {signupBonus && (
              <div className="rounded-lg border bg-muted/50 p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">Current Value</span>
                  <span className="text-2xl font-bold text-primary">
                    {signupBonus.value}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Key: {signupBonus.key}</span>
                  <span>
                    Last updated: {formatDate(signupBonus.updatedAt)}
                  </span>
                </div>
              </div>
            )}

            {/* Value Input */}
            <div className="space-y-4">
              <FormInput
                label="Signup Bonus Value"
                type="number"
                placeholder="Enter signup bonus value"
                error={errors.value?.message}
                required
                step="0.01"
                min="0"
                max="10000"
                {...register('value', { valueAsNumber: true })}
              />
              <p className="text-xs text-muted-foreground">
                Enter the credit amount that will be awarded to professionals upon signup.
                Value must be between 0 and 10,000.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 justify-end pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => reset()}
                disabled={isSubmitting}
              >
                Reset
              </Button>
              <Button
                type="submit"
                isLoading={isSubmitting}
                className="bg-primary text-white hover:bg-primary/80"
              >
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  )
}