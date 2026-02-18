import { useMemo, useState, useEffect } from 'react'
import { Plus } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import {
  SearchInput,
  FilterDropdown,
  Pagination,
  GridSkeleton,
} from '@/components/common'
import { CategoryCard } from './components/CategoryCard'
import { ServiceCard } from './components/ServiceCard'
import { AddEditCategoryModal } from './AddEditCategoryModal'
import { AddEditServiceModal } from './components/AddEditServiceModal'
import { DeleteCategoryModal } from './DeleteCategoryModal'
import { ConfirmDialog } from '@/components/common'
import { useAppDispatch, useAppSelector } from '@/redux/hooks'
import { setFilters, setPage, setLimit, setSelectedCategoryId } from '@/redux/slices/categorySlice'
import { useGetCategoriesQuery } from '@/redux/api/categoriesApi'
import { useGetServicesQuery, useDeleteServiceMutation, useUpdateServiceStatusMutation } from '@/redux/api/serviceApi'
import { useUrlParams } from '@/hooks/useUrlState'
import { CATEGORY_STATUSES } from '@/utils/constants'
import type { Service } from '@/types'
import { motion } from 'framer-motion'
import { toast } from '@/utils/toast'

// Backend FAQ type
interface BackendFAQ {
  _id: string
  question: string
  answer: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

// Backend category type (from API response)
interface BackendCategory {
  _id: string
  name: string
  slug: string
  description?: string
  image?: string
  isActive: boolean
  serviceCount?: number
  faqs?: BackendFAQ[]
  createdAt: string
  updatedAt: string
}

export default function CategoryList() {
  const dispatch = useAppDispatch()

  // URL-based state management
  const { getParam, getNumberParam, setParam, setParams } = useUrlParams()

  const search = getParam('search', '')
  // Normalize status from URL (convert to lowercase for dropdown comparison)
  const statusParam = getParam('status', 'all')
  const status = statusParam !== 'all' ? statusParam.toLowerCase() : statusParam
  const categoryId = getParam('categoryId', 'all')
  const page = getNumberParam('page', 1)
  const limit = getNumberParam('limit', 20
  )
  const activeTab = getParam('tab', 'categories')

  // Convert status to boolean for API (isActive: true for 'active', false for 'inactive', undefined for 'all')
  const isActiveForApi = status === 'active' ? true : status === 'inactive' ? false : undefined

  // RTK Query - Categories (backend handles filtering/pagination)
  const {
    data: categoriesResponse,
    isLoading: categoriesLoading,
    isFetching: categoriesFetching,
  } = useGetCategoriesQuery({
    searchTerm: search || undefined,
    isActive: isActiveForApi,
    page,
    limit,
  })

  // RTK Query - Services (backend handles filtering/pagination)
  const {
    data: servicesResponse,
    isLoading: servicesLoading,
    isFetching: servicesFetching,
  } = useGetServicesQuery(
    activeTab === 'services'
      ? {
          searchTerm: search || undefined,
          isActive: isActiveForApi,
          categoryId: categoryId !== 'all' ? categoryId : undefined,
          page,
          limit,
        }
      : undefined,
    { skip: activeTab !== 'services' }
  )

  // Extract categories and meta from response
  const categories = useMemo(
    () => (Array.isArray(categoriesResponse?.data) ? categoriesResponse.data : []),
    [categoriesResponse?.data]
  )
  const categoriesMeta = categoriesResponse?.meta

  // Extract services and pagination from response
  const backendServices = useMemo(
    () => (Array.isArray(servicesResponse?.data) ? servicesResponse.data : []),
    [servicesResponse?.data]
  )
  const servicesMeta = servicesResponse?.pagination

  // Map backend services to frontend Service type
  const services = useMemo(
    () =>
      backendServices.map((backendService) => ({
        id: backendService._id,
        name: backendService.name,
        categoryId: backendService.categoryId._id,
        categoryName: backendService.categoryId.name,
        status: (backendService.isActive ? 'active' : 'inactive') as Service['status'],
        totalQuestions: 0, // Not provided by API, defaulting to 0
        createdAt: backendService.createdAt,
        updatedAt: backendService.updatedAt,
      })),
    [backendServices]
  )

  // UI state from Redux
  const { selectedCategoryId } = useAppSelector((state) => state.categoryUI)
  
  // Local state for selected service (for edit modal)
  const [selectedService, setSelectedService] = useState<Service | null>(null)

  // Derive selected category from server data
  const selectedCategory = useMemo(
    () => {
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
  const [showDeleteServiceModal, setShowDeleteServiceModal] = useState(false)
  const [serviceToDelete, setServiceToDelete] = useState<Service | null>(null)
  const [showCategoryDetailsModal, setShowCategoryDetailsModal] = useState(false)
  const [faqMode, setFaqMode] = useState<'edit' | 'faq' | 'details'>('edit')

  // RTK Query mutations for services
  const [deleteService, { isLoading: isDeletingService }] = useDeleteServiceMutation()
  const [updateServiceStatus] = useUpdateServiceStatusMutation()

  // Sync URL params with Redux UI state (only for categories now)
  useEffect(() => {
    if (activeTab === 'categories') {
      dispatch(setFilters({ search, status: status as 'active' | 'inactive' | 'all' }))
      dispatch(setPage(page))
      dispatch(setLimit(limit))
    }
  }, [search, status, page, limit, activeTab, dispatch])

  const handleSearch = (value: string) => {
    setParams({ search: value, page: 1 })
  }

  const handleStatusFilter = (value: string) => {
    // Convert to uppercase for URL (except 'all')
    const statusValue = value !== 'all' ? value.toUpperCase() : value
    setParams({ status: statusValue, page: 1 })
  }

  const handleCategoryFilter = (value: string) => {
    setParams({ categoryId: value, page: 1 })
  }

  const handlePageChange = (newPage: number) => {
    setParam('page', newPage)
  }

  const handleLimitChange = (newLimit: number) => {
    setParams({ limit: newLimit, page: 1 })
  }

  const handleTabChange = (value: string) => {
    setParams({ tab: value, page: 1, search: '', status: 'all', categoryId: 'all' })
  }

  const handleEditCategory = (category: BackendCategory) => {
    dispatch(setSelectedCategoryId(category._id))
    setFaqMode('edit')
    setShowEditCategoryModal(true)
  }

  const handleFaqCategory = (category: BackendCategory) => {
    dispatch(setSelectedCategoryId(category._id))
    setFaqMode('faq')
    setShowEditCategoryModal(true)
  }

  const handleCategoryDetails = (category: BackendCategory) => {
    dispatch(setSelectedCategoryId(category._id))
    setFaqMode('details')
    setShowCategoryDetailsModal(true)
  }



  const handleEditService = (service: Service) => {
    // Find the backend service to get full data
    const backendService = backendServices.find((s) => s._id === service.id)
    if (backendService) {
      const mappedService: Service = {
        id: backendService._id,
        name: backendService.name,
        categoryId: backendService.categoryId._id,
        categoryName: backendService.categoryId.name,
        status: (backendService.isActive ? 'active' : 'inactive') as Service['status'],
        totalQuestions: 0,
        createdAt: backendService.createdAt,
        updatedAt: backendService.updatedAt,
      }
      setSelectedService(mappedService)
      setShowEditServiceModal(true)
    }
  }

  const handleDeleteService = (service: Service) => {
    setServiceToDelete(service)
    setShowDeleteServiceModal(true)
  }

  const handleConfirmDeleteService = async () => {
    if (serviceToDelete) {
      try {
        await deleteService(serviceToDelete.id).unwrap()
        toast({
          title: 'Service Deleted',
          description: `${serviceToDelete.name} has been deleted successfully.`,
        })
        setShowDeleteServiceModal(false)
        setServiceToDelete(null)
      } catch (error: unknown) {
        const errorMessage = error && typeof error === 'object' && 'data' in error
          ? (error as { data?: { message?: string } }).data?.message
          : undefined
        toast({
          title: 'Error',
          description: errorMessage || 'Failed to delete service.',
          variant: 'destructive',
        })
      }
    }
  }

  const handleToggleServiceStatus = async (service: Service) => {
    try {
      // Toggle the status: if active, make inactive; if inactive, make active
      const newIsActive = service.status === 'active' ? false : true
      
      await updateServiceStatus({
        id: service.id,
        isActive: newIsActive,
      }).unwrap()
      
      toast({
        title: 'Status Updated',
        description: `${service.name} status has been updated successfully.`,
      })
    } catch (error: unknown) {
      const errorMessage = error && typeof error === 'object' && 'data' in error
        ? (error as { data?: { message?: string } }).data?.message
        : undefined
      toast({
        title: 'Error',
        description: errorMessage || 'Failed to update service status.',
        variant: 'destructive',
      })
    }
  }

  // Map backend category to component format
  const mapCategoryForCard = (category: BackendCategory) => ({
    id: category._id,
    name: category.name,
    slug: category.slug,
    description: category.description,
    image: category.image,
    status: category.isActive ? 'active' as const : 'inactive' as const,
    productCount: category.serviceCount || 0,
    faqs: (category.faqs || []).map((faq) => ({
      _id: faq._id,
      question: faq.question,
      answer: faq.answer,
      isActive: faq.isActive,
      createdAt: faq.createdAt,
      updatedAt: faq.updatedAt,
    })),
    createdAt: category.createdAt,
    updatedAt: category.updatedAt,
  })

  // Map selected category for modals
  const selectedCategoryForModal = selectedCategory ? mapCategoryForCard(selectedCategory) : null

  // Create category filter options for services tab
  const categoryFilterOptions = useMemo(() => {
    const options = [{ value: 'all', label: 'All Categories' }]
    if (Array.isArray(categories) && categories.length > 0) {
      categories.forEach((category: BackendCategory) => {
        options.push({
          value: category._id,
          label: category.name,
        })
      })
    }
    return options
  }, [categories])

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

                {
                  activeTab === 'services' && (
                    <SearchInput
                      value={search}
                      onChange={handleSearch}
                      placeholder="Search here"
                      className="sm:w-80"
                    />
                  )
                }

                {
                  activeTab === 'services' && (
                    <FilterDropdown
                      value={categoryId}
                      options={categoryFilterOptions}
                      onChange={handleCategoryFilter}
                      placeholder="All Categories"
                    />
                  )
                }

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
              {categoriesLoading || categoriesFetching ? (
                <GridSkeleton count={8} itemClassName="h-64" />
              ) : categories.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {categories.map((category: BackendCategory, index: number) => (
                      <CategoryCard
                        key={category._id}
                        category={mapCategoryForCard(category)}
                        onEdit={() => handleEditCategory(category)}
                        onFaq={() => handleFaqCategory(category)}
                        onDetails={() => handleCategoryDetails(category)}
                        hasFaqs={(category.faqs && category.faqs.length > 0) || false}
                        index={index}
                      />
                    ))}
                  </div>
                  <Pagination
                    currentPage={categoriesMeta?.page ?? page}
                    totalPages={categoriesMeta?.totalPage ?? 1}
                    totalItems={categoriesMeta?.total ?? categories.length}
                    itemsPerPage={categoriesMeta?.limit ?? limit}
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
              {servicesLoading || servicesFetching ? (
                <GridSkeleton count={8} className="grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4" itemClassName="h-32" />
              ) : services.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4">
                    {services.map((service, index) => (
                      <ServiceCard
                        key={service.id}
                        service={service}
                        onEdit={() => handleEditService(service)}
                        onDelete={() => handleDeleteService(service)}
                        onToggleStatus={() => handleToggleServiceStatus(service)}
                        index={index}
                      />
                    ))}
                  </div>
                  <Pagination
                    currentPage={servicesMeta?.page ?? page}
                    totalPages={servicesMeta?.totalPage ?? 1}
                    totalItems={servicesMeta?.total ?? services.length}
                    itemsPerPage={servicesMeta?.limit ?? limit}
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
            setFaqMode('edit')
          }}
          mode={faqMode === 'faq' ? 'faq' : 'edit'}
          category={selectedCategoryForModal}
        />
      )}

      {/* Category Details Modal */}
      {selectedCategoryForModal && (
        <AddEditCategoryModal
          open={showCategoryDetailsModal}
          onClose={() => {
            setShowCategoryDetailsModal(false)
            dispatch(setSelectedCategoryId(null))
            setFaqMode('edit')
          }}
          mode="details"
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
            setSelectedService(null)
          }}
          mode="edit"
          service={selectedService}
        />
      )}

      {/* Delete Service Confirmation Dialog */}
      {serviceToDelete && (
        <ConfirmDialog
          open={showDeleteServiceModal}
          onClose={() => {
            setShowDeleteServiceModal(false)
            setServiceToDelete(null)
          }}
          onConfirm={handleConfirmDeleteService}
          title="Delete Service"
          description={`Are you sure you want to delete "${serviceToDelete.name}"? This action cannot be undone.`}
          confirmText="Delete"
          cancelText="Cancel"
          variant="danger"
          isLoading={isDeletingService}
        />
      )}
    </motion.div>
  )
}
