import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAppSelector } from '@/redux/hooks'
import { useVerifyEmailMutation, useResentOtpMutation } from '@/redux/api/authApi'
import { cn } from '@/utils/cn'
import { motion } from 'framer-motion'

const OTP_LENGTH = 6

export default function VerifyEmail() {
  const navigate = useNavigate()
  const location = useLocation()
  const { passwordResetEmail, verificationEmail } = useAppSelector((state) => state.auth)
  
  const isPasswordReset = location.state?.type === 'reset'
  const email = isPasswordReset ? passwordResetEmail : verificationEmail

  const [otp, setOtp] = useState<number[]>(new Array(OTP_LENGTH).fill(0))
  const [error, setError] = useState('')
  const [resendTimer, setResendTimer] = useState(30)

  const [verifyEmail, { isLoading: isVerifying }] = useVerifyEmailMutation()
  const [resentOtp, { isLoading: isResendLoading }] = useResentOtpMutation()
  
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    inputRefs.current[0]?.focus()
  }, [])

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [resendTimer])

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return

    const newOtp = [...otp]
    newOtp[index] = parseInt(value.slice(-1))
    setOtp(newOtp)
    setError('')

    // Move to next input
    if (value && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text').slice(0, OTP_LENGTH)
    if (!/^\d+$/.test(pastedData)) return

    const newOtp = [...otp]
    pastedData.split('').forEach((char, index) => {
      if (index < OTP_LENGTH) newOtp[index] = parseInt(char)
    })
    setOtp(newOtp)

    const focusIndex = Math.min(pastedData.length, OTP_LENGTH - 1)
    inputRefs.current[focusIndex]?.focus()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const code = otp.join('')

    if (code.length !== OTP_LENGTH) {
      setError('Please enter the complete verification code')
      return
    }

    if (!email) {
      setError('Email not found. Please try again from the beginning.')
      return
    }

    setError('')
    try {
      const response = await verifyEmail({
        email,
        oneTimeCode: parseInt(code),
      }).unwrap()

      if (response?.success) {
        if (isPasswordReset) {
          navigate('/auth/reset-password')
        } else {
          navigate('/auth/login', { state: { verified: true } })
        }
      } else {
        setError(response?.message || 'Invalid verification code')
      }
    } catch (err: unknown) {
      let message = 'An error occurred. Please try again.'
      if (err && typeof err === 'object' && 'data' in err) {
        const data = (err as { data?: { message?: string } }).data
        if (data?.message) {
          message = String(data.message)
        }
      }
      setError(message)
    }
  }

  const handleResend = async () => {
    if (!email) return
    setError('')
    setResendTimer(30)
    try {
      await resentOtp({ email }).unwrap()
    } catch (err: unknown) {
      let message = 'Failed to resend code. Please try again.'
        if (err && typeof err === 'object' && 'data' in err && (err as { data?: { message?: string } }).data?.message) {
        message = String((err as { data?: { message?: string } }).data?.message)
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

      <Link
        to={isPasswordReset ? '/auth/forgot-password' : '/auth/login'}
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </Link>

      <div className="space-y-2 text-center">
        <div className="mx-auto w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-4">
          <Mail className="h-6 w-6 text-primary" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight">Verify your email</h1>
        <p className="text-muted-foreground">
          We sent a 6-digit code to
        </p>
        <p className="font-medium">{email || 'your email'}</p>
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm text-center"
        >
          {error}
        </motion.div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex justify-center gap-2">
          {otp.map((digit, index) => (
            <Input
              key={index}
              ref={(el) => { inputRefs.current[index] = el }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={handlePaste}
              className={cn(
                'w-12 h-14 text-center text-xl font-semibold',
                error && 'border-destructive'
              )}
            />
          ))}
        </div>

        <Button type="submit" className="w-full" size="lg" isLoading={isVerifying}>
          {!isVerifying && (
            <>
              Verify
              <ArrowRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </form>

      <div className="text-center">
        <p className="text-sm text-muted-foreground">
          Didn't receive the code?{' '}
          {resendTimer > 0 ? (
            <span className="text-muted-foreground">
              Resend in {resendTimer}s
            </span>
          ) : (
            <button
              onClick={handleResend}
              disabled={isResendLoading}
              className="text-primary font-medium hover:underline disabled:opacity-60"
            >
              {isResendLoading ? 'Resending...' : 'Click to resend'}
            </button>
          )}
        </p>
      </div>
    </div>
  )
}

