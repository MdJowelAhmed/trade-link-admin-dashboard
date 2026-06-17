import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, Shield } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from '@/utils/toast'
import { cn } from '@/utils/cn'
import { motion } from 'framer-motion'
import { useChangePasswordMutation } from '@/redux/api/authApi'

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
}).refine((data) => data.currentPassword !== data.newPassword, {
  message: 'New password must be different from current password',
  path: ['newPassword'],
})

type PasswordFormData = z.infer<typeof passwordSchema>

interface PasswordInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
  helperText?: string
}

const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ label, error, helperText, required, className, ...props }, ref) => {
  const [showPassword, setShowPassword] = useState(false)

  return (
    <div className="space-y-1.5">
      <Label htmlFor={props.id ?? props.name} className={cn(error && 'text-destructive')}>
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>
      <div className="relative">
        <Input
          ref={ref}
          type={showPassword ? 'text' : 'password'}
          className={cn('pr-10', error && 'border-destructive', className)}
          error={!!error}
          {...props}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
        >
          {showPassword ? (
            <EyeOff className="h-4 w-4" />
          ) : (
            <Eye className="h-4 w-4" />
          )}
        </button>
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
      {helperText && !error && (
        <p className="text-xs text-muted-foreground">{helperText}</p>
      )}
    </div>
  )
})

PasswordInput.displayName = 'PasswordInput'

function getErrorMessage(error: unknown): string {
  if (error && typeof error === 'object' && 'data' in error) {
    const data = (error as { data?: { message?: string; errorMessages?: { message?: string }[] } }).data
    if (data?.errorMessages?.length) {
      return data.errorMessages.map((item) => item.message).filter(Boolean).join(', ')
    }
    if (typeof data?.message === 'string') {
      return data.message
    }
  }
  if (error instanceof Error) {
    return error.message
  }
  return 'Something went wrong. Please try again.'
}

export default function ChangePassword() {
  const [changePassword, { isLoading }] = useChangePasswordMutation()

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  })

  const newPassword = watch('newPassword', '')

  const passwordRequirements = [
    { label: 'At least 8 characters', met: newPassword.length >= 8 },
    { label: 'One uppercase letter', met: /[A-Z]/.test(newPassword) },
    { label: 'One lowercase letter', met: /[a-z]/.test(newPassword) },
    { label: 'One number', met: /[0-9]/.test(newPassword) },
    { label: 'One special character', met: /[^A-Za-z0-9]/.test(newPassword) },
  ]

  const onSubmit = async (data: PasswordFormData) => {
    try {
      const response = await changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
        confirmPassword: data.confirmPassword,
      }).unwrap()

      if (response?.success) {
        toast({
          title: 'Password Changed',
          description: response.message || 'Your password has been changed successfully.',
          variant: 'success',
        })
        reset()
      } else {
        toast({
          title: 'Failed to change password',
          description: response?.message || 'Something went wrong. Please try again.',
          variant: 'destructive',
        })
      }
    } catch (error: unknown) {
      toast({
        title: 'Failed to change password',
        description: getErrorMessage(error),
        variant: 'destructive',
      })
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6 max-w-2xl mx-auto"
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Change Password
          </CardTitle>
          <CardDescription>
            Ensure your account is using a strong password to stay secure
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <PasswordInput
              label="Current Password"
              placeholder="Enter current password"
              error={errors.currentPassword?.message}
              required
              {...register('currentPassword')}
            />

            <PasswordInput
              label="New Password"
              placeholder="Enter new password"
              error={errors.newPassword?.message}
              required
              {...register('newPassword')}
            />

            {/* Password Requirements */}
            <div className="rounded-lg border p-4 space-y-2">
              <p className="text-sm font-medium">Password Requirements</p>
              <div className="grid gap-2 sm:grid-cols-2">
                {passwordRequirements.map((req) => (
                  <div
                    key={req.label}
                    className={cn(
                      'flex items-center gap-2 text-sm',
                      req.met ? 'text-success' : 'text-muted-foreground'
                    )}
                  >
                    <div
                      className={cn(
                        'h-1.5 w-1.5 rounded-full',
                        req.met ? 'bg-success' : 'bg-muted-foreground'
                      )}
                    />
                    {req.label}
                  </div>
                ))}
              </div>
            </div>

            <PasswordInput
              label="Confirm New Password"
              placeholder="Confirm new password"
              error={errors.confirmPassword?.message}
              required
              {...register('confirmPassword')}
            />

            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => reset()}>
                Cancel
              </Button>
              <Button type="submit" isLoading={isLoading}>
                Change Password
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  )
}












