
import { MoreHorizontal, Edit, Trash2, Eye, Package } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { Category } from '@/types'
import { toast } from '@/components/ui/use-toast'

interface CategoryActionMenuProps {
  category: Category
  onEdit: () => void
  onDelete: () => void
}

export function CategoryActionMenu({ category, onEdit, onDelete }: CategoryActionMenuProps) {
  const handleViewProducts = () => {
    toast({
      title: 'View Products',
      description: `Viewing products in ${category.name}`,
    })
  }

  const handleView = () => {
    toast({
      title: 'View Category',
      description: `Viewing ${category.name}`,
    })
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon-sm">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleView}>
          <Eye className="h-4 w-4 mr-2" />
          View Details
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onEdit}>
          <Edit className="h-4 w-4 mr-2" />
          Edit Category
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleViewProducts}>
          <Package className="h-4 w-4 mr-2" />
          View Products ({category.productCount})
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={onDelete}
          className="text-destructive focus:text-destructive"
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Delete Category
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}











