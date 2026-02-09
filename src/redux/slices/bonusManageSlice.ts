import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { PaginationState } from '@/types'
import { DEFAULT_PAGINATION } from '@/utils/constants'
import type { BackendProfessional } from '@/redux/api/bonusManageApi'

interface BonusManagementState {
  list: BackendProfessional[]
  filters: {
    search: string
  }
  pagination: PaginationState
  isLoading: boolean
  error: string | null
}

const initialState: BonusManagementState = {
  list: [],
  filters: {
    search: '',
  },
  pagination: {
    ...DEFAULT_PAGINATION,
    total: 0,
    totalPages: 0,
  },
  isLoading: false,
  error: null,
}

const bonusManageSlice = createSlice({
  name: 'bonusManagement',
  initialState,
  reducers: {
    setProfessionals: (state, action: PayloadAction<BackendProfessional[]>) => {
      state.list = action.payload
    },
    setFilters: (state, action: PayloadAction<Partial<BonusManagementState['filters']>>) => {
      state.filters = { ...state.filters, ...action.payload }
    },
    clearFilters: (state) => {
      state.filters = { search: '' }
    },
    setPage: (state, action: PayloadAction<number>) => {
      state.pagination.page = action.payload
    },
    setLimit: (state, action: PayloadAction<number>) => {
      state.pagination.limit = action.payload
    },
    setPagination: (state, action: PayloadAction<Partial<PaginationState>>) => {
      state.pagination = { ...state.pagination, ...action.payload }
    },
    updateProfessionalWallet: (
      state,
      action: PayloadAction<{ id: string; amount: number }>
    ) => {
      const { id, amount } = action.payload
      const professional = state.list.find((p) => p._id === id)
      if (professional) {
        professional.walletBalance = amount
        professional.updatedAt = new Date().toISOString()
      }
    },
    updateProfessionalStatus: (
      state,
      action: PayloadAction<{ id: string; approveStatus: 'APPROVED' | 'REJECTED' | 'PENDING' }>
    ) => {
      const { id, approveStatus } = action.payload
      const professional = state.list.find((p) => p._id === id)
      if (professional) {
        professional.professional.approveStatus = approveStatus
        professional.updatedAt = new Date().toISOString()
      }
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
  setProfessionals,
  setFilters,
  clearFilters,
  setPage,
  setLimit,
  setPagination,
  updateProfessionalWallet,
  updateProfessionalStatus,
  setLoading,
  setError,
} = bonusManageSlice.actions

export default bonusManageSlice.reducer