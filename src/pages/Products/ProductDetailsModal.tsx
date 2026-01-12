import { Package, Tag, DollarSign, Archive, Calendar, Hash } from 'lucide-react'
import { ModalWrapper, StatusBadge } from '@/components/common'
import { Separator } from '@/components/ui/separator'
import { formatCurrency, formatDate } from '@/utils/formatters'
import type { Product } from '@/types'

interface ProductDetailsModalProps {
  open: boolean
  onClose: () => void
  product: Product
}

export function ProductDetailsModal({ open, onClose, product }: ProductDetailsModalProps) {
  return (
    <ModalWrapper
      open={open}
      onClose={onClose}
      title="Product Details"
      description="View complete product information"
      size="lg"
    >
      <div className="space-y-6">
        {/* Product Image & Basic Info */}
        <div className="flex gap-6">
          <div className="w-32 h-32 rounded-xl overflow-hidden bg-muted flex-shrink-0">
            {product.image ? (
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                <Package className="h-12 w-12" />
              </div>
            )}
          </div>
          <div className="flex-1 space-y-2">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-xl font-semibold">{product.name}</h3>
                <p className="text-sm text-muted-foreground">SKU: {product.sku}</p>
              </div>
              <StatusBadge status={product.status} />
            </div>
            <div className="flex items-center gap-4 pt-2">
              <div className="flex items-center gap-2">
                <Tag className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{product.category}</span>
              </div>
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <span className="text-lg font-bold text-primary">
                  {formatCurrency(product.price)}
                </span>
              </div>
            </div>
          </div>
        </div>

        <Separator />

        {/* Description */}
        <div>
          <h4 className="text-sm font-semibold text-muted-foreground mb-2">Description</h4>
          <p className="text-sm leading-relaxed">{product.description}</p>
        </div>

        <Separator />

        {/* Details Grid */}
        <div className="grid grid-cols-2 gap-4">
          <DetailItem
            icon={Archive}
            label="Stock"
            value={`${product.stock} units`}
            highlight={product.stock === 0}
          />
          <DetailItem
            icon={Hash}
            label="SKU"
            value={product.sku}
          />
          <DetailItem
            icon={Tag}
            label="Category"
            value={product.category}
          />
          <DetailItem
            icon={DollarSign}
            label="Price"
            value={formatCurrency(product.price)}
          />
          <DetailItem
            icon={Calendar}
            label="Created"
            value={formatDate(product.createdAt)}
          />
          <DetailItem
            icon={Calendar}
            label="Last Updated"
            value={formatDate(product.updatedAt)}
          />
        </div>

        {/* Stock Warning */}
        {product.stock === 0 && (
          <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
            <p className="text-sm text-destructive font-medium">
              ⚠️ This product is out of stock. Consider restocking soon.
            </p>
          </div>
        )}

        {product.stock > 0 && product.stock < 20 && (
          <div className="p-4 rounded-lg bg-warning/10 border border-warning/20">
            <p className="text-sm text-warning font-medium">
              ⚠️ Low stock alert! Only {product.stock} units remaining.
            </p>
          </div>
        )}
      </div>
    </ModalWrapper>
  )
}

interface DetailItemProps {
  icon: React.ElementType
  label: string
  value: string
  highlight?: boolean
}

function DetailItem({ icon: Icon, label, value, highlight }: DetailItemProps) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
      <div className="h-10 w-10 rounded-lg bg-background flex items-center justify-center">
        <Icon className="h-5 w-5 text-muted-foreground" />
      </div>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className={`font-medium ${highlight ? 'text-destructive' : ''}`}>{value}</p>
      </div>
    </div>
  )
}













