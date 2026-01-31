import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { Lead, LeadFilters, LeadStatus, PaginationState } from '@/types'
import { DEFAULT_PAGINATION } from '@/utils/constants'

// Mock data for demonstration
const mockLeads: Lead[] = [
  {
    id: '1',
    leadId:'1001',
    name: 'Leslie Alexander',
    requiredService: 'Domestic Cleaning',
    email: 'User@Gmail.Com',
    contact: '+60 123 456 78',
    location: 'Royal Ln Mesa, New Jersey',
    status: 'active',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Lead1',
    budget: 'Under $5000',
    notes:
      'Small garden / No groundwork or drainage / Apartment / Urgent request',
    createdAt: '2026-02-14T10:00:00Z',
    updatedAt: '2026-02-14T10:00:00Z',
  },
  {
    id: '2',
    leadId:'1002',
    name: 'Leslie Alexander',
    requiredService: 'Pool Cleaning',
    email: 'User@Gmail.Com',
    contact: '+60 123 456 78',
    location: 'Royal Ln Mesa, New Jersey',
    status: 'active',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Lead2',
    budget: 'Under $5000',
    notes: 'Regular weekly pool cleaning and maintenance',
    createdAt: '2026-02-13T10:00:00Z',
    updatedAt: '2026-02-13T10:00:00Z',
  },
  {
    id: '3',
    leadId:'1003',
    name: 'Leslie Alexander',
    requiredService: 'Accountant',
    email: 'User@Gmail.Com',
    contact: '+60 123 456 78',
    location: 'Royal Ln Mesa, New Jersey',
    status: 'active',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Lead3',
    budget: 'Under $5000',
    notes: 'Yearly tax preparation and bookkeeping support',
    createdAt: '2026-02-12T10:00:00Z',
    updatedAt: '2026-02-12T10:00:00Z',
  },
  {
    id: '4',
    leadId:'1004',
    name: 'Leslie Alexander',
    requiredService: 'Plumbing',
    email: 'User@Gmail.Com',
    contact: '+60 123 456 78',
    location: 'Royal Ln Mesa, New Jersey',
    status: 'active',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Lead4',
    budget: 'Under $5000',
    notes: 'Kitchen sink leakage and bathroom fitting replacement',
    createdAt: '2026-02-11T10:00:00Z',
    updatedAt: '2026-02-11T10:00:00Z',
  },
  {
    id: '5',
    leadId:'1005',
    name: 'Leslie Alexander',
    requiredService: 'Massage Therapy',
    email: 'User@Gmail.Com',
    contact: '+60 123 456 78',
    location: 'Royal Ln Mesa, New Jersey',
    status: 'active',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Lead5',
    budget: 'Under $5000',
    notes: 'Home visit massage therapy for 2 persons',
    createdAt: '2026-02-10T10:00:00Z',
    updatedAt: '2026-02-10T10:00:00Z',
  },
  {
    id: '6',
    leadId:'1006',
    name: 'Leslie Alexander',
    requiredService: 'Makeup Artist',
    email: 'User@Gmail.Com',
    contact: '+60 123 456 78',
    location: 'Royal Ln Mesa, New Jersey',
    status: 'active',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Lead6',
    budget: 'Under $5000',
    notes: 'Bridal party makeup for 4 persons',
    createdAt: '2026-02-09T10:00:00Z',
    updatedAt: '2026-02-09T10:00:00Z',
  },
  {
    id: '7',
    leadId:'1007',
    name: 'Leslie Alexander',
    requiredService: 'Photographer',
    email: 'User@Gmail.Com',
    contact: '+60 123 456 78',
    location: 'Royal Ln Mesa, New Jersey',
    status: 'active',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Lead7',
    budget: 'Under $5000',
    notes: 'Event photography for a full day corporate event',
    createdAt: '2026-02-08T10:00:00Z',
    updatedAt: '2026-02-08T10:00:00Z',
  },
  {
    id: '8',
    leadId:'1008',
    name: 'Leslie Alexander',
    requiredService: 'Wedding Planner',
    email: 'User@Gmail.Com',
    contact: '+60 123 456 78',
    location: 'Royal Ln Mesa, New Jersey',
    status: 'expired',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Lead8',
    budget: 'Under $5000',
    notes: 'Full wedding planning and coordination services',
    createdAt: '2026-02-07T10:00:00Z',
    updatedAt: '2026-02-07T10:00:00Z',
  },
]

