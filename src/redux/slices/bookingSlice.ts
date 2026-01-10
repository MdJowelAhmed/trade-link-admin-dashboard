import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { Booking, BookingFilters, BookingStatus } from '@/types'
import { carBookingsData } from '@/pages/Booking/bookingData'

interface BookingState {
  list: Booking[]
  filteredList: Booking[]
  filters: BookingFilters
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  isLoading: boolean
  error: string | null
}

const initialState: BookingState = {
  list: carBookingsData.map((booking) => ({
    id: booking.id,
    startDate: booking.startDate,
    endDate: booking.endDate,
    clientName: booking.clientName,
    clientEmail: booking.clientEmail,
    clientPhone: booking.clientPhone,
    carModel: booking.carModel,
    carImage: booking.carImage,
    carName: booking.carName,
    licensePlate: booking.licensePlate,
    plan: booking.plan,
    payment: booking.payment,
    paymentStatus: booking.paymentStatus as 'Paid' | 'Pending',
    status: booking.status as BookingStatus,
  })),
  filteredList: carBookingsData.map((booking) => ({
    id: booking.id,
    startDate: booking.startDate,
    endDate: booking.endDate,
    clientName: booking.clientName,
    carModel: booking.carModel,
    carImage: booking.carImage,
    carName: booking.carName,
    clientEmail: booking.clientEmail,
    clientPhone: booking.clientPhone,
    licensePlate: booking.licensePlate,
    plan: booking.plan,
    payment: booking.payment,
    paymentStatus: booking.paymentStatus as 'Paid' | 'Pending',
    status: booking.status as BookingStatus,
  })),
  filters: {
    search: '',
    status: 'all',
  },
  pagination: {
    page: 1,
    limit: 10,
    total: carBookingsData.length,
    totalPages: Math.ceil(carBookingsData.length / 10),
  },
  isLoading: false,
  error: null,
}

const bookingSlice = createSlice({
  name: 'bookings',
  initialState,
  reducers: {
    setBookings: (state, action: PayloadAction<Booking[]>) => {
      state.list = action.payload
      state.filteredList = action.payload
      state.pagination.total = action.payload.length
      state.pagination.totalPages = Math.ceil(
        action.payload.length / state.pagination.limit
      )
    },
    setFilters: (state, action: PayloadAction<Partial<BookingFilters>>) => {
      state.filters = { ...state.filters, ...action.payload }
      
      // Apply filters
      let filtered = [...state.list]
      
      // Search filter
      if (state.filters.search) {
        const searchLower = state.filters.search.toLowerCase()
        filtered = filtered.filter(
          (booking) =>
            booking.clientName.toLowerCase().includes(searchLower) ||
            booking.carModel.toLowerCase().includes(searchLower) ||
            booking.id.toLowerCase().includes(searchLower) ||
            booking.licensePlate.toLowerCase().includes(searchLower)
        )
      }
      
      // Status filter
      if (state.filters.status !== 'all') {
        filtered = filtered.filter((booking) => booking.status === state.filters.status)
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
    updateBookingStatus: (
      state,
      action: PayloadAction<{ id: string; status: BookingStatus }>
    ) => {
      const { id, status } = action.payload
      const bookingIndex = state.list.findIndex((b) => b.id === id)
      if (bookingIndex !== -1) {
        state.list[bookingIndex].status = status
      }
      const filteredIndex = state.filteredList.findIndex((b) => b.id === id)
      if (filteredIndex !== -1) {
        state.filteredList[filteredIndex].status = status
      }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload
    },
    addBooking: (state, action: PayloadAction<Booking>) => {
      state.list.unshift(action.payload)
      state.filteredList.unshift(action.payload)
      state.pagination.total = state.list.length
      state.pagination.totalPages = Math.ceil(
        state.list.length / state.pagination.limit
      )
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
    },
  },
})

export const {
  setBookings,
  setFilters,
  clearFilters,
  setPage,
  setLimit,
  updateBookingStatus,
  addBooking,
  setLoading,
  setError,
} = bookingSlice.actions

export default bookingSlice.reducer

