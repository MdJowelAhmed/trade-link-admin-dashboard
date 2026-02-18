import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { SearchInput } from '@/components/common/SearchInput'
import { Pagination } from '@/components/common/Pagination'
import { TradePersonFilterDropdown } from './components/TradePersonFilterDropdown'
import { TradePersonTable } from './components/TradePersonTable'
import { ViewTradePersonDetailsModal } from './components/ViewTradePersonDetailsModal'
import { UpdateStatusModal } from './components/UpdateStatusModal'
import { UpdateAmountModal } from './components/UpdateAmountModal'
import { useAppDispatch, useAppSelector } from '@/redux/hooks'
import {
  setError,
  setFilters,
  setLoading,
  setPagination,
  setTradePersonStatus,
  setTradePersons,
  updateTradePersonWallet,
} from '@/redux/slices/tradePersonSlice'
import { useUrlNumber, useUrlString } from '@/hooks/useUrlState'
import { toast } from '@/utils/toast'
import type { TradePerson, TradePersonStatus, ProfessionalDocumentType } from '@/types'
import {
  useGetBonusManagementQuery,
  useUpdateBonusManagementAmountMutation,
  useUpdateBonusManagementStatusMutation,
  type BackendProfessional,
} from '@/redux/api/bonusManageApi'

const mapApproveStatusToTradePersonStatus = (
  status: BackendProfessional['professional']['approveStatus']
): TradePersonStatus => {
  if (status === 'APPROVED') return 'approved'
  if (status === 'REJECTED') return 'rejected'
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
    walletBalance: professional.walletBalance,
    verificationDocuments: professional.professional?.verificationDocuments?.map(
      (doc) => ({
        _id: doc._id,
        documentType: doc.documentType as ProfessionalDocumentType,
        documentPath: doc.documentPath,
        uploadedAt: doc.uploadedAt,
      })
    ),
    createdAt: professional.createdAt,
    updatedAt: professional.updatedAt,
  }
}

