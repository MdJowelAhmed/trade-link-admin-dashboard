import { useState } from 'react'
import { motion } from 'framer-motion'
import { Plus } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ConfirmDialog, GridSkeleton, Pagination, SearchInput } from '@/components/common'
import { useUrlNumber } from '@/hooks/useUrlState'
import {
    useGetServiceLocationsQuery,
    useDeleteServiceLocationMutation,
    useUpdateServiceLocationMutation,
    getLocationNameFromRef,
    getServiceNameFromRef,
    type ServiceLocationPage,
} from '@/redux/api/serviceLocationApi'
import { ServiceLocationCard } from './components/ServiceLocationCard'
import { AddEditServiceLocationModal } from './AddEditServiceLocationModal'
import { toast } from '@/utils/toast'
import { isFetchBaseQueryError } from '@/pages/location/errorUtils'

function extractErrorMessage(error: unknown): string {
    if (!isFetchBaseQueryError(error)) return 'Request failed'
    const d = error.data as Record<string, unknown> | undefined
    if (!d) return 'Request failed'
    const msg = d.message
    if (typeof msg === 'string') return msg
    return 'Request failed'
}

export default function ServiceLocationsContainer() {
    const [page, setPage] = useUrlNumber('page', 1)
    const [limit, setLimit] = useState(20)
    const [search, setSearch] = useState('')

    const [createOpen, setCreateOpen] = useState(false)
    const [editOpen, setEditOpen] = useState(false)
    const [editing, setEditing] = useState<ServiceLocationPage | null>(null)

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

                    {isLoading || isFetching ? (
                        <GridSkeleton count={6} itemClassName="h-56" />
                    ) : rows.length === 0 ? (
                        <p className="text-center py-14 text-muted-foreground">
                            No service location pages yet. Add one to get started.
                        </p>
                    ) : (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                {rows.map((row, index) => (
                                    <ServiceLocationCard
                                        key={row._id}
                                        item={row}
                                        index={index}
                                        isToggling={togglingId === row._id}
                                        onEdit={openEdit}
                                        onDelete={openDelete}
                                        onToggleStatus={onToggleStatus}
                                    />
                                ))}
                            </div>

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
