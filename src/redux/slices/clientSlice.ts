import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { Client, ClientFilters, PaginationState } from '@/types'
import { DEFAULT_PAGINATION } from '@/utils/constants'

// Mock data for demonstration
const mockClients: Client[] = [
  {
    id: '1',
    name: 'Alice Johnson',
    phone: '49-42372838',
    email: 'alice123@example.com',
    status: 'active',
    country: 'France',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alice',
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-20T14:45:00Z',
  },
  {
    id: '2',
    name: 'Alice Johnson',
    phone: '49-42372838',
    email: 'alice123@example.com',
    status: 'active',
    country: 'France',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alice2',
    createdAt: '2024-01-16T11:30:00Z',
    updatedAt: '2024-01-21T15:45:00Z',
  },
  {
    id: '3',
    name: 'Alice Johnson',
    phone: '49-42372838',
    email: 'alice123@example.com',
    status: 'inactive',
    country: 'France',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alice3',
    createdAt: '2024-01-17T12:30:00Z',
    updatedAt: '2024-01-22T16:45:00Z',
  },
  {
    id: '4',
    name: 'Alice Johnson',
    phone: '49-42372838',
    email: 'alice123@example.com',
    status: 'active',
    country: 'Germany',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alice4',
    createdAt: '2024-01-18T13:30:00Z',
    updatedAt: '2024-01-23T17:45:00Z',
  },
  {
    id: '5',
    name: 'Alice Johnson',
    phone: '49-42372838',
    email: 'alice123@example.com',
    status: 'active',
    country: 'Spain',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alice5',
    createdAt: '2024-01-19T14:30:00Z',
    updatedAt: '2024-01-24T18:45:00Z',
  },
  {
    id: '6',
    name: 'Alice Johnson',
    phone: '49-42372838',
    email: 'alice123@example.com',
    status: 'inactive',
    country: 'Italy',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alice6',
    createdAt: '2024-01-20T15:30:00Z',
    updatedAt: '2024-01-25T19:45:00Z',
  },
  {
    id: '7',
    name: 'John Smith',
    phone: '49-42372839',
    email: 'john.smith@example.com',
    status: 'active',
    country: 'USA',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John',
    createdAt: '2024-01-21T16:30:00Z',
    updatedAt: '2024-01-26T20:45:00Z',
  },
  {
    id: '8',
    name: 'Sarah Williams',
    phone: '49-42372840',
    email: 'sarah.williams@example.com',
    status: 'active',
    country: 'UK',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
    createdAt: '2024-01-22T17:30:00Z',
    updatedAt: '2024-01-27T21:45:00Z',
  },
]

interface ClientState {
  list: Client[]
  filteredList: Client[]
  filters: ClientFilters
  pagination: PaginationState
  isLoading: boolean
  error: string | null
}

const initialState: ClientState = {
  list: mockClients,
  filteredList: mockClients,
  filters: {
    search: '',
    status: 'all',
    country: 'all',
  },
  pagination: {
    ...DEFAULT_PAGINATION,
    total: mockClients.length,
    totalPages: Math.ceil(mockClients.length / DEFAULT_PAGINATION.limit),
  },
  isLoading: false,
  error: null,
}

const clientSlice = createSlice({
  name: 'clients',
  initialState,
  reducers: {
    setClients: (state, action: PayloadAction<Client[]>) => {
      state.list = action.payload
      state.filteredList = action.payload
      state.pagination.total = action.payload.length
      state.pagination.totalPages = Math.ceil(
        action.payload.length / state.pagination.limit
      )
    },
    setFilters: (state, action: PayloadAction<Partial<ClientFilters>>) => {
      state.filters = { ...state.filters, ...action.payload }
      
      // Apply filters
      let filtered = [...state.list]
      
      // Search filter
      if (state.filters.search) {
        const searchLower = state.filters.search.toLowerCase()
        filtered = filtered.filter(
          (client) =>
            client.name.toLowerCase().includes(searchLower) ||
            client.email.toLowerCase().includes(searchLower) ||
            client.phone.includes(state.filters.search)
        )
      }
      
      // Status filter
      if (state.filters.status !== 'all') {
        filtered = filtered.filter((client) => client.status === state.filters.status)
      }
      
      // Country filter
      if (state.filters.country !== 'all') {
        filtered = filtered.filter((client) => client.country === state.filters.country)
      }
      
      state.filteredList = filtered
      state.pagination.total = filtered.length
      state.pagination.totalPages = Math.ceil(
        filtered.length / state.pagination.limit
      )
      state.pagination.page = 1
    },
    clearFilters: (state) => {
      state.filters = { search: '', status: 'all', country: 'all' }
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
    addClient: (state, action: PayloadAction<Client>) => {
      state.list.unshift(action.payload)
      state.filteredList.unshift(action.payload)
      state.pagination.total = state.list.length
      state.pagination.totalPages = Math.ceil(
        state.list.length / state.pagination.limit
      )
    },
    updateClient: (state, action: PayloadAction<Client>) => {
      const index = state.list.findIndex((client) => client.id === action.payload.id)
      if (index !== -1) {
        state.list[index] = { ...action.payload, updatedAt: new Date().toISOString() }
      }
      const filteredIndex = state.filteredList.findIndex((client) => client.id === action.payload.id)
      if (filteredIndex !== -1) {
        state.filteredList[filteredIndex] = { ...action.payload, updatedAt: new Date().toISOString() }
      }
    },
    toggleClientStatus: (state, action: PayloadAction<string>) => {
      const client = state.list.find((c) => c.id === action.payload)
      if (client) {
        client.status = client.status === 'active' ? 'inactive' : 'active'
        client.updatedAt = new Date().toISOString()
      }
      const filteredClient = state.filteredList.find((c) => c.id === action.payload)
      if (filteredClient) {
        filteredClient.status = filteredClient.status === 'active' ? 'inactive' : 'active'
        filteredClient.updatedAt = new Date().toISOString()
      }
    },
    deleteClient: (state, action: PayloadAction<string>) => {
      state.list = state.list.filter((client) => client.id !== action.payload)
      state.filteredList = state.filteredList.filter((client) => client.id !== action.payload)
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
  setClients,
  setFilters,
  clearFilters,
  setPage,
  setLimit,
  addClient,
  updateClient,
  toggleClientStatus,
  deleteClient,
  setLoading,
  setError,
} = clientSlice.actions

export default clientSlice.reducer

