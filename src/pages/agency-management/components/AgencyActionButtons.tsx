import { Eye, Edit2, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { Agency } from '@/types'

interface AgencyActionButtonsProps {
  agency: Agency
  onView: (agency: Agency) => void
  onEdit: (agency: Agency) => void
  onDelete: (agency: Agency) => void
}

export function AgencyActionButtons({
  agency,
  onView,
  onEdit,
  onDelete,
}: AgencyActionButtonsProps) {
  return (
    <div className="flex items-center justify-end gap-2">
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={() => onView(agency)}
        className="h-8 w-8 hover:bg-green-50"
      >
        <Eye className="h-4 w-4 text-green-600" />
      </Button>
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={() => onEdit(agency)}
        className="h-8 w-8 hover:bg-blue-50"
      >
        <Edit2 className="h-4 w-4 text-blue-600" />
      </Button>
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={() => onDelete(agency)}
        className="h-8 w-8 hover:bg-red-50"
      >
        <Trash2 className="h-4 w-4 text-red-600" />
      </Button>
    </div>
  )
}




