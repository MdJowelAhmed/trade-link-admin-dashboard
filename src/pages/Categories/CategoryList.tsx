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
import { setFilters, setPage, setLimit, setSelectedCategoryId } from '@/redux/slices/categorySlice'
import { setFilters as setServiceFilters, setPage as setServicePage, setLimit as setServiceLimit, setSelectedService } from '@/redux/slices/serviceSlice'
import { useGetCategoriesQuery } from '@/redux/api/categoriesApi'
import { useUrlParams } from '@/hooks/useUrlState'
import { CATEGORY_STATUSES } from '@/utils/constants'
import type { Service } from '@/types'
import { motion } from 'framer-motion'

// Backend category type (from API response)
interface BackendCategory {
  _id: string
  name: string
  slug: string
  description?: string
  image?: string
  isActive: boolean
  serviceCount: number
  createdAt: string
  updatedAt: string
}

export default function CategoryList() {
  const dispatch = useAppDispatch()

  // Service state from Redux (keeping existing pattern for services)
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

  // RTK Query - server data comes from here (backend handles filtering/pagination)
  const {
    data: categoriesResponse,
    isLoading,
    isFetching,
  } = useGetCategoriesQuery({
    searchTerm: search || undefined,
    status: status !== 'all' ? status : undefined,
    page,
    limit,
  })

  // Extract categories and meta from response
  const categories = useMemo(
    () => (Array.isArray(categoriesResponse?.data) ? categoriesResponse.data : []),
    [categoriesResponse?.data]
  )
  const meta = categoriesResponse?.meta

  // UI state from Redux
  const { selectedCategoryId } = useAppSelector((state) => state.categoryUI)

  // Derive selected category from server data
  const selectedCategory = useMemo(
    () => {
      // Defensive: categories may not always be an array
      if (Array.isArray(categories) && categories.length > 0) {
        return categories.find((c: BackendCategory) => c._id === selectedCategoryId) ?? null
      }
      return null
    },
    [categories, selectedCategoryId]
  )

  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false)
  const [showEditCategoryModal, setShowEditCategoryModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showAddServiceModal, setShowAddServiceModal] = useState(false)
  const [showEditServiceModal, setShowEditServiceModal] = useState(false)

  // Sync URL params with Redux UI state
  useEffect(() => {
    if (activeTab === 'categories') {
      dispatch(setFilters({ search, status: status as 'active' | 'inactive' | 'all' }))
      dispatch(setPage(page))
      dispatch(setLimit(limit))
    } else {
      dispatch(setServiceFilters({ search, status: status as Service['status'] | 'all', categoryId: 'all' }))
      dispatch(setServicePage(page))
      dispatch(setServiceLimit(limit))
    }
  }, [search, status, page, limit, activeTab, dispatch])

  // Calculate paginated services (services still use old pattern)
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

  const handleEditCategory = (category: BackendCategory) => {
    dispatch(setSelectedCategoryId(category._id))
    setShowEditCategoryModal(true)
  }



  const handleEditService = (service: Service) => {
    dispatch(setSelectedService(service))
    setShowEditServiceModal(true)
  }

  // Map backend category to component format
  const mapCategoryForCard = (category: BackendCategory) => ({
    id: category._id,
    name: category.name,
    slug: category.slug,
    description: category.description,
    image: category.image,
    status: category.isActive ? 'active' as const : 'inactive' as const,
    productCount: category.serviceCount,
    createdAt: category.createdAt,
    updatedAt: category.updatedAt,
  })

  // Map selected category for modals
  const selectedCategoryForModal = selectedCategory ? mapCategoryForCard(selectedCategory) : null

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <Card>
       
        <CardContent className='p-6'>
          <Tabs value={activeTab} onValueChange={handleTabChange}>
            {/* Filters */}
            <div className="flex justify-between items-center">
              {/* <SearchInput
                value={search}
                onChange={handleSearch}
                placeholder="Search here"
                className="sm:w-80"
              /> */}


              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <TabsList className="bg-gray-100">
                      <TabsTrigger value="categories">Categories</TabsTrigger>
                      <TabsTrigger value="services">Services</TabsTrigger>
                    </TabsList>

                  </div>
                </Tabs>
              </div>

              <div className='flex flex-col sm:flex-row gap-4 mb-6 justify-end'>
                <FilterDropdown
                  value={status}
                  options={CATEGORY_STATUSES}
                  onChange={handleStatusFilter}
                  placeholder="All Status"
                />

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
            </div>

            <TabsContent value="categories" className="mt-0">
              {isLoading || isFetching ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className="h-64 bg-muted animate-pulse rounded-lg" />
                  ))}
                </div>
              ) : categories.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {categories.map((category: BackendCategory, index: number) => (
                      <CategoryCard
                        key={category._id}
                        category={mapCategoryForCard(category)}
                        onEdit={() => handleEditCategory(category)}
                        index={index}
                      />
                    ))}
                  </div>
                  <Pagination
                    currentPage={meta?.page ?? page}
                    totalPages={meta?.totalPage ?? 1}
                    totalItems={meta?.total ?? categories.length}
                    itemsPerPage={meta?.limit ?? limit}
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
                    {paginatedServices.map((service, index) => (
                      <ServiceCard
                        key={service.id}
                        service={service}
                        onEdit={() => handleEditService(service)}
                        index={index}
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
      {selectedCategoryForModal && (
        <AddEditCategoryModal
          open={showEditCategoryModal}
          onClose={() => {
            setShowEditCategoryModal(false)
            dispatch(setSelectedCategoryId(null))
          }}
          mode="edit"
          category={selectedCategoryForModal}
        />
      )}

      {/* Delete Category Modal */}
      {selectedCategoryForModal && (
        <DeleteCategoryModal
          open={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false)
            dispatch(setSelectedCategoryId(null))
          }}
          category={selectedCategoryForModal}
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
