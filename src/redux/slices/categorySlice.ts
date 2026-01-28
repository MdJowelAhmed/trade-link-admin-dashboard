import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { Category, CategoryFilters, PaginationState } from '@/types'
import { DEFAULT_PAGINATION } from '@/utils/constants'

// Mock data for demonstration - matching the image examples
const mockCategories: Category[] = [
  {
    id: '1',
    name: 'Outdoor & Landscaping',
    slug: 'outdoor-landscaping',
    description: 'Outdoor and landscaping services.',
    image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400',
    parentId: null,
    status: 'active',
    productCount: 0,
    createdAt: '2024-01-10T10:00:00Z',
    updatedAt: '2024-01-20T14:45:00Z',
  },
  {
    id: '2',
    name: 'Driveways & Surfacing',
    slug: 'driveways-surfacing',
    description: 'Driveway and surfacing services.',
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400',
    parentId: null,
    status: 'active',
    productCount: 0,
    createdAt: '2024-01-11T11:00:00Z',
    updatedAt: '2024-01-21T15:45:00Z',
  },
  {
    id: '3',
    name: 'Building & Structural',
    slug: 'building-structural',
    description: 'Building and structural services.',
    image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400',
    parentId: null,
    status: 'active',
    productCount: 0,
    createdAt: '2024-01-12T12:00:00Z',
    updatedAt: '2024-01-22T16:45:00Z',
  },
  {
    id: '4',
    name: 'Home Renovation & Interiors',
    slug: 'home-renovation-interiors',
    description: 'Home renovation and interior services.',
    image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400',
    parentId: null,
    status: 'active',
    productCount: 0,
    createdAt: '2024-01-13T13:00:00Z',
    updatedAt: '2024-01-23T17:45:00Z',
  },
  {
    id: '5',
    name: 'Electrical, Plumbing & Heating',
    slug: 'electrical-plumbing-heating',
    description: 'Electrical, plumbing and heating services.',
    image: 'https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=400',
    parentId: null,
    status: 'active',
    productCount: 0,
    createdAt: '2024-01-14T14:00:00Z',
    updatedAt: '2024-01-24T18:45:00Z',
  },
  {
    id: '6',
    name: 'Roofing & Exterior Shell',
    slug: 'roofing-exterior-shell',
    description: 'Roofing and exterior shell services.',
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400',
    parentId: null,
    status: 'active',
    productCount: 0,
    createdAt: '2024-01-15T15:00:00Z',
    updatedAt: '2024-01-25T19:45:00Z',
  },
  {
    id: '7',
    name: 'Windows, Doors & Security',
    slug: 'windows-doors-security',
    description: 'Windows, doors and security services.',
    image: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=400',
    parentId: null,
    status: 'active',
    productCount: 0,
    createdAt: '2024-01-16T16:00:00Z',
    updatedAt: '2024-01-26T20:45:00Z',
  },
  {
    id: '8',
    name: 'Cleaning, Maintenance & Repairs',
    slug: 'cleaning-maintenance-repairs',
    description: 'Cleaning, maintenance and repair services.',
    image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400',
    parentId: null,
    status: 'active',
    productCount: 0,
    createdAt: '2024-01-17T17:00:00Z',
    updatedAt: '2024-01-27T21:45:00Z',
  },
  {
    id: '9',
    name: 'Specialist Service',
    slug: 'specialist-service',
    description: 'Specialist services.',
    image: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=400',
    parentId: null,
    status: 'active',
    productCount: 0,
    createdAt: '2024-01-18T18:00:00Z',
    updatedAt: '2024-01-28T22:45:00Z',
  },
  {
    id: '10',
    name: 'All Moving Service',
    slug: 'all-moving-service',
    description: 'Moving services.',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400',
    parentId: null,
    status: 'active',
    productCount: 0,
    createdAt: '2024-01-19T19:00:00Z',
    updatedAt: '2024-01-29T23:45:00Z',
  },
]

