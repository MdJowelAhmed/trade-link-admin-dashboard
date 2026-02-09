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
})

type PasswordFormData = z.infer<typeof passwordSchema>

interface PasswordInputProps {
  label: string
  error?: string
  helperText?: string
  required?: boolean
}

function PasswordInput({
  label,
  error,
  helperText,
  required,
  ...props
}: PasswordInputProps & React.InputHTMLAttributes<HTMLInputElement>) {
  const [showPassword, setShowPassword] = useState(false)

  return (
    <div className="space-y-1.5">
      <Label className={cn(error && 'text-destructive')}>
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>
      <div className="relative">
        <Input
          type={showPassword ? 'text' : 'password'}
          className={cn('pr-10', error && 'border-destructive')}
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
      let message = 'Something went wrong. Please try again.'

      if (error && typeof error === 'object') {
        const errWithData = error as { data?: { message?: string } }
        if (errWithData.data && typeof errWithData.data === 'object' && typeof errWithData.data.message === 'string') {
          message = errWithData.data.message
        } else if ('message' in error && typeof (error as { message?: string }).message === 'string') {
          message = (error as { message?: string }).message as string
        }
      } else if (error instanceof Error) {
        message = error.message
      }

      toast({
        title: 'Failed to change password',
        description: message,
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












