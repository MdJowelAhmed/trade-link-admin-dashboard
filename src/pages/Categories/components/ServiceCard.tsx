import { Edit } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { motion } from 'framer-motion'
import type { Service } from '@/types'
// import { Switch } from '@/components/ui/switch'

interface ServiceCardProps {
  service: Service
  onEdit: () => void
  index?: number
}

export function ServiceCard({ service, onEdit, index = 0 }: ServiceCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        duration: 0.50,
        delay: index * 0.15,
        ease: [0.25, 0.1, 0.25, 1],
      }}
      whileHover={{ y: -4, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="p-4">
        <h3 className="font-semibold text-lg mb-2 line-clamp-2">{service.name}</h3>
        {service.categoryName && (
          <p className="text-sm text-muted-foreground mb-6 line-clamp-1">
            {service.categoryName}
          </p>
        )}
       <div className="flex items-center gap-2">
       <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={onEdit}
        >
          <Edit className="h-4 w-4 mr-2" />
          Edit
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={onEdit}
        >
          <Edit className="h-4 w-4 mr-2" />
          Delete
        </Button>
       <Button
       variant="outline"
       size="sm"
       className="w-full"
      //  onClick={onEdit}
       >
        {/* <Switch className="h-4 w-4 mr-2" /> */}
        {service.status === 'active' ? 'Turn Off' : 'Turn On'}
       </Button>
       </div>
      </div>
    </Card>
    </motion.div>
  )
}
