import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { Client, ClientFilters, ClientStatus, PaginationState } from '@/types'
import { DEFAULT_PAGINATION } from '@/utils/constants'

// Mock data for demonstration
const mockClients: Client[] = [
  {
    id: '1',
    name: 'Alice Johnson',
    phone: '+33-1-42-36-72-38',
    email: 'alice.johnson@example.com',
    status: 'verified',
    country: 'France',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alice',
    gender: 'Female',
    fullAddress: '123 Rue de Rivoli, 75001 Paris, France',
    licenseNumber: 'FR-ALICE-12345',
    licenseDocumentUrl: 'https://via.placeholder.com/600x400.png?text=Alice+License',
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-20T14:45:00Z',
  },
  {
    id: '2',
    name: 'Michael Chen',
    phone: '+49-30-1234-5678',
    email: 'michael.chen@example.com',
    status: 'requested',
    country: 'Germany',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Michael',
    gender: 'Male',
    fullAddress: '456 Alexanderplatz, 10178 Berlin, Germany',
    licenseNumber: 'DE-MICHAEL-98765',
    licenseDocumentUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    createdAt: '2024-01-16T11:30:00Z',
    updatedAt: '2024-01-21T15:45:00Z',
  },
  {
    id: '3',
    name: 'Emma Rodriguez',
    phone: '+34-91-456-7890',
    email: 'emma.rodriguez@example.com',
    status: 'unverified',
    country: 'Spain',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emma',
    createdAt: '2024-01-17T12:30:00Z',
    updatedAt: '2024-01-22T16:45:00Z',
  },
  {
    id: '4',
    name: 'David Thompson',
    phone: '+1-212-555-0123',
    email: 'david.thompson@example.com',
    status: 'verified',
    country: 'USA',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=David',
    createdAt: '2024-01-18T13:30:00Z',
    updatedAt: '2024-01-23T17:45:00Z',
  },
  {
    id: '5',
    name: 'Sophie Martin',
    phone: '+33-1-56-78-90-12',
    email: 'sophie.martin@example.com',
    status: 'requested',
    country: 'France',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sophie',
    createdAt: '2024-01-19T14:30:00Z',
    updatedAt: '2024-01-24T18:45:00Z',
  },
  {
    id: '6',
    name: 'Marco Rossi',
    phone: '+39-06-1234-5678',
    email: 'marco.rossi@example.com',
    status: 'unverified',
    country: 'Italy',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Marco',
    createdAt: '2024-01-20T15:30:00Z',
    updatedAt: '2024-01-25T19:45:00Z',
  },
  {
    id: '7',
    name: 'Sarah Williams',
    phone: '+44-20-7946-0958',
    email: 'sarah.williams@example.com',
    status: 'verified',
    country: 'UK',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
    createdAt: '2024-01-21T16:30:00Z',
    updatedAt: '2024-01-26T20:45:00Z',
  },
  {
    id: '8',
    name: 'James Wilson',
    phone: '+1-416-555-0198',
    email: 'james.wilson@example.com',
    status: 'verified',
    country: 'Canada',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=James',
    createdAt: '2024-01-22T17:30:00Z',
    updatedAt: '2024-01-27T21:45:00Z',
  },
  {
    id: '9',
    name: 'Lisa Anderson',
    phone: '+61-2-9374-4000',
    email: 'lisa.anderson@example.com',
    status: 'verified',
    country: 'Australia',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Lisa',
    createdAt: '2024-01-23T18:30:00Z',
    updatedAt: '2024-01-28T22:45:00Z',
  },
  {
    id: '10',
    name: 'Thomas Brown',
    phone: '+49-89-1234-5678',
    email: 'thomas.brown@example.com',
    status: 'unverified',
    country: 'Germany',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Thomas',
    createdAt: '2024-01-24T19:30:00Z',
    updatedAt: '2024-01-29T23:45:00Z',
  },
  {
    id: '11',
    name: 'Maria Garcia',
    phone: '+34-93-456-7890',
    email: 'maria.garcia@example.com',
    status: 'verified',
    country: 'Spain',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Maria',
    createdAt: '2024-01-25T20:30:00Z',
    updatedAt: '2024-01-30T00:45:00Z',
  },
  {
    id: '12',
    name: 'Robert Taylor',
    phone: '+44-131-496-0000',
    email: 'robert.taylor@example.com',
    status: 'verified',
    country: 'UK',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Robert',
    createdAt: '2024-01-26T21:30:00Z',
    updatedAt: '2024-01-31T01:45:00Z',
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
    setClientStatus: (
      state,
      action: PayloadAction<{ id: string; status: ClientStatus }>
    ) => {
      const { id, status } = action.payload

      const client = state.list.find((c) => c.id === id)
      if (client) {
        client.status = status
        client.updatedAt = new Date().toISOString()
      }

      const filteredClient = state.filteredList.find((c) => c.id === id)
      if (filteredClient) {
        filteredClient.status = status
        filteredClient.updatedAt = new Date().toISOString()
      }
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
        client.status = client.status === 'verified' ? 'unverified' : 'verified'
        client.updatedAt = new Date().toISOString()
      }
      const filteredClient = state.filteredList.find((c) => c.id === action.payload)
      if (filteredClient) {
        filteredClient.status =
          filteredClient.status === 'verified' ? 'unverified' : 'verified'
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
  setClientStatus,
} = clientSlice.actions

export default clientSlice.reducer

