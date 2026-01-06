import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { ModalType } from '@/types'

interface ModalState {
  isOpen: boolean
  type: ModalType
  data: unknown
}

interface UIState {
  modal: ModalState
  sidebarCollapsed: boolean
  theme: 'light' | 'dark'
  globalLoading: boolean
  toast: {
    isOpen: boolean
    type: 'success' | 'error' | 'warning' | 'info'
    message: string
  }
}

const initialState: UIState = {
  modal: {
    isOpen: false,
    type: null,
    data: null,
  },
  sidebarCollapsed: false,
  theme: 'light',
  globalLoading: false,
  toast: {
    isOpen: false,
    type: 'info',
    message: '',
  },
}

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    openModal: (state, action: PayloadAction<{ type: ModalType; data?: unknown }>) => {
      state.modal.isOpen = true
      state.modal.type = action.payload.type
      state.modal.data = action.payload.data || null
    },
    closeModal: (state) => {
      state.modal.isOpen = false
      state.modal.type = null
      state.modal.data = null
    },
    toggleSidebar: (state) => {
      state.sidebarCollapsed = !state.sidebarCollapsed
    },
    setSidebarCollapsed: (state, action: PayloadAction<boolean>) => {
      state.sidebarCollapsed = action.payload
    },
    setTheme: (state, action: PayloadAction<'light' | 'dark'>) => {
      state.theme = action.payload
      if (action.payload === 'dark') {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
    },
    toggleTheme: (state) => {
      const newTheme = state.theme === 'light' ? 'dark' : 'light'
      state.theme = newTheme
      if (newTheme === 'dark') {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
    },
    setGlobalLoading: (state, action: PayloadAction<boolean>) => {
      state.globalLoading = action.payload
    },
    showToast: (state, action: PayloadAction<{ type: UIState['toast']['type']; message: string }>) => {
      state.toast.isOpen = true
      state.toast.type = action.payload.type
      state.toast.message = action.payload.message
    },
    hideToast: (state) => {
      state.toast.isOpen = false
    },
  },
})

export const {
  openModal,
  closeModal,
  toggleSidebar,
  setSidebarCollapsed,
  setTheme,
  toggleTheme,
  setGlobalLoading,
  showToast,
  hideToast,
} = uiSlice.actions

export default uiSlice.reducer











