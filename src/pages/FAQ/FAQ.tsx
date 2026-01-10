import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, ChevronLeft, ChevronRight } from 'lucide-react'
import { SearchInput } from '@/components/common/SearchInput'
import { FAQTable } from './components/FAQTable'
import { AddEditFAQModal } from './components/AddEditFAQModal'
// import { ViewFAQModal } from './components/ViewFAQModal'
import { DeleteFAQModal } from './components/DeleteFAQModal'
import { FAQFilterDropdown } from './components/FAQFilterDropdown'
import { useAppDispatch, useAppSelector } from '@/redux/hooks'
import { setFilters, setPage, setLimit, deleteFAQ } from '@/redux/slices/faqSlice'
import { useUrlString, useUrlNumber } from '@/hooks/useUrlState'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from '@/utils/toast'
import type { FAQ, FAQPosition } from '@/types'

const FAQ = () => {
  const dispatch = useAppDispatch()

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false)
  // const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedFAQ, setSelectedFAQ] = useState<FAQ | null>(null)

  // URL state management
  const [searchQuery, setSearchQuery] = useUrlString('search', '')
  const [positionFilter, setPositionFilter] = useUrlString('position', 'all')
  const [currentPage, setCurrentPage] = useUrlNumber('page', 1)
  const [itemsPerPage, setItemsPerPage] = useUrlNumber('limit', 10)

  // Redux state
  const { filteredList, pagination } = useAppSelector((state) => state.faqs)

  // Sync URL state with Redux filters
  useEffect(() => {
    dispatch(
      setFilters({
        search: searchQuery,
        position: positionFilter as FAQPosition | 'all',
      })
    )
  }, [searchQuery, positionFilter, dispatch])

  // Sync URL pagination with Redux
  useEffect(() => {
    dispatch(setPage(currentPage))
  }, [currentPage, dispatch])

  useEffect(() => {
    dispatch(setLimit(itemsPerPage))
  }, [itemsPerPage, dispatch])

  // Pagination
  const totalPages = pagination.totalPages
  const paginatedData = useMemo(() => {
    const startIndex = (pagination.page - 1) * pagination.limit
    return filteredList.slice(startIndex, startIndex + pagination.limit)
  }, [filteredList, pagination.page, pagination.limit])

  // Handlers
  // const handleView = (faq: FAQ) => {
  //   setSelectedFAQ(faq)
  //   setIsViewModalOpen(true)
  // }

  const handleEdit = (faq: FAQ) => {
    setSelectedFAQ(faq)
    setIsModalOpen(true)
  }

  const handleDelete = (faq: FAQ) => {
    setSelectedFAQ(faq)
    setIsDeleteModalOpen(true)
  }

  const handleConfirmDelete = () => {
    if (selectedFAQ) {
      dispatch(deleteFAQ(selectedFAQ.id))
      toast({
        title: 'FAQ Deleted',
        description: 'FAQ has been deleted successfully.',
      })
      setSelectedFAQ(null)
    }
  }

  const handleAddNew = () => {
    setSelectedFAQ(null)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedFAQ(null)
  }

  const getPageNumbers = () => {
    const pages: (number | string)[] = []
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      pages.push(1)
      if (pagination.page > 3) pages.push('...')
      for (
        let i = Math.max(2, pagination.page - 1);
        i <= Math.min(totalPages - 1, pagination.page + 1);
        i++
      ) {
        if (!pages.includes(i)) pages.push(i)
      }
      if (pagination.page < totalPages - 2) pages.push('...')
      if (!pages.includes(totalPages)) pages.push(totalPages)
    }
    return pages
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <Card className="bg-white border-0 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-6">
          <CardTitle className="text-xl font-bold text-slate-800">FAQ</CardTitle>
          <div className="flex items-center gap-3">
            {/* Search Input */}
            <SearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search questions & answers"
              className="w-[300px]"
            />

            {/* Filter Dropdown */}
            <FAQFilterDropdown
              value={positionFilter as FAQPosition | 'all'}
              onChange={setPositionFilter}
            />

            {/* Add New FAQ Button */}
            <Button
              onClick={handleAddNew}
              className="bg-primary-foreground hover:bg-blue-700 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add New FAQ
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {/* Table */}
          <FAQTable
            faqs={paginatedData}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />

          {/* Pagination */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>Result Per Page</span>
              <Select
                value={String(itemsPerPage)}
                onValueChange={(val) => setItemsPerPage(Number(val))}
              >
                <SelectTrigger className="w-[70px] h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[10, 25, 50, 100].map((option) => (
                    <SelectItem key={option} value={String(option)}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.max(1, pagination.page - 1))}
                disabled={pagination.page === 1}
                className="text-gray-600"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Prev
              </Button>

              <div className="flex items-center gap-1">
                {getPageNumbers().map((page, index) =>
                  typeof page === 'number' ? (
                    <Button
                      key={index}
                      variant={pagination.page === page ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setCurrentPage(page)}
                      className={`w-8 h-8 ${
                        pagination.page === page
                          ? 'bg-green-600 text-white hover:bg-green-700'
                          : 'text-gray-600'
                      }`}
                    >
                      {page}
                    </Button>
                  ) : (
                    <span key={index} className="px-2 text-gray-400">
                      {page}
                    </span>
                  )
                )}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setCurrentPage(Math.min(totalPages, pagination.page + 1))
                }
                disabled={pagination.page === totalPages}
                className="text-gray-600"
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Add/Edit FAQ Modal */}
      <AddEditFAQModal
        open={isModalOpen}
        onClose={handleCloseModal}
        faq={selectedFAQ}
      />

      {/* View FAQ Modal - Commented out as View button is hidden */}
      {/* <ViewFAQModal
        open={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false)
          setSelectedFAQ(null)
        }}
        faq={selectedFAQ}
      /> */}

      {/* Delete FAQ Modal */}
      <DeleteFAQModal
        open={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false)
          setSelectedFAQ(null)
        }}
        faq={selectedFAQ}
        onConfirm={handleConfirmDelete}
      />
    </motion.div>
  )
}

export default FAQ