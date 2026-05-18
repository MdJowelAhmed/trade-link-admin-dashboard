import { useCallback, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Plus } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ConfirmDialog, Pagination, SearchInput } from '@/components/common'
import { useUrlNumber, useUrlParams } from '@/hooks/useUrlState'
import {
    useGetGuidePagesQuery,
    useDeleteGuidePageMutation,
    type GuidePage,
    type GuidePageType,
} from '@/redux/api/guideApi'
import { GuidePagesTable } from './components/GuidePagesTable'
import { AddEditGuidePageModal } from './AddEditGuidePageModal'
import { toast } from '@/utils/toast'
import { isFetchBaseQueryError } from '@/pages/location/errorUtils'

const GUIDE_TAB_LABEL: Record<GuidePageType, string> = {
    PROBLEM: 'Guides problem',
    COST: 'Guide cost',
}

function extractErrorMessage(error: unknown): string {
    if (!isFetchBaseQueryError(error)) return 'Request failed'
    const d = error.data as Record<string, unknown> | undefined
    if (!d) return 'Request failed'
    const msg = d.message
    if (typeof msg === 'string') return msg
    return 'Request failed'
}

export default function GuidePagesContainer() {
    const [page, setPage] = useUrlNumber('page', 1)
    const [limit, setLimit] = useState(10)
    const [search, setSearch] = useState('')

    const { searchParams, setParams } = useUrlParams()

    /** Read from URL (must stay in sync with tab `setParams` — avoid two `setSearchParams` calls in one tick). */
    const activeGuideType = useMemo((): GuidePageType => {
        const raw = searchParams.get('guideType')?.toLowerCase()
        return raw === 'cost' ? 'COST' : 'PROBLEM'
    }, [searchParams])

    const handleGuideTabChange = useCallback(
        (value: string) => {
            const next = value as GuidePageType
            setParams({
                guideType: next === 'COST' ? 'cost' : null,
                page: null,
            })
        },
        [setParams]
    )

    const [createOpen, setCreateOpen] = useState(false)
    const [editOpen, setEditOpen] = useState(false)
    const [editing, setEditing] = useState<GuidePage | null>(null)

    const [deleteOpen, setDeleteOpen] = useState(false)
    const [deleting, setDeleting] = useState<GuidePage | null>(null)

    const { data, isLoading, isFetching, error } = useGetGuidePagesQuery({
        page,
        limit,
        searchTerm: search || undefined,
        type: activeGuideType,
    })

    const [deletePage, { isLoading: deleteLoading }] = useDeleteGuidePageMutation()

    const rows = data?.data ?? []
    const pagination = data?.pagination
    const totalItems = pagination?.total ?? rows.length
    const itemsPerPage = pagination?.limit ?? limit
    const totalPages =
        pagination?.totalPage ??
        (itemsPerPage ? Math.max(1, Math.ceil(totalItems / itemsPerPage)) : 1)
    const currentPage = pagination?.page ?? page
    const hasBackendPagination = typeof pagination?.total === 'number'

    const openEdit = (row: GuidePage) => {
        setEditing(row)
        setEditOpen(true)
    }

    const openDelete = (row: GuidePage) => {
        setDeleting(row)
        setDeleteOpen(true)
    }

    const handleDelete = async () => {
        if (!deleting) return
        try {
            await deletePage(deleting._id).unwrap()
            toast({ title: 'Guide page deleted', variant: 'success' })
            setDeleteOpen(false)
            setDeleting(null)
        } catch (e) {
            toast({ title: extractErrorMessage(e), variant: 'destructive' })
        }
    }

    const listLoading = isLoading || isFetching
    const addLabel =
        activeGuideType === 'PROBLEM' ? 'Add problem guide' : 'Add cost guide'
    const searchPlaceholder =
        activeGuideType === 'PROBLEM'
            ? 'Search problem guides…'
            : 'Search cost guides…'

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="space-y-6"
        >
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Guide Pages</h1>
                    <p className="text-muted-foreground text-sm">
                        Manage problem and cost guides linked to services and regions.
                    </p>
                </div>
                <Button
                    type="button"
                    className="rounded-full shrink-0"
                    onClick={() => setCreateOpen(true)}
                >
                    <Plus className="h-4 w-4 mr-2" />
                    {addLabel}
                </Button>
            </div>

            <Card>
                <CardContent className="p-0">
                    <div className="p-6 pb-0 space-y-4">
                        <Tabs
                            value={activeGuideType}
                            onValueChange={handleGuideTabChange}
                            className="w-full"
                        >
                            <TabsList className="flex h-auto min-h-12 max-w-[260px] flex-wrap justify-start gap-1 rounded-xl bg-gray-100 sm:w-auto">
                                <TabsTrigger
                                    value="PROBLEM"
                                    className="rounded-xl px-4 py-3 text-xs sm:text-sm"
                                >
                                    {GUIDE_TAB_LABEL.PROBLEM}
                                </TabsTrigger>
                                <TabsTrigger
                                    value="COST"
                                    className="rounded-xl px-4 py-3 text-xs sm:text-sm"
                                >
                                    {GUIDE_TAB_LABEL.COST}
                                </TabsTrigger>
                            </TabsList>
                        </Tabs>

                        <div className="flex justify-end">
                            <SearchInput
                                value={search}
                                onChange={(val) => {
                                    setSearch(val)
                                    setPage(1)
                                }}
                                debounceMs={500}
                                placeholder={searchPlaceholder}
                                className="w-full sm:w-80"
                            />
                        </div>
                    </div>

                    <div className="pt-4">
                        {listLoading ? (
                            <div className="px-6 py-10 text-center text-muted-foreground">
                                Loading…
                            </div>
                        ) : error ? (
                            <div className="px-6 py-10 text-center text-destructive">
                                Error loading data. Please try again.
                            </div>
                        ) : (
                            <>
                                <GuidePagesTable
                                    rows={rows}
                                    startIndex={(currentPage - 1) * itemsPerPage}
                                    hideTypeColumn
                                    onEdit={openEdit}
                                    onDelete={openDelete}
                                />

                                {hasBackendPagination && totalPages > 1 && (
                                    <div className="mt-4 pt-4 border-t border-gray-100">
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
                                        />
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </CardContent>
            </Card>

            <AddEditGuidePageModal
                open={createOpen}
                onClose={() => setCreateOpen(false)}
                mode="create"
                lockedGuideType={activeGuideType}
            />

            <AddEditGuidePageModal
                open={editOpen}
                onClose={() => {
                    setEditOpen(false)
                    setEditing(null)
                }}
                mode="edit"
                row={editing}
                lockedGuideType={activeGuideType}
            />

            <ConfirmDialog
                open={deleteOpen}
                onClose={() => {
                    setDeleteOpen(false)
                    setDeleting(null)
                }}
                onConfirm={handleDelete}
                title="Delete guide page"
                description={
                    deleting ? `Remove "${deleting.title}"? This cannot be undone.` : ''
                }
                confirmText="Delete"
                variant="danger"
                isLoading={deleteLoading}
            />
        </motion.div>
    )
}
