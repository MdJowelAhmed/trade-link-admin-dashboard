import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { CategoryFilters } from '@/types'

// UI-only state - no server data stored here
// Server data comes from RTK Query (useGetCategoriesQuery)
interface CategoryUIState {
  selectedCategoryId: string | null
  filters: CategoryFilters
  pagination: {
    page: number
    limit: number
  }
}

const initialState: CategoryUIState = {
  selectedCategoryId: null,
  filters: {
    search: '',
    status: 'all',
  },
  pagination: {
    page: 1,
    limit: 12,
  },
}

const categorySlice = createSlice({
  name: 'categoryUI',
  initialState,
  reducers: {
    setSelectedCategoryId: (state, action: PayloadAction<string | null>) => {
      state.selectedCategoryId = action.payload
    },
    setFilters: (state, action: PayloadAction<Partial<CategoryFilters>>) => {
      state.filters = { ...state.filters, ...action.payload }
      // Reset to page 1 when filters change
      state.pagination.page = 1
    },
    clearFilters: (state) => {
      state.filters = { search: '', status: 'all' }
      state.pagination.page = 1
    },
    setPage: (state, action: PayloadAction<number>) => {
      state.pagination.page = action.payload
    },
    setLimit: (state, action: PayloadAction<number>) => {
      state.pagination.limit = action.payload
      state.pagination.page = 1
    },
  },
})

export const {
  setSelectedCategoryId,
  setFilters,
  clearFilters,
  setPage,
  setLimit,
} = categorySlice.actions

export default categorySlice.reducer
