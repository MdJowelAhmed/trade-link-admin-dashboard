import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { SearchInput } from '@/components/common/SearchInput'
import { Pagination } from '@/components/common/Pagination'
import { TradePersonFilterDropdown } from './components/TradePersonFilterDropdown'
import { TradePersonTable } from './components/TradePersonTable'
import { ViewTradePersonDetailsModal } from './components/ViewTradePersonDetailsModal'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { useAppDispatch, useAppSelector } from '@/redux/hooks'
import { 
  setFilters, 
  setPage, 
  setLimit, 
  setTradePersonStatus,
  approveTradePerson,
  rejectTradePerson 
} from '@/redux/slices/tradePersonSlice'
import { useUrlString, useUrlNumber } from '@/hooks/useUrlState'
import { toast } from '@/utils/toast'
import type { TradePerson, TradePersonStatus } from '@/types'

export default function TradePersonManagement() {
  const dispatch = useAppDispatch()

  // Modal state
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [selectedTradePerson, setSelectedTradePerson] = useState<TradePerson | null>(null)

  // Confirmation dialog state
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const [confirmAction, setConfirmAction] = useState<{
    type: 'approve' | 'reject' | 'toggle'
    tradePerson: TradePerson
  } | null>(null)
  const [isConfirmLoading, setIsConfirmLoading] = useState(false)

  // URL state management
  const [searchQuery, setSearchQuery] = useUrlString('search', '')
  const [statusFilter, setStatusFilter] = useUrlString('status', 'all')
  const [currentPage, setCurrentPage] = useUrlNumber('page', 1)
  const [itemsPerPage, setItemsPerPage] = useUrlNumber('limit', 10)

  // Redux state
  const { filteredList, pagination } = useAppSelector(
    (state) => state.tradePersons
  )

  // Sync URL state with Redux filters
  useEffect(() => {
    dispatch(
      setFilters({
        search: searchQuery,
        status: statusFilter as TradePersonStatus | 'all',
      })
    )
  }, [searchQuery, statusFilter, dispatch])

  // Sync URL pagination with Redux
  useEffect(() => {
    dispatch(setPage(currentPage))
  }, [currentPage, dispatch])

  useEffect(() => {
    dispatch(setLimit(itemsPerPage))
  }, [itemsPerPage, dispatch])

  // Pagination
  const totalPages = pagination.totalPages
  const paginatedData = useMemo(() => {
    const startIndex = (pagination.page - 1) * pagination.limit
    return filteredList.slice(startIndex, startIndex + pagination.limit)
  }, [filteredList, pagination.page, pagination.limit])

  // Handlers
  const handleView = (tradePerson: TradePerson) => {
    setSelectedTradePerson(tradePerson)
    setIsViewModalOpen(true)
  }

  const handleToggleStatus = (tradePerson: TradePerson) => {
    setConfirmAction({ type: 'toggle', tradePerson })
    setIsConfirmOpen(true)
  }

  const handleApprove = (tradePerson: TradePerson) => {
    setConfirmAction({ type: 'approve', tradePerson })
    setIsConfirmOpen(true)
  }

  const handleReject = (tradePerson: TradePerson) => {
    setConfirmAction({ type: 'reject', tradePerson })
    setIsConfirmOpen(true)
  }

  const handleConfirmAction = async () => {
    if (!confirmAction) return

    setIsConfirmLoading(true)
    try {
      const { type, tradePerson } = confirmAction

      if (type === 'approve') {
        dispatch(approveTradePerson(tradePerson.id))
        toast({
          title: 'Success',
          description: `${tradePerson.businessName} has been approved.`,
          variant: 'success',
        })
        setIsViewModalOpen(false)
      } else if (type === 'reject') {
        dispatch(rejectTradePerson(tradePerson.id))
        toast({
          title: 'Success',
          description: `${tradePerson.businessName} has been rejected.`,
          variant: 'success',
        })
        setIsViewModalOpen(false)
      } else if (type === 'toggle') {
        const nextStatus: TradePersonStatus =
          tradePerson.status === 'approved' ? 'rejected' : 'approved'
        dispatch(setTradePersonStatus({ id: tradePerson.id, status: nextStatus }))
        toast({
          title: 'Success',
          description: `${tradePerson.businessName} status changed to ${nextStatus}.`,
          variant: 'success',
        })
      }

      setIsConfirmOpen(false)
      setConfirmAction(null)
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update trade person status. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsConfirmLoading(false)
    }
  }

  const getConfirmDialogConfig = () => {
    if (!confirmAction) return null

    const { type, tradePerson } = confirmAction

    if (type === 'approve') {
      return {
        title: 'Approve Trade Person',
        description: `Are you sure you want to approve ${tradePerson.businessName}?`,
        variant: 'info' as const,
        confirmText: 'Approve',
      }
    }

    if (type === 'reject') {
      return {
        title: 'Reject Trade Person',
        description: `Are you sure you want to reject ${tradePerson.businessName}?`,
        variant: 'danger' as const,
        confirmText: 'Reject',
      }
    }

    if (type === 'toggle') {
      const nextStatus = tradePerson.status === 'approved' ? 'rejected' : 'approved'
      return {
        title: 'Change Status',
        description: `Are you sure you want to change ${tradePerson.businessName}'s status to ${nextStatus}?`,
        variant: 'warning' as const,
        confirmText: 'Change Status',
      }
    }

    return null
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handleItemsPerPageChange = (limit: number) => {
    setItemsPerPage(limit)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <Card className="bg-white border-0 shadow-sm rounded-2xl overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between pb-6">
          <CardTitle className="text-xl font-bold text-slate-800">
            Trade Person
          </CardTitle>
          <div className="flex items-center gap-3">
            {/* Filter Dropdown */}
            <TradePersonFilterDropdown
              value={statusFilter as TradePersonStatus | 'all'}
              onChange={setStatusFilter}
            />

            {/* Search Input */}
            <SearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search here"
              className="w-[200px]"
            />
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {/* Table */}
          <TradePersonTable
            tradePersons={paginatedData}
            onView={handleView}
            onToggleStatus={handleToggleStatus}
          />

          {/* Pagination */}
          <div className="px-6 py-4 border-t border-gray-100">
            <Pagination
              currentPage={pagination.page}
              totalPages={totalPages}
              totalItems={filteredList.length}
              itemsPerPage={pagination.limit}
              onPageChange={handlePageChange}
              onItemsPerPageChange={handleItemsPerPageChange}
            />
          </div>
        </CardContent>
      </Card>

      {/* View Trade Person Details Modal */}
      <ViewTradePersonDetailsModal
        open={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false)
          setSelectedTradePerson(null)
        }}
        tradePerson={selectedTradePerson}
        onApprove={handleApprove}
        onReject={handleReject}
      />

      {/* Confirmation Dialog */}
      {confirmAction && getConfirmDialogConfig() && (
        <ConfirmDialog
          open={isConfirmOpen}
          onClose={() => {
            setIsConfirmOpen(false)
            setConfirmAction(null)
          }}
          onConfirm={handleConfirmAction}
          title={getConfirmDialogConfig()!.title}
          description={getConfirmDialogConfig()!.description}
          variant={getConfirmDialogConfig()!.variant}
          confirmText={getConfirmDialogConfig()!.confirmText}
          isLoading={isConfirmLoading}
        />
      )}
    </motion.div>
  )
}
