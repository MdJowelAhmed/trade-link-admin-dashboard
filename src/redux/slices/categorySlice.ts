import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { Category, CategoryFilters, PaginationState } from '@/types'
import { DEFAULT_PAGINATION } from '@/utils/constants'

// Mock data for demonstration
const mockCategories: Category[] = [
  {
    id: '1',
    name: 'Electronics',
    slug: 'electronics',
    description: 'Electronic devices, gadgets, and accessories.',
    image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=200',
    parentId: null,
    status: 'active',
    productCount: 245,
    createdAt: '2024-01-10T10:00:00Z',
    updatedAt: '2024-01-20T14:45:00Z',
  },
  {
    id: '2',
    name: 'Clothing',
    slug: 'clothing',
    description: 'Fashion apparel for men, women, and kids.',
    image: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=200',
    parentId: null,
    status: 'active',
    productCount: 520,
    createdAt: '2024-01-11T11:00:00Z',
    updatedAt: '2024-01-21T15:45:00Z',
  },
  {
    id: '3',
    name: 'Accessories',
    slug: 'accessories',
    description: 'Bags, watches, jewelry, and fashion accessories.',
    image: 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=200',
    parentId: null,
    status: 'active',
    productCount: 180,
    createdAt: '2024-01-12T12:00:00Z',
    updatedAt: '2024-01-22T16:45:00Z',
  },
  {
    id: '4',
    name: 'Home & Kitchen',
    slug: 'home-kitchen',
    description: 'Furniture, decor, and kitchen essentials.',
    image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=200',
    parentId: null,
    status: 'active',
    productCount: 340,
    createdAt: '2024-01-13T13:00:00Z',
    updatedAt: '2024-01-23T17:45:00Z',
  },
  {
    id: '5',
    name: 'Sports',
    slug: 'sports',
    description: 'Sports equipment, fitness gear, and outdoor items.',
    image: 'https://images.unsplash.com/photo-1461896836934- voices-7?w=200',
    parentId: null,
    status: 'inactive',
    productCount: 95,
    createdAt: '2024-01-14T14:00:00Z',
    updatedAt: '2024-01-24T18:45:00Z',
  },
  {
    id: '6',
    name: 'Books',
    slug: 'books',
    description: 'Books, magazines, and educational materials.',
    image: 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=200',
    parentId: null,
    status: 'active',
    productCount: 420,
    createdAt: '2024-01-15T15:00:00Z',
    updatedAt: '2024-01-25T19:45:00Z',
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













