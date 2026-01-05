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

// ==================== Car Types ====================
export interface CarOwner {
  name: string
  email: string
  phone: string
}

export interface Car {
  id: string
  name: string
  carNumber?: string
  description: string
  image: string
  images?: string[]
  doors: number
  transmission: 'Automatic' | 'Manual'
  seats: number
  suitcases?: string
  location?: string
  fuelPolicy?: string
  kilometers?: string
  climate?: string
  amount: number
  priceDuration: string
  carClass: CarClass
  insuranceCoverage?: string
  termsConditions?: string
  owner?: CarOwner
  rating?: number
  createdAt: string
  updatedAt: string
}

export interface CarFormData {
  name: string
  doors: number
  suitcases: string
  seats: number
  location: string
  fuelPolicy: string
  kilometers: string
  carClass: CarClass
  transmission: 'Automatic' | 'Manual'
  climate: string
  amount: number
  insuranceCoverage: string
  termsConditions: string
  images?: File[] | string[]
}

export type CarClass = 'Upper Class' | 'Small Cars' | 'Compact Class' | 'Middle Class' | 'Premium Class'

export interface CarFilters {
  search: string
  carClass: CarClass | 'all'
  transmission: 'Automatic' | 'Manual' | 'all'
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
  | 'addCar'
  | 'editCar'
  | 'deleteCar'
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

// ==================== Booking Types ====================
export interface Booking {
  id: string
  startDate: string
  endDate: string
  clientName: string
  carModel: string
  licensePlate: string
  plan: string
  payment: string
  paymentStatus: 'Paid' | 'Pending'
  status: BookingStatus
}

export type BookingStatus = 'Upcoming' | 'Runing' | 'Completed'

export interface BookingFilters {
  search: string
  status: BookingStatus | 'all'
}

// ==================== Client Types ====================
export interface Client {
  id: string
  name: string
  phone: string
  email: string
  status: ClientStatus
  country: string
  avatar?: string
  photo?: string
  createdAt: string
  updatedAt: string
}

export type ClientStatus = 'active' | 'inactive'

export interface ClientFilters {
  search: string
  status: ClientStatus | 'all'
  country: string | 'all'
}

export interface ClientFormData {
  name: string
  phone: string
  email: string
  country: string
  photo?: File | string
}