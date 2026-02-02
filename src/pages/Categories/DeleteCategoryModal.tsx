import { ConfirmDialog } from '@/components/common'
import { useDeleteCategoryMutation } from '@/redux/api/categoriesApi'
import type { Category } from '@/types'
import { toast } from '@/utils/toast'

interface DeleteCategoryModalProps {
  open: boolean
  onClose: () => void
  category: Category
}

export function DeleteCategoryModal({ open, onClose, category }: DeleteCategoryModalProps) {
  // RTK Query mutation - auto-refetch via invalidatesTags
  const [deleteCategory, { isLoading: isDeleting }] = useDeleteCategoryMutation()

  const handleDelete = async () => {
    try {
      await deleteCategory(category.id).unwrap()

      toast({
        title: 'Category Deleted',
        description: `${category.name} has been deleted successfully.`,
        variant: 'destructive',
      })

      // No Redux dispatch needed - invalidatesTags triggers auto-refetch
      onClose()
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete category'
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      })
    }
  }

  return (
    <ConfirmDialog
      open={open}
      onClose={onClose}
      onConfirm={handleDelete}
      title="Delete Category"
      description={`Are you sure you want to delete "${category.name}"? This will affect ${category.productCount} products. This action cannot be undone.`}
      confirmText="Delete Category"
      variant="danger"
      isLoading={isDeleting}
    />
  )
}
