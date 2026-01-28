import  { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ModalWrapper, FormInput, ImageUploader } from '@/components/common'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { useAppDispatch } from '@/redux/hooks'
import { addCategory, updateCategory } from '@/redux/slices/categorySlice'
import { slugify } from '@/utils/formatters'
import type { Category } from '@/types'
import { toast } from '@/utils/toast'

const categorySchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
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
  const [image, setImage] = useState<File | string | null>(null)
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
      status: 'active',
    },
  })

  // Reset form when category changes or modal opens
  useEffect(() => {
    if (open) {
      if (mode === 'edit' && category) {
        reset({
          name: category.name,
          status: category.status,
        })
        setImage(category.image ? category.image : null)
      } else {
        reset({
          name: '',
          status: 'active',
        })
        setImage(null)
      }
    }
  }, [open, mode, category, reset])

  const onSubmit = async (data: CategoryFormData) => {
    setIsSubmitting(true)
    
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const categoryData: Category = {
      id: mode === 'edit' && category ? category.id : Date.now().toString(),
      name: data.name,
      slug: slugify(data.name),
      description: undefined,
      image: typeof image === 'string' ? image : image ? URL.createObjectURL(image) : undefined,
      status: data.status,
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

  const statusValue = watch('status') === 'active'

  return (
    <ModalWrapper
      open={open}
      onClose={onClose}
      title={mode === 'add' ? 'Add Categories' : 'Edit Category'}
      size="md"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <Label className="text-sm font-medium mb-2 block">Add Category Image</Label>
          <ImageUploader
            value={image}
            onChange={(file) => setImage(file || null)}
          />
        </div>

        <FormInput
          label="Category Name"
          placeholder="Enter category name"
          error={errors.name?.message}
          required
          {...register('name')}
        />

        <div className="flex items-center justify-between">
          <Label htmlFor="category-status" className="text-sm font-medium">
            Category Status
          </Label>
          <Switch
            id="category-status"
            checked={statusValue}
            onCheckedChange={(checked) => setValue('status', checked ? 'active' : 'inactive')}
          />
        </div>

        <div className="flex justify-end pt-4">
          <Button type="submit" isLoading={isSubmitting} className="min-w-[120px]">
            Save
          </Button>
        </div>
      </form>
    </ModalWrapper>
  )
}












