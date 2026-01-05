import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Upload, X, User, Phone, Mail, MapPin } from 'lucide-react'
import { ModalWrapper } from '@/components/common'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAppDispatch } from '@/redux/hooks'
import { addClient, updateClient } from '@/redux/slices/clientSlice'
import { useToast } from '@/components/ui/use-toast'
import type { Client } from '@/types'
import { cn } from '@/utils/cn'

const clientSchema = z.object({
  name: z.string().min(1, 'Client name is required'),
  phone: z.string().min(1, 'Phone is required'),
  email: z.string().email('Invalid email address'),
  country: z.string().min(1, 'Country is required'),
})

type ClientFormData = z.infer<typeof clientSchema>

interface AddEditClientModalProps {
  open: boolean
  onClose: () => void
  client?: Client | null
}

const countries = [
  'France',
  'Germany',
  'Spain',
  'Italy',
  'USA',
  'UK',
  'Canada',
  'Australia',
  'Japan',
  'China',
  'India',
  'Brazil',
]

export function AddEditClientModal({ open, onClose, client }: AddEditClientModalProps) {
  const dispatch = useAppDispatch()
  const { toast } = useToast()
  const [photo, setPhoto] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string>('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const isEditMode = !!client

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<ClientFormData>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      name: '',
      phone: '',
      email: '',
      country: '',
    },
  })

  // Reset form when modal opens or client changes
  useEffect(() => {
    if (open) {
      if (isEditMode && client) {
        reset({
          name: client.name,
          phone: client.phone,
          email: client.email,
          country: client.country,
        })
        setPhotoPreview(client.avatar || '')
      } else {
        reset({
          name: '',
          phone: '',
          email: '',
          country: '',
        })
        setPhoto(null)
        setPhotoPreview('')
      }
    }
  }, [open, isEditMode, client, reset])

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setPhoto(file)
      const reader = new FileReader()
      reader.onload = () => {
        setPhotoPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const removePhoto = () => {
    setPhoto(null)
    setPhotoPreview('')
  }

  const onSubmit = async (data: ClientFormData) => {
    setIsSubmitting(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const clientData: Client = {
      id: isEditMode && client ? client.id : Date.now().toString(),
      name: data.name,
      phone: data.phone,
      email: data.email,
      country: data.country,
      status: isEditMode && client ? client.status : 'active',
      avatar: photoPreview || client?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.name}`,
      createdAt: isEditMode && client ? client.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    if (isEditMode) {
      dispatch(updateClient(clientData))
      toast({
        title: 'Client Updated',
        description: `${data.name} has been updated successfully.`,
      })
    } else {
      dispatch(addClient(clientData))
      toast({
        title: 'Client Created',
        description: `${data.name} has been created successfully.`,
      })
    }

    setIsSubmitting(false)
    onClose()
  }

  return (
    <ModalWrapper
      open={open}
      onClose={onClose}
      title={isEditMode ? 'Edit Client' : 'Add New Client'}
      size="lg"
      className="max-w-2xl bg-white"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Grid Layout - 2 Columns */}
        <div className="grid grid-cols-2 gap-3 gap-x-5">
          {/* Client Name */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <Label htmlFor="name">Client Name</Label>
            </div>
            <Input
              id="name"
              placeholder="Enter Client Name"
              error={!!errors.name}
              {...register('name')}
            />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name.message}</p>
            )}
          </div>

          {/* Phone */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <Label htmlFor="phone">Phone</Label>
            </div>
            <Input
              id="phone"
              placeholder="Enter Phone Number"
              error={!!errors.phone}
              {...register('phone')}
            />
            {errors.phone && (
              <p className="text-xs text-destructive">{errors.phone.message}</p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <Label htmlFor="email">Email</Label>
            </div>
            <Input
              id="email"
              type="email"
              placeholder="Enter Email"
              error={!!errors.email}
              {...register('email')}
            />
            {errors.email && (
              <p className="text-xs text-destructive">{errors.email.message}</p>
            )}
          </div>

          {/* Country */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <Label htmlFor="country">Country</Label>
            </div>
            <select
              id="country"
              {...register('country')}
              className={cn(
                'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background',
                'file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                'disabled:cursor-not-allowed disabled:opacity-50',
                errors.country && 'border-destructive'
              )}
            >
              <option value="">Select Country</option>
              {countries.map((country) => (
                <option key={country} value={country}>
                  {country}
                </option>
              ))}
            </select>
            {errors.country && (
              <p className="text-xs text-destructive">{errors.country.message}</p>
            )}
          </div>
        </div>

        {/* File Upload Section */}
        <div className="space-y-2">
          <Label>Photos</Label>
          <div
            className={cn(
              'border-2 border-dashed rounded-lg p-6 transition-colors',
              'border-green-300 bg-green-50/30 hover:border-green-400'
            )}
          >
            {photoPreview ? (
              <div className="relative inline-block">
                <img
                  src={photoPreview}
                  alt="Preview"
                  className="w-32 h-32 object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={removePhoto}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center gap-3">
                <div className="flex flex-col items-center gap-2">
                  <div className="rounded-full bg-purple-100 p-3">
                    <Upload className="h-6 w-6 text-purple-600" />
                  </div>
                  <p className="text-sm font-medium text-gray-700">
                    Photos, Jpg, Png...
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="bg-secondary hover:bg-secondary/80 text-white border-secondary hover:text-white"
                  onClick={() => document.getElementById('client-photo')?.click()}
                >
                  Select files
                </Button>
                <input
                  id="client-photo"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handlePhotoChange}
                />
              </div>
            )}
          </div>
        </div>

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
            {isSubmitting
              ? 'Saving...'
              : isEditMode
              ? 'Save Changes'
              : 'Save Category'}
          </Button>
        </div>
      </form>
    </ModalWrapper>
  )
}

