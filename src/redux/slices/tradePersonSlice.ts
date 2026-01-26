import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { TradePerson, TradePersonFilters, TradePersonStatus, PaginationState } from '@/types'
import { DEFAULT_PAGINATION } from '@/utils/constants'

// Mock data for demonstration
const mockTradePersons: TradePerson[] = [
  {
    id: '1',
    businessName: 'Leslie Alexander',
    ownerName: 'Leslie Alexander',
    services: ['Domestic Cleaning'],
    email: 'User@Gmail.Com',
    mobile: '+99123456789',
    location: 'Royal Ln Mesa, New Jersey',
    address: '2464 Royal Ln. Mesa, New Jersey 45463',
    status: 'approved',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Leslie',
    galleryImages: [
      'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=300&h=200&fit=crop',
      'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=300&h=200&fit=crop',
      'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=300&h=200&fit=crop',
    ],
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-20T14:45:00Z',
  },
  {
    id: '2',
    businessName: 'Leslie Alexander',
    ownerName: 'Leslie Alexander',
    services: ['Pool Cleaning'],
    email: 'User@Gmail.Com',
    mobile: '+99123456789',
    location: 'Royal Ln Mesa, New Jersey',
    address: '2464 Royal Ln. Mesa, New Jersey 45463',
    status: 'approved',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Leslie2',
    galleryImages: [
      'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=300&h=200&fit=crop',
      'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=300&h=200&fit=crop',
    ],
    createdAt: '2024-01-16T11:30:00Z',
    updatedAt: '2024-01-21T15:45:00Z',
  },
  {
    id: '3',
    businessName: 'Leslie Alexander',
    ownerName: 'Leslie Alexander',
    services: ['Accountant'],
    email: 'User@Gmail.Com',
    mobile: '+99123456789',
    location: 'Royal Ln Mesa, New Jersey',
    address: '2464 Royal Ln. Mesa, New Jersey 45463',
    status: 'pending',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Leslie3',
    galleryImages: [
      'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=300&h=200&fit=crop',
    ],
    createdAt: '2024-01-17T12:30:00Z',
    updatedAt: '2024-01-22T16:45:00Z',
  },
  {
    id: '4',
    businessName: 'Leslie Alexander',
    ownerName: 'Leslie Alexander',
    services: ['Plumbing'],
    email: 'User@Gmail.Com',
    mobile: '+99123456789',
    location: 'Royal Ln Mesa, New Jersey',
    address: '2464 Royal Ln. Mesa, New Jersey 45463',
    status: 'pending',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Leslie4',
    galleryImages: [
      'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=300&h=200&fit=crop',
      'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=300&h=200&fit=crop',
    ],
    createdAt: '2024-01-18T13:30:00Z',
    updatedAt: '2024-01-23T17:45:00Z',
  },
  {
    id: '5',
    businessName: 'Leslie Alexander',
    ownerName: 'Leslie Alexander',
    services: ['Message Therapy'],
    email: 'User@Gmail.Com',
    mobile: '+99123456789',
    location: 'Royal Ln Mesa, New Jersey',
    address: '2464 Royal Ln. Mesa, New Jersey 45463',
    status: 'pending',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Leslie5',
    galleryImages: [
      'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=300&h=200&fit=crop',
    ],
    createdAt: '2024-01-19T14:30:00Z',
    updatedAt: '2024-01-24T18:45:00Z',
  },
  {
    id: '6',
    businessName: 'Leslie Alexander',
    ownerName: 'Leslie Alexander',
    services: ['Makeup Artist'],
    email: 'User@Gmail.Com',
    mobile: '+99123456789',
    location: 'Royal Ln Mesa, New Jersey',
    address: '2464 Royal Ln. Mesa, New Jersey 45463',
    status: 'pending',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Leslie6',
    galleryImages: [
      'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=300&h=200&fit=crop',
      'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=300&h=200&fit=crop',
    ],
    createdAt: '2024-01-20T15:30:00Z',
    updatedAt: '2024-01-25T19:45:00Z',
  },
  {
    id: '7',
    businessName: 'Leslie Alexander',
    ownerName: 'Leslie Alexander',
    services: ['Photographer'],
    email: 'User@Gmail.Com',
    mobile: '+99123456789',
    location: 'Royal Ln Mesa, New Jersey',
    address: '2464 Royal Ln. Mesa, New Jersey 45463',
    status: 'pending',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Leslie7',
    galleryImages: [
      'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=300&h=200&fit=crop',
    ],
    createdAt: '2024-01-21T16:30:00Z',
    updatedAt: '2024-01-26T20:45:00Z',
  },
  {
    id: '8',
    businessName: 'Leslie Alexander',
    ownerName: 'Leslie Alexander',
    services: ['Wedding Planner'],
    email: 'User@Gmail.Com',
    mobile: '+99123456789',
    location: 'Royal Ln Mesa, New Jersey',
    address: '2464 Royal Ln. Mesa, New Jersey 45463',
    status: 'rejected',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Leslie8',
    galleryImages: [
      'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=300&h=200&fit=crop',
      'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=300&h=200&fit=crop',
    ],
    createdAt: '2024-01-22T17:30:00Z',
    updatedAt: '2024-01-27T21:45:00Z',
  },
  {
    id: '9',
    businessName: 'Tavy Rahman',
    ownerName: 'Tavy Rahman',
    services: ['Wedding Planner', 'Wedding Photography', 'Makeup Artist'],
    email: 'Example@gmail.com',
    mobile: '+99123456789',
    location: 'Royal Ln Mesa, New Jersey',
    address: '2464 Royal Ln. Mesa, New Jersey 45463',
    status: 'pending',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Tavy',
    galleryImages: [
      'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=300&h=200&fit=crop',
      'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=300&h=200&fit=crop',
      'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=300&h=200&fit=crop',
    ],
    createdAt: '2024-01-23T18:30:00Z',
    updatedAt: '2024-01-28T22:45:00Z',
  },
]

interface TradePersonState {
  list: TradePerson[]
  filteredList: TradePerson[]
  filters: TradePersonFilters
  pagination: PaginationState
  isLoading: boolean
  error: string | null
}

const initialState: TradePersonState = {
  list: mockTradePersons,
  filteredList: mockTradePersons,
  filters: {
    search: '',
    status: 'all',
  },
  pagination: {
    ...DEFAULT_PAGINATION,
    total: mockTradePersons.length,
    totalPages: Math.ceil(mockTradePersons.length / DEFAULT_PAGINATION.limit),
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
        action.payload.length / state.pagination.limit
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
        state.filteredList.length / action.payload
      )
      state.pagination.page = 1
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
