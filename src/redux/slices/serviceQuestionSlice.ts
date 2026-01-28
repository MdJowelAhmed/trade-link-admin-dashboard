import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { ServiceQuestion, ServiceQuestionFormData } from '@/types'

interface ServiceQuestionState {
  list: ServiceQuestion[]
  isLoading: boolean
  error: string | null
}

const initialState: ServiceQuestionState = {
  list: [],
  isLoading: false,
  error: null,
}

const serviceQuestionSlice = createSlice({
  name: 'serviceQuestions',
  initialState,
  reducers: {
    setServiceQuestions: (state, action: PayloadAction<ServiceQuestion[]>) => {
      state.list = action.payload
    },
    addServiceQuestion: (state, action: PayloadAction<ServiceQuestion>) => {
      state.list.push(action.payload)
    },
    updateServiceQuestion: (state, action: PayloadAction<ServiceQuestion>) => {
      const index = state.list.findIndex((q) => q.id === action.payload.id)
      if (index !== -1) {
        state.list[index] = { ...action.payload, updatedAt: new Date().toISOString() }
      }
    },
    deleteServiceQuestion: (state, action: PayloadAction<string>) => {
      state.list = state.list.filter((q) => q.id !== action.payload)
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
  setServiceQuestions,
  addServiceQuestion,
  updateServiceQuestion,
  deleteServiceQuestion,
  setLoading,
  setError,
} = serviceQuestionSlice.actions

export default serviceQuestionSlice.reducer
