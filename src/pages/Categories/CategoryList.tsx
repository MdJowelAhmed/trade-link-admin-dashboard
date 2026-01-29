import { useMemo, useState, useEffect } from 'react'
import { Plus } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import {
  SearchInput,
  FilterDropdown,
  Pagination,
} from '@/components/common'
import { CategoryCard } from './components/CategoryCard'
import { ServiceCard } from './components/ServiceCard'
import { AddEditCategoryModal } from './AddEditCategoryModal'
import { AddEditServiceModal } from './components/AddEditServiceModal'
import { DeleteCategoryModal } from './DeleteCategoryModal'
import { useAppDispatch, useAppSelector } from '@/redux/hooks'
import { setFilters, setPage, setLimit, setSelectedCategory } from '@/redux/slices/categorySlice'
import { setFilters as setServiceFilters, setPage as setServicePage, setLimit as setServiceLimit, setSelectedService } from '@/redux/slices/serviceSlice'
import { useUrlParams } from '@/hooks/useUrlState'
import { CATEGORY_STATUSES } from '@/utils/constants'
import type { Category, Service } from '@/types'
import { motion } from 'framer-motion'

export default function CategoryList() {
  const dispatch = useAppDispatch()
  const { filteredList, isLoading, selectedCategory } = useAppSelector(
    (state) => state.categories
  )
  const { filteredList: filteredServices, selectedService } = useAppSelector(
    (state) => state.services
  )

  // URL-based state management
  const { getParam, getNumberParam, setParam, setParams } = useUrlParams()
  
  const search = getParam('search', '')
  const status = getParam('status', 'all')
  const page = getNumberParam('page', 1)
  const limit = getNumberParam('limit', 12)
  const activeTab = getParam('tab', 'categories')

  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false)
  const [showEditCategoryModal, setShowEditCategoryModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showAddServiceModal, setShowAddServiceModal] = useState(false)
  const [showEditServiceModal, setShowEditServiceModal] = useState(false)

  // Sync URL params with Redux
  useEffect(() => {
    if (activeTab === 'categories') {
      dispatch(setFilters({ search, status: status as Category['status'] | 'all' }))
      dispatch(setPage(page))
      dispatch(setLimit(limit))
    } else {
      dispatch(setServiceFilters({ search, status: status as Service['status'] | 'all', categoryId: 'all' }))
      dispatch(setServicePage(page))
      dispatch(setServiceLimit(limit))
    }
  }, [search, status, page, limit, activeTab, dispatch])

  // Calculate paginated data
  const paginatedCategories = useMemo(() => {
    const start = (page - 1) * limit
    const end = start + limit
    return filteredList.slice(start, end)
  }, [filteredList, page, limit])

  const paginatedServices = useMemo(() => {
    const start = (page - 1) * limit
    const end = start + limit
    return filteredServices.slice(start, end)
  }, [filteredServices, page, limit])

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

  const handleTabChange = (value: string) => {
    setParams({ tab: value, page: 1, search: '', status: 'all' })
  }

  const handleEditCategory = (category: Category) => {
    dispatch(setSelectedCategory(category))
    setShowEditCategoryModal(true)
  }

  const handleEditService = (service: Service) => {
    dispatch(setSelectedService(service))
    setShowEditServiceModal(true)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <TabsList className="bg-gray-100">
                  <TabsTrigger value="categories">Categories</TabsTrigger>
                  <TabsTrigger value="services">Services</TabsTrigger>
                </TabsList>
                <Button
                  onClick={() => {
                    if (activeTab === 'categories') {
                      setShowAddCategoryModal(true)
                    } else {
                      setShowAddServiceModal(true)
                    }
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  {activeTab === 'categories' ? 'Add New Category' : 'Add New Service'}
                </Button>
              </div>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={handleTabChange}>
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <SearchInput
                value={search}
                onChange={handleSearch}
                placeholder="Search here"
                className="sm:w-80"
              />
              <FilterDropdown
                value={status}
                options={CATEGORY_STATUSES}
                onChange={handleStatusFilter}
                placeholder="All Status"
              />
            </div>

            <TabsContent value="categories" className="mt-0">
              {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className="h-64 bg-muted animate-pulse rounded-lg" />
                  ))}
                </div>
              ) : paginatedCategories.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {paginatedCategories.map((category) => (
                      <CategoryCard
                        key={category.id}
                        category={category}
                        onEdit={() => handleEditCategory(category)}
                      />
                    ))}
                  </div>
                  <Pagination
                    currentPage={page}
                    totalPages={Math.ceil(filteredList.length / limit)}
                    totalItems={filteredList.length}
                    itemsPerPage={limit}
                    onPageChange={handlePageChange}
                    onItemsPerPageChange={handleLimitChange}
                    className="mt-6"
                  />
                </>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  No categories found. Try adjusting your filters.
                </div>
              )}
            </TabsContent>

            <TabsContent value="services" className="mt-0">
              {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className="h-32 bg-muted animate-pulse rounded-lg" />
                  ))}
                </div>
              ) : paginatedServices.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4">
                    {paginatedServices.map((service) => (
                      <ServiceCard
                        key={service.id}
                        service={service}
                        onEdit={() => handleEditService(service)}
                      />
                    ))}
                  </div>
                  <Pagination
                    currentPage={page}
                    totalPages={Math.ceil(filteredServices.length / limit)}
                    totalItems={filteredServices.length}
                    itemsPerPage={limit}
                    onPageChange={handlePageChange}
                    onItemsPerPageChange={handleLimitChange}
                    className="mt-6"
                  />
                </>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  No services found. Try adjusting your filters.
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Add Category Modal */}
      <AddEditCategoryModal
        open={showAddCategoryModal}
        onClose={() => setShowAddCategoryModal(false)}
        mode="add"
      />

      {/* Edit Category Modal */}
      {selectedCategory && (
        <AddEditCategoryModal
          open={showEditCategoryModal}
          onClose={() => {
            setShowEditCategoryModal(false)
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

      {/* Add Service Modal */}
      <AddEditServiceModal
        open={showAddServiceModal}
        onClose={() => setShowAddServiceModal(false)}
        mode="add"
      />

      {/* Edit Service Modal */}
      {selectedService && (
        <AddEditServiceModal
          open={showEditServiceModal}
          onClose={() => {
            setShowEditServiceModal(false)
            dispatch(setSelectedService(null))
          }}
          mode="edit"
          service={selectedService}
        />
      )}
    </motion.div>
  )
}
