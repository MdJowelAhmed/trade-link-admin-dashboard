import { Eye, Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { TradePerson } from '@/types'

interface TradePersonActionButtonsProps {
  tradePerson: TradePerson
  onView: (tradePerson: TradePerson) => void
  onToggleStatus: (tradePerson: TradePerson) => void
}

export function TradePersonActionButtons({
  tradePerson,
  onView,
  onToggleStatus,
}: TradePersonActionButtonsProps) {
  return (
    <div className="flex items-center justify-end gap-2">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onView(tradePerson)}
        className="h-8 w-8 hover:bg-gray-100"
        title="View Details"
      >
        <Eye className="h-4 w-4 text-gray-500" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onToggleStatus(tradePerson)}
        className="h-8 w-8 hover:bg-gray-100"
        title="Toggle Status"
      >
        <Lock className="h-4 w-4 text-gray-400" />
      </Button>
    </div>
  )
}
