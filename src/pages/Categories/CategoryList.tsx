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
import { CategoryActionMenu } from './components/CategoryActionMenu'
import { AddEditCategoryModal } from './AddEditCategoryModal'
import { DeleteCategoryModal } from './DeleteCategoryModal'
import { useAppDispatch, useAppSelector } from '@/redux/hooks'
import { setFilters, setPage, setLimit, setSelectedCategory } from '@/redux/slices/categorySlice'
import { useUrlParams } from '@/hooks/useUrlState'
import { CATEGORY_STATUSES } from '@/utils/constants'
import { formatDate, formatNumber } from '@/utils/formatters'
import type { Category, TableColumn } from '@/types'
import { motion } from 'framer-motion'

export default function CategoryList() {
  const dispatch = useAppDispatch()
  const { filteredList, isLoading, selectedCategory } = useAppSelector(
    (state) => state.categories
  )

  // URL-based state management
  const { getParam, getNumberParam, setParam, setParams } = useUrlParams()
  
  const search = getParam('search', '')
  const status = getParam('status', 'all')
  const page = getNumberParam('page', 1)
  const limit = getNumberParam('limit', 10)

  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  // Sync URL params with Redux
  useEffect(() => {
    dispatch(setFilters({ search, status: status as Category['status'] | 'all' }))
  }, [search, status, dispatch])

  useEffect(() => {
    dispatch(setPage(page))
  }, [page, dispatch])

  useEffect(() => {
    dispatch(setLimit(limit))
  }, [limit, dispatch])

  const columns: TableColumn<Category>[] = useMemo(
    () => [
      {
        key: 'category',
        label: 'Category',
        sortable: true,
        render: (_, category) => (
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-lg overflow-hidden bg-muted flex-shrink-0">
              {category.image ? (
                <img
                  src={category.image}
                  alt={category.name}
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
                      d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
                    />
                  </svg>
                </div>
              )}
            </div>
            <div>
              <p className="font-medium">{category.name}</p>
              <p className="text-xs text-muted-foreground">/{category.slug}</p>
            </div>
          </div>
        ),
      },
      {
        key: 'description',
        label: 'Description',
        render: (value) => (
          <span className="text-muted-foreground line-clamp-2 max-w-xs">
            {(value as string) || 'No description'}
          </span>
        ),
      },
      {
        key: 'productCount',
        label: 'Products',
        sortable: true,
        render: (value) => (
          <span className="font-medium">{formatNumber(value as number)}</span>
        ),
      },
      {
        key: 'status',
        label: 'Status',
        sortable: true,
        render: (value) => <StatusBadge status={value as string} />,
      },
      {
        key: 'createdAt',
        label: 'Created',
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

  const handlePageChange = (newPage: number) => {
    setParam('page', newPage)
  }

  const handleLimitChange = (newLimit: number) => {
    setParams({ limit: newLimit, page: 1 })
  }

  const handleEdit = (category: Category) => {
    dispatch(setSelectedCategory(category))
    setShowEditModal(true)
  }

  const handleDelete = (category: Category) => {
    dispatch(setSelectedCategory(category))
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
            <CardTitle>Categories</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Organize your products with categories
            </p>
          </div>
          <Button onClick={() => setShowAddModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Category
          </Button>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <SearchInput
              value={search}
              onChange={handleSearch}
              placeholder="Search categories..."
              className="sm:w-80"
            />
            <FilterDropdown
              value={status}
              options={CATEGORY_STATUSES}
              onChange={handleStatusFilter}
              placeholder="All Status"
            />
          </div>

          {/* Table */}
          <DataTable
            columns={columns}
            data={paginatedData}
            isLoading={isLoading}
            rowKeyExtractor={(row) => row.id}
            actions={(category) => (
              <CategoryActionMenu
                category={category}
                onEdit={() => handleEdit(category)}
                onDelete={() => handleDelete(category)}
              />
            )}
            emptyMessage="No categories found. Try adjusting your filters."
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

      {/* Add Category Modal */}
      <AddEditCategoryModal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        mode="add"
      />

      {/* Edit Category Modal */}
      {selectedCategory && (
        <AddEditCategoryModal
          open={showEditModal}
          onClose={() => {
            setShowEditModal(false)
            dispatch(setSelectedCategory(null))
          }}
          mode="edit"
          category={selectedCategory}
        />
      )}

      {/* Delete Category Modal */}
      {selectedCategory && (
        <DeleteCategoryModal
          open={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false)
            dispatch(setSelectedCategory(null))
          }}
          category={selectedCategory}
        />
      )}
    </motion.div>
  )
}
