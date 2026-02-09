import { Edit, HelpCircle, Info } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { motion } from 'framer-motion'
import type { Category } from '@/types'
import { imageUrl } from '@/utils/imageUrl'
import { Badge } from '@/components/ui/badge'
import { capitalize } from '@/utils/formatters'

interface CategoryCardProps {
  category: Category
  onEdit: () => void
  onFaq: () => void
  onDetails: () => void
  hasFaqs: boolean
  index?: number
}

export function CategoryCard({ category, onEdit, onFaq, onDetails, hasFaqs, index = 0 }: CategoryCardProps) {
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
        <div className="relative aspect-video w-full overflow-hidden bg-muted">
          {category.image ? (
            <img
              src={imageUrl(category.image)}
              alt={category.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center text-muted-foreground">
              <svg
                className="h-12 w-12"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
                />
              </svg>
            </div>
          )}

          
            <Badge variant='outline' className='absolute top-2 right-2 bg-primary text-white'>
              {capitalize(category.status)}
            </Badge>
       
        </div>
        <div className="p-4 space-y-2">
          <h3 className="font-semibold text-lg mb-2 line-clamp-2">{category.name}</h3>

          <div className="flex  gap-2">
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
              onClick={onFaq}
            >
              <HelpCircle className="h-4 w-4 mr-2" />
              {hasFaqs ? 'Edit FAQ' : 'Add FAQ'}
            </Button>

            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={onDetails}
            >
              <Info className="h-4 w-4 mr-2" />
              Details
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  )
}
