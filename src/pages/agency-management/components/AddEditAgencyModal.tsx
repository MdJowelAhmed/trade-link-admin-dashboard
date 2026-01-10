import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Upload, X } from 'lucide-react'
import { ModalWrapper } from '@/components/common'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/utils/cn'
import { useAppDispatch } from '@/redux/hooks'
import { addAgency, updateAgency } from '@/redux/slices/agencySlice'
import type { Agency } from '@/types'
import { useToast } from '@/components/ui/use-toast'

const agencySchema = z.object({
  name: z.string().min(1, 'Agency name is required'),
  ownerName: z.string().min(1, 'Owner name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(1, 'Phone is required'),
  country: z.string().min(1, 'Country is required'),
  address: z.string().min(1, 'Address is required'),
})

type AgencyFormData = z.infer<typeof agencySchema>

interface AddEditAgencyModalProps {
  open: boolean
  onClose: () => void
  agency?: Agency | null
}

const countries = [
  'Germany',
  'France',
  'Spain',
  'Italy',
  'USA',
  'UK',
  'Canada',
  'Australia',
]

export function AddEditAgencyModal({
  open,
  onClose,
  agency,
}: AddEditAgencyModalProps) {
  const dispatch = useAppDispatch()
  const { toast } = useToast()

  const [_logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string>('')
  const [docFiles, setDocFiles] = useState<File[]>([])

  const isEditMode = !!agency

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AgencyFormData>({
    resolver: zodResolver(agencySchema),
    defaultValues: {
      name: '',
      ownerName: '',
      email: '',
      phone: '',
      country: '',
      address: '',
    },
  })

  // Reset form when modal opens or agency changes
  useEffect(() => {
    if (open) {
      if (isEditMode && agency) {
        reset({
          name: agency.name,
          ownerName: agency.ownerName,
          email: agency.email,
          phone: agency.phone,
          country: agency.country,
          address: agency.address,
        })
        setLogoPreview(agency.logo || '')
        setDocFiles([])
      } else {
        reset({
          name: '',
          ownerName: '',
          email: '',
          phone: '',
          country: '',
          address: '',
        })
        setLogoFile(null)
        setLogoPreview('')
        setDocFiles([])
      }
    }
  }, [open, isEditMode, agency, reset])

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setLogoFile(file)
      const reader = new FileReader()
      reader.onload = () => {
        setLogoPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleDocsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setDocFiles(files)
  }

  const onSubmit = async (data: AgencyFormData) => {
    // simulate API
    await new Promise((resolve) => setTimeout(resolve, 800))

    const now = new Date().toISOString()

    const newAgency: Agency = {
      id: isEditMode && agency ? agency.id : Date.now().toString(),
      name: data.name,
      ownerName: data.ownerName,
      email: data.email,
      phone: data.phone,
      country: data.country,
      address: data.address,
      totalCars: isEditMode && agency ? agency.totalCars : 0,
      completedOrders: isEditMode && agency ? agency.completedOrders : 0,
      status: isEditMode && agency ? agency.status : 'active',
      logo:
        logoPreview ||
        agency?.logo ||
        `https://api.dicebear.com/7.x/identicon/svg?seed=${data.name}`,
      documents: agency?.documents || [],
      createdAt: isEditMode && agency ? agency.createdAt : now,
      updatedAt: now,
    }

    if (isEditMode) {
      dispatch(updateAgency(newAgency))
      toast({
        title: 'Agency Updated',
        description: `${data.name} has been updated successfully.`,
      })
    } else {
      dispatch(addAgency(newAgency))
      toast({
        title: 'Agency Created',
        description: `${data.name} has been created successfully.`,
      })
    }

    onClose()
  }

  return (
    <ModalWrapper
      open={open}
      onClose={onClose}
      title={isEditMode ? 'Edit Agency' : 'Add New Agency'}
      size="xl"
      className="bg-white"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Form Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="name">Agency Name</Label>
            <Input
              id="name"
              placeholder="Enter Agency Name"
              error={!!errors.name}
              {...register('name')}
            />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="ownerName">Owner Name</Label>
            <Input
              id="ownerName"
              placeholder="Enter Owner Name"
              error={!!errors.ownerName}
              {...register('ownerName')}
            />
            {errors.ownerName && (
              <p className="text-xs text-destructive">
                {errors.ownerName.message}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
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

          <div className="space-y-1.5">
            <Label htmlFor="phone">Phone</Label>
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

          <div className="space-y-1.5">
            <Label htmlFor="country">Country</Label>
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
              <p className="text-xs text-destructive">
                {errors.country.message}
              </p>
            )}
          </div>

          <div className="space-y-1.5 md:col-span-2">
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              placeholder="Enter Agency Address"
              error={!!errors.address}
              {...register('address')}
            />
            {errors.address && (
              <p className="text-xs text-destructive">
                {errors.address.message}
              </p>
            )}
          </div>
        </div>

        {/* Upload Areas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Agency Logo */}
          <div className="space-y-2">
            <Label>Agency Logo</Label>
            <div
              className={cn(
                'border-2 border-dashed rounded-lg p-6 transition-colors',
                'border-green-300 bg-green-50/40 hover:border-green-400'
              )}
            >
              {logoPreview ? (
                <div className="relative inline-block">
                  <img
                    src={logoPreview}
                    alt="Logo Preview"
                    className="w-32 h-32 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setLogoFile(null)
                      setLogoPreview('')
                    }}
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
                    onClick={() =>
                      document.getElementById('agency-logo')?.click()
                    }
                  >
                    Select files
                  </Button>
                  <input
                    id="agency-logo"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleLogoChange}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Agency Documents */}
          <div className="space-y-2">
            <Label>Agency Documents</Label>
            <div
              className={cn(
                'border-2 border-dashed rounded-lg p-6 transition-colors',
                'border-blue-300 bg-blue-50/40 hover:border-blue-400'
              )}
            >
              {docFiles.length > 0 ? (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700">
                    {docFiles.length} file(s) selected
                  </p>
                  <ul className="text-xs text-gray-600 list-disc list-inside space-y-1">
                    {docFiles.map((file) => (
                      <li key={file.name}>{file.name}</li>
                    ))}
                  </ul>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-2 border-red-400 text-red-600 hover:bg-red-50"
                    onClick={() => setDocFiles([])}
                  >
                    Clear files
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center gap-3">
                  <div className="flex flex-col items-center gap-2">
                    <div className="rounded-full bg-blue-100 p-3">
                      <Upload className="h-6 w-6 text-blue-600" />
                    </div>
                    <p className="text-sm font-medium text-gray-700 text-center">
                      Upload agency documents (Image/PDF)
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="border-blue-400 text-blue-700 hover:bg-blue-50"
                    onClick={() =>
                      document.getElementById('agency-docs')?.click()
                    }
                  >
                    Select files
                  </Button>
                  <input
                    id="agency-docs"
                    type="file"
                    accept="image/*,application/pdf"
                    multiple
                    className="hidden"
                    onChange={handleDocsChange}
                  />
                </div>
              )}
            </div>
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
              ? 'Save Agency'
              : 'Save Agency'}
          </Button>
        </div>
      </form>
    </ModalWrapper>
  )
}



