import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { Customer, CustomerFilters, CustomerStatus, PaginationState } from '@/types'
import { DEFAULT_PAGINATION } from '@/utils/constants'

// Mock data for demonstration
const mockCustomers: Customer[] = [
  {
    id: '1',
    userName: 'Leslie Alexander',
    contact: '12345678910',
    email: 'User@Gmail.Com',
    location: 'Royal Ln Mesa, New Jersey',
    status: 'active',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Leslie',
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-20T14:45:00Z',
  },
  {
    id: '2',
    userName: 'Leslie Alexander',
    contact: '12345678910',
    email: 'User@Gmail.Com',
    location: 'Royal Ln Mesa, New Jersey',
    status: 'active',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Leslie2',
    createdAt: '2024-01-16T11:30:00Z',
    updatedAt: '2024-01-21T15:45:00Z',
  },
  {
    id: '3',
    userName: 'Leslie Alexander',
    contact: '12345678910',
    email: 'User@Gmail.Com',
    location: 'Royal Ln Mesa, New Jersey',
    status: 'active',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Leslie3',
    createdAt: '2024-01-17T12:30:00Z',
    updatedAt: '2024-01-22T16:45:00Z',
  },
  {
    id: '4',
    userName: 'Leslie Alexander',
    contact: '12345678910',
    email: 'User@Gmail.Com',
    location: 'Royal Ln Mesa, New Jersey',
    status: 'active',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Leslie4',
    createdAt: '2024-01-18T13:30:00Z',
    updatedAt: '2024-01-23T17:45:00Z',
  },
  {
    id: '5',
    userName: 'Leslie Alexander',
    contact: '12345678910',
    email: 'User@Gmail.Com',
    location: 'Royal Ln Mesa, New Jersey',
    status: 'active',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Leslie5',
    createdAt: '2024-01-19T14:30:00Z',
    updatedAt: '2024-01-24T18:45:00Z',
  },
  {
    id: '6',
    userName: 'Leslie Alexander',
    contact: '12345678910',
    email: 'User@Gmail.Com',
    location: 'Royal Ln Mesa, New Jersey',
    status: 'active',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Leslie6',
    createdAt: '2024-01-20T15:30:00Z',
    updatedAt: '2024-01-25T19:45:00Z',
  },
  {
    id: '7',
    userName: 'Leslie Alexander',
    contact: '12345678910',
    email: 'User@Gmail.Com',
    location: 'Royal Ln Mesa, New Jersey',
    status: 'active',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Leslie7',
    createdAt: '2024-01-21T16:30:00Z',
    updatedAt: '2024-01-26T20:45:00Z',
  },
  {
    id: '8',
    userName: 'Leslie Alexander',
    contact: '12345678910',
    email: 'User@Gmail.Com',
    location: 'Royal Ln Mesa, New Jersey',
    status: 'inactive',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Leslie8',
    createdAt: '2024-01-22T17:30:00Z',
    updatedAt: '2024-01-27T21:45:00Z',
  },
  {
    id: '9',
    userName: 'John Doe',
    contact: '9876543210',
    email: 'john.doe@example.com',
    location: 'Main St, New York',
    status: 'active',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John',
    createdAt: '2024-01-23T18:30:00Z',
    updatedAt: '2024-01-28T22:45:00Z',
  },
  {
    id: '10',
    userName: 'Jane Smith',
    contact: '5551234567',
    email: 'jane.smith@example.com',
    location: 'Oak Avenue, Los Angeles',
    status: 'inactive',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jane',
    createdAt: '2024-01-24T19:30:00Z',
    updatedAt: '2024-01-29T23:45:00Z',
  },
  {
    id: '11',
    userName: 'Robert Johnson',
    contact: '1112223334',
    email: 'robert.j@example.com',
    location: 'Park Lane, Chicago',
    status: 'active',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Robert',
    createdAt: '2024-01-25T20:30:00Z',
    updatedAt: '2024-01-30T00:45:00Z',
  },
  {
    id: '12',
    userName: 'Emily Davis',
    contact: '4445556667',
    email: 'emily.d@example.com',
    location: 'Broadway, Seattle',
    status: 'active',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emily',
    createdAt: '2024-01-26T21:30:00Z',
    updatedAt: '2024-01-31T01:45:00Z',
  },
]

interface CustomerState {
  list: Customer[]
  filteredList: Customer[]
  filters: CustomerFilters
  pagination: PaginationState
  isLoading: boolean
  error: string | null
}

const initialState: CustomerState = {
  list: mockCustomers,
  filteredList: mockCustomers,
  filters: {
    search: '',
    status: 'all',
  },
  pagination: {
    ...DEFAULT_PAGINATION,
    total: mockCustomers.length,
    totalPages: Math.ceil(mockCustomers.length / DEFAULT_PAGINATION.limit),
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
      state.pagination.total = action.payload.length
      state.pagination.totalPages = Math.ceil(
        action.payload.length / state.pagination.limit
      )
    },
    setFilters: (state, action: PayloadAction<Partial<CustomerFilters>>) => {
      state.filters = { ...state.filters, ...action.payload }
      
      // Apply filters
      let filtered = [...state.list]
      
      // Search filter
      if (state.filters.search) {
        const searchLower = state.filters.search.toLowerCase()
        filtered = filtered.filter(
          (customer) =>
            customer.userName.toLowerCase().includes(searchLower) ||
            customer.email.toLowerCase().includes(searchLower) ||
            customer.contact.includes(state.filters.search) ||
            customer.location.toLowerCase().includes(searchLower)
        )
      }
      
      // Status filter
      if (state.filters.status !== 'all') {
        filtered = filtered.filter((customer) => customer.status === state.filters.status)
      }
      
      state.filteredList = filtered
      state.pagination.total = filtered.length
      state.pagination.totalPages = Math.ceil(
        filtered.length / state.pagination.limit
      )
      state.pagination.page = 1
    },
    clearFilters: (state) => {
      state.filters = { search: '', status: 'all' }
      state.filteredList = state.list
      state.pagination.total = state.list.length
      state.pagination.totalPages = Math.ceil(
        state.list.length / state.pagination.limit
      )
      state.pagination.page = 1
    },
    setPage: (state, action: PayloadAction<number>) => {
      state.pagination.page = action.payload
    },
    setLimit: (state, action: PayloadAction<number>) => {
      state.pagination.limit = action.payload
      state.pagination.totalPages = Math.ceil(
        state.filteredList.length / action.payload
      )
      state.pagination.page = 1
    },
    setCustomerStatus: (
      state,
      action: PayloadAction<{ id: string; status: CustomerStatus }>
    ) => {
      const { id, status } = action.payload

      const customer = state.list.find((c) => c.id === id)
      if (customer) {
        customer.status = status
        customer.updatedAt = new Date().toISOString()
      }

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
  addCustomer,
  updateCustomer,
  toggleCustomerStatus,
  deleteCustomer,
  setLoading,
  setError,
  setCustomerStatus,
} = customerSlice.actions

export default customerSlice.reducer
