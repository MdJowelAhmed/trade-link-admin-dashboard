import  { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ModalWrapper, FormInput, FormTextarea, ImageUploader } from '@/components/common'
import { Button } from '@/components/ui/button'
import { useAppDispatch } from '@/redux/hooks'
import { addCategory, updateCategory } from '@/redux/slices/categorySlice'
import { slugify } from '@/utils/formatters'
import type { Category } from '@/types'
import { toast } from '@/utils/toast'

const categorySchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  slug: z.string().min(2, 'Slug must be at least 2 characters'),
  description: z.string().optional(),
  status: z.enum(['active', 'inactive']),
})

type CategoryFormData = z.infer<typeof categorySchema>

interface AddEditCategoryModalProps {
  open: boolean
  onClose: () => void
  mode: 'add' | 'edit'
  category?: Category
}

export function AddEditCategoryModal({ open, onClose, mode, category }: AddEditCategoryModalProps) {
  const dispatch = useAppDispatch()
  const [image, setImage] = useState<File | string | null>(category?.image || null)
  const [isSubmitting, setIsSubmitting] = useState(false)

 

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: '',
      slug: '',
      description: '',
      status: 'active',
    },
  })

  // Reset form when category changes or modal opens
  useEffect(() => {
    if (open) {
      if (mode === 'edit' && category) {
        reset({
          name: category.name,
          slug: category.slug,
          description: category.description || '',
          status: category.status,
        })
        setImage(category.image || null)
      } else {
        reset({
          name: '',
          slug: '',
          description: '',
          status: 'active',
        })
        setImage(null)
      }
    }
  }, [open, mode, category, reset])

  // Auto-generate slug from name
  const watchedName = watch('name')
  useEffect(() => {
    if (mode === 'add' && watchedName) {
      setValue('slug', slugify(watchedName))
    }
  }, [watchedName, mode, setValue])

  const onSubmit = async (data: CategoryFormData) => {
    setIsSubmitting(true)
    
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const categoryData: Category = {
      id: mode === 'edit' && category ? category.id : Date.now().toString(),
      ...data,
      description: data.description || undefined,
      image: typeof image === 'string' ? image : image ? URL.createObjectURL(image) : undefined,
      productCount: mode === 'edit' && category ? category.productCount : 0,
      createdAt: mode === 'edit' && category ? category.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    if (mode === 'edit') {
      dispatch(updateCategory(categoryData))
      toast({
        title: 'Category Updated',
        description: `${data.name} has been updated successfully.`,
      })
    } else {
      dispatch(addCategory(categoryData))
      toast({
        title: 'Category Created',
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
      title={mode === 'add' ? 'Add New Category' : 'Edit Category'}
      description={
        mode === 'add'
          ? 'Create a new category to organize your products'
          : 'Update the category information'
      }
      size="xl"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <FormInput
          label="Category Name"
          placeholder="Enter category name"
          error={errors.name?.message}
          required
          {...register('name')}
        />

        <FormInput
          label="Slug"
          placeholder="category-slug"
          error={errors.slug?.message}
          helperText="URL-friendly version of the name"
          required
          {...register('slug')}
        />

        <FormTextarea
          label="Description"
          placeholder="Enter category description (optional)"
          error={errors.description?.message}
          rows={3}
          {...register('description')}
        />
{/* 
        <FormSelect
          label="Status"
          value={watch('status')}
          options={statusOptions}
          onChange={(value) => setValue('status', value as CategoryStatus)}
          placeholder="Select status"
          error={errors.status?.message}
          required
        /> */}

        <div>
          <label className="text-sm font-medium mb-2 block">Category Image</label>
          <ImageUploader
            value={image}
            onChange={setImage}
          />
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            {mode === 'add' ? 'Create Category' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </ModalWrapper>
  )
}












