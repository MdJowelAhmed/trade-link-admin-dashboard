import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Mail, ArrowLeft, ArrowRight, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAppDispatch } from '@/redux/hooks'
import { setPasswordResetEmail } from '@/redux/slices/authSlice'
import { useForgotPasswordMutation, useResentOtpMutation } from '@/redux/api/authApi'
import { cn } from '@/utils/cn'
import { motion, AnimatePresence } from 'framer-motion'

const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email'),
})

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>

export default function ForgotPassword() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const [isSuccess, setIsSuccess] = useState(false)
  const [submittedEmail, setSubmittedEmail] = useState('')
  const [error, setError] = useState('')

  const [forgotPassword, { isLoading }] = useForgotPasswordMutation()
  const [resentOtp, { isLoading: isResendLoading }] = useResentOtpMutation()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  })

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setError('')
    try {
      await forgotPassword({ email: data.email }).unwrap()

      dispatch(setPasswordResetEmail(data.email))
      setSubmittedEmail(data.email)
      setIsSuccess(true)
    } catch (err: unknown) {
      let message = 'Failed to send reset email. Please try again.'
      if (err && typeof err === 'object' && 'data' in err && (err as any).data?.message) {
        message = String((err as any).data.message)
      }
      setError(message)
    }
  }

  const handleContinue = () => {
    navigate('/auth/verify-email', { state: { type: 'reset' } })
  }

  const handleResend = async () => {
    if (!submittedEmail) return
    setError('')
    try {
      await resentOtp({ email: submittedEmail }).unwrap()
    } catch (err: unknown) {
      let message = 'Failed to resend code. Please try again.'
      if (err && typeof err === 'object' && 'data' in err && (err as any).data?.message) {
        message = String((err as any).data.message)
      }
      setError(message)
    }
  }

  return (
    <div className="space-y-6">
      {/* Mobile Logo */}
      <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
        <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center">
          <span className="text-primary-foreground font-bold text-xl">D</span>
        </div>
        <span className="font-display font-bold text-2xl">Dashboard</span>
      </div>

      <AnimatePresence mode="wait">
        {!isSuccess ? (
          <motion.div
            key="form"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-6"
          >
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm"
              >
                {error}
              </motion.div>
            )}

            <Link
              to="/auth/login"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to login
            </Link>

            <div className="space-y-2">
              <h1 className="text-2xl font-bold tracking-tight">Forgot password?</h1>
              <p className="text-muted-foreground">
                No worries, we'll send you reset instructions.
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    className={cn('pl-10', errors.email && 'border-destructive')}
                    {...register('email')}
                  />
                </div>
                {errors.email && (
                  <p className="text-xs text-destructive">{errors.email.message}</p>
                )}
              </div>

              <Button type="submit" className="w-full" size="lg" isLoading={isLoading}>
                {!isLoading && (
                  <>
                    Send Reset Link
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </form>
          </motion.div>
        ) : (
          <motion.div
            key="success"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6 text-center"
          >
            <div className="mx-auto w-16 h-16 rounded-full bg-success/10 flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-success" />
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl font-bold tracking-tight">Check your email</h1>
              <p className="text-muted-foreground">
                We sent a verification code to
              </p>
              <p className="font-medium">{submittedEmail}</p>
            </div>

            <Button onClick={handleContinue} className="w-full" size="lg">
              Enter Code
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>

            <p className="text-sm text-muted-foreground">
              Didn't receive the email?{' '}
              <button
                onClick={handleResend}
                disabled={isResendLoading}
                className="text-primary font-medium hover:underline disabled:opacity-60"
              >
                {isResendLoading ? 'Resending...' : 'Click to resend'}
              </button>
            </p>

            <Link
              to="/auth/login"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to login
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

