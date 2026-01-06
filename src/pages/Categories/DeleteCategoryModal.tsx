import  { useState } from 'react'
import { ConfirmDialog } from '@/components/common'
import { useAppDispatch } from '@/redux/hooks'
import { deleteCategory } from '@/redux/slices/categorySlice'
import type { Category } from '@/types'
import { toast } from '@/components/ui/use-toast'

interface DeleteCategoryModalProps {
  open: boolean
  onClose: () => void
  category: Category
}

export function DeleteCategoryModal({ open, onClose, category }: DeleteCategoryModalProps) {
  const dispatch = useAppDispatch()
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    setIsDeleting(true)
    
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    dispatch(deleteCategory(category.id))
    
    toast({
      title: 'Category Deleted',
      description: `${category.name} has been deleted successfully.`,
      variant: 'destructive',
    })
    
    setIsDeleting(false)
    onClose()
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











