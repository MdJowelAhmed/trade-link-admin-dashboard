// ==================== User Types ====================
export interface User {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  avatar?: string
  role: UserRole
  status: UserStatus
  createdAt: string
  updatedAt: string
  address?: string
  city?: string
  country?: string
}

export type UserRole = 'admin' | 'user' | 'moderator' | 'editor'
export type UserStatus = 'active' | 'blocked' | 'pending' | 'inactive'

export interface UserFilters {
  search: string
  status: UserStatus | 'all'
  role: UserRole | 'all'
}

// ==================== Product Types ====================
export interface Product {
  id: string
  name: string
  description: string
  image?: string
  images?: string[]
  category: string
  categoryId: string
  price: number
  stock: number
  sku: string
  status: ProductStatus
  createdAt: string
  updatedAt: string
}

export type ProductStatus = 'active' | 'inactive' | 'draft' | 'out_of_stock'

export interface ProductFilters {
  search: string
  status: ProductStatus | 'all'
  categoryId: string | 'all'
  priceRange: {
    min: number | null
    max: number | null
  }
}

export interface ProductFormData {
  name: string
  description: string
  categoryId: string
  price: number
  stock: number
  sku: string
  status: ProductStatus
  image?: File | string
}

// ==================== Category Types ====================
export interface Category {
  id: string
  name: string
  slug: string
  description?: string
  image?: string
  parentId?: string | null
  status: CategoryStatus
  productCount: number
  createdAt: string
  updatedAt: string
}

export type CategoryStatus = 'active' | 'inactive'

export interface CategoryFilters {
  search: string
  status: CategoryStatus | 'all'
}

export interface CategoryFormData {
  name: string
  description?: string
  parentId?: string | null
  status: CategoryStatus
  image?: File | string
}

// ==================== Pagination Types ====================
export interface PaginationState {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: PaginationState
}

// ==================== Modal Types ====================
export type ModalType = 
  | 'addUser' 
  | 'editUser' 
  | 'deleteUser'
  | 'addProduct' 
  | 'editProduct' 
  | 'deleteProduct'
  | 'addCategory' 
  | 'editCategory' 
  | 'deleteCategory'
  | null

export interface ModalState {
  isOpen: boolean
  type: ModalType
  data?: unknown
}

// ==================== Table Types ====================
export interface TableColumn<T> {
  key: keyof T | string
  label: string
  sortable?: boolean
  width?: string
  render?: (value: unknown, row: T) => React.ReactNode
}

export interface SortConfig {
  key: string
  direction: 'asc' | 'desc'
}

// ==================== Settings Types ====================
export interface ProfileData {
  firstName: string
  lastName: string
  email: string
  phone: string
  avatar?: string
  address?: string
  city?: string
  country?: string
  bio?: string
}

export interface PasswordChangeData {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

// ==================== API Response Types ====================
export interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

export interface ApiError {
  success: false
  message: string
  errors?: Record<string, string[]>
}

// ==================== Filter Option Types ====================
export interface SelectOption {
  value: string
  label: string
}

// ==================== Dashboard Stats Types ====================
export interface DashboardStats {
  totalUsers: number
  totalProducts: number
  totalCategories: number
  totalRevenue: number
  userGrowth: number
  productGrowth: number
  recentOrders: number
  pendingOrders: number
}



