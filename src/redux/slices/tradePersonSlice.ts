import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type {
  TradePerson,
  TradePersonFilters,
  TradePersonStatus,
  PaginationState,
} from '@/types'
import { DEFAULT_PAGINATION } from '@/utils/constants'

interface TradePersonState {
  list: TradePerson[]
  filteredList: TradePerson[]
  filters: TradePersonFilters
  pagination: PaginationState
  isLoading: boolean
  error: string | null
}

const initialState: TradePersonState = {
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

const tradePersonSlice = createSlice({
  name: 'tradePersons',
  initialState,
  reducers: {
    setTradePersons: (state, action: PayloadAction<TradePerson[]>) => {
      state.list = action.payload
      state.filteredList = action.payload
      state.pagination.total = action.payload.length
      state.pagination.totalPages = Math.ceil(
        action.payload.length / state.pagination.limit || 1
      )
    },
    setFilters: (state, action: PayloadAction<Partial<TradePersonFilters>>) => {
      state.filters = { ...state.filters, ...action.payload }
      
      // Apply filters
      let filtered = [...state.list]
      
      // Search filter
      if (state.filters.search) {
        const searchLower = state.filters.search.toLowerCase()
        filtered = filtered.filter(
          (tradePerson) =>
            tradePerson.businessName.toLowerCase().includes(searchLower) ||
            tradePerson.ownerName.toLowerCase().includes(searchLower) ||
            tradePerson.email.toLowerCase().includes(searchLower) ||
            tradePerson.services.some(s => s.toLowerCase().includes(searchLower)) ||
            tradePerson.location.toLowerCase().includes(searchLower)
        )
      }
      
      // Status filter
      if (state.filters.status !== 'all') {
        filtered = filtered.filter((tradePerson) => tradePerson.status === state.filters.status)
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
        state.filteredList.length / (action.payload || 1)
      )
      state.pagination.page = 1
    },
    setPagination: (state, action: PayloadAction<Partial<PaginationState>>) => {
      state.pagination = { ...state.pagination, ...action.payload }
    },
    setTradePersonStatus: (
      state,
      action: PayloadAction<{ id: string; status: TradePersonStatus }>
    ) => {
      const { id, status } = action.payload

      const tradePerson = state.list.find((t) => t.id === id)
      if (tradePerson) {
        tradePerson.status = status
        tradePerson.updatedAt = new Date().toISOString()
      }

      const filteredTradePerson = state.filteredList.find((t) => t.id === id)
      if (filteredTradePerson) {
        filteredTradePerson.status = status
        filteredTradePerson.updatedAt = new Date().toISOString()
      }
    },
    approveTradePerson: (state, action: PayloadAction<string>) => {
      const tradePerson = state.list.find((t) => t.id === action.payload)
      if (tradePerson) {
        tradePerson.status = 'approved'
        tradePerson.updatedAt = new Date().toISOString()
      }
      const filteredTradePerson = state.filteredList.find((t) => t.id === action.payload)
      if (filteredTradePerson) {
        filteredTradePerson.status = 'approved'
        filteredTradePerson.updatedAt = new Date().toISOString()
      }
    },
    rejectTradePerson: (state, action: PayloadAction<string>) => {
      const tradePerson = state.list.find((t) => t.id === action.payload)
      if (tradePerson) {
        tradePerson.status = 'rejected'
        tradePerson.updatedAt = new Date().toISOString()
      }
      const filteredTradePerson = state.filteredList.find((t) => t.id === action.payload)
      if (filteredTradePerson) {
        filteredTradePerson.status = 'rejected'
        filteredTradePerson.updatedAt = new Date().toISOString()
      }
    },
    addTradePerson: (state, action: PayloadAction<TradePerson>) => {
      state.list.unshift(action.payload)
      state.filteredList.unshift(action.payload)
      state.pagination.total = state.list.length
      state.pagination.totalPages = Math.ceil(
        state.list.length / state.pagination.limit
      )
    },
    updateTradePerson: (state, action: PayloadAction<TradePerson>) => {
      const index = state.list.findIndex((tradePerson) => tradePerson.id === action.payload.id)
      if (index !== -1) {
        state.list[index] = { ...action.payload, updatedAt: new Date().toISOString() }
      }
      const filteredIndex = state.filteredList.findIndex((tradePerson) => tradePerson.id === action.payload.id)
      if (filteredIndex !== -1) {
        state.filteredList[filteredIndex] = { ...action.payload, updatedAt: new Date().toISOString() }
      }
    },
    deleteTradePerson: (state, action: PayloadAction<string>) => {
      state.list = state.list.filter((tradePerson) => tradePerson.id !== action.payload)
      state.filteredList = state.filteredList.filter((tradePerson) => tradePerson.id !== action.payload)
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
  setTradePersons,
  setFilters,
  clearFilters,
  setPage,
  setLimit,
  setTradePersonStatus,
  approveTradePerson,
  rejectTradePerson,
  addTradePerson,
  updateTradePerson,
  deleteTradePerson,
  setLoading,
  setError,
} = tradePersonSlice.actions

export default tradePersonSlice.reducer