export default function TradePersonManagement() {
  const dispatch = useAppDispatch()

  // Modal state
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [selectedTradePerson, setSelectedTradePerson] = useState<TradePerson | null>(null)

  // Amount update modal state
  const [isAmountModalOpen, setIsAmountModalOpen] = useState(false)

  // Status update modal state
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false)
  const [statusToUpdate, setStatusToUpdate] = useState<'APPROVED' | 'REJECTED' | null>(null)

  // URL state management
  const [searchQuery, setSearchQuery] = useUrlString('search', '')
  const [statusFilter, setStatusFilter] = useUrlString('status', 'all')
  const [currentPage, setCurrentPage] = useUrlNumber('page', 1)
  const [itemsPerPage, setItemsPerPage] = useUrlNumber('limit', 10)

  // Map frontend status filter to backend status
  const backendStatusFilter = useMemo(() => {
    if (statusFilter === 'all') return undefined
    if (statusFilter === 'pending') return 'PENDING' as const
    if (statusFilter === 'approved') return 'APPROVED' as const
    if (statusFilter === 'rejected') return 'REJECTED' as const
    return undefined
  }, [statusFilter])

  // Backend data (professionals)
  const {
    data: professionalsResponse,
    isLoading: isProfessionalsLoading,
    isFetching: isProfessionalsFetching,
    isError: isProfessionalsError,
    error: professionalsError,
  } = useGetBonusManagementQuery({
    searchTerm: searchQuery || undefined,
    page: currentPage,
    limit: itemsPerPage,
    status: backendStatusFilter,
  })

  // API mutations
  const [updateAmount, { isLoading: isAmountUpdating }] =
    useUpdateBonusManagementAmountMutation()
  const [updateStatus, { isLoading: isStatusUpdating }] =
    useUpdateBonusManagementStatusMutation()

  // Redux state (pagination is synced from API response)
  const { pagination } = useAppSelector(
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

    // Update pagination from API response
    if (professionalsResponse.pagination) {
      dispatch(setPagination({
        page: professionalsResponse.pagination.page,
        limit: professionalsResponse.pagination.limit,
        total: professionalsResponse.pagination.total,
        totalPages: professionalsResponse.pagination.totalPage,
      }))
    }
  }, [dispatch, professionalsResponse])

  // Error handling
  useEffect(() => {
    if (isProfessionalsError) {
      const errorMessage =
        professionalsError && typeof professionalsError === 'object' && 'data' in professionalsError
          ? // @ts-expect-error – RTK Query error shape
            (professionalsError.data?.message as string | undefined)
          : undefined

      dispatch(setError(errorMessage || 'Failed to load professionals'))
      toast({
        title: 'Error',
        description: errorMessage || 'Failed to load professionals. Please try again.',
        variant: 'destructive',
      })
    } else {
      dispatch(setError(null))
    }
  }, [dispatch, isProfessionalsError, professionalsError])

  // Sync filters to Redux (for reference, filtering is handled server-side)
  useEffect(() => {
    dispatch(
      setFilters({
        search: searchQuery,
        status: statusFilter as TradePersonStatus | 'all',
      })
    )
  }, [searchQuery, statusFilter, dispatch])

  // Map backend data to trade persons (no client-side filtering needed)
  const tradePersonsData = useMemo(() => {
    if (!professionalsResponse?.data) return []
    return professionalsResponse.data.map(mapBackendProfessionalToTradePerson)
  }, [professionalsResponse])

  // Pagination from API response (backend handles filtering)
  const totalPages = professionalsResponse?.pagination?.totalPage || pagination.totalPages
  const totalItems = professionalsResponse?.pagination?.total || 0

  // Calculate start index for SL column
  const startIndex = (currentPage - 1) * itemsPerPage

  // Handlers
  const handleView = (tradePerson: TradePerson) => {
    setSelectedTradePerson(tradePerson)
    setIsViewModalOpen(true)
  }

  const handleUpdateAmount = (tradePerson: TradePerson) => {
    setSelectedTradePerson(tradePerson)
    setIsAmountModalOpen(true)
  }

  const handleApprove = (tradePerson: TradePerson) => {
    setSelectedTradePerson(tradePerson)
    setStatusToUpdate('APPROVED')
    setIsStatusModalOpen(true)
  }

  const handleReject = (tradePerson: TradePerson) => {
    setSelectedTradePerson(tradePerson)
    setStatusToUpdate('REJECTED')
    setIsStatusModalOpen(true)
  }

  const handleConfirmAmount = async (id: string, amount: number) => {
    try {
      await updateAmount({
        id,
        payload: { amount },
      }).unwrap()

      // Update Redux state
      dispatch(updateTradePersonWallet({ id, walletBalance: amount }))

      toast({
        title: 'Success',
        description: 'Wallet amount updated successfully.',
        variant: 'success',
      })
      setIsAmountModalOpen(false)
      setSelectedTradePerson(null)
    } catch (error: unknown) {
      const errorMessage =
        error && typeof error === 'object' && 'data' in error &&
        error.data && typeof error.data === 'object' && 'message' in error.data
          ? String(error.data.message)
          : 'Failed to update amount. Please try again.'

      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      })
    }
  }

  const handleConfirmStatus = async (id: string, status: 'APPROVED' | 'REJECTED') => {
    try {
      await updateStatus({
        id,
        payload: { status },
      }).unwrap()

      // Update local state
      const newStatus: TradePersonStatus = status === 'APPROVED' ? 'approved' : 'rejected'
      dispatch(setTradePersonStatus({ id, status: newStatus }))

      toast({
        title: 'Success',
        description: `Trade person ${status.toLowerCase()} successfully.`,
        variant: 'success',
      })
      setIsStatusModalOpen(false)
      setSelectedTradePerson(null)
      setStatusToUpdate(null)
    } catch (error: unknown) {
      const errorMessage =
        error && typeof error === 'object' && 'data' in error &&
        error.data && typeof error.data === 'object' && 'message' in error.data
          ? String(error.data.message)
          : 'Failed to update status. Please try again.'

      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      })
    }
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
          {/* Loading State */}
          {(isProfessionalsLoading || isProfessionalsFetching) && (
            <div className="flex items-center justify-center py-12">
              <div className="text-sm text-gray-500">Loading trade persons...</div>
            </div>
          )}

          {/* Table */}
          {!isProfessionalsLoading && !isProfessionalsFetching && (
            <>
              <TradePersonTable
                tradePersons={tradePersonsData}
                onView={handleView}
                onUpdateAmount={handleUpdateAmount}
                onApprove={handleApprove}
                onReject={handleReject}
                startIndex={startIndex}
              />

              {/* Pagination */}
              <div className="px-6 py-4 border-t border-gray-100">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={totalItems}
                  itemsPerPage={itemsPerPage}
                  onPageChange={handlePageChange}
                  onItemsPerPageChange={handleItemsPerPageChange}
                />
              </div>
            </>
          )}
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

      {/* Update Amount Modal */}
      <UpdateAmountModal
        open={isAmountModalOpen}
        onClose={() => {
          setIsAmountModalOpen(false)
          setSelectedTradePerson(null)
        }}
        tradePerson={selectedTradePerson}
        onConfirm={handleConfirmAmount}
        isLoading={isAmountUpdating}
      />

      {/* Status Update Modal */}
      <UpdateStatusModal
        open={isStatusModalOpen}
        onClose={() => {
          setIsStatusModalOpen(false)
          setSelectedTradePerson(null)
          setStatusToUpdate(null)
        }}
        tradePerson={selectedTradePerson}
        status={statusToUpdate}
        onConfirm={handleConfirmStatus}
        isLoading={isStatusUpdating}
      />
    </motion.div>
  )
}
