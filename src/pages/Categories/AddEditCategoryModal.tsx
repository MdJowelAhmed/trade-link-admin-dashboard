import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ModalWrapper, FormInput, ImageUploader } from '@/components/common'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { useAddCategoryMutation, useUpdateCategoryMutation } from '@/redux/api/categoriesApi'
import type { Category } from '@/types'
import { toast } from '@/utils/toast'
import { imageUrl } from '@/utils/imageUrl'

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
  const [image, setImage] = useState<File | string | null>(null)
  const [originalImage, setOriginalImage] = useState<string | null>(null)

  // RTK Query mutations - auto-refetch via invalidatesTags
  const [addCategory, { isLoading: isAdding }] = useAddCategoryMutation()
  const [updateCategory, { isLoading: isUpdating }] = useUpdateCategoryMutation()

  const isSubmitting = isAdding || isUpdating

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
        // Set image from category if it exists
        const categoryImage = category.image || null
        setImage(categoryImage)
        setOriginalImage(categoryImage)
      } else {
        reset({
          name: '',
          status: 'active',
        })
        setImage(null)
        setOriginalImage(null)
      }
    }
  }, [open, mode, category, reset])

  const onSubmit = async (data: CategoryFormData) => {
    try {
      // Prepare FormData for file upload
      const formData = new FormData()
      formData.append('name', data.name)
      formData.append('isActive', data.status === 'active' ? 'true' : 'false')

      // Handle image upload
      if (mode === 'edit' && category) {
        // Edit mode: only send image if it changed
        if (image instanceof File) {
          // New file selected
          formData.append('image', image)
        } else if (image !== originalImage) {
          // Image was changed (removed or replaced with different URL)
          if (typeof image === 'string' && image.trim() !== '') {
            formData.append('imageUrl', image)
          }
          // If image is null and original wasn't, backend should remove the image
        }
        // If image hasn't changed, don't send any image data

        console.log(formData)
        await updateCategory({ id: category.id, formData }).unwrap()
        toast({
          title: 'Category Updated',
          description: `${data.name} has been updated successfully.`,
        })
      } else {
        // Add mode: always send image if provided
        if (image instanceof File) {
          formData.append('image', image)
        }
        await addCategory(formData).unwrap()
        toast({
          title: 'Category Created',
          description: `${data.name} has been created successfully.`,
        })
      }

      // No Redux dispatch needed - invalidatesTags triggers auto-refetch
      onClose()
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Something went wrong'
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      })
    }
  }

  const statusValue = watch('status') === 'active'

  return (
    <ModalWrapper
      open={open}
      onClose={onClose}
      title={mode === 'add' ? 'Add Categories' : 'Edit Category'}
      size="md"
      className="bg-white"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <Label className="text-sm font-medium mb-2 block">Add Category Image</Label>
          <ImageUploader
            value={ image ? imageUrl(image as string) : null}
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
