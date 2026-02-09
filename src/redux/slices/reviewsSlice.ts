import { createSlice, PayloadAction } from '@reduxjs/toolkit'

// UI-only state - no server data stored here
// Server data comes from RTK Query (useGetReviewsQuery)
interface ReviewUIState {
  selectedReviewId: string | null
  filters: {
    search: string
    rating: string
  }
  pagination: {
    page: number
    limit: number
  }
}

const initialState: ReviewUIState = {
  selectedReviewId: null,
  filters: {
    search: '',
    rating: 'all',
  },
  pagination: {
    page: 1,
    limit: 10,
  },
}

const reviewsSlice = createSlice({
  name: 'reviewUI',
  initialState,
  reducers: {
    setSelectedReviewId: (state, action: PayloadAction<string | null>) => {
      state.selectedReviewId = action.payload
    },
    setFilters: (state, action: PayloadAction<Partial<ReviewUIState['filters']>>) => {
      state.filters = { ...state.filters, ...action.payload }
      // Reset to page 1 when filters change
      state.pagination.page = 1
    },
    clearFilters: (state) => {
      state.filters = { search: '', rating: 'all' }
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
  setSelectedReviewId,
  setFilters,
  clearFilters,
  setPage,
  setLimit,
} = reviewsSlice.actions

export default reviewsSlice.reducer