interface CategoryState {
  list: Category[]
  filteredList: Category[]
  selectedCategory: Category | null
  filters: CategoryFilters
  pagination: PaginationState
  isLoading: boolean
  error: string | null
}

const initialState: CategoryState = {
  list: mockCategories,
  filteredList: mockCategories,
  selectedCategory: null,
  filters: {
    search: '',
    status: 'all',
  },
  pagination: {
    ...DEFAULT_PAGINATION,
    total: mockCategories.length,
    totalPages: Math.ceil(mockCategories.length / DEFAULT_PAGINATION.limit),
  },
  isLoading: false,
  error: null,
}

const categorySlice = createSlice({
  name: 'categories',
  initialState,
  reducers: {
    setCategories: (state, action: PayloadAction<Category[]>) => {
      state.list = action.payload
      state.filteredList = action.payload
    },
    setSelectedCategory: (state, action: PayloadAction<Category | null>) => {
      state.selectedCategory = action.payload
    },
    setFilters: (state, action: PayloadAction<Partial<CategoryFilters>>) => {
      state.filters = { ...state.filters, ...action.payload }
      // Apply filters
      let filtered = [...state.list]
      
      if (state.filters.search) {
        const searchLower = state.filters.search.toLowerCase()
        filtered = filtered.filter(
          (category) =>
            category.name.toLowerCase().includes(searchLower) ||
            category.description?.toLowerCase().includes(searchLower) ||
            category.slug.toLowerCase().includes(searchLower)
        )
      }
      
      if (state.filters.status !== 'all') {
        filtered = filtered.filter((category) => category.status === state.filters.status)
      }
      
      state.filteredList = filtered
      state.pagination.total = filtered.length
      state.pagination.totalPages = Math.ceil(filtered.length / state.pagination.limit)
      state.pagination.page = 1
    },
    clearFilters: (state) => {
      state.filters = { search: '', status: 'all' }
      state.filteredList = state.list
      state.pagination.total = state.list.length
      state.pagination.totalPages = Math.ceil(state.list.length / state.pagination.limit)
      state.pagination.page = 1
    },
    setPage: (state, action: PayloadAction<number>) => {
      state.pagination.page = action.payload
    },
    setLimit: (state, action: PayloadAction<number>) => {
      state.pagination.limit = action.payload
      state.pagination.totalPages = Math.ceil(state.filteredList.length / action.payload)
      state.pagination.page = 1
    },
    addCategory: (state, action: PayloadAction<Category>) => {
      state.list.unshift(action.payload)
      state.filteredList.unshift(action.payload)
      state.pagination.total += 1
      state.pagination.totalPages = Math.ceil(state.filteredList.length / state.pagination.limit)
    },
    updateCategory: (state, action: PayloadAction<Category>) => {
      const categoryIndex = state.list.findIndex((c) => c.id === action.payload.id)
      if (categoryIndex !== -1) {
        state.list[categoryIndex] = { ...action.payload, updatedAt: new Date().toISOString() }
      }
      const filteredIndex = state.filteredList.findIndex((c) => c.id === action.payload.id)
      if (filteredIndex !== -1) {
        state.filteredList[filteredIndex] = { ...action.payload, updatedAt: new Date().toISOString() }
      }
    },
    deleteCategory: (state, action: PayloadAction<string>) => {
      state.list = state.list.filter((c) => c.id !== action.payload)
      state.filteredList = state.filteredList.filter((c) => c.id !== action.payload)
      state.pagination.total -= 1
      state.pagination.totalPages = Math.ceil(state.filteredList.length / state.pagination.limit)
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
  setCategories,
  setSelectedCategory,
  setFilters,
  clearFilters,
  setPage,
  setLimit,
  addCategory,
  updateCategory,
  deleteCategory,
  setLoading,
  setError,
} = categorySlice.actions

export default categorySlice.reducer













