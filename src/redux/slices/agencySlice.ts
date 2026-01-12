import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { Agency, AgencyFilters, AgencyStatus, PaginationState } from '@/types'
import { DEFAULT_PAGINATION } from '@/utils/constants'

// Mock data for demonstration
const mockAgencies: Agency[] = [
  {
    id: '1',
    name: 'Elite Drive Agency',
    ownerName: 'Alice Johnson',
    phone: '+49-423-72838',
    email: 'alice01@example.com',
    country: 'Germany',
    address: 'ORPA-44/B-1 Road 02, Vonica, Italy-1212',
    totalCars: 24,
    completedOrders: 120,
    status: 'active',
    logo: 'https://api.dicebear.com/7.x/identicon/svg?seed=EliteDrive',
    documents: [],
    createdAt: '2024-01-10T10:00:00Z',
    updatedAt: '2024-01-15T12:00:00Z',
  },
  {
    id: '2',
    name: 'City Wheels',
    ownerName: 'Michael Chen',
    phone: '+33-1-42-36-72-38',
    email: 'citywheels@example.com',
    country: 'France',
    address: '123 Rue de Rivoli, 75001 Paris, France',
    totalCars: 18,
    completedOrders: 85,
    status: 'inactive',
    logo: 'https://api.dicebear.com/7.x/identicon/svg?seed=CityWheels',
    documents: [],
    createdAt: '2024-01-12T11:00:00Z',
    updatedAt: '2024-01-18T13:00:00Z',
  },
  {
    id: '3',
    name: 'Premium Rides',
    ownerName: 'Emma Rodriguez',
    phone: '+34-91-456-7890',
    email: 'premiumrides@example.com',
    country: 'Spain',
    address: '456 Gran Via, Madrid, Spain',
    totalCars: 32,
    completedOrders: 210,
    status: 'active',
    logo: 'https://api.dicebear.com/7.x/identicon/svg?seed=PremiumRides',
    documents: [],
    createdAt: '2024-01-14T09:30:00Z',
    updatedAt: '2024-01-20T16:00:00Z',
  },
]

interface AgencyState {
  list: Agency[]
  filteredList: Agency[]
  filters: AgencyFilters
  pagination: PaginationState
  isLoading: boolean
  error: string | null
}

const initialState: AgencyState = {
  list: mockAgencies,
  filteredList: mockAgencies,
  filters: {
    search: '',
    status: 'all',
  },
  pagination: {
    ...DEFAULT_PAGINATION,
    total: mockAgencies.length,
    totalPages: Math.ceil(mockAgencies.length / DEFAULT_PAGINATION.limit),
  },
  isLoading: false,
  error: null,
}

const agencySlice = createSlice({
  name: 'agencies',
  initialState,
  reducers: {
    setAgencies: (state, action: PayloadAction<Agency[]>) => {
      state.list = action.payload
      state.filteredList = action.payload
      state.pagination.total = action.payload.length
      state.pagination.totalPages = Math.ceil(
        action.payload.length / state.pagination.limit
      )
    },
    setFilters: (state, action: PayloadAction<Partial<AgencyFilters>>) => {
      state.filters = { ...state.filters, ...action.payload }

      let filtered = [...state.list]

      // Search filter (name, owner, email, phone, country)
      if (state.filters.search) {
        const searchLower = state.filters.search.toLowerCase()
        filtered = filtered.filter(
          (agency) =>
            agency.name.toLowerCase().includes(searchLower) ||
            agency.ownerName.toLowerCase().includes(searchLower) ||
            agency.email.toLowerCase().includes(searchLower) ||
            agency.phone.includes(state.filters.search) ||
            agency.country.toLowerCase().includes(searchLower)
        )
      }

      // Status filter
      if (state.filters.status !== 'all') {
        filtered = filtered.filter(
          (agency) => agency.status === state.filters.status
        )
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
    setAgencyStatus: (
      state,
      action: PayloadAction<{ id: string; status: AgencyStatus }>
    ) => {
      const { id, status } = action.payload

      const agency = state.list.find((a) => a.id === id)
      if (agency) {
        agency.status = status
        agency.updatedAt = new Date().toISOString()
      }

      const filteredAgency = state.filteredList.find((a) => a.id === id)
      if (filteredAgency) {
        filteredAgency.status = status
        filteredAgency.updatedAt = new Date().toISOString()
      }
    },
    addAgency: (state, action: PayloadAction<Agency>) => {
      state.list.unshift(action.payload)
      state.filteredList.unshift(action.payload)
      state.pagination.total = state.list.length
      state.pagination.totalPages = Math.ceil(
        state.list.length / state.pagination.limit
      )
    },
    updateAgency: (state, action: PayloadAction<Agency>) => {
      const index = state.list.findIndex((a) => a.id === action.payload.id)
      if (index !== -1) {
        state.list[index] = {
          ...action.payload,
          updatedAt: new Date().toISOString(),
        }
      }
      const filteredIndex = state.filteredList.findIndex(
        (a) => a.id === action.payload.id
      )
      if (filteredIndex !== -1) {
        state.filteredList[filteredIndex] = {
          ...action.payload,
          updatedAt: new Date().toISOString(),
        }
      }
    },
    deleteAgency: (state, action: PayloadAction<string>) => {
      state.list = state.list.filter((a) => a.id !== action.payload)
      state.filteredList = state.filteredList.filter(
        (a) => a.id !== action.payload
      )
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
  setAgencies,
  setFilters,
  clearFilters,
  setPage,
  setLimit,
  setAgencyStatus,
  addAgency,
  updateAgency,
  deleteAgency,
  setLoading,
  setError,
} = agencySlice.actions

export default agencySlice.reducer




