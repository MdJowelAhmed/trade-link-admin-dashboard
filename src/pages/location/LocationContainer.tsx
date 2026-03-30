import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Plus } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ConfirmDialog, GridSkeleton, Pagination, SearchInput } from '@/components/common'
import { useUrlState, useUrlNumber, useUrlParams } from '@/hooks/useUrlState'
import {
    useGetLocationsQuery,
    useDeleteLocationMutation,
    useUpdateLocationMutation,
    type LocationEntity,
    type LocationType,
} from '@/redux/api/locationApi'
import {
    LOCATION_TAB_ORDER,
    LOCATION_TAB_LABELS,
    LOCATION_TAB_PLURAL,
    getParentTypeFor,
} from './constants'
import { LocationCard } from './components/LocationCard'
import { AddEditLocationModal } from './components/AddEditLocationModal'
import { toast } from '@/utils/toast'
import { isFetchBaseQueryError } from './errorUtils'

const VALID_LOCATION_TABS = new Set<LocationType>(LOCATION_TAB_ORDER)

function parseLocationTab(value: string): LocationType {
    return VALID_LOCATION_TABS.has(value as LocationType)
        ? (value as LocationType)
        : 'country'
}

function extractErrorMessage(error: unknown): string {
    if (!isFetchBaseQueryError(error)) return 'Request failed'
    const d = error.data as Record<string, unknown> | undefined
    if (!d) return 'Request failed'
    const msg = d.message
    if (typeof msg === 'string') return msg
    return 'Request failed'
}

function LocationTypePanel({
    type,
    page,
    limit,
    search,
    onPageChange,
    onItemsPerPageChange,
    onEdit,
    onDelete,
    onToggleStatus,
    isTogglingId,
}: {
    type: LocationType
    page: number
    limit: number
    search: string
    onPageChange: (page: number) => void
    onItemsPerPageChange: (limit: number) => void
    onEdit: (loc: LocationEntity) => void
    onDelete: (loc: LocationEntity) => void
    onToggleStatus: (loc: LocationEntity) => void
    isTogglingId: string | null
}) {
    const PARENT_LOOKUP_LIMIT = 1000

    const { data, isLoading, isFetching } = useGetLocationsQuery({
        type,
        page,
        limit,
        searchTerm: search || undefined,
    })
    const locations = data?.data ?? []

    const pagination = data?.pagination
    const totalItems = pagination?.total ?? locations.length
    const itemsPerPage = pagination?.limit ?? limit
    const totalPages =
        pagination?.totalPage ?? (itemsPerPage ? Math.max(1, Math.ceil(totalItems / itemsPerPage)) : 1)
    const currentPage = pagination?.page ?? page
    const hasBackendPagination = typeof pagination?.total === 'number'

    const parentType = getParentTypeFor(type)
    const { data: parentsRes } = useGetLocationsQuery(
        { type: parentType!, page: 1, limit: PARENT_LOOKUP_LIMIT },
        { skip: !parentType }
    )
    const parentNameById = useMemo(() => {
        const map: Record<string, string> = {}
        for (const p of parentsRes?.data ?? []) {
            map[p._id] = p.name
        }
        return map
    }, [parentsRes?.data])

    if (isLoading || isFetching) {
        return <GridSkeleton count={6} itemClassName="h-56" />
    }

    if (locations.length === 0) {
        return (
            <p className="text-center py-14 text-muted-foreground">
                No {LOCATION_TAB_PLURAL[type].toLowerCase()} yet. Add one to get started.
            </p>
        )
    }

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {locations.map((loc, index) => (
                    <LocationCard
                        key={loc._id}
                        location={loc}
                        index={index}
                        parentNameById={parentNameById}
                        isToggling={isTogglingId === loc._id}
                        onEdit={onEdit}
                        onDelete={onDelete}
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
                    onPageChange={onPageChange}
                    onItemsPerPageChange={onItemsPerPageChange}
                    className="mt-2"
                />
            )}
        </div>
    )
}

