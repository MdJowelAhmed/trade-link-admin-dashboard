import { useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Check, X, Pencil, Trash2, Eye } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { ConfirmDialog, DataTable, Pagination, SearchInput } from '@/components/common'
import { useUrlNumber } from '@/hooks/useUrlState'
import type { TableColumn } from '@/types'
import {
    useGetServiceLocationsQuery,
    useDeleteServiceLocationMutation,
    useUpdateServiceLocationMutation,
    getLocationNameFromRef,
    getServiceNameFromRef,
    type ServiceLocationPage,
} from '@/redux/api/serviceLocationApi'
import { AddEditServiceLocationModal } from './AddEditServiceLocationModal'
import { ServiceLocationDetailsModal } from './ServiceLocationDetailsModal'
import { toast } from '@/utils/toast'
import { isFetchBaseQueryError } from '@/pages/location/errorUtils'
import { cn } from '@/utils/cn'

function extractErrorMessage(error: unknown): string {
    if (!isFetchBaseQueryError(error)) return 'Request failed'
    const d = error.data as Record<string, unknown> | undefined
    if (!d) return 'Request failed'
    const msg = d.message
    if (typeof msg === 'string') return msg
    return 'Request failed'
}

function hasFaqOverrides(row: ServiceLocationPage): boolean {
    return Array.isArray(row.faqOverrides) && row.faqOverrides.length > 0
}

function truncateText(text: string | undefined, max = 72): string {
    const t = text?.trim() ?? ''
    if (!t) return '—'
    return t.length <= max ? t : `${t.slice(0, max)}…`
}

