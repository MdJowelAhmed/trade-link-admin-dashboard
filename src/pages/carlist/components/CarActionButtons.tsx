import { Edit, Eye, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { Car } from '@/types'

interface CarActionButtonsProps {
  car: Car
  onEdit: (car: Car) => void
  onView: (car: Car) => void
  onDelete: (car: Car) => void
}

export function CarActionButtons({ car, onEdit, onView, onDelete }: CarActionButtonsProps) {
  return (
    <div className="flex items-center justify-end gap-2">
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={() => onEdit(car)}
        className="h-8 w-8 hover:bg-gray-100"
      >
        <Edit className="h-4 w-4 text-gray-600" />
      </Button>
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={() => onView(car)}
        className="h-8 w-8 hover:bg-gray-100"
      >
        <Eye className="h-4 w-4 text-gray-600" />
      </Button>
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={() => onDelete(car)}
        className="h-8 w-8 hover:bg-red-50"
      >
        <Trash2 className="h-4 w-4 text-red-600" />
      </Button>
    </div>
  )
}

