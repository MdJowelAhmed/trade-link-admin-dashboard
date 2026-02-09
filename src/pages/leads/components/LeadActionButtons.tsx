import { Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { Lead } from '@/types'

interface LeadActionButtonsProps {
  lead: Lead
  onView: (lead: Lead) => void
}

export function LeadActionButtons({ lead, onView }: LeadActionButtonsProps) {
  return (
    <div className="flex items-center justify-end gap-2">
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={() => onView(lead)}
        className="h-8 w-8 hover:bg-gray-100"
        title="View Details"
      >
        <Eye className="h-6 w-6 text-gray-600" />
      </Button>
    </div>
  )
}

