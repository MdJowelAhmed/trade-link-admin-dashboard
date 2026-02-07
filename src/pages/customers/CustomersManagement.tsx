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
import { setCustomers, setPage, setLimit, setPagination, setCustomerStatus } from '@/redux/slices/customerSlice'
import { useUrlString, useUrlNumber } from '@/hooks/useUrlState'
import { toast } from '@/utils/toast'
import { useGetCustomersQuery, useStatusUpdateCustomerMutation } from '@/redux/api/customersApi'
import { imageUrl } from '@/utils/imageUrl'
import type { Customer, CustomerStatus } from '@/types'
import type { BackendCustomer } from '@/redux/api/customersApi'

// Map backend customer status to UI CustomerStatus
const mapBackendStatusToCustomerStatus = (status: string): CustomerStatus => {
  return status === 'ACTIVE' ? 'active' : 'inactive'
}

// Map backend customer to UI Customer
const mapBackendCustomerToCustomer = (item: BackendCustomer): Customer => {
  return {
    id: item._id,
    userName: item.name,
    contact: item.phone || '',
    email: item.email,
    location: item.customer?.address || '',
    status: mapBackendStatusToCustomerStatus(item.status),
    avatar: item.customer?.profileImage ? imageUrl(item.customer.profileImage) : undefined,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  }
}

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

  // URL state management
  const [searchQuery, setSearchQuery] = useUrlString('search', '')
  const [statusFilter, setStatusFilter] = useUrlString('status', 'all')
  const [currentPage, setCurrentPage] = useUrlNumber('page', 1)
  const [itemsPerPage, setItemsPerPage] = useUrlNumber('limit', 10)

  // API query - convert status filter to uppercase for backend
  const backendStatus = statusFilter !== 'all' ? statusFilter.toUpperCase() : undefined
  const {
    data: customersResponse,
    isLoading: isCustomersLoading,
    isFetching: isCustomersFetching,
    isError: isCustomersError,
    error: customersError,
  } = useGetCustomersQuery({
    searchTerm: searchQuery || undefined,
    status: backendStatus,
    page: currentPage,
    limit: itemsPerPage,
  })

  const [updateCustomerStatus, { isLoading: isStatusUpdating }] =
    useStatusUpdateCustomerMutation()

  // Redux state
  const { list, pagination } = useAppSelector((state) => state.customers)

  // Sync backend customers into Redux store
  useEffect(() => {
    if (customersResponse?.data && Array.isArray(customersResponse.data)) {
      const mappedCustomers: Customer[] = customersResponse.data.map(mapBackendCustomerToCustomer)

      dispatch(setCustomers(mappedCustomers))

      // Update pagination from API response
      if (customersResponse.pagination) {
        dispatch(setPagination({
          page: customersResponse.pagination.page,
          limit: customersResponse.pagination.limit,
          total: customersResponse.pagination.total,
          totalPages: customersResponse.pagination.totalPage,
        }))
      }
    }
  }, [customersResponse, dispatch])

  // Error handling
  useEffect(() => {
    if (isCustomersError) {
      const errorMessage =
        customersError && typeof customersError === 'object' && 'data' in customersError
          ? // @ts-expect-error – RTK Query error shape
            (customersError.data?.message as string | undefined)
          : undefined

      toast({
        title: 'Error',
        description: errorMessage || 'Failed to load customers. Please try again.',
        variant: 'destructive',
      })
    }
  }, [isCustomersError, customersError])

  // Pagination from API response
  const totalPages = customersResponse?.pagination?.totalPage || pagination.totalPages
  const totalItems = customersResponse?.pagination?.total || list.length

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

    try {
      const { type, customer } = confirmAction

      if (type === 'toggle') {
        const nextStatus: CustomerStatus =
          customer.status === 'active' ? 'inactive' : 'active'
        
        // Convert to uppercase for API (ACTIVE/INACTIVE)
        const apiStatus = nextStatus.toUpperCase() as 'ACTIVE' | 'INACTIVE'
        
        await updateCustomerStatus({ 
          id: customer.id, 
          status: apiStatus 
        }).unwrap()
        
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
              className="w-[300px]  "
            />

            {/* Filter Dropdown */}
            <CustomerFilterDropdown
              value={statusFilter as CustomerStatus | 'all'}
              onChange={setStatusFilter}
            />
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {/* Loading State */}
          {(isCustomersLoading || isCustomersFetching) && (
            <div className="flex items-center justify-center py-12">
              <div className="text-sm text-gray-500">Loading customers...</div>
            </div>
          )}

          {/* Table */}
          {!isCustomersLoading && !isCustomersFetching && (
            <>
              <CustomerTable
                customers={list}
                onView={handleView}
                onToggleStatus={handleToggleStatus}
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
          isLoading={isStatusUpdating}
        />
      )}
    </motion.div>
  )
}
