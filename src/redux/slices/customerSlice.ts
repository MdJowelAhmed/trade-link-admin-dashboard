import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { Customer, CustomerFilters, CustomerStatus, PaginationState } from '@/types'
import { DEFAULT_PAGINATION } from '@/utils/constants'

interface CustomerState {
  list: Customer[]
  filteredList: Customer[]
  filters: CustomerFilters
  pagination: PaginationState
  isLoading: boolean
  error: string | null
}

const initialState: CustomerState = {
  list: [],
  filteredList: [],
  filters: {
    search: '',
    status: 'all',
  },
  pagination: {
    ...DEFAULT_PAGINATION,
    total: 0,
    totalPages: 0,
  },
  isLoading: false,
  error: null,
}

const customerSlice = createSlice({
  name: 'customers',
  initialState,
  reducers: {
    setCustomers: (state, action: PayloadAction<Customer[]>) => {
      state.list = action.payload
      state.filteredList = action.payload
      // Note: Pagination totals are now managed by API response
      // This action just updates the list for current page
    },
    setFilters: (state, action: PayloadAction<Partial<CustomerFilters>>) => {
      state.filters = { ...state.filters, ...action.payload }
      // Note: Filtering is now handled server-side via API
      // This action just updates the filter state for API queries
    },
    clearFilters: (state) => {
      state.filters = { search: '', status: 'all' }
      // Note: Filtering is now handled server-side via API
    },
    setPage: (state, action: PayloadAction<number>) => {
      state.pagination.page = action.payload
    },
    setLimit: (state, action: PayloadAction<number>) => {
      state.pagination.limit = action.payload
      // Note: Pagination is now handled server-side via API
      // This action just updates the limit state for API queries
    },
    setPagination: (state, action: PayloadAction<Partial<PaginationState>>) => {
      state.pagination = { ...state.pagination, ...action.payload }
    },
    setCustomerStatus: (
      state,
      action: PayloadAction<{ id: string; status: CustomerStatus }>
    ) => {
      const { id, status } = action.payload

      // Update customer status in the list (optimistic update)
      const customer = state.list.find((c) => c.id === id)
      if (customer) {
        customer.status = status
        customer.updatedAt = new Date().toISOString()
      }

      // Also update in filteredList if it exists
      const filteredCustomer = state.filteredList.find((c) => c.id === id)
      if (filteredCustomer) {
        filteredCustomer.status = status
        filteredCustomer.updatedAt = new Date().toISOString()
      }
    },
    addCustomer: (state, action: PayloadAction<Customer>) => {
      state.list.unshift(action.payload)
      state.filteredList.unshift(action.payload)
      state.pagination.total = state.list.length
      state.pagination.totalPages = Math.ceil(
        state.list.length / state.pagination.limit
      )
    },
    updateCustomer: (state, action: PayloadAction<Customer>) => {
      const index = state.list.findIndex((customer) => customer.id === action.payload.id)
      if (index !== -1) {
        state.list[index] = { ...action.payload, updatedAt: new Date().toISOString() }
      }
      const filteredIndex = state.filteredList.findIndex((customer) => customer.id === action.payload.id)
      if (filteredIndex !== -1) {
        state.filteredList[filteredIndex] = { ...action.payload, updatedAt: new Date().toISOString() }
      }
    },
    toggleCustomerStatus: (state, action: PayloadAction<string>) => {
      const customer = state.list.find((c) => c.id === action.payload)
      if (customer) {
        customer.status = customer.status === 'active' ? 'inactive' : 'active'
        customer.updatedAt = new Date().toISOString()
      }
      const filteredCustomer = state.filteredList.find((c) => c.id === action.payload)
      if (filteredCustomer) {
        filteredCustomer.status =
          filteredCustomer.status === 'active' ? 'inactive' : 'active'
        filteredCustomer.updatedAt = new Date().toISOString()
      }
    },
    deleteCustomer: (state, action: PayloadAction<string>) => {
      state.list = state.list.filter((customer) => customer.id !== action.payload)
      state.filteredList = state.filteredList.filter((customer) => customer.id !== action.payload)
      state.pagination.total = state.list.length
      state.pagination.totalPages = Math.ceil(
        state.list.length / state.pagination.limit
      )
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
    },
  },
})

export const {
  setCustomers,
  setFilters,
  clearFilters,
  setPage,
  setLimit,
  setPagination,
  addCustomer,
  updateCustomer,
  toggleCustomerStatus,
  deleteCustomer,
  setLoading,
  setError,
  setCustomerStatus,
} = customerSlice.actions

export default customerSlice.reducer
