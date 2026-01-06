import  { useState } from 'react'
import { ConfirmDialog } from '@/components/common'
import { useAppDispatch } from '@/redux/hooks'
import { deleteProduct } from '@/redux/slices/productSlice'
import type { Product } from '@/types'
import { toast } from '@/components/ui/use-toast'

interface DeleteProductModalProps {
  open: boolean
  onClose: () => void
  product: Product
}

export function DeleteProductModal({ open, onClose, product }: DeleteProductModalProps) {
  const dispatch = useAppDispatch()
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    setIsDeleting(true)
    
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    dispatch(deleteProduct(product.id))
    
    toast({
      title: 'Product Deleted',
      description: `${product.name} has been deleted successfully.`,
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
      title="Delete Product"
      description={`Are you sure you want to delete "${product.name}"? This action cannot be undone.`}
      confirmText="Delete Product"
      variant="danger"
      isLoading={isDeleting}
    />
  )
}











