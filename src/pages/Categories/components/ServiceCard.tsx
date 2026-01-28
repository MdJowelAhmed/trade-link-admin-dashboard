import { Edit } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import type { Service } from '@/types'

interface ServiceCardProps {
  service: Service
  onEdit: () => void
}

export function ServiceCard({ service, onEdit }: ServiceCardProps) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="p-4">
        <h3 className="font-semibold text-lg mb-1 line-clamp-2">{service.name}</h3>
        {service.categoryName && (
          <p className="text-sm text-muted-foreground mb-3 line-clamp-1">
            {service.categoryName}
          </p>
        )}
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={onEdit}
        >
          <Edit className="h-4 w-4 mr-2" />
          Edit
        </Button>
      </div>
    </Card>
  )
}
