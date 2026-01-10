import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Calendar, User, Car, CreditCard, Mail, Phone, DollarSign } from 'lucide-react'
import { ModalWrapper } from '@/components/common'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAppDispatch, useAppSelector } from '@/redux/hooks'
import { addBooking } from '@/redux/slices/bookingSlice'
import { useToast } from '@/components/ui/use-toast'
// import type { BookingStatus, BookingFormData } from '@/types'
import { cn } from '@/utils/cn' 

const bookingSchema = z.object({
  clientName: z.string().min(2, 'Client name must be at least 2 characters'),
  clientEmail: z.string().email('Invalid email address').optional().or(z.literal('')),
  clientPhone: z.string().optional(),
  carId: z.string().min(1, 'Please select a car'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  plan: z.string().min(1, 'Plan is required'),
  payment: z.string().min(1, 'Payment amount is required'),
  paymentStatus: z.enum(['Paid', 'Pending']),
  status: z.enum(['Upcoming', 'Runing', 'Completed']),
})

type BookingFormSchema = z.infer<typeof bookingSchema>

interface AddBookingModalProps {
  open: boolean
  onClose: () => void
}

export function AddBookingModal({ open, onClose }: AddBookingModalProps) {
  const dispatch = useAppDispatch()
  const { toast } = useToast()
  const { list: cars } = useAppSelector((state) => state.cars)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<BookingFormSchema>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      clientName: '',
      clientEmail: '',
      clientPhone: '',
      carId: '',
      startDate: '',
      endDate: '',
      plan: '2 Days',
      payment: '',
      paymentStatus: 'Pending',
      status: 'Upcoming',
    },
  })

  const watchedCarId = watch('carId')
  const watchedStartDate = watch('startDate')
  const watchedEndDate = watch('endDate')

  // Reset form when modal opens
  useEffect(() => {
    if (open) {
      reset({
        clientName: '',
        clientEmail: '',
        clientPhone: '',
        carId: '',
        startDate: '',
        endDate: '',
        plan: '2 Days',
        payment: '',
        paymentStatus: 'Pending',
        status: 'Upcoming',
      })
    }
  }, [open, reset])

  // Calculate plan and payment based on dates
  useEffect(() => {
    const selectedCar = cars.find((car) => car.id === watchedCarId)

    if (watchedStartDate && watchedEndDate && selectedCar) {
      const start = new Date(watchedStartDate)
      const end = new Date(watchedEndDate)
      const diffTime = Math.abs(end.getTime() - start.getTime())
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

      if (diffDays > 0) {
        // Set plan based on days
        if (diffDays === 1) setValue('plan', '1 Day')
        else if (diffDays <= 7) setValue('plan', `${diffDays} Days`)
        else if (diffDays <= 14) setValue('plan', `${Math.ceil(diffDays / 7)} Week`)
        else setValue('plan', '1 Month')

        // Calculate payment based on car price and days
        const dailyRate = selectedCar.amount || 0
        const totalAmount = dailyRate * diffDays
        setValue('payment', `€${totalAmount}`)
      }
    }
  }, [watchedStartDate, watchedEndDate, watchedCarId, cars, setValue])

  const onSubmit = async (data: BookingFormSchema) => {
    setIsSubmitting(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const selectedCar = cars.find((car) => car.id === data.carId)
    
    // Generate booking ID
    const bookingId = `Ik-${Date.now()}`

    const bookingData = {
      id: bookingId,
      startDate: new Date(data.startDate).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }),
      endDate: new Date(data.endDate).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }),
      clientName: data.clientName,
      clientEmail: data.clientEmail || undefined,
      clientPhone: data.clientPhone || undefined,
      carModel: selectedCar?.name || '',
      licensePlate: selectedCar?.carNumber || '',
      carId: data.carId,
      plan: data.plan,
      payment: data.payment,
      paymentStatus: data.paymentStatus,
      status: data.status,
      carInfo: selectedCar
        ? {
            id: selectedCar.id,
            name: selectedCar.name,
            image: selectedCar.image,
            transmission: selectedCar.transmission,
            seats: selectedCar.seats,
            carClass: selectedCar.carClass,
            location: selectedCar.location,
            amount: selectedCar.amount,
            priceDuration: selectedCar.priceDuration,
          }
        : undefined,
      carOwner: selectedCar?.owner,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    dispatch(addBooking(bookingData))
    toast({
      title: 'Booking Created',
      description: 'Booking has been created successfully.',
    })

    setIsSubmitting(false)
    onClose()
  }

  return (
    <ModalWrapper
      open={open}
      onClose={onClose}
      title="Add New Booking"
      size="lg"
      className="max-w-3xl bg-white"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Client Information */}
        <div>
          <h3 className="text-lg font-semibold mb-4 text-gray-900">
            Client Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <Label htmlFor="clientName">Client Name *</Label>
              </div>
              <Input
                id="clientName"
                placeholder="Enter client name"
                error={!!errors.clientName}
                {...register('clientName')}
              />
              {errors.clientName && (
                <p className="text-xs text-destructive">
                  {errors.clientName.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <Label htmlFor="clientEmail">Client Email</Label>
              </div>
              <Input
                id="clientEmail"
                type="email"
                placeholder="Enter client email"
                error={!!errors.clientEmail}
                {...register('clientEmail')}
              />
              {errors.clientEmail && (
                <p className="text-xs text-destructive">
                  {errors.clientEmail.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <Label htmlFor="clientPhone">Client Phone</Label>
              </div>
              <Input
                id="clientPhone"
                placeholder="Enter client phone"
                error={!!errors.clientPhone}
                {...register('clientPhone')}
              />
              {errors.clientPhone && (
                <p className="text-xs text-destructive">
                  {errors.clientPhone.message}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Car Selection */}
        <div>
          <h3 className="text-lg font-semibold mb-4 text-gray-900">
            Car Selection
          </h3>
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <Car className="h-4 w-4 text-muted-foreground" />
              <Label htmlFor="carId">Select Car *</Label>
            </div>
            <select
              id="carId"
              value={watchedCarId}
              onChange={(e) => setValue('carId', e.target.value)}
              className={cn(
                'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                'disabled:cursor-not-allowed disabled:opacity-50',
                errors.carId && 'border-destructive'
              )}
            >
              <option value="">Select a car</option>
              {cars.map((car) => (
                <option key={car.id} value={car.id}>
                  {car.name} - {car.carNumber || 'N/A'} ({car.carClass})
                </option>
              ))}
            </select>
            {errors.carId && (
              <p className="text-xs text-destructive">{errors.carId.message}</p>
            )}
          </div>
        </div>

        {/* Booking Dates */}
        <div>
          <h3 className="text-lg font-semibold mb-4 text-gray-900">
            Booking Dates
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <Label htmlFor="startDate">Start Date *</Label>
              </div>
              <Input
                id="startDate"
                type="date"
                error={!!errors.startDate}
                {...register('startDate')}
              />
              {errors.startDate && (
                <p className="text-xs text-destructive">
                  {errors.startDate.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <Label htmlFor="endDate">End Date *</Label>
              </div>
              <Input
                id="endDate"
                type="date"
                error={!!errors.endDate}
                {...register('endDate')}
              />
              {errors.endDate && (
                <p className="text-xs text-destructive">
                  {errors.endDate.message}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Plan and Payment */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <Label htmlFor="plan">Plan *</Label>
            </div>
            <select
              id="plan"
              {...register('plan')}
              className={cn(
                'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                'disabled:cursor-not-allowed disabled:opacity-50',
                errors.plan && 'border-destructive'
              )}
            >
              {PLAN_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {errors.plan && (
              <p className="text-xs text-destructive">{errors.plan.message}</p>
            )}
          </div> */}

          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-muted-foreground" />
              <Label htmlFor="payment">Payment Amount *</Label>
            </div>
            <Input
              id="payment"
              placeholder="Enter payment amount"
              error={!!errors.payment}
              {...register('payment')}
            />
            {errors.payment && (
              <p className="text-xs text-destructive">
                {errors.payment.message}
              </p>
            )}
          </div>


          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <Label htmlFor="paymentStatus">Payment Status *</Label>
            </div>
            <select
              id="paymentStatus"
              {...register('paymentStatus')}
              className={cn(
                'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                'disabled:cursor-not-allowed disabled:opacity-50',
                errors.paymentStatus && 'border-destructive'
              )}
            >
              <option value="Pending">Pending</option>
              <option value="Paid">Paid</option>
            </select>
            {errors.paymentStatus && (
              <p className="text-xs text-destructive">
                {errors.paymentStatus.message}
              </p>
            )}
          </div>
        </div>

        {/* Payment Status and Booking Status */}
        {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <Label htmlFor="paymentStatus">Payment Status *</Label>
            </div>
            <select
              id="paymentStatus"
              {...register('paymentStatus')}
              className={cn(
                'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                'disabled:cursor-not-allowed disabled:opacity-50',
                errors.paymentStatus && 'border-destructive'
              )}
            >
              <option value="Pending">Pending</option>
              <option value="Paid">Paid</option>
            </select>
            {errors.paymentStatus && (
              <p className="text-xs text-destructive">
                {errors.paymentStatus.message}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
              <Label htmlFor="status">Booking Status *</Label>
            </div>
            <select
              id="status"
              {...register('status')}
              className={cn(
                'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                'disabled:cursor-not-allowed disabled:opacity-50',
                errors.status && 'border-destructive'
              )}
            >
              <option value="Upcoming">Upcoming</option>
              <option value="Runing">Running</option>
              <option value="Completed">Completed</option>
            </select>
            {errors.status && (
              <p className="text-xs text-destructive">
                {errors.status.message}
              </p>
            )}
          </div>
        </div> */}

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            {isSubmitting ? 'Creating...' : 'Create Booking'}
          </Button>
        </div>
      </form>
    </ModalWrapper>
  )
}