interface LeadState {
  list: Lead[]
  filteredList: Lead[]
  filters: LeadFilters
  pagination: PaginationState
  isLoading: boolean
  error: string | null
}

const initialState: LeadState = {
  list: mockLeads,
  filteredList: mockLeads,
  filters: {
    search: '',
    status: 'all',
  },
  pagination: {
    ...DEFAULT_PAGINATION,
    total: mockLeads.length,
    totalPages: Math.ceil(mockLeads.length / DEFAULT_PAGINATION.limit),
  },
  isLoading: false,
  error: null,
}

const leadSlice = createSlice({
  name: 'leads',
  initialState,
  reducers: {
    setLeads: (state, action: PayloadAction<Lead[]>) => {
      state.list = action.payload
      state.filteredList = action.payload
      state.pagination.total = action.payload.length
      state.pagination.totalPages = Math.ceil(
        action.payload.length / state.pagination.limit
      )
    },
    setFilters: (state, action: PayloadAction<Partial<LeadFilters>>) => {
      state.filters = { ...state.filters, ...action.payload }

      let filtered = [...state.list]

      // Search by name, email, contact, required service
      if (state.filters.search) {
        const searchLower = state.filters.search.toLowerCase()
        filtered = filtered.filter(
          (lead) =>
            lead.name.toLowerCase().includes(searchLower) ||
            lead.email.toLowerCase().includes(searchLower) ||
            lead.contact.includes(state.filters.search) ||
            lead.requiredService.toLowerCase().includes(searchLower)
        )
      }

      // Status filter
      if (state.filters.status !== 'all') {
        filtered = filtered.filter((lead) => lead.status === state.filters.status)
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
    setLeadStatus: (
      state,
      action: PayloadAction<{ id: string; status: LeadStatus }>
    ) => {
      const { id, status } = action.payload

      const lead = state.list.find((l) => l.id === id)
      if (lead) {
        lead.status = status
        lead.updatedAt = new Date().toISOString()
      }

      const filteredLead = state.filteredList.find((l) => l.id === id)
      if (filteredLead) {
        filteredLead.status = status
        filteredLead.updatedAt = new Date().toISOString()
      }
    },
    addLead: (state, action: PayloadAction<Lead>) => {
      state.list.unshift(action.payload)
      state.filteredList.unshift(action.payload)
      state.pagination.total = state.list.length
      state.pagination.totalPages = Math.ceil(
        state.list.length / state.pagination.limit
      )
    },
    updateLead: (state, action: PayloadAction<Lead>) => {
      const index = state.list.findIndex((lead) => lead.id === action.payload.id)
      if (index !== -1) {
        state.list[index] = {
          ...action.payload,
          updatedAt: new Date().toISOString(),
        }
      }
      const filteredIndex = state.filteredList.findIndex(
        (lead) => lead.id === action.payload.id
      )
      if (filteredIndex !== -1) {
        state.filteredList[filteredIndex] = {
          ...action.payload,
          updatedAt: new Date().toISOString(),
        }
      }
    },
    deleteLead: (state, action: PayloadAction<string>) => {
      state.list = state.list.filter((lead) => lead.id !== action.payload)
      state.filteredList = state.filteredList.filter(
        (lead) => lead.id !== action.payload
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
  setLeads,
  setFilters,
  clearFilters,
  setPage,
  setLimit,
  addLead,
  updateLead,
  deleteLead,
  setLoading,
  setError,
  setLeadStatus,
} = leadSlice.actions

export default leadSlice.reducer

