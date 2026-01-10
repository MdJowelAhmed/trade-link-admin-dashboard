import { toast as sonnerToast } from 'sonner'

type ToastVariant = 'success' | 'destructive' | 'default' | 'info' | 'warning'

interface ToastOptions {
  title?: string
  description?: string
  variant?: ToastVariant
}

export const toast = ({ title, description, variant = 'default' }: ToastOptions) => {
  // If only description is provided, use it as the message
  // If both title and description are provided, title is message and description is description
  // If only title is provided, use it as the message
  const message = title || description || ''
  const toastDescription = title && description ? description : undefined

  switch (variant) {
    case 'success':
      return sonnerToast.success(message, {
        description: toastDescription,
      })
    case 'destructive':
      return sonnerToast.error(message, {
        description: toastDescription,
      })
    case 'warning':
      return sonnerToast.warning(message, {
        description: toastDescription,
      })
    case 'info':
      return sonnerToast.info(message, {
        description: toastDescription,
      })
    default:
      return sonnerToast(message, {
        description: toastDescription,
      })
  }
}

// Re-export sonner toast for advanced usage if needed
export { sonnerToast }

