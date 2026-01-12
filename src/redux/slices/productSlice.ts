import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { Product, ProductFilters, PaginationState } from '@/types'
import { DEFAULT_PAGINATION } from '@/utils/constants'

// Mock data for demonstration
const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Wireless Bluetooth Headphones',
    description: 'Premium noise-canceling wireless headphones with 30-hour battery life.',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200',
    category: 'Electronics',
    categoryId: '1',
    price: 299.99,
    stock: 150,
    sku: 'ELEC-ABC123',
    status: 'active',
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-20T14:45:00Z',
  },
  {
    id: '2',
    name: 'Organic Cotton T-Shirt',
    description: 'Sustainable organic cotton t-shirt available in multiple colors.',
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=200',
    category: 'Clothing',
    categoryId: '2',
    price: 49.99,
    stock: 500,
    sku: 'CLTH-DEF456',
    status: 'active',
    createdAt: '2024-01-16T11:30:00Z',
    updatedAt: '2024-01-21T15:45:00Z',
  },
  {
    id: '3',
    name: 'Smart Watch Pro',
    description: 'Advanced smartwatch with health monitoring and GPS tracking.',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200',
    category: 'Electronics',
    categoryId: '1',
    price: 399.99,
    stock: 0,
    sku: 'ELEC-GHI789',
    status: 'out_of_stock',
    createdAt: '2024-01-17T12:30:00Z',
    updatedAt: '2024-01-22T16:45:00Z',
  },
  {
    id: '4',
    name: 'Leather Messenger Bag',
    description: 'Handcrafted genuine leather messenger bag for professionals.',
    image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=200',
    category: 'Accessories',
    categoryId: '3',
    price: 199.99,
    stock: 75,
    sku: 'ACCS-JKL012',
    status: 'active',
    createdAt: '2024-01-18T13:30:00Z',
    updatedAt: '2024-01-23T17:45:00Z',
  },
  {
    id: '5',
    name: 'Ceramic Coffee Mug Set',
    description: 'Set of 4 artisan ceramic coffee mugs in earthy tones.',
    image: 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=200',
    category: 'Home & Kitchen',
    categoryId: '4',
    price: 59.99,
    stock: 200,
    sku: 'HOME-MNO345',
    status: 'draft',
    createdAt: '2024-01-19T14:30:00Z',
    updatedAt: '2024-01-24T18:45:00Z',
  },
  {
    id: '6',
    name: 'Yoga Mat Premium',
    description: 'Eco-friendly non-slip yoga mat with alignment guides.',
    image: 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=200',
    category: 'Sports',
    categoryId: '5',
    price: 79.99,
    stock: 120,
    sku: 'SPRT-PQR678',
    status: 'inactive',
    createdAt: '2024-01-20T15:30:00Z',
    updatedAt: '2024-01-25T19:45:00Z',
  },
]

interface ProductState {
  list: Product[]
  filteredList: Product[]
  selectedProduct: Product | null
  filters: ProductFilters
  pagination: PaginationState
  isLoading: boolean
  error: string | null
}

const initialState: ProductState = {
  list: mockProducts,
  filteredList: mockProducts,
  selectedProduct: null,
  filters: {
    search: '',
    status: 'all',
    categoryId: 'all',
    priceRange: { min: null, max: null },
  },
  pagination: {
    ...DEFAULT_PAGINATION,
    total: mockProducts.length,
    totalPages: Math.ceil(mockProducts.length / DEFAULT_PAGINATION.limit),
  },
  isLoading: false,
  error: null,
}

const productSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    setProducts: (state, action: PayloadAction<Product[]>) => {
      state.list = action.payload
      state.filteredList = action.payload
    },
    setSelectedProduct: (state, action: PayloadAction<Product | null>) => {
      state.selectedProduct = action.payload
    },
    setFilters: (state, action: PayloadAction<Partial<ProductFilters>>) => {
      state.filters = { ...state.filters, ...action.payload }
      // Apply filters
      let filtered = [...state.list]
      
      if (state.filters.search) {
        const searchLower = state.filters.search.toLowerCase()
        filtered = filtered.filter(
          (product) =>
            product.name.toLowerCase().includes(searchLower) ||
            product.description.toLowerCase().includes(searchLower) ||
            product.sku.toLowerCase().includes(searchLower)
        )
      }
      
      if (state.filters.status !== 'all') {
        filtered = filtered.filter((product) => product.status === state.filters.status)
      }
      
      if (state.filters.categoryId !== 'all') {
        filtered = filtered.filter((product) => product.categoryId === state.filters.categoryId)
      }
      
      if (state.filters.priceRange.min !== null) {
        filtered = filtered.filter((product) => product.price >= state.filters.priceRange.min!)
      }
      
      if (state.filters.priceRange.max !== null) {
        filtered = filtered.filter((product) => product.price <= state.filters.priceRange.max!)
      }
      
      state.filteredList = filtered
      state.pagination.total = filtered.length
      state.pagination.totalPages = Math.ceil(filtered.length / state.pagination.limit)
      state.pagination.page = 1
    },
    clearFilters: (state) => {
      state.filters = { search: '', status: 'all', categoryId: 'all', priceRange: { min: null, max: null } }
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
    addProduct: (state, action: PayloadAction<Product>) => {
      state.list.unshift(action.payload)
      state.filteredList.unshift(action.payload)
      state.pagination.total += 1
      state.pagination.totalPages = Math.ceil(state.filteredList.length / state.pagination.limit)
    },
    updateProduct: (state, action: PayloadAction<Product>) => {
      const productIndex = state.list.findIndex((p) => p.id === action.payload.id)
      if (productIndex !== -1) {
        state.list[productIndex] = { ...action.payload, updatedAt: new Date().toISOString() }
      }
      const filteredIndex = state.filteredList.findIndex((p) => p.id === action.payload.id)
      if (filteredIndex !== -1) {
        state.filteredList[filteredIndex] = { ...action.payload, updatedAt: new Date().toISOString() }
      }
    },
    deleteProduct: (state, action: PayloadAction<string>) => {
      state.list = state.list.filter((p) => p.id !== action.payload)
      state.filteredList = state.filteredList.filter((p) => p.id !== action.payload)
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
  setProducts,
  setSelectedProduct,
  setFilters,
  clearFilters,
  setPage,
  setLimit,
  addProduct,
  updateProduct,
  deleteProduct,
  setLoading,
  setError,
} = productSlice.actions

export default productSlice.reducer













