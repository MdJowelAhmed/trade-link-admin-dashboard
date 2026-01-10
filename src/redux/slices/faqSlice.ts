import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { FAQ, FAQFilters, PaginationState } from '@/types'
import { DEFAULT_PAGINATION } from '@/utils/constants'

// Mock data for demonstration
const mockFAQs: FAQ[] = [
  {
    id: '1',
    question: 'How do I rent a car?',
    answer: 'You can rent a car by browsing our available vehicles, selecting your preferred dates, and completing the booking process online.',
    position: 'top-left',
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-15T10:30:00Z',
  },
  {
    id: '2',
    question: 'What documents do I need?',
    answer: 'You need a valid driver\'s license, credit card, and proof of insurance. International drivers may need an IDP.',
    position: 'top-right',
    createdAt: '2024-01-16T11:30:00Z',
    updatedAt: '2024-01-16T11:30:00Z',
  },
  {
    id: '3',
    question: 'Can I cancel my booking?',
    answer: 'Yes, you can cancel your booking up to 24 hours before the rental start time for a full refund.',
    position: 'bottom-left',
    createdAt: '2024-01-17T12:30:00Z',
    updatedAt: '2024-01-17T12:30:00Z',
  },
  {
    id: '4',
    question: 'What is the minimum age to rent?',
    answer: 'The minimum age to rent a car is 21 years old. Drivers under 25 may have additional fees.',
    position: 'bottom-right',
    createdAt: '2024-01-18T13:30:00Z',
    updatedAt: '2024-01-18T13:30:00Z',
  },
  {
    id: '5',
    question: 'Do you offer insurance?',
    answer: 'Yes, we offer comprehensive insurance coverage options. You can add insurance during the booking process.',
    position: 'top-left',
    createdAt: '2024-01-19T14:30:00Z',
    updatedAt: '2024-01-19T14:30:00Z',
  },
]

interface FAQState {
  list: FAQ[]
  filteredList: FAQ[]
  filters: FAQFilters
  pagination: PaginationState
  isLoading: boolean
  error: string | null
}

const initialState: FAQState = {
  list: mockFAQs,
  filteredList: mockFAQs,
  filters: {
    search: '',
    position: 'all',
  },
  pagination: {
    ...DEFAULT_PAGINATION,
    total: mockFAQs.length,
    totalPages: Math.ceil(mockFAQs.length / DEFAULT_PAGINATION.limit),
  },
  isLoading: false,
  error: null,
}

const faqSlice = createSlice({
  name: 'faqs',
  initialState,
  reducers: {
    setFAQs: (state, action: PayloadAction<FAQ[]>) => {
      state.list = action.payload
      state.filteredList = action.payload
      state.pagination.total = action.payload.length
      state.pagination.totalPages = Math.ceil(
        action.payload.length / state.pagination.limit
      )
    },
    setFilters: (state, action: PayloadAction<Partial<FAQFilters>>) => {
      state.filters = { ...state.filters, ...action.payload }
      
      // Apply filters
      let filtered = [...state.list]
      
      // Search filter
      if (state.filters.search) {
        const searchLower = state.filters.search.toLowerCase()
        filtered = filtered.filter(
          (faq) =>
            faq.question.toLowerCase().includes(searchLower) ||
            faq.answer.toLowerCase().includes(searchLower)
        )
      }
      
      // Position filter
      if (state.filters.position !== 'all') {
        filtered = filtered.filter((faq) => faq.position === state.filters.position)
      }
      
      state.filteredList = filtered
      state.pagination.total = filtered.length
      state.pagination.totalPages = Math.ceil(
        filtered.length / state.pagination.limit
      )
      state.pagination.page = 1
    },
    clearFilters: (state) => {
      state.filters = { search: '', position: 'all' }
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
    addFAQ: (state, action: PayloadAction<FAQ>) => {
      state.list.unshift(action.payload)
      state.filteredList.unshift(action.payload)
      state.pagination.total = state.list.length
      state.pagination.totalPages = Math.ceil(
        state.list.length / state.pagination.limit
      )
    },
    updateFAQ: (state, action: PayloadAction<FAQ>) => {
      const index = state.list.findIndex((faq) => faq.id === action.payload.id)
      if (index !== -1) {
        state.list[index] = { ...action.payload, updatedAt: new Date().toISOString() }
      }
      const filteredIndex = state.filteredList.findIndex((faq) => faq.id === action.payload.id)
      if (filteredIndex !== -1) {
        state.filteredList[filteredIndex] = { ...action.payload, updatedAt: new Date().toISOString() }
      }
    },
    deleteFAQ: (state, action: PayloadAction<string>) => {
      state.list = state.list.filter((faq) => faq.id !== action.payload)
      state.filteredList = state.filteredList.filter((faq) => faq.id !== action.payload)
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
  setFAQs,
  setFilters,
  clearFilters,
  setPage,
  setLimit,
  addFAQ,
  updateFAQ,
  deleteFAQ,
  setLoading,
  setError,
} = faqSlice.actions

export default faqSlice.reducer

