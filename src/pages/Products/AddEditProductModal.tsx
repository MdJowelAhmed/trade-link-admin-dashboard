import { useState, useEffect, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ModalWrapper, FormInput, FormSelect, FormTextarea, ImageUploader } from '@/components/common'
import { Button } from '@/components/ui/button'
import { useAppDispatch } from '@/redux/hooks'
import { addProduct, updateProduct } from '@/redux/slices/productSlice'
import { useGetCategoriesQuery } from '@/redux/api/categoriesApi'
import { PRODUCT_STATUSES } from '@/utils/constants'
import { generateSKU } from '@/utils/formatters'
import type { Product, ProductStatus } from '@/types'
import { toast } from '@/utils/toast'

const productSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  categoryId: z.string().min(1, 'Please select a category'),
  price: z.number().min(0.01, 'Price must be greater than 0'),
  stock: z.number().min(0, 'Stock cannot be negative'),
  sku: z.string().min(1, 'SKU is required'),
  status: z.enum(['active', 'inactive', 'draft', 'out_of_stock']),
})

type ProductFormData = z.infer<typeof productSchema>

interface AddEditProductModalProps {
  open: boolean
  onClose: () => void
  mode: 'add' | 'edit'
  product?: Product
}

export function AddEditProductModal({ open, onClose, mode, product }: AddEditProductModalProps) {
  const dispatch = useAppDispatch()

  // Use RTK Query for categories (backend handles data)
  const { data: categoriesResponse } = useGetCategoriesQuery()
  const categories = Array.isArray(categoriesResponse?.data) ? categoriesResponse.data : []

  const [image, setImage] = useState<File | string | null>(product?.image || null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const categoryOptions = useMemo(
    () => categories.map((cat: { _id: string; name: string }) => ({ value: cat._id, label: cat.name })),
    [categories]
  )

  const statusOptions = PRODUCT_STATUSES.filter((s) => s.value !== 'all')

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      description: '',
      categoryId: '',
      price: 0,
      stock: 0,
      sku: '',
      status: 'draft',
    },
  })

  // Reset form when product changes or modal opens
  useEffect(() => {
    if (open) {
      if (mode === 'edit' && product) {
        reset({
          name: product.name,
          description: product.description,
          categoryId: product.categoryId,
          price: product.price,
          stock: product.stock,
          sku: product.sku,
          status: product.status,
        })
        setImage(product.image || null)
      } else {
        reset({
          name: '',
          description: '',
          categoryId: '',
          price: 0,
          stock: 0,
          sku: generateSKU('PRD'),
          status: 'draft',
        })
        setImage(null)
      }
    }
  }, [open, mode, product, reset])

  const watchedCategoryId = watch('categoryId')

  // Update category name for display when categoryId changes
  const selectedCategory = categories.find((c: { _id: string }) => c._id === watchedCategoryId)

  const onSubmit = async (data: ProductFormData) => {
    setIsSubmitting(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const productData: Product = {
      id: mode === 'edit' && product ? product.id : Date.now().toString(),
      ...data,
      category: selectedCategory?.name || '',
      image: typeof image === 'string' ? image : image ? URL.createObjectURL(image) : undefined,
      createdAt: mode === 'edit' && product ? product.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    if (mode === 'edit') {
      dispatch(updateProduct(productData))
      toast({
        title: 'Product Updated',
        description: `${data.name} has been updated successfully.`,
      })
    } else {
      dispatch(addProduct(productData))
      toast({
        title: 'Product Created',
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
      title={mode === 'add' ? 'Add New Product' : 'Edit Product'}
      description={
        mode === 'add'
          ? 'Fill in the details to create a new product'
          : 'Update the product information'
      }
      size="full"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <FormInput
            label="Product Name"
            placeholder="Enter product name"
            error={errors.name?.message}
            required
            {...register('name')}
          />
          <FormInput
            label="SKU"
            placeholder="Enter SKU"
            error={errors.sku?.message}
            required
            {...register('sku')}
          />
        </div>

        <FormTextarea
          label="Description"
          placeholder="Enter product description"
          error={errors.description?.message}
          required
          rows={3}
          {...register('description')}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <FormSelect
            label="Category"
            value={watchedCategoryId}
            options={categoryOptions}
            onChange={(value) => setValue('categoryId', value)}
            placeholder="Select category"
            error={errors.categoryId?.message}
            required
          />
          <FormSelect
            label="Status"
            value={watch('status')}
            options={statusOptions}
            onChange={(value) => setValue('status', value as ProductStatus)}
            placeholder="Select status"
            error={errors.status?.message}
            required
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormInput
            label="Price"
            type="number"
            step="0.01"
            min="0"
            placeholder="0.00"
            error={errors.price?.message}
            required
            {...register('price', { valueAsNumber: true })}
          />
          <FormInput
            label="Stock"
            type="number"
            min="0"
            placeholder="0"
            error={errors.stock?.message}
            required
            {...register('stock', { valueAsNumber: true })}
          />
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">Product Image</label>
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
            {mode === 'add' ? 'Create Product' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </ModalWrapper>
  )
}












