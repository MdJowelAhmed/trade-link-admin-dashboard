import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { Lead, LeadFilters, LeadStatus, JobPostStatus, PaginationState } from '@/types'
import { DEFAULT_PAGINATION } from '@/utils/constants'

interface LeadState {
  list: Lead[]
  filteredList: Lead[]
  filters: LeadFilters
  pagination: PaginationState
  isLoading: boolean
  error: string | null
}

const initialState: LeadState = {
  list: [],
  filteredList: [],
  filters: {
    search: '',
    status: 'all',
  },
  pagination: {
    ...DEFAULT_PAGINATION,
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
    },
    setPagination: (state, action: PayloadAction<Partial<PaginationState>>) => {
      state.pagination = { ...state.pagination, ...action.payload }
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
  setPagination,
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