export default function LocationContainer() {
    const { setParams } = useUrlParams()
    const [activeType] = useUrlState<LocationType>({
        key: 'tab',
        defaultValue: 'country',
        parse: parseLocationTab,
        serialize: (v) => v,
    })
    const [page, setPage] = useUrlNumber('page', 1)
    const [limit, setLimit] = useState(30)
    const [search, setSearch] = useState('')

    const [createOpen, setCreateOpen] = useState(false)
    const [createTypeSnapshot, setCreateTypeSnapshot] = useState<LocationType>('country')
    const [editOpen, setEditOpen] = useState(false)
    const [editing, setEditing] = useState<LocationEntity | null>(null)

    const [deleteOpen, setDeleteOpen] = useState(false)
    const [deleting, setDeleting] = useState<LocationEntity | null>(null)

    const [deleteLocation, { isLoading: deleteLoading }] = useDeleteLocationMutation()
    const [updateLocation] = useUpdateLocationMutation()
    const [togglingId, setTogglingId] = useState<string | null>(null)

    const openCreate = () => {
        setCreateTypeSnapshot(activeType)
        setCreateOpen(true)
    }

    const openEdit = (loc: LocationEntity) => {
        setEditing(loc)
        setEditOpen(true)
    }

    const openDelete = (loc: LocationEntity) => {
        setDeleting(loc)
        setDeleteOpen(true)
    }

    const onToggleStatus = async (loc: LocationEntity) => {
        if (togglingId) return
        const nextActive = !loc.isActive
        setTogglingId(loc._id)
        try {
            await updateLocation({
                id: loc._id,
                body: { isActive: nextActive },
            }).unwrap()
            toast({
                title: 'Status updated',
                variant: 'success',
            })
        } catch (e) {
            toast({
                title: extractErrorMessage(e),
                variant: 'destructive',
            })
        } finally {
            setTogglingId(null)
        }
    }

    const handleDelete = async () => {
        if (!deleting) return
        try {
            await deleteLocation(deleting._id).unwrap()
            toast({ title: 'Location deleted', variant: 'success' })
            setDeleteOpen(false)
            setDeleting(null)
        } catch (e) {
            toast({ title: extractErrorMessage(e), variant: 'destructive' })
        }
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="space-y-6"
        >
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Locations</h1>
                    <p className="text-muted-foreground text-sm">
                        Manage countries, regions, counties, towns, and cities. Non-country types
                        require a parent in the hierarchy.
                    </p>
                </div>
                <Button
                    type="button"
                    className="rounded-full shrink-0"
                    onClick={openCreate}
                >
                    <Plus className="h-4 w-4 mr-2" />
                    Add {LOCATION_TAB_LABELS[activeType]}
                </Button>
            </div>

            <Card>
                <CardContent className="p-6">
                    <Tabs
                        value={activeType}
                        onValueChange={(v) => {
                            const next = v as LocationType
                            setParams({
                                tab: next === 'country' ? null : next,
                                page: null,
                            })
                            setSearch('')
                        }}
                        className="w-full"
                    >
                        <div className="flex flex-col gap-3 mb-6 sm:flex-row sm:items-center sm:justify-between">
                            <TabsList className="flex h-auto min-h-12 w-full flex-wrap justify-start gap-1 rounded-2xl bg-muted/60 p-1.5 sm:w-auto">
                                {LOCATION_TAB_ORDER.map((t) => (
                                    <TabsTrigger
                                        key={t}
                                        value={t}
                                        className="rounded-full px-4 py-2 text-xs sm:text-sm"
                                    >
                                        {LOCATION_TAB_PLURAL[t]}
                                    </TabsTrigger>
                                ))}
                            </TabsList>

                            <SearchInput
                                value={search}
                                onChange={(val) => {
                                    setSearch(val)
                                    setPage(1)
                                }}
                                debounceMs={500}
                                placeholder={`Search ${LOCATION_TAB_PLURAL[activeType].toLowerCase()}...`}
                                className="w-full sm:w-80"
                            />
                        </div>

                        {LOCATION_TAB_ORDER.map((t) => (
                            <TabsContent key={t} value={t} className="mt-0">
                                <LocationTypePanel
                                    type={t}
                                    page={page}
                                    limit={limit}
                                    search={search}
                                    onPageChange={setPage}
                                    onItemsPerPageChange={(newLimit) => {
                                        setLimit(newLimit)
                                        setPage(1)
                                    }}
                                    onEdit={openEdit}
                                    onDelete={openDelete}
                                    onToggleStatus={onToggleStatus}
                                    isTogglingId={togglingId}
                                />
                            </TabsContent>
                        ))}
                    </Tabs>
                </CardContent>
            </Card>

            <AddEditLocationModal
                open={createOpen}
                onClose={() => setCreateOpen(false)}
                mode="create"
                createType={createTypeSnapshot}
            />

            <AddEditLocationModal
                open={editOpen}
                onClose={() => {
                    setEditOpen(false)
                    setEditing(null)
                }}
                mode="edit"
                location={editing}
            />

            <ConfirmDialog
                open={deleteOpen}
                onClose={() => {
                    setDeleteOpen(false)
                    setDeleting(null)
                }}
                onConfirm={handleDelete}
                title="Delete location"
                description={
                    deleting
                        ? `Remove “${deleting.name}”? This cannot be undone.`
                        : ''
                }
                confirmText="Delete"
                variant="danger"
                isLoading={deleteLoading}
            />
        </motion.div>
    )
}
