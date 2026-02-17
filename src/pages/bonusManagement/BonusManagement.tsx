import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { SearchInput } from '@/components/common/SearchInput'
import { Pagination } from '@/components/common/Pagination'
import { useAppDispatch, useAppSelector } from '@/redux/hooks'
import {
  setProfessionals,
  setPagination,
  updateProfessionalWallet,
  updateProfessionalStatus,
} from '@/redux/slices/bonusManageSlice'
import { useUrlString, useUrlNumber } from '@/hooks/useUrlState'
import { toast } from '@/utils/toast'
import {
  useGetBonusManagementQuery,
  useUpdateBonusManagementAmountMutation,
  useUpdateBonusManagementStatusMutation,
} from '@/redux/api/bonusManageApi'
import { BonusTable } from './components/BonusTable'
import { UpdateAmountModal } from './components/UpdateAmountModal'
import { UpdateStatusModal } from './components/UpdateStatusModal'
import type { BackendProfessional } from '@/redux/api/bonusManageApi'

export default function BonusManagement() {
  const dispatch = useAppDispatch()

  // Modal state
  const [isAmountModalOpen, setIsAmountModalOpen] = useState(false)
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false)
  const [selectedProfessional, setSelectedProfessional] = useState<BackendProfessional | null>(null)
  const [statusToUpdate, setStatusToUpdate] = useState<'APPROVED' | 'REJECTED' | null>(null)

  // URL state management
  const [searchQuery, setSearchQuery] = useUrlString('search', '')
  const [currentPage, setCurrentPage] = useUrlNumber('page', 1)
  const [itemsPerPage, setItemsPerPage] = useUrlNumber('limit', 10)

  // API query
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
  })

  const [updateAmount, { isLoading: isAmountUpdating }] =
    useUpdateBonusManagementAmountMutation()
  const [updateStatus, { isLoading: isStatusUpdating }] =
    useUpdateBonusManagementStatusMutation()

  // Redux state
  const { list, pagination } = useAppSelector((state) => state.bonusManagement)

  // Sync backend professionals into Redux store
  useEffect(() => {
    if (professionalsResponse?.data && Array.isArray(professionalsResponse.data)) {
      dispatch(setProfessionals(professionalsResponse.data))

      // Update pagination from API response
      if (professionalsResponse.pagination) {
        dispatch(setPagination({
          page: professionalsResponse.pagination.page,
          limit: professionalsResponse.pagination.limit,
          total: professionalsResponse.pagination.total,
          totalPages: professionalsResponse.pagination.totalPage,
        }))
      }
    }
  }, [professionalsResponse, dispatch])

  // Error handling
  useEffect(() => {
    if (isProfessionalsError) {
      const errorMessage =
        professionalsError && typeof professionalsError === 'object' && 'data' in professionalsError
          ? // @ts-expect-error – RTK Query error shape
            (professionalsError.data?.message as string | undefined)
          : undefined

      toast({
        title: 'Error',
        description: errorMessage || 'Failed to load professionals. Please try again.',
        variant: 'destructive',
      })
    }
  }, [isProfessionalsError, professionalsError])

  // Pagination from API response
  const totalPages = professionalsResponse?.pagination?.totalPage || pagination.totalPages
  const totalItems = professionalsResponse?.pagination?.total || list.length

  // Calculate start index for SL column
  const startIndex = (currentPage - 1) * itemsPerPage

  // Handlers
  const handleUpdateAmount = (professional: BackendProfessional) => {
    setSelectedProfessional(professional)
    setIsAmountModalOpen(true)
  }

  const handleApprove = (professional: BackendProfessional) => {
    setSelectedProfessional(professional)
    setStatusToUpdate('APPROVED')
    setIsStatusModalOpen(true)
  }

  const handleReject = (professional: BackendProfessional) => {
    setSelectedProfessional(professional)
    setStatusToUpdate('REJECTED')
    setIsStatusModalOpen(true)
  }

  const handleConfirmAmount = async (id: string, amount: number) => {
    try {
      await updateAmount({
        id,
        payload: { amount },
      }).unwrap()

      dispatch(updateProfessionalWallet({ id, amount }))
      toast({
        title: 'Success',
        description: 'Wallet amount updated successfully.',
        variant: 'success',
      })
      setIsAmountModalOpen(false)
      setSelectedProfessional(null)
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

      dispatch(updateProfessionalStatus({ id, approveStatus: status }))
      toast({
        title: 'Success',
        description: `Professional ${status.toLowerCase()} successfully.`,
        variant: 'success',
      })
      setIsStatusModalOpen(false)
      setSelectedProfessional(null)
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
      <Card className="bg-white border-0 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-6">
          <CardTitle className="text-xl font-bold text-slate-800">
            Bonus Management
          </CardTitle>
          <div className="flex items-center gap-3">
            {/* Search Input */}
            <SearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search here"
              className="w-[300px]"
            />
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {/* Loading State */}
          {(isProfessionalsLoading || isProfessionalsFetching) && (
            <div className="flex items-center justify-center py-12">
              <div className="text-sm text-gray-500">Loading professionals...</div>
            </div>
          )}

          {/* Table */}
          {!isProfessionalsLoading && !isProfessionalsFetching && (
            <>
              <BonusTable
                professionals={list}
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

      {/* Update Amount Modal */}
      <UpdateAmountModal
        open={isAmountModalOpen}
        onClose={() => {
          setIsAmountModalOpen(false)
          setSelectedProfessional(null)
        }}
        professional={selectedProfessional}
        onConfirm={handleConfirmAmount}
        isLoading={isAmountUpdating}
      />      {/* Update Status Modal */}
      <UpdateStatusModal
        open={isStatusModalOpen}
        onClose={() => {
          setIsStatusModalOpen(false)
          setSelectedProfessional(null)
          setStatusToUpdate(null)
        }}
        professional={selectedProfessional}
        status={statusToUpdate}
        onConfirm={handleConfirmStatus}
        isLoading={isStatusUpdating}
      />
    </motion.div>
  )
}
