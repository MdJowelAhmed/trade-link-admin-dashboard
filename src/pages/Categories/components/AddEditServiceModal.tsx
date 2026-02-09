import {  useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ModalWrapper, FormInput, FormSelect } from '@/components/common'
import { Button } from '@/components/ui/button'
import { useGetCategoriesQuery } from '@/redux/api/categoriesApi'
import { useAddServiceMutation, useUpdateServiceMutation } from '@/redux/api/serviceApi'
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
  // Use RTK Query for categories (backend handles data)
  const { data: categoriesResponse } = useGetCategoriesQuery()
  const categories = Array.isArray(categoriesResponse?.data) ? categoriesResponse.data : []

  // RTK Query mutations
  const [addService, { isLoading: isAdding }] = useAddServiceMutation()
  const [updateService, { isLoading: isUpdating }] = useUpdateServiceMutation()

  const isSubmitting = isAdding || isUpdating

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
    try {
      const servicePayload = {
        name: data.name,
        categoryId: data.categoryId,
        isActive: data.status === 'active',
      }

      if (mode === 'edit' && service) {
        await updateService({
          id: service.id,
          formData: servicePayload,
        }).unwrap()
        toast({
          title: 'Service Updated',
          description: `${data.name} has been updated successfully.`,
        })
      } else {
        await addService(servicePayload).unwrap()
        toast({
          title: 'Service Created',
          description: `${data.name} has been created successfully.`,
        })
      }

      onClose()
    } catch (error: unknown) {
      const errorMessage = error && typeof error === 'object' && 'data' in error
        ? (error as { data?: { message?: string } }).data?.message
        : undefined
      toast({
        title: 'Error',
        description: errorMessage || `Failed to ${mode === 'edit' ? 'update' : 'create'} service.`,
        variant: 'destructive',
      })
    }
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
