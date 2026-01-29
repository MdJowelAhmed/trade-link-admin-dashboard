import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { Transaction, TransactionFilters, TransactionStatus, PaginationState } from '@/types'
import { DEFAULT_PAGINATION } from '@/utils/constants'

// Mock data for demonstration
const mockTransactions: Transaction[] = [
  {
    id: '1',
    transactionId: 'QPOUVHFWBO',
    leadId: '1234567890',
    service: 'Car rental',
    date: '2026-08-26',
    userName: 'Alice Jhonson',
    email: 'alicejhon345@gmail.com',
    amount: 350,
    currency: 'EUR',
    status: 'Pending',
    paymentMethod: 'Credit Card',
    description: 'Car rental payment',
    createdAt: '2026-08-26T10:00:00Z',
    updatedAt: '2026-08-26T10:00:00Z',
  },
  {
    id: '2',
    transactionId: 'QPOUVHFWBO',
    leadId: '1234567890',
    service: 'Car rental',
    date: '2026-08-26',
    userName: 'Alice Jhonson',
    email: 'alicejhon345@gmail.com',
    amount: 350,
    currency: 'EUR',
    status: 'Completed',
    paymentMethod: 'Credit Card',
    description: 'Car rental payment',
    createdAt: '2026-08-26T10:00:00Z',
    updatedAt: '2026-08-26T10:00:00Z',
  },
  {
    id: '3',
    transactionId: 'QPOUVHFWBO',
    leadId: '1234567890',
    service: 'Car rental',
    date: '2026-08-26',
    userName: 'Alice Jhonson',
    email: 'alicejhon345@gmail.com',
    amount: 350,
    currency: 'EUR',
    status: 'Pending',
    paymentMethod: 'Credit Card',
    description: 'Car rental payment',
    createdAt: '2026-08-26T10:00:00Z',
    updatedAt: '2026-08-26T10:00:00Z',
  },
  {
    id: '4',
    transactionId: 'QPOUVHFWBO',
    leadId: '1234567890',
    service: 'Car rental',
    date: '2026-08-26',
    userName: 'Alice Jhonson',
    email: 'alicejhon345@gmail.com',
    amount: 350,
    currency: 'EUR',
    status: 'Completed',
    paymentMethod: 'Credit Card',
    description: 'Car rental payment',
    createdAt: '2026-08-26T10:00:00Z',
    updatedAt: '2026-08-26T10:00:00Z',
  },
  {
    id: '5',
    transactionId: 'QPOUVHFWBO',
    leadId: '1234567890',
    service: 'Car rental',
    date: '2026-08-26',
    userName: 'Alice Jhonson',
    email: 'alicejhon345@gmail.com',
    amount: 350,
    currency: 'EUR',
    status: 'Pending',
    paymentMethod: 'Credit Card',
    description: 'Car rental payment',
    createdAt: '2026-08-26T10:00:00Z',
    updatedAt: '2026-08-26T10:00:00Z',
  },
  {
    id: '6',
    transactionId: 'QPOUVHFWBO',
    leadId: '1234567890',
    service: 'Car rental',
    date: '2026-08-26',
    userName: 'Alice Jhonson',
    email: 'alicejhon345@gmail.com',
    amount: 350,
    currency: 'EUR',
    status: 'Completed',
    paymentMethod: 'Credit Card',
    description: 'Car rental payment',
    createdAt: '2026-08-26T10:00:00Z',
    updatedAt: '2026-08-26T10:00:00Z',
  },
  {
    id: '7',
    transactionId: 'QPOUVHFWBO',
    leadId: '1234567890',
    service: 'Car rental',
    date: '2026-08-26',
    userName: 'Alice Jhonson',
    email: 'alicejhon345@gmail.com',
    amount: 350,
    currency: 'EUR',
    status: 'Pending',
    paymentMethod: 'Credit Card',
    description: 'Car rental payment',
    createdAt: '2026-08-26T10:00:00Z',
    updatedAt: '2026-08-26T10:00:00Z',
  },
  {
    id: '8',
    transactionId: 'TXN123456',
    leadId: '1234567890',
    service: 'Car rental',
    date: '2026-08-25',
    userName: 'John Smith',
    email: 'john.smith@example.com',
    amount: 500,
    currency: 'EUR',
    status: 'Completed',
    paymentMethod: 'PayPal',
    description: 'Premium car rental',
    createdAt: '2026-08-25T14:30:00Z',
    updatedAt: '2026-08-25T14:30:00Z',
  },
  {
    id: '9',
    transactionId: 'TXN789012',
    leadId: '1234567890',
    service: 'Car rental',
    date: '2026-08-24',
    userName: 'Emma Wilson',
    email: 'emma.wilson@example.com',
    amount: 250,
    currency: 'EUR',
    status: 'Completed',
    paymentMethod: 'Bank Transfer',
    description: 'Standard car rental',
    createdAt: '2026-08-24T09:15:00Z',
    updatedAt: '2026-08-24T09:15:00Z',
  },
  {
    id: '10',
    transactionId: 'TXN345678',
    leadId: '1234567890',
    service: 'Car rental',
    date: '2026-08-23',
    userName: 'Michael Brown',
    email: 'michael.brown@example.com',
    amount: 450,
    currency: 'EUR',
    status: 'Pending',
    paymentMethod: 'Credit Card',
    description: 'Luxury car rental',
    createdAt: '2026-08-23T16:45:00Z',
    updatedAt: '2026-08-23T16:45:00Z',
  },
  {
    id: '11',
    transactionId: 'TXN901234',
    leadId: '1234567890',
    service: 'Car rental',
    date: '2026-08-22',
    userName: 'Sarah Davis',
    email: 'sarah.davis@example.com',
    amount: 300,
    currency: 'EUR',
    status: 'Completed',
    paymentMethod: 'Credit Card',
    description: 'Economy car rental',
    createdAt: '2026-08-22T11:20:00Z',
    updatedAt: '2026-08-22T11:20:00Z',
  },
  {
    id: '12',
    transactionId: 'TXN567890',
    leadId: '1234567890',
    service: 'Car rental',
    date: '2026-08-21',
    userName: 'David Lee',
    email: 'david.lee@example.com',
    amount: 400,
    currency: 'EUR',
    status: 'Failed',
    paymentMethod: 'Credit Card',
    description: 'SUV rental',
    createdAt: '2026-08-21T13:10:00Z',
    updatedAt: '2026-08-21T13:10:00Z',
  },
  {
    id: '13',
    transactionId: 'TXN234567',
    leadId: '1234567890',
    service: 'Car rental',
    date: '2026-08-20',
    userName: 'Lisa Anderson',
    email: 'lisa.anderson@example.com',
    amount: 275,
    currency: 'EUR',
    status: 'Completed',
    paymentMethod: 'PayPal',
    description: 'Compact car rental',
    createdAt: '2026-08-20T08:30:00Z',
    updatedAt: '2026-08-20T08:30:00Z',
  },
  {
    id: '14',
    transactionId: 'TXN890123',
    leadId: '1234567890',
    service: 'Car rental',
        date: '2026-08-19',
    userName: 'Robert Taylor',
    email: 'robert.taylor@example.com',
    amount: 550,
    currency: 'EUR',
    status: 'Pending',
    paymentMethod: 'Bank Transfer',
    description: 'Premium SUV rental',
    createdAt: '2026-08-19T15:45:00Z',
    updatedAt: '2026-08-19T15:45:00Z',
  },
  {
    id: '15',
    transactionId: 'TXN456789',
    leadId: '1234567890',
    service: 'Car rental',
    date: '2026-08-18',
    userName: 'Jennifer White',
    email: 'jennifer.white@example.com',
    amount: 320,
    currency: 'EUR',
    status: 'Completed',
    paymentMethod: 'Credit Card',
    description: 'Mid-size car rental',
    createdAt: '2026-08-18T10:15:00Z',
    updatedAt: '2026-08-18T10:15:00Z',
  },
]

