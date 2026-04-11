import { motion } from 'framer-motion'
import { Check, X, Pencil, Trash2, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import {
    getLocationNameFromRef,
    getServiceNameFromRef,
    type ServiceLocationPage,
} from '@/redux/api/serviceLocationApi'

export interface ServiceLocationsTableProps {
    rows: ServiceLocationPage[]
    onDetails: (row: ServiceLocationPage) => void
    onEdit: (row: ServiceLocationPage) => void
    onDelete: (row: ServiceLocationPage) => void
    onToggleStatus: (row: ServiceLocationPage) => void
    togglingId: string | null
    /** Zero-based offset for SL column (e.g. (page - 1) * limit) */
    startIndex?: number
}

function hasFaqOverrides(row: ServiceLocationPage): boolean {
    return Array.isArray(row.faqOverrides) && row.faqOverrides.length > 0
}

function truncateText(text: string | undefined, max = 120): string {
    const t = text?.trim() ?? ''
    if (!t) return '—'
    return t.length <= max ? t : `${t.slice(0, max)}…`
}

export function ServiceLocationsTable({
    rows,
    onDetails,
    onEdit,
    onDelete,
    onToggleStatus,
    togglingId,
    startIndex = 0,
}: ServiceLocationsTableProps) {
    const colSpan = 8

    return (
        <div className="w-full overflow-auto">
            <table className="w-full min-w-[1100px]">
                <thead>
                    <tr className="bg-card">
                        <th className="px-6 py-4 text-left text-sm font-bold">SL</th>
                        <th className="px-6 py-4 text-left text-sm font-bold">Service name</th>
                        <th className="px-6 py-4 text-left text-sm font-bold">Location name</th>
                        <th className="px-6 py-4 text-left text-sm font-bold">Meta title</th>
                        <th className="px-6 py-4 text-left text-sm font-bold">Meta description</th>
                        <th className="px-6 py-4 text-center text-sm font-bold">FAQ</th>
                        <th className="px-6 py-4 text-left text-sm font-bold">Status</th>
                        <th className="px-6 py-4 text-right text-sm font-bold">Action</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                    {rows.length === 0 ? (
                        <tr>
                            <td
                                colSpan={colSpan}
                                className="px-6 py-8 text-center text-gray-500"
                            >
                                No service location pages yet.
                            </td>
                        </tr>
                    ) : (
                        rows.map((row, index) => (
                            <motion.tr
                                key={row._id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.06 * index }}
                                className="hover:bg-gray-50 transition-colors"
                            >
                                <td className="px-6 py-4">
                                    <span className="text-sm font-medium text-slate-700">
                                        {String(startIndex + index + 1).padStart(2, '0')}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="text-sm font-medium text-slate-800">
                                        {getServiceNameFromRef(row.serviceId) ?? '—'}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="text-sm font-medium text-slate-800">
                                        {getLocationNameFromRef(row.locationId) ?? '—'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 max-w-[200px]">
                                    <span className="text-sm text-slate-600 line-clamp-2">
                                        {row.metaTitleOverride?.trim() ? row.metaTitleOverride : '—'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 max-w-[260px]">
                                    <span
                                        className="text-sm text-slate-600 line-clamp-2"
                                        title={row.metaDescriptionOverride?.trim() || undefined}
                                    >
                                        {truncateText(row.metaDescriptionOverride, 120)}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex justify-center">
                                        {hasFaqOverrides(row) ? (
                                            <span
                                                className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-700"
                                                title="Has FAQ overrides"
                                            >
                                                <Check className="h-4 w-4" strokeWidth={2.5} />
                                            </span>
                                        ) : (
                                            <span
                                                className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-destructive/10 text-destructive"
                                                title="No FAQ overrides"
                                            >
                                                <X className="h-4 w-4" strokeWidth={2.5} />
                                            </span>
                                        )}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <Switch
                                        checked={row.isActive}
                                        disabled={togglingId === row._id}
                                        onCheckedChange={() => onToggleStatus(row)}
                                        aria-label={row.isActive ? 'Turn off' : 'Turn on'}
                                    />
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex flex-wrap justify-end gap-2">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            className="rounded-full h-8"
                                            onClick={() => onDetails(row)}
                                        >
                                            <Eye className="h-3.5 w-3.5 mr-1" />
                                            Details
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            className="rounded-full h-8"
                                            onClick={() => onEdit(row)}
                                        >
                                            <Pencil className="h-3.5 w-3.5 mr-1" />
                                            Edit
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 rounded-full text-destructive hover:text-destructive"
                                            onClick={() => onDelete(row)}
                                            aria-label="Delete"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </td>
                            </motion.tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    )
}
