import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ModalWrapper, FormInput, ImageUploader, FormTextarea } from '@/components/common'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { useAddCategoryMutation, useUpdateCategoryMutation } from '@/redux/api/categoriesApi'
import type { Category } from '@/types'
import { toast } from '@/utils/toast'
import { imageUrl } from '@/utils/imageUrl'
import { X, Plus } from 'lucide-react'
import { Separator } from '@/components/ui/separator'

const categorySchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  description:z.string().min(5, "Description must be at least 5 characters"),
  status: z.enum(['active', 'inactive']),
})

type CategoryFormData = z.infer<typeof categorySchema>

interface FAQField {
  id: string
  question: string
  answer: string
}

interface AddEditCategoryModalProps {
  open: boolean
  onClose: () => void
  mode: 'add' | 'edit' | 'faq' | 'details'
  category?: Category
}

export function AddEditCategoryModal({ open, onClose, mode, category }: AddEditCategoryModalProps) {
  const [image, setImage] = useState<File | string | null>(null)
  const [originalImage, setOriginalImage] = useState<string | null>(null)
  const [faqFields, setFaqFields] = useState<FAQField[]>([])

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
      description:'',
      status: 'active',
    },
  })

  // Reset form when category changes or modal opens
  useEffect(() => {
    if (open) {
      if ((mode === 'edit' || mode === 'faq' || mode === 'details') && category) {
        reset({
          name: category.name,
          description:category.description,
          status: category.status,
        })
        // Set image from category if it exists
        const categoryImage = category.image || null
        setImage(categoryImage)
        setOriginalImage(categoryImage)

        // Initialize FAQ fields if in FAQ mode
        if (mode === 'faq' && category.faqs && category.faqs.length > 0) {
          setFaqFields(
            category.faqs.map((faq, index) => ({
              id: faq._id || `faq-${index}`,
              question: faq.question,
              answer: faq.answer,
            }))
          )
        } else if (mode === 'faq') {
          setFaqFields([])
        }
      } else {
        reset({
          name: '',
          description: '',
          status: 'active',
        })
        setImage(null)
        setOriginalImage(null)
        setFaqFields([])
      }
    }
  }, [open, mode, category, reset])

  const addFaqField = () => {
    setFaqFields([...faqFields, { id: `faq-${Date.now()}`, question: '', answer: '' }])
  }

  const removeFaqField = (id: string) => {
    setFaqFields(faqFields.filter((field) => field.id !== id))
  }

  const updateFaqField = (id: string, field: 'question' | 'answer', value: string) => {
    setFaqFields(
      faqFields.map((faq) => (faq.id === id ? { ...faq, [field]: value } : faq))
    )
  }

  const onSubmit = async (data: CategoryFormData) => {
    try {
      // Prepare FormData for file upload
      const formData = new FormData()

      // In FAQ mode, use category data; otherwise use form data
      if (mode === 'faq' && category) {
        formData.append('name', category.name)
        formData.append('description', category.description || '')
        formData.append('isActive', category.status === 'active' ? 'true' : 'false')
      } else {
        formData.append('name', data.name)
        formData.append('description', data.description)
        formData.append('isActive', data.status === 'active' ? 'true' : 'false')
      }

      // Handle FAQs if in FAQ mode
      // Handle FAQs if in FAQ mode
      if (mode === 'faq') {
        const faqs = faqFields
          .filter(
            (faq) => faq.question.trim() && faq.answer.trim()
          )
          .map((faq) => ({
            question: faq.question.trim(),
            answer: faq.answer.trim(),
          }))

        const payload = {
          faqs,
        }

        formData.append('data', JSON.stringify(payload))
      }


      // Handle image upload
      if ((mode === 'edit' || mode === 'faq') && category) {
        // Edit/FAQ mode: only send image if it changed
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

        await updateCategory({ id: category.id, formData }).unwrap()
        toast({
          title: mode === 'faq' ? 'FAQs Updated' : 'Category Updated',
          description: mode === 'faq'
            ? 'FAQs have been updated successfully.'
            : `${data.name} has been updated successfully.`,
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

  // Details view
  if (mode === 'details' && category) {
    return (
      <ModalWrapper
        open={open}
        onClose={onClose}
        title="Category Details"
        size="md"
        className="bg-white"
      >
        <div className="space-y-4">
          {category.image && (
            <div>
              <Label className="text-sm font-medium mb-2 block">Image</Label>
              <img
                src={imageUrl(category.image)}
                alt={category.name}
                className="w-full h-48 object-cover rounded-md"
              />
            </div>
          )}

          <div>
            <Label className="text-sm font-medium mb-1 block">Name</Label>
            <p className="text-sm text-muted-foreground">{category.name}</p>
          </div>

          <div>
            <Label className="text-sm font-medium mb-1 block">Slug</Label>
            <p className="text-sm text-muted-foreground">{category.slug}</p>
          </div>

          {category.description && (
            <div>
              <Label className="text-sm font-medium mb-1 block">Description</Label>
              <p className="text-sm text-muted-foreground">{category.description}</p>
            </div>
          )}

          <div>
            <Label className="text-sm font-medium mb-1 block">Status</Label>
            <p className="text-sm text-muted-foreground capitalize">{category.status}</p>
          </div>

          <div>
            <Label className="text-sm font-medium mb-1 block">Product Count</Label>
            <p className="text-sm text-muted-foreground">{category.productCount}</p>
          </div>

          {category.faqs && category.faqs.length > 0 && (
            <div>
              <Label className="text-sm font-medium mb-2 block">FAQs ({category.faqs.length})</Label>
              <Accordion type="single" collapsible className="w-full">
                {category.faqs.map((faq, index) => (
                  <AccordionItem key={faq._id || index} value={`faq-${index}`}>
                    <AccordionTrigger className="text-left">
                      <span className="font-medium">{faq.question}</span>
                    </AccordionTrigger>
                    <AccordionContent>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                        {faq.answer}
                      </p>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          )}

          <div className="flex justify-end pt-4">
            <Button onClick={onClose} variant="outline">
              Close
            </Button>
          </div>
        </div>
      </ModalWrapper>
    )
  }

  return (
    <ModalWrapper
      open={open}
      onClose={onClose}
      title={
        mode === 'add'
          ? 'Add Categories'
          : mode === 'faq'
            ? 'Manage FAQs'
            : 'Edit Category'
      }
      size={mode === 'faq' ? 'lg' : 'md'}
      className="bg-white"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {mode !== 'faq' && (
          <>
            <div>
              <Label className="text-sm font-medium mb-2 block">Add Category Image</Label>
              <ImageUploader
                value={image ? imageUrl(image as string) : null}
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
            <FormTextarea 
              label='Description'
              placeholder='Enter category description'
              error={errors.description?.message}
              required
              {...register('description')}
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
          </>
        )}

        {mode === 'faq' && (
          <>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">FAQs</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addFaqField}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add FAQ
                </Button>
              </div>

              {faqFields.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground border rounded-md">
                  No FAQs added. Click "Add FAQ" to add one.
                </div>
              ) : (
                <div className="space-y-4 max-h-[500px] overflow-y-auto">
                  {faqFields.map((faq, index) => (
                    <div key={faq.id} className="p-4 border rounded-md space-y-3">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm font-medium">FAQ #{index + 1}</Label>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFaqField(faq.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>

                      <div>
                        <Label htmlFor={`question-${faq.id}`} className="text-sm font-medium mb-1 block">
                          Question
                        </Label>
                        <Input
                          id={`question-${faq.id}`}
                          type="text"
                          value={faq.question}
                          onChange={(e) => updateFaqField(faq.id, 'question', e.target.value)}
                          placeholder="Enter question"
                        />
                      </div>

                      <div>
                        <Label htmlFor={`answer-${faq.id}`} className="text-sm font-medium mb-1 block">
                          Answer
                        </Label>
                        <Textarea
                          id={`answer-${faq.id}`}
                          value={faq.answer}
                          onChange={(e) => updateFaqField(faq.id, 'answer', e.target.value)}
                          placeholder="Enter answer"
                          className="min-h-[100px]"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        <Separator />

        <div className="flex justify-end pt-4 gap-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isSubmitting} className="min-w-[120px]">
            {mode === 'faq' ? 'Save FAQs' : 'Save'}
          </Button>
        </div>
      </form>
    </ModalWrapper>
  )
}
