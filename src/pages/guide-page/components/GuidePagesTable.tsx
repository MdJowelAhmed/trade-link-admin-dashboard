import { motion } from 'framer-motion'
import { Pencil, Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
    getGuideServiceName,
    getGuideLocationName,
    type GuidePage,
} from '@/redux/api/guideApi'

interface GuidePagesTableProps {
    rows: GuidePage[]
    startIndex?: number
    onEdit: (row: GuidePage) => void
    onDelete: (row: GuidePage) => void
    /** When true, hide the Type column (e.g. tab already implies type). */
    hideTypeColumn?: boolean
}

function truncate(text: string | undefined, max = 100): string {
    const t = text?.trim() ?? ''
    if (!t) return '—'
    return t.length <= max ? t : `${t.slice(0, max)}…`
}

export function GuidePagesTable({
    rows,
    startIndex = 0,
    onEdit,
    onDelete,
    hideTypeColumn = false,
}: GuidePagesTableProps) {
    const colCount = hideTypeColumn ? 7 : 8
    return (
        <div className="w-full overflow-auto">
            <table className="w-full min-w-[900px]">
                <thead>
                    <tr className="bg-card">
                        <th className="px-6 py-4 text-left text-sm font-bold">SL</th>
                        <th className="px-6 py-4 text-left text-sm font-bold">Title</th>
                        {!hideTypeColumn && (
                            <th className="px-6 py-4 text-left text-sm font-bold">Type</th>
                        )}
                        <th className="px-6 py-4 text-left text-sm font-bold">Service</th>
                        <th className="px-6 py-4 text-left text-sm font-bold">Location</th>
                        <th className="px-6 py-4 text-left text-sm font-bold">Meta title</th>
                        <th className="px-6 py-4 text-left text-sm font-bold">Status</th>
                        <th className="px-6 py-4 text-right text-sm font-bold">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                    {rows.length === 0 ? (
                        <tr>
                            <td
                                colSpan={colCount}
                                className="px-6 py-10 text-center text-muted-foreground"
                            >
                                No guide pages yet. Add one to get started.
                            </td>
                        </tr>
                    ) : (
                        rows.map((row, index) => (
                            <motion.tr
                                key={row._id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.05 * index }}
                                className="hover:bg-gray-50 transition-colors"
                            >
                                <td className="px-6 py-4 text-sm font-medium text-slate-700">
                                    {String(startIndex + index + 1).padStart(2, '0')}
                                </td>
                                <td className="px-6 py-4 max-w-[200px]">
                                    <span className="text-sm font-medium text-slate-800 line-clamp-2">
                                        {row.title}
                                    </span>
                                </td>
                                {!hideTypeColumn && (
                                    <td className="px-6 py-4">
                                        <Badge variant="outline" className="text-xs">
                                            {row.type}
                                        </Badge>
                                    </td>
                                )}
                                <td className="px-6 py-4">
                                    <span className="text-sm text-slate-700">
                                        {getGuideServiceName(row.serviceId)}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="text-sm text-slate-700">
                                        {getGuideLocationName(row.locationId)}
                                    </span>
                                </td>
                                <td className="px-6 py-4 max-w-[200px]">
                                    <span className="text-sm text-slate-600 line-clamp-2">
                                        {truncate(row.metaTitle, 80)}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <Badge
                                        variant={row.isPublished ? 'success' : 'secondary'}
                                    >
                                        {row.isPublished ? 'Published' : 'Draft'}
                                    </Badge>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex justify-end gap-2">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            className="rounded-full h-8"
                                            onClick={() => onEdit(row)}
                                        >
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            className="rounded-full h-8 text-destructive hover:text-destructive"
                                            onClick={() => onDelete(row)}
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
