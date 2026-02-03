import { useMemo, useState, useEffect } from 'react'
import { Plus } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  SearchInput,
  FilterDropdown,
  DataTable,
  Pagination,
  StatusBadge,
} from '@/components/common'
import { ProductActionMenu } from './components/ProductActionMenu'
import { AddEditProductModal } from './AddEditProductModal'
import { DeleteProductModal } from './DeleteProductModal'
import { ProductDetailsModal } from './ProductDetailsModal'
import { useAppDispatch, useAppSelector } from '@/redux/hooks'
import { setFilters, setPage, setLimit, setSelectedProduct } from '@/redux/slices/productSlice'
import { useGetCategoriesQuery } from '@/redux/api/categoriesApi'
import { useUrlParams } from '@/hooks/useUrlState'
import { PRODUCT_STATUSES } from '@/utils/constants'
import { formatCurrency, formatDate } from '@/utils/formatters'
import type { Product, TableColumn } from '@/types'
import { motion } from 'framer-motion'

export default function ProductList() {
  const dispatch = useAppDispatch()
  const { filteredList, isLoading, selectedProduct } = useAppSelector(
    (state) => state.products
  )

  // Use RTK Query for categories (backend handles data)
  const { data: categoriesResponse } = useGetCategoriesQuery()
  const categories = Array.isArray(categoriesResponse?.data) ? categoriesResponse.data : []

  // URL-based state management
  const { getParam, getNumberParam, setParam, setParams } = useUrlParams()

  const search = getParam('search', '')
  const status = getParam('status', 'all')
  const categoryId = getParam('category', 'all')
  const page = getNumberParam('page', 1)
  const limit = getNumberParam('limit', 10)

  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showDetailsModal, setShowDetailsModal] = useState(false)

  // Sync URL params with Redux
  useEffect(() => {
    dispatch(setFilters({ search, status: status as Product['status'] | 'all', categoryId }))
  }, [search, status, categoryId, dispatch])

  useEffect(() => {
    dispatch(setPage(page))
  }, [page, dispatch])

  useEffect(() => {
    dispatch(setLimit(limit))
  }, [limit, dispatch])

  const categoryOptions = useMemo(
    () => [
      { value: 'all', label: 'All Categories' },
      ...categories.map((cat: { _id: string; name: string }) => ({ value: cat._id, label: cat.name })),
    ],
    [categories]
  )

  const columns: TableColumn<Product>[] = useMemo(
    () => [
      {
        key: 'product',
        label: 'Product',
        sortable: true,
        render: (_, product) => (
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-lg overflow-hidden bg-muted flex-shrink-0">
              {product.image ? (
                <img
                  src={product.image}
                  alt={product.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center text-muted-foreground">
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
              )}
            </div>
            <div>
              <p className="font-medium">{product.name}</p>
              <p className="text-xs text-muted-foreground">SKU: {product.sku}</p>
            </div>
          </div>
        ),
      },
      {
        key: 'category',
        label: 'Category',
        sortable: true,
        render: (value) => (
          <span className="text-muted-foreground">{value as string}</span>
        ),
      },
      {
        key: 'price',
        label: 'Price',
        sortable: true,
        render: (value) => (
          <span className="font-medium">{formatCurrency(value as number)}</span>
        ),
      },
      {
        key: 'stock',
        label: 'Stock',
        sortable: true,
        render: (value) => {
          const stock = value as number
          return (
            <span
              className={
                stock === 0
                  ? 'text-destructive font-medium'
                  : stock < 20
                    ? 'text-warning font-medium'
                    : 'text-muted-foreground'
              }
            >
              {stock} units
            </span>
          )
        },
      },
      {
        key: 'status',
        label: 'Status',
        sortable: true,
        render: (value) => <StatusBadge status={value as string} />,
      },
      {
        key: 'updatedAt',
        label: 'Last Updated',
        sortable: true,
        render: (value) => (
          <span className="text-muted-foreground">{formatDate(value as string)}</span>
        ),
      },
    ],
    []
  )

  // Calculate paginated data
  const paginatedData = useMemo(() => {
    const start = (page - 1) * limit
    const end = start + limit
    return filteredList.slice(start, end)
  }, [filteredList, page, limit])

  const handleSearch = (value: string) => {
    setParams({ search: value, page: 1 })
  }

  const handleStatusFilter = (value: string) => {
    setParams({ status: value, page: 1 })
  }

  const handleCategoryFilter = (value: string) => {
    setParams({ category: value, page: 1 })
  }

  const handlePageChange = (newPage: number) => {
    setParam('page', newPage)
  }

  const handleLimitChange = (newLimit: number) => {
    setParams({ limit: newLimit, page: 1 })
  }

  const handleView = (product: Product) => {
    dispatch(setSelectedProduct(product))
    setShowDetailsModal(true)
  }

  const handleEdit = (product: Product) => {
    dispatch(setSelectedProduct(product))
    setShowEditModal(true)
  }

  const handleDelete = (product: Product) => {
    dispatch(setSelectedProduct(product))
    setShowDeleteModal(true)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle>Products</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Manage your product catalog with ease
            </p>
          </div>
          <Button onClick={() => setShowAddModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </Button>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <SearchInput
              value={search}
              onChange={handleSearch}
              placeholder="Search by name, SKU..."
              className="sm:w-80"
            />
            <div className="flex gap-3 flex-wrap">
              <FilterDropdown
                value={status}
                options={PRODUCT_STATUSES}
                onChange={handleStatusFilter}
                placeholder="All Status"
              />
              <FilterDropdown
                value={categoryId}
                options={categoryOptions}
                onChange={handleCategoryFilter}
                placeholder="All Categories"
              />
            </div>
          </div>

          {/* Table */}
          <DataTable
            columns={columns}
            data={paginatedData}
            isLoading={isLoading}
            rowKeyExtractor={(row) => row.id}
            onRowClick={handleView}
            actions={(product) => (
              <ProductActionMenu
                product={product}
                onView={() => handleView(product)}
                onEdit={() => handleEdit(product)}
                onDelete={() => handleDelete(product)}
              />
            )}
            emptyMessage="No products found. Try adjusting your filters."
          />

          {/* Pagination */}
          <Pagination
            currentPage={page}
            totalPages={Math.ceil(filteredList.length / limit)}
            totalItems={filteredList.length}
            itemsPerPage={limit}
            onPageChange={handlePageChange}
            onItemsPerPageChange={handleLimitChange}
          />
        </CardContent>
      </Card>

      {/* Add Product Modal */}
      <AddEditProductModal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        mode="add"
      />

      {/* Edit Product Modal */}
      {selectedProduct && (
        <AddEditProductModal
          open={showEditModal}
          onClose={() => {
            setShowEditModal(false)
            dispatch(setSelectedProduct(null))
          }}
          mode="edit"
          product={selectedProduct}
        />
      )}

      {/* Delete Product Modal */}
      {selectedProduct && (
        <DeleteProductModal
          open={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false)
            dispatch(setSelectedProduct(null))
          }}
          product={selectedProduct}
        />
      )}

      {/* Product Details Modal */}
      {selectedProduct && (
        <ProductDetailsModal
          open={showDetailsModal}
          onClose={() => {
            setShowDetailsModal(false)
            dispatch(setSelectedProduct(null))
          }}
          product={selectedProduct}
        />
      )}
    </motion.div>
  )
}
