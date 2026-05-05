import { motion } from 'framer-motion'
import { Check, Eye, Pencil, Trash2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { TableRowSkeleton } from '@/components/common'
import type { Service } from '@/types'

export interface ServicesTableProps {
  services: Service[]
  isLoading?: boolean
  startIndex?: number
  onDetails: (service: Service) => void
  onEdit: (service: Service) => void
  onDelete: (service: Service) => void
  /** User toggled status — parent should confirm (e.g. `ConfirmDialog`) then PATCH `isActive` */
  onToggleActive?: (service: Service, isActive: boolean) => void | Promise<void>
  statusUpdatingId?: string | null
}

function hasDetailedDescriptionLines(items: string[] | undefined): boolean {
  return (
    Array.isArray(items) &&
    items.some((s) => typeof s === 'string' && s.trim().length > 0)
  )
}

function truncateText(text: string | undefined, max = 100): string {
  const t = text?.trim() ?? ''
  if (!t) return '—'
  return t.length <= max ? t : `${t.slice(0, max)}…`
}

const COL_SPAN = 8

export function ServicesTable({
  services,
  isLoading = false,
  startIndex = 0,
  onDetails,
  onEdit,
  onDelete,
  onToggleActive,
  statusUpdatingId = null,
}: ServicesTableProps) {
  return (
    <div className="w-full overflow-auto rounded-xl border bg-white">
      <table className="w-full min-w-[900px] border-collapse">
        <thead>
          <tr className="border-b bg-card text-accent">
            <th className="px-4 py-4 text-left text-sm font-semibold">SL</th>
            <th className="px-4 py-4 text-left text-sm font-semibold">Service name</th>
            <th className="px-4 py-4 text-left text-sm font-semibold">Category</th>
            <th className="px-4 py-4 text-left text-sm font-semibold max-w-[220px]">
              Description
            </th>
            <th className="px-4 py-4 text-center text-sm font-semibold">
              Detailed description
            </th>
            <th className="px-4 py-4 text-center text-sm font-semibold">FAQs</th>
            <th className="px-4 py-4 text-center text-sm font-semibold whitespace-nowrap">
              Status
            </th>
            <th className="px-4 py-4 text-right text-sm font-semibold min-w-[180px]">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            <TableRowSkeleton columns={COL_SPAN} rows={6} />
          ) : services.length === 0 ? (
            <tr>
              <td
                colSpan={COL_SPAN}
                className="px-4 py-12 text-center text-muted-foreground"
              >
                No services found. Try adjusting your filters.
              </td>
            </tr>
          ) : (
            services.map((service, index) => (
              <motion.tr
                key={service.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.04 * index }}
                className="border-b transition-colors hover:bg-muted/50"
              >
                <td className="px-4 py-3 text-sm font-medium text-slate-700">
                  {String(startIndex + index + 1).padStart(2, '0')}
                </td>
                <td className="px-4 py-3 text-sm font-medium text-slate-900">
                  {service.name}
                </td>
                <td className="px-4 py-3 text-sm text-slate-700">
                  {service.categoryName ?? '—'}
                </td>
                <td className="px-4 py-3 text-sm text-slate-600 max-w-[220px]">
                  <span className="line-clamp-2" title={service.description?.trim() || undefined}>
                    {truncateText(service.description, 120)}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-center">
                    {hasDetailedDescriptionLines(service.detailedDescription) ? (
                      <span
                        className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-700"
                        title="Has detailed description"
                      >
                        <Check className="h-4 w-4" strokeWidth={2.5} />
                      </span>
                    ) : (
                      <span
                        className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-destructive/10 text-destructive"
                        title="No detailed description"
                      >
                        <X className="h-4 w-4" strokeWidth={2.5} />
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3">
                  {(service.faqs?.length ?? 0) > 0 ? (
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-700" title="Has FAQs">
                      <Check className="h-4 w-4" strokeWidth={2.5} />
                    </span>
                  ) : (
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-destructive/10 text-destructive" title="No FAQs">
                      <X className="h-4 w-4" strokeWidth={2.5} />
                    </span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-col items-center justify-center gap-2 sm:flex-row sm:gap-3">
                    {/* <Badge variant={service.status === 'active' ? 'success' : 'outline'}>
                      {service.status === 'active' ? 'Active' : 'Inactive'}
                    </Badge> */}
                    {onToggleActive ? (
                      <Switch
                        checked={service.status === 'active'}
                        disabled={statusUpdatingId === service.id}
                        onCheckedChange={(checked) => onToggleActive(service, checked)}
                        aria-label={
                          service.status === 'active' ? 'Deactivate service' : 'Activate service'
                        }
                      />
                    ) : null}
                  </div>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex flex-wrap justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-8 w-8 rounded-full p-0"
                      onClick={() => onDetails(service)}
                      aria-label="View details"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-8 w-8 rounded-full p-0"
                      onClick={() => onEdit(service)}
                      aria-label="Edit service"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-8 w-8 rounded-full p-0"
                      onClick={() => onDelete(service)}
                      aria-label="Delete service"
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
