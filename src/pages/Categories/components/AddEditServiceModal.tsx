import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ModalWrapper, FormInput, FormSelect } from '@/components/common'
import { Button } from '@/components/ui/button'
import { useAppDispatch } from '@/redux/hooks'
import { addService, updateService } from '@/redux/slices/serviceSlice'
import { useGetCategoriesQuery } from '@/redux/api/categoriesApi'
import type { Service } from '@/types'
import { toast } from '@/utils/toast'

const serviceSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  categoryId: z.string().min(1, 'Please select a category'),
  status: z.enum(['active', 'inactive']),
})

type ServiceFormData = z.infer<typeof serviceSchema>

interface AddEditServiceModalProps {
  open: boolean
  onClose: () => void
  mode: 'add' | 'edit'
  service?: Service
}

export function AddEditServiceModal({ open, onClose, mode, service }: AddEditServiceModalProps) {
  const dispatch = useAppDispatch()

  // Use RTK Query for categories (backend handles data)
  const { data: categoriesResponse } = useGetCategoriesQuery()
  const categories = Array.isArray(categoriesResponse?.data) ? categoriesResponse.data : []

  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<ServiceFormData>({
    resolver: zodResolver(serviceSchema),
    defaultValues: {
      name: '',
      categoryId: '',
      status: 'active',
    },
  })

  // Reset form when service changes or modal opens
  useEffect(() => {
    if (open) {
      if (mode === 'edit' && service) {
        reset({
          name: service.name,
          categoryId: service.categoryId,
          status: service.status,
        })
      } else {
        reset({
          name: '',
          categoryId: '',
          status: 'active',
        })
      }
    }
  }, [open, mode, service, reset])

  const categoryOptions = categories.map((cat: { _id: string; name: string }) => ({
    value: cat._id,
    label: cat.name,
  }))

  // const statusOptions = [
  //   { value: 'active', label: 'Active' },
  //   { value: 'inactive', label: 'Inactive' },
  // ]

  const onSubmit = async (data: ServiceFormData) => {
    setIsSubmitting(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const selectedCategory = categories.find((c: { _id: string }) => c._id === data.categoryId)
    const serviceData: Service = {
      id: mode === 'edit' && service ? service.id : Date.now().toString(),
      ...data,
      categoryName: selectedCategory?.name,
      createdAt: mode === 'edit' && service ? service.createdAt : new Date().toISOString(),
      totalQuestions: mode === 'edit' && service ? service.totalQuestions : 0,
      updatedAt: new Date().toISOString(),
    }

    if (mode === 'edit') {
      dispatch(updateService(serviceData))
      toast({
        title: 'Service Updated',
        description: `${data.name} has been updated successfully.`,
      })
    } else {
      dispatch(addService(serviceData))
      toast({
        title: 'Service Created',
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
      title={mode === 'add' ? 'Add Service' : 'Edit Service'}
      description={
        mode === 'add'
          ? 'Create a new service'
          : 'Update the service information'
      }
      size="md"
      className="bg-white"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <FormInput
          label="Service Name"
          placeholder="Enter name"
          error={errors.name?.message}
          required
          {...register('name')}
        />

        <FormSelect
          label="Select Category"
          value={watch('categoryId')}
          options={categoryOptions}
          onChange={(value) => setValue('categoryId', value)}
          placeholder="Please select"
          error={errors.categoryId?.message}
          required
        />

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            Save Changes
          </Button>
        </div>
      </form>
    </ModalWrapper>
  )
}