export default function ServiceLocationsContainer() {
    const [page, setPage] = useUrlNumber('page', 1)
    const [limit, setLimit] = useState(20)
    const [search, setSearch] = useState('')

    const [createOpen, setCreateOpen] = useState(false)
    const [editOpen, setEditOpen] = useState(false)
    const [editing, setEditing] = useState<ServiceLocationPage | null>(null)

    const [detailsOpen, setDetailsOpen] = useState(false)
    const [detailsRow, setDetailsRow] = useState<ServiceLocationPage | null>(null)

    const [deleteOpen, setDeleteOpen] = useState(false)
    const [deleting, setDeleting] = useState<ServiceLocationPage | null>(null)

    const { data, isLoading, isFetching } = useGetServiceLocationsQuery({
        page,
        limit,
        searchTerm: search || undefined,
    })

    const [deleteRow, { isLoading: deleteLoading }] = useDeleteServiceLocationMutation()
    const [updateRow] = useUpdateServiceLocationMutation()
    const [togglingId, setTogglingId] = useState<string | null>(null)

    const rows = data?.data ?? []
    const pagination = data?.pagination
    const totalItems = pagination?.total ?? rows.length
    const itemsPerPage = pagination?.limit ?? limit
    const totalPages =
        pagination?.totalPage ??
        (itemsPerPage ? Math.max(1, Math.ceil(totalItems / itemsPerPage)) : 1)
    const currentPage = pagination?.page ?? page
    const hasBackendPagination = typeof pagination?.total === 'number'

    const openEdit = (row: ServiceLocationPage) => {
        setEditing(row)
        setEditOpen(true)
    }

    const openDetails = (row: ServiceLocationPage) => {
        setDetailsRow(row)
        setDetailsOpen(true)
    }

    const openDelete = (row: ServiceLocationPage) => {
        setDeleting(row)
        setDeleteOpen(true)
    }

    const onToggleStatus = async (row: ServiceLocationPage) => {
        if (togglingId) return
        setTogglingId(row._id)
        try {
            await updateRow({
                id: row._id,
                body: { isActive: !row.isActive },
            }).unwrap()
            toast({ title: 'Status updated', variant: 'success' })
        } catch (e) {
            toast({ title: extractErrorMessage(e), variant: 'destructive' })
        } finally {
            setTogglingId(null)
        }
    }

    const handleDelete = async () => {
        if (!deleting) return
        try {
            await deleteRow(deleting._id).unwrap()
            toast({ title: 'Service location deleted', variant: 'success' })
            setDeleteOpen(false)
            setDeleting(null)
        } catch (e) {
            toast({ title: extractErrorMessage(e), variant: 'destructive' })
        }
    }

    const deleteDescription = deleting
        ? `Remove “${getServiceNameFromRef(deleting.serviceId) ?? deleting.slug} · ${getLocationNameFromRef(deleting.locationId) ?? 'location'}”? This cannot be undone.`
        : ''

    const columns: TableColumn<ServiceLocationPage>[] = [
        {
            key: 'serviceId',
            label: 'Service name',
            render: (_, row) => (
                <span className="font-medium">{getServiceNameFromRef(row.serviceId) ?? '—'}</span>
            ),
        },
        {
            key: 'locationId',
            label: 'Location name',
            render: (_, row) => (
                <span className="font-medium">{getLocationNameFromRef(row.locationId) ?? '—'}</span>
            ),
        },
        {
            key: 'metaTitleOverride',
            label: 'Meta title',
            render: (_, row) => (
                <span className="text-muted-foreground">
                    {row.metaTitleOverride?.trim() ? row.metaTitleOverride : '—'}
                </span>
            ),
        },
        {
            key: 'metaDescriptionOverride',
            label: 'Meta description',
            render: (_, row) => (
                <span
                    className="text-muted-foreground line-clamp-2 max-w-[280px]"
                    title={row.metaDescriptionOverride?.trim() || undefined}
                >
                    {truncateText(row.metaDescriptionOverride, 120)}
                </span>
            ),
        },
        {
            key: 'faqOverrides',
            label: 'FAQ',
            render: (_, row) => (
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
            ),
        },
        {
            key: 'isActive',
            label: 'On / off',
            render: (_, row) => (
                <Switch
                    checked={row.isActive}
                    disabled={togglingId === row._id}
                    onCheckedChange={() => onToggleStatus(row)}
                    aria-label={row.isActive ? 'Turn off' : 'Turn on'}
                />
            ),
        },
    ]

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="space-y-6"
        >
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Service & locations</h1>
                    <p className="text-muted-foreground text-sm">
                        Manage SEO pages that combine a service with a specific place in your
                        hierarchy.
                    </p>
                </div>
                <Button
                    type="button"
                    className="rounded-full shrink-0"
                    onClick={() => setCreateOpen(true)}
                >
                    <Plus className="h-4 w-4 mr-2" />
                    Add page
                </Button>
            </div>

            <Card>
                <CardContent className="p-6 space-y-6">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
                        <SearchInput
                            value={search}
                            onChange={(val) => {
                                setSearch(val)
                                setPage(1)
                            }}
                            debounceMs={500}
                            placeholder="Search by slug or text…"
                            className="w-full sm:w-80"
                        />
                    </div>

                    {rows.length === 0 && !isLoading && !isFetching ? (
                        <p className="text-center py-14 text-muted-foreground">
                            No service location pages yet. Add one to get started.
                        </p>
                    ) : (
                        <div className="space-y-6">
                            <DataTable<ServiceLocationPage>
                                columns={columns}
                                data={rows}
                                isLoading={isLoading || isFetching}
                                emptyMessage="No service location pages yet."
                                rowKeyExtractor={(row) => row._id}
                                actions={(row) => (
                                    <div className="flex flex-wrap items-center justify-end gap-2">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            className={cn('rounded-full h-8')}
                                            onClick={() => openDetails(row)}
                                        >
                                            <Eye className="h-3.5 w-3.5 mr-1" />
                                            Details
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            className="rounded-full h-8"
                                            onClick={() => openEdit(row)}
                                        >
                                            <Pencil className="h-3.5 w-3.5 mr-1" />
                                            Edit
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 rounded-full text-destructive hover:text-destructive"
                                            onClick={() => openDelete(row)}
                                            aria-label="Delete"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                )}
                            />

                            {hasBackendPagination && totalPages > 1 && (
                                <Pagination
                                    currentPage={currentPage}
                                    totalPages={totalPages}
                                    totalItems={totalItems}
                                    itemsPerPage={itemsPerPage}
                                    onPageChange={setPage}
                                    onItemsPerPageChange={(newLimit) => {
                                        setLimit(newLimit)
                                        setPage(1)
                                    }}
                                    className="mt-2"
                                />
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>

            <AddEditServiceLocationModal
                open={createOpen}
                onClose={() => setCreateOpen(false)}
                mode="create"
            />

            <AddEditServiceLocationModal
                open={editOpen}
                onClose={() => {
                    setEditOpen(false)
                    setEditing(null)
                }}
                mode="edit"
                row={editing}
            />

            <ServiceLocationDetailsModal
                open={detailsOpen}
                onClose={() => {
                    setDetailsOpen(false)
                    setDetailsRow(null)
                }}
                row={detailsRow}
            />

            <ConfirmDialog
                open={deleteOpen}
                onClose={() => {
                    setDeleteOpen(false)
                    setDeleting(null)
                }}
                onConfirm={handleDelete}
                title="Delete service location page"
                description={deleteDescription}
                confirmText="Delete"
                variant="danger"
                isLoading={deleteLoading}
            />
        </motion.div>
    )
}
