import { useEffect } from 'react'
import { useFieldArray, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Minus, Plus } from 'lucide-react'
import { ModalWrapper, FormInput, FormSelect, FormTextarea } from '@/components/common'
import { Button } from '@/components/ui/button'
import { useGetCategoriesQuery } from '@/redux/api/categoriesApi'
import { useAddServiceMutation, useUpdateServiceMutation } from '@/redux/api/serviceApi'
import type { Service } from '@/types'
import { toast } from '@/utils/toast'

/** RHF useFieldArray expects objects per row, not raw strings. */
const detailLineSchema = z.object({
  value: z.string(),
})

const serviceSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  categoryId: z.string().min(1, 'Please select a category'),
  status: z.enum(['active', 'inactive']),
  description: z.string().optional(),
  detailedDescription: z.array(detailLineSchema),
})

type ServiceFormData = z.infer<typeof serviceSchema>

interface AddEditServiceModalProps {
  open: boolean
  onClose: () => void
  mode: 'add' | 'edit'
  service?: Service
}

function linesFromService(lines: string[] | undefined): { value: string }[] {
  if (!lines?.length) return [{ value: '' }]
  return lines.map((value) => ({ value }))
}

export function AddEditServiceModal({ open, onClose, mode, service }: AddEditServiceModalProps) {
  const { data: categoriesResponse } = useGetCategoriesQuery()
  const categories = Array.isArray(categoriesResponse?.data) ? categoriesResponse.data : []

  const [addService, { isLoading: isAdding }] = useAddServiceMutation()
  const [updateService, { isLoading: isUpdating }] = useUpdateServiceMutation()

  const isSubmitting = isAdding || isUpdating

  const {
    register,
    control,
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
      description: '',
      detailedDescription: [{ value: '' }],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'detailedDescription',
  })

  useEffect(() => {
    if (open) {
      if (mode === 'edit' && service) {
        reset({
          name: service.name,
          categoryId: service.categoryId,
          status: service.status,
          description: service.description ?? '',
          detailedDescription: linesFromService(service.detailedDescription),
        })
      } else {
        reset({
          name: '',
          categoryId: '',
          status: 'active',
          description: '',
          detailedDescription: [{ value: '' }],
        })
      }
    }
  }, [open, mode, service, reset])

  const categoryOptions = categories.map((cat: { _id: string; name: string }) => ({
    value: cat._id,
    label: cat.name,
  }))

  const onSubmit = async (data: ServiceFormData) => {
    try {
      const detailedLines = data.detailedDescription
        .map((row) => row.value.trim())
        .filter(Boolean)

      const servicePayload = {
        name: data.name,
        categoryId: data.categoryId,
        description: data.description?.trim() ?? '',
        detailedDescription: detailedLines,
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
      const errorMessage =
        error && typeof error === 'object' && 'data' in error
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
        mode === 'add' ? 'Create a new service' : 'Update the service information'
      }
      size="lg"
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

        <FormTextarea
          label="Description"
          placeholder="Short description"
          rows={3}
          error={errors.description?.message}
          {...register('description')}
        />

        <div className="space-y-2">
          <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            Detailed description
          </label>
          <p className="text-xs text-muted-foreground">
            Add one or more lines. Each line is sent as an item in the list.
          </p>
          <div className="space-y-2">
            {fields.map((field, index) => {
              const isOnlyRow = fields.length === 1
              return (
                <div key={field.id} className="flex items-center gap-2">
                  <div className="min-w-0 flex-1">
                    <FormInput
                      placeholder={`Line ${index + 1}`}
                      error={
                        errors.detailedDescription?.[index]?.value?.message as
                          | string
                          | undefined
                      }
                      {...register(`detailedDescription.${index}.value` as const)}
                    />
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="shrink-0"
                      onClick={() => append({ value: '' })}
                      aria-label="Add line"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                    {!isOnlyRow && (
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="shrink-0"
                        onClick={() => remove(index)}
                        aria-label="Remove line"
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
          {errors.detailedDescription &&
            typeof errors.detailedDescription.message === 'string' && (
              <p className="text-xs text-destructive">{errors.detailedDescription.message}</p>
            )}
        </div>

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
