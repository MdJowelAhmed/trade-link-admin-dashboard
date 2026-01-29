import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { Service, ServiceFilters, PaginationState } from '@/types'
import { DEFAULT_PAGINATION } from '@/utils/constants'

// Mock data for demonstration
const mockServices: Service[] = [
  {
    id: '1',
    name: 'Full Garden Renovation',
    categoryId: '1',
    categoryName: 'Outdoor & Landscaping',
    totalQuestions: 10,
    status: 'active',
    createdAt: '2024-01-10T10:00:00Z',
    updatedAt: '2024-01-20T14:45:00Z',
  },
  {
    id: '2',
    name: 'New Garden / Blank Canvas',
    categoryId: '1',
    categoryName: 'Outdoor & Landscaping',
    totalQuestions: 8,
    status: 'active',
    createdAt: '2024-01-11T11:00:00Z',
    updatedAt: '2024-01-21T15:45:00Z',
  },
  {
    id: '3',
    name: 'Garden Redesign / Makeover',
    categoryId: '1',
    categoryName: 'Outdoor & Landscaping',
    totalQuestions: 12,
    status: 'active',
    createdAt: '2024-01-12T12:00:00Z',
    updatedAt: '2024-01-22T16:45:00Z',
  },
  {
    id: '4',
    name: 'Patios & Paving',
    categoryId: '1',
    categoryName: 'Outdoor & Landscaping',
    totalQuestions: 14,
    status: 'active',
    createdAt: '2024-01-13T13:00:00Z',
    updatedAt: '2024-01-23T17:45:00Z',
  },
  {
    id: '5',
    name: 'Fencing',
    categoryId: '1',
    categoryName: 'Outdoor & Landscaping',
    totalQuestions: 6,
    status: 'active',
    createdAt: '2024-01-14T14:00:00Z',
    updatedAt: '2024-01-24T18:45:00Z',
  },
  {
    id: '6',
    name: 'Turfing / Artificial Grass',
    categoryId: '1',
    categoryName: 'Outdoor & Landscaping',
    totalQuestions: 10,
    status: 'active',
    createdAt: '2024-01-15T15:00:00Z',
    updatedAt: '2024-01-25T19:45:00Z',
  },
  {
    id: '7',
    name: 'Plumbing Repair',
    categoryId: '5',
    categoryName: 'Electrical, Plumbing & Heating',
    totalQuestions: 12,
    status: 'active',
    createdAt: '2024-01-16T16:00:00Z',
    updatedAt: '2024-01-26T20:45:00Z',
  },
  {
    id: '8',
    name: 'Electrical Installation',
    categoryId: '5',
    categoryName: 'Electrical, Plumbing & Heating',
    totalQuestions: 14,
    status: 'active',
    createdAt: '2024-01-17T17:00:00Z',
    updatedAt: '2024-01-27T21:45:00Z',
  },
]

interface ServiceState {
  list: Service[]
  filteredList: Service[]
  selectedService: Service | null
  filters: ServiceFilters
  pagination: PaginationState
  isLoading: boolean
  error: string | null
}

const initialState: ServiceState = {
  list: mockServices,
  filteredList: mockServices,
  selectedService: null,
  filters: {
    search: '',
    status: 'all',
    categoryId: 'all',
  },
  pagination: {
    ...DEFAULT_PAGINATION,
    total: mockServices.length,
    totalPages: Math.ceil(mockServices.length / DEFAULT_PAGINATION.limit),
  },
  isLoading: false,
  error: null,
}

const serviceSlice = createSlice({
  name: 'services',
  initialState,
  reducers: {
    setServices: (state, action: PayloadAction<Service[]>) => {
      state.list = action.payload
      state.filteredList = action.payload
    },
    setSelectedService: (state, action: PayloadAction<Service | null>) => {
      state.selectedService = action.payload
    },
    setFilters: (state, action: PayloadAction<Partial<ServiceFilters>>) => {
      state.filters = { ...state.filters, ...action.payload }
      // Apply filters
      let filtered = [...state.list]
      
      if (state.filters.search) {
        const searchLower = state.filters.search.toLowerCase()
        filtered = filtered.filter(
          (service) =>
            service.name.toLowerCase().includes(searchLower) ||
            service.categoryName?.toLowerCase().includes(searchLower)
        )
      }
      
      if (state.filters.status !== 'all') {
        filtered = filtered.filter((service) => service.status === state.filters.status)
      }
      
      if (state.filters.categoryId !== 'all') {
        filtered = filtered.filter((service) => service.categoryId === state.filters.categoryId)
      }
      
      state.filteredList = filtered
      state.pagination.total = filtered.length
      state.pagination.totalPages = Math.ceil(filtered.length / state.pagination.limit)
      state.pagination.page = 1
    },
    clearFilters: (state) => {
      state.filters = { search: '', status: 'all', categoryId: 'all' }
      state.filteredList = state.list
      state.pagination.total = state.list.length
      state.pagination.totalPages = Math.ceil(state.list.length / state.pagination.limit)
      state.pagination.page = 1
    },
    setPage: (state, action: PayloadAction<number>) => {
      state.pagination.page = action.payload
    },
    setLimit: (state, action: PayloadAction<number>) => {
      state.pagination.limit = action.payload
      state.pagination.totalPages = Math.ceil(state.filteredList.length / action.payload)
      state.pagination.page = 1
    },
    addService: (state, action: PayloadAction<Service>) => {
      state.list.unshift(action.payload)
      state.filteredList.unshift(action.payload)
      state.pagination.total += 1
      state.pagination.totalPages = Math.ceil(state.filteredList.length / state.pagination.limit)
    },
    updateService: (state, action: PayloadAction<Service>) => {
      const serviceIndex = state.list.findIndex((s) => s.id === action.payload.id)
      if (serviceIndex !== -1) {
        state.list[serviceIndex] = { ...action.payload, updatedAt: new Date().toISOString() }
      }
      const filteredIndex = state.filteredList.findIndex((s) => s.id === action.payload.id)
      if (filteredIndex !== -1) {
        state.filteredList[filteredIndex] = { ...action.payload, updatedAt: new Date().toISOString() }
      }
    },
    deleteService: (state, action: PayloadAction<string>) => {
      state.list = state.list.filter((s) => s.id !== action.payload)
      state.filteredList = state.filteredList.filter((s) => s.id !== action.payload)
      state.pagination.total -= 1
      state.pagination.totalPages = Math.ceil(state.filteredList.length / state.pagination.limit)
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
  setServices,
  setSelectedService,
  setFilters,
  clearFilters,
  setPage,
  setLimit,
  addService,
  updateService,
  deleteService,
  setLoading,
  setError,
} = serviceSlice.actions

export default serviceSlice.reducer
