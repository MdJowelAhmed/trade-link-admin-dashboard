import { Eye, Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { Client } from '@/types'

interface ClientActionButtonsProps {
  client: Client
  onView: (client: Client) => void
  onToggleStatus: (client: Client) => void
}

export function ClientActionButtons({ client, onView, onToggleStatus }: ClientActionButtonsProps) {
  return (
    <div className="flex items-center justify-end gap-2">
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={() => onView(client)}
        className="h-8 w-8 hover:bg-green-50"
      >
        <Eye className="h-4 w-4 text-green-600" />
      </Button>
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={() => onToggleStatus(client)}
        className="h-8 w-8 hover:bg-red-50"
      >
        <Lock className="h-4 w-4 text-red-600" />
      </Button>
    </div>
  )
}

