import { motion } from 'framer-motion'
import { Pencil, Trash2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import {
    getLocationNameFromRef,
    getServiceNameFromRef,
    type ServiceLocationPage,
} from '@/redux/api/serviceLocationApi'

interface ServiceLocationCardProps {
    item: ServiceLocationPage
    index: number
    isToggling?: boolean
    onEdit: (row: ServiceLocationPage) => void
    onDelete: (row: ServiceLocationPage) => void
    onToggleStatus: (row: ServiceLocationPage) => void
}

export function ServiceLocationCard({
    item,
    index,
    isToggling,
    onEdit,
    onDelete,
    onToggleStatus,
}: ServiceLocationCardProps) {
    const serviceName = getServiceNameFromRef(item.serviceId) ?? '—'
    const locationName = getLocationNameFromRef(item.locationId) ?? '—'

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: index * 0.04 }}
        >
            <Card className="h-full hover:shadow-md transition-shadow">
                <CardContent className="px-5 py-4 flex flex-col gap-3">
                    <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 space-y-1">
                            <h3 className="font-semibold text-lg text-foreground truncate">
                                {serviceName}
                                <span className="text-muted-foreground font-normal"> · </span>
                                <span className="font-medium">{locationName}</span>
                            </h3>
                            <p className="text-xs text-muted-foreground truncate" title={item.slug}>
                                /{item.slug}
                            </p>
                            {item.metaTitleOverride && (
                                <p className="text-sm text-muted-foreground line-clamp-2">
                                    <span className="font-medium text-foreground/80">Meta: </span>
                                    {item.metaTitleOverride}
                                </p>
                            )}
                        </div>
                        <Badge variant={item.isActive ? 'success' : 'secondary'}>
                            {item.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                    </div>

                    <div className="flex items-center justify-between gap-2 pt-1">
                        <Switch
                            checked={item.isActive}
                            disabled={isToggling}
                            onCheckedChange={() => onToggleStatus(item)}
                        />
                        <div className="flex gap-4">
                            <button
                                type="button"
                                className="rounded-full border-none"
                                onClick={() => onEdit(item)}
                            >
                                <Pencil className="h-4 w-4" />
                            </button>
                            <button
                                type="button"
                                className="rounded-full text-destructive hover:text-destructive border-none"
                                onClick={() => onDelete(item)}
                            >
                                <Trash2 className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    )
}
