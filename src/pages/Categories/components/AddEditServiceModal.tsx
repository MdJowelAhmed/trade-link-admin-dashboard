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

const faqSchema = z.object({
  question: z.string(),
  answer: z.string(),
})

const serviceSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  categoryId: z.string().min(1, 'Please select a category'),
  status: z.enum(['active', 'inactive']),
  description: z.string().optional(),
  detailedDescription: z.array(detailLineSchema),
  faqs: z.array(faqSchema),
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

function faqsFromService(
  faqs: Array<{ question?: string; answer?: string }> | undefined
): { question: string; answer: string }[] {
  if (!faqs?.length) return [{ question: '', answer: '' }]
  return faqs.map((f) => ({ question: f.question ?? '', answer: f.answer ?? '' }))
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
      faqs: [{ question: '', answer: '' }],
    },
  })

  const {
    fields: detailFields,
    append: appendDetail,
    remove: removeDetail,
  } = useFieldArray({
    control,
    name: 'detailedDescription',
  })

  const {
    fields: faqFields,
    append: appendFaq,
    remove: removeFaq,
  } = useFieldArray({
    control,
    name: 'faqs',
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
          faqs: faqsFromService(service.faqs),
        })
      } else {
        reset({
          name: '',
          categoryId: '',
          status: 'active',
          description: '',
          detailedDescription: [{ value: '' }],
          faqs: [{ question: '', answer: '' }],
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

      const faqs = data.faqs
        .map(({ question, answer }) => ({
          question: (question ?? '').trim(),
          answer: (answer ?? '').trim(),
        }))
        .filter((f) => f.question.length > 0 || f.answer.length > 0)

      const servicePayload = {
        name: data.name,
        categoryId: data.categoryId,
        description: data.description?.trim() ?? '',
        detailedDescription: detailedLines,
        faqs,
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
      className="bg-white max-w-3xl"
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
            {detailFields.map((field, index) => {
              const isOnlyRow = detailFields.length === 1
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
                      onClick={() => appendDetail({ value: '' })}
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
                        onClick={() => removeDetail(index)}
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

        <div className="space-y-3 rounded-2xl border border-border p-4">
          <div className="flex items-center justify-between gap-2">
            <label className="text-sm font-medium leading-none">FAQ</label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="rounded-full"
              onClick={() => appendFaq({ question: '', answer: '' })}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add FAQ
            </Button>
          </div>
          {faqFields.length === 0 && (
            <p className="text-sm text-muted-foreground">No FAQ rows. Optional.</p>
          )}
          <div className="flex flex-col gap-4">
            {faqFields.map((field, index) => (
              <div
                key={field.id}
                className="flex flex-col gap-3 rounded-xl border border-border/80 bg-muted/20 p-4"
              >
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-medium">Question</label>
                  <FormInput
                    placeholder="FAQ question"
                    error={errors.faqs?.[index]?.question?.message as string | undefined}
                    {...register(`faqs.${index}.question` as const)}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-medium">Answer</label>
                  <FormTextarea
                    placeholder="FAQ answer"
                    rows={3}
                    error={errors.faqs?.[index]?.answer?.message as string | undefined}
                    {...register(`faqs.${index}.answer` as const)}
                  />
                </div>
                <div className="flex justify-end">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive rounded-full"
                    onClick={() => removeFaq(index)}
                  >
                    <Minus className="h-4 w-4 mr-1" />
                    Remove
                  </Button>
                </div>
              </div>
            ))}
          </div>
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