interface TransactionState {
  list: Transaction[]
  filteredList: Transaction[]
  filters: TransactionFilters
  pagination: PaginationState
  isLoading: boolean
  error: string | null
}

const initialState: TransactionState = {
  list: mockTransactions,
  filteredList: mockTransactions,
  filters: {
    search: '',
    status: 'all',
  },
  pagination: {
    ...DEFAULT_PAGINATION,
    total: mockTransactions.length,
    totalPages: Math.ceil(mockTransactions.length / DEFAULT_PAGINATION.limit),
  },
  isLoading: false,
  error: null,
}

const transactionSlice = createSlice({
  name: 'transactions',
  initialState,
  reducers: {
    setTransactions: (state, action: PayloadAction<Transaction[]>) => {
      state.list = action.payload
      state.filteredList = action.payload
      state.pagination.total = action.payload.length
      state.pagination.totalPages = Math.ceil(
        action.payload.length / state.pagination.limit
      )
    },
    setFilters: (state, action: PayloadAction<Partial<TransactionFilters>>) => {
      state.filters = { ...state.filters, ...action.payload }
      
      // Apply filters
      let filtered = [...state.list]
      
      // Search filter
      if (state.filters.search) {
        const searchLower = state.filters.search.toLowerCase()
        filtered = filtered.filter(
          (transaction) =>
            transaction.transactionId.toLowerCase().includes(searchLower) ||
            transaction.userName.toLowerCase().includes(searchLower) ||
            transaction.email.toLowerCase().includes(searchLower)
        )
      }
      
      // Status filter
      if (state.filters.status !== 'all') {
        filtered = filtered.filter((transaction) => transaction.status === state.filters.status)
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
    setTransactionStatus: (
      state,
      action: PayloadAction<{ id: string; status: TransactionStatus }>
    ) => {
      const { id, status } = action.payload

      const transaction = state.list.find((t) => t.id === id)
      if (transaction) {
        transaction.status = status
        transaction.updatedAt = new Date().toISOString()
      }

      const filteredTransaction = state.filteredList.find((t) => t.id === id)
      if (filteredTransaction) {
        filteredTransaction.status = status
        filteredTransaction.updatedAt = new Date().toISOString()
      }
    },
    addTransaction: (state, action: PayloadAction<Transaction>) => {
      state.list.unshift(action.payload)
      state.filteredList.unshift(action.payload)
      state.pagination.total = state.list.length
      state.pagination.totalPages = Math.ceil(
        state.list.length / state.pagination.limit
      )
    },
    updateTransaction: (state, action: PayloadAction<Transaction>) => {
      const index = state.list.findIndex((transaction) => transaction.id === action.payload.id)
      if (index !== -1) {
        state.list[index] = { ...action.payload, updatedAt: new Date().toISOString() }
      }
      const filteredIndex = state.filteredList.findIndex((transaction) => transaction.id === action.payload.id)
      if (filteredIndex !== -1) {
        state.filteredList[filteredIndex] = { ...action.payload, updatedAt: new Date().toISOString() }
      }
    },
    deleteTransaction: (state, action: PayloadAction<string>) => {
      state.list = state.list.filter((transaction) => transaction.id !== action.payload)
      state.filteredList = state.filteredList.filter((transaction) => transaction.id !== action.payload)
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
  setTransactions,
  setFilters,
  clearFilters,
  setPage,
  setLimit,
  addTransaction,
  updateTransaction,
  deleteTransaction,
  setLoading,
  setError,
  setTransactionStatus,
} = transactionSlice.actions

export default transactionSlice.reducer

