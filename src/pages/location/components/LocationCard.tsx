import { motion } from 'framer-motion'
import { Pencil, Trash2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
// import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { LocationEntity } from '@/redux/api/locationApi'
// import { LOCATION_TAB_LABELS } from '../constants'
import { resolveParentDisplayName } from '../locationUtils'
// import { Switch } from '@/components/ui/switch'

interface LocationCardProps {
    location: LocationEntity
    index: number
    parentName?: string | null
    isToggling?: boolean
    onEdit: (location: LocationEntity) => void
    onDelete: (location: LocationEntity) => void
    onToggleStatus: (location: LocationEntity) => void
    parentNameById?: Record<string, string>
}

export function LocationCard({
    location,
    index,
    parentName,
    // isToggling,
    onEdit,
    onDelete,
    // onToggleStatus,
    parentNameById,
}: LocationCardProps) {
    const resolvedParentName =
        parentName ?? resolveParentDisplayName(location, parentNameById)

    const parseCoord = (v: unknown): number | null => {
        if (typeof v === 'number' && Number.isFinite(v)) return v
        if (typeof v === 'string' && v.trim() !== '') {
            const n = Number(v)
            if (Number.isFinite(n)) return n
        }
        return null
    }

    const lat = parseCoord(location.latitude)
    const lng = parseCoord(location.longitude)
    const hasCoords = lat !== null || lng !== null

    const formatCoord = (n: number) =>
        n.toLocaleString(undefined, { maximumFractionDigits: 6 })
    // const typeLabel =
    //     LOCATION_TAB_LABELS[location.type as LocationType] ?? location.type

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: index * 0.04 }}
        >
            <Card className="h-full hover:shadow-md transition-shadow">
                <CardContent className="px-5 py-4 flex flex-col gap-3">
                    <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                            <h3 className="font-semibold text-lg text-foreground truncate">
                                {location.name}
                            </h3>
                        </div>
                        <Badge variant={location.isActive ? 'success' : 'secondary'}>
                            {location.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                    </div>

                    {resolvedParentName && (
                        <p className="text-sm text-muted-foreground">
                            <span className="font-medium text-foreground/80">
                                Parent:{' '}
                            </span>
                            {resolvedParentName}
                        </p>
                    )}

                    {hasCoords && (
                        <p className="text-sm text-muted-foreground">
                            <span className="font-medium text-foreground/80">Coordinates: </span>
                            {lat !== null && <span className="tabular-nums">Lat {formatCoord(lat)}</span>}
                            {lat !== null && lng !== null && (
                                <span className="mx-1.5 text-border">·</span>
                            )}
                            {lng !== null && <span className="tabular-nums">Lng {formatCoord(lng)}</span>}
                        </p>
                    )}

                    <div className="flex   justify-end ">
                        {/* <Switch
                            checked={location.isActive}
                            disabled={isToggling}
                            onCheckedChange={() => onToggleStatus(location)}
                            
                        /> */}
                        <div className=" flex gap-4">
                            <button
                                type="button"
                                // variant="outline"
                                // size="sm"
                                className="rounded-full border-none"
                                onClick={() => onEdit(location)}
                            >
                                <Pencil className="h-4 w-4" />
                            </button>
                            <button
                                type="button"
                                // variant="outline"
                                // size="sm"
                                className="rounded-full text-destructive hover:text-destructive border-none"
                                onClick={() => onDelete(location)}
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
