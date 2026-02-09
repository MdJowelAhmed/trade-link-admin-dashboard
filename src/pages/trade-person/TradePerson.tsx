import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { SearchInput } from '@/components/common/SearchInput'
import { Pagination } from '@/components/common/Pagination'
import { TradePersonFilterDropdown } from './components/TradePersonFilterDropdown'
import { TradePersonTable } from './components/TradePersonTable'
import { ViewTradePersonDetailsModal } from './components/ViewTradePersonDetailsModal'
import { UpdateStatusModal } from './components/UpdateStatusModal'
import { useAppDispatch, useAppSelector } from '@/redux/hooks'
import {
  approveTradePerson,
  clearFilters,
  rejectTradePerson,
  setError,
  setFilters,
  setLimit,
  setLoading,
  setPage,
  setTradePersonStatus,
  setTradePersons,
} from '@/redux/slices/tradePersonSlice'
import { useUrlNumber, useUrlString } from '@/hooks/useUrlState'
import { toast } from '@/utils/toast'
import type { TradePerson, TradePersonStatus } from '@/types'
import {
  useGetBonusManagementQuery,
  type BackendProfessional,
} from '@/redux/api/bonusManageApi'

const mapApproveStatusToTradePersonStatus = (
  approveStatus: BackendProfessional['professional']['approveStatus']
): TradePersonStatus => {
  if (approveStatus === 'APPROVED') return 'approved'
  if (approveStatus === 'REJECTED') return 'rejected'
  return 'pending'
}

const mapBackendProfessionalToTradePerson = (
  professional: BackendProfessional
): TradePerson => {
  const address = professional.professional?.address || ''

  return {
    id: professional._id,
    businessName: professional.name,
    ownerName: professional.name,
    services: professional.professional?.services ?? [],
    email: professional.email,
    mobile: professional.phone || '',
    location: address,
    address,
    status: mapApproveStatusToTradePersonStatus(
      professional.professional?.approveStatus
    ),
    avatar: undefined,
    galleryImages: [],
    createdAt: professional.createdAt,
    updatedAt: professional.updatedAt,
  }
}

export default function TradePersonManagement() {
  const dispatch = useAppDispatch()

  // Modal state
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [selectedTradePerson, setSelectedTradePerson] = useState<TradePerson | null>(null)

  // Status update modal state
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false)
  const [statusModalAction, setStatusModalAction] = useState<{
    type: 'approve' | 'reject' | 'toggle'
    tradePerson: TradePerson
  } | null>(null)
  const [isStatusModalLoading, setIsStatusModalLoading] = useState(false)

  // Backend data (professionals)
  const {
    data: professionalsResponse,
    isLoading: isProfessionalsLoading,
    isError: isProfessionalsError,
  } = useGetBonusManagementQuery()

  // URL state management
  const [searchQuery, setSearchQuery] = useUrlString('search', '')
  const [statusFilter, setStatusFilter] = useUrlString('status', 'all')
  const [currentPage, setCurrentPage] = useUrlNumber('page', 1)
  const [itemsPerPage, setItemsPerPage] = useUrlNumber('limit', 10)

  // Redux state
  const { filteredList, pagination } = useAppSelector(
    (state) => state.tradePersons
  )

  // Sync backend loading & error to Redux
  useEffect(() => {
    dispatch(setLoading(isProfessionalsLoading))
    if (isProfessionalsError) {
      dispatch(setError('Failed to load professionals'))
    } else {
      dispatch(setError(null))
    }
  }, [dispatch, isProfessionalsLoading, isProfessionalsError])

  // Load professionals from backend into trade person list
  useEffect(() => {
    if (!professionalsResponse?.data) return

    const mappedTradePersons = professionalsResponse.data.map(
      mapBackendProfessionalToTradePerson
    )

    dispatch(setTradePersons(mappedTradePersons))

    // Reset filters when new backend data arrives
    dispatch(clearFilters())
  }, [dispatch, professionalsResponse])

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
    setStatusModalAction({ type: 'toggle', tradePerson })
    setIsStatusModalOpen(true)
  }

  const handleApprove = (tradePerson: TradePerson) => {
    setStatusModalAction({ type: 'approve', tradePerson })
    setIsStatusModalOpen(true)
  }

  const handleReject = (tradePerson: TradePerson) => {
    setStatusModalAction({ type: 'reject', tradePerson })
    setIsStatusModalOpen(true)
  }

  const handleStatusUpdate = async (id: string, status: 'approved' | 'rejected') => {
    if (!statusModalAction) return

    setIsStatusModalLoading(true)
    try {
      if (statusModalAction.type === 'toggle') {
        dispatch(setTradePersonStatus({ id, status }))
        toast({
          title: 'Success',
          description: `${statusModalAction.tradePerson.businessName} status changed to ${status}.`,
          variant: 'success',
        })
      } else if (status === 'approved') {
        dispatch(approveTradePerson(id))
        toast({
          title: 'Success',
          description: `${statusModalAction.tradePerson.businessName} has been approved.`,
          variant: 'success',
        })
      } else {
        dispatch(rejectTradePerson(id))
        toast({
          title: 'Success',
          description: `${statusModalAction.tradePerson.businessName} has been rejected.`,
          variant: 'success',
        })
      }

      setIsViewModalOpen(false)
      setIsStatusModalOpen(false)
      setStatusModalAction(null)
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update trade person status. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsStatusModalLoading(false)
    }
  }

  const getStatusModalStatus = (): 'approved' | 'rejected' | null => {
    if (!statusModalAction) return null

    const { type, tradePerson } = statusModalAction

    if (type === 'approve') {
      return 'approved'
    }

    if (type === 'reject') {
      return 'rejected'
    }

    if (type === 'toggle') {
      return tradePerson.status === 'approved' ? 'rejected' : 'approved'
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

      {/* Status Update Modal */}
      {statusModalAction && (
        <UpdateStatusModal
          open={isStatusModalOpen}
          onClose={() => {
            setIsStatusModalOpen(false)
            setStatusModalAction(null)
          }}
          tradePerson={statusModalAction.tradePerson}
          status={getStatusModalStatus()}
          onConfirm={handleStatusUpdate}
          isLoading={isStatusModalLoading}
        />
      )}
    </motion.div>
  )
}
