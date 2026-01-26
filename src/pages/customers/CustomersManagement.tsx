import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { SearchInput } from '@/components/common/SearchInput'
import { Pagination } from '@/components/common/Pagination'
import { CustomerFilterDropdown } from './components/CustomerFilterDropdown'
import { CustomerTable } from './components/CustomerTable'
import { ViewCustomerDetailsModal } from './components/ViewCustomerDetailsModal'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { useAppDispatch, useAppSelector } from '@/redux/hooks'
import { setFilters, setPage, setLimit, setCustomerStatus } from '@/redux/slices/customerSlice'
import { useUrlString, useUrlNumber } from '@/hooks/useUrlState'
import { toast } from '@/utils/toast'
import type { Customer, CustomerStatus } from '@/types'

export default function CustomersManagement() {
  const dispatch = useAppDispatch()

  // Modal state
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)

  // Confirmation dialog state
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const [confirmAction, setConfirmAction] = useState<{
    type: 'toggle'
    customer: Customer
  } | null>(null)
  const [isConfirmLoading, setIsConfirmLoading] = useState(false)

  // URL state management
  const [searchQuery, setSearchQuery] = useUrlString('search', '')
  const [statusFilter, setStatusFilter] = useUrlString('status', 'all')
  const [currentPage, setCurrentPage] = useUrlNumber('page', 1)
  const [itemsPerPage, setItemsPerPage] = useUrlNumber('limit', 10)

  // Redux state
  const { filteredList, pagination } = useAppSelector(
    (state) => state.customers
  )

  // Sync URL state with Redux filters
  useEffect(() => {
    dispatch(
      setFilters({
        search: searchQuery,
        status: statusFilter as CustomerStatus | 'all',
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
  const handleView = (customer: Customer) => {
    setSelectedCustomer(customer)
    setIsViewModalOpen(true)
  }

  const handleToggleStatus = (customer: Customer) => {
    setConfirmAction({ type: 'toggle', customer })
    setIsConfirmOpen(true)
  }

  const handleConfirmAction = async () => {
    if (!confirmAction) return

    setIsConfirmLoading(true)
    try {
      const { type, customer } = confirmAction

      if (type === 'toggle') {
        const nextStatus: CustomerStatus =
          customer.status === 'active' ? 'inactive' : 'active'
        dispatch(setCustomerStatus({ id: customer.id, status: nextStatus }))
        toast({
          title: 'Success',
          description: `${customer.userName} is now ${nextStatus}.`,
          variant: 'success',
        })
      }

      setIsConfirmOpen(false)
      setConfirmAction(null)
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update customer status. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsConfirmLoading(false)
    }
  }

  const getConfirmDialogConfig = () => {
    if (!confirmAction) return null

    const { type, customer } = confirmAction

    if (type === 'toggle') {
      const nextStatus = customer.status === 'active' ? 'inactive' : 'active'
      return {
        title: 'Change Status',
        description: `Are you sure you want to change ${customer.userName}'s status to ${nextStatus}?`,
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
      <Card className="bg-white border-0 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-6">
          <CardTitle className="text-xl font-bold text-slate-800">
            Customers
          </CardTitle>
          <div className="flex items-center gap-3">
            {/* Search Input */}
            <SearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search here"
              className="w-[300px]"
            />

            {/* Filter Dropdown */}
            <CustomerFilterDropdown
              value={statusFilter as CustomerStatus | 'all'}
              onChange={setStatusFilter}
            />
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {/* Table */}
          <CustomerTable
            customers={paginatedData}
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

      {/* View Customer Details Modal */}
      <ViewCustomerDetailsModal
        open={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false)
          setSelectedCustomer(null)
        }}
        customer={selectedCustomer}
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
