import { useMemo, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import {
  SearchInput,
  FilterDropdown,
  Pagination,
  GridSkeleton,
} from '@/components/common'
import { useAppDispatch } from '@/redux/hooks'
import { setFilters, setPage, setLimit } from '@/redux/slices/reviewsSlice'
import { useGetReviewsQuery } from '@/redux/api/reviewsApi'
import { useUrlParams } from '@/hooks/useUrlState'
import { motion } from 'framer-motion'
import { Star } from 'lucide-react'

// Backend review type (from API response)
interface BackendReview {
  _id: string
  professional: {
    businessName: string
  }
  customer: {
    name: string
    email: string
  }
  rating: number
  comment: string
  createdAt: string
  updatedAt: string
}

// Rating filter options
const RATING_OPTIONS = [
  { value: 'all', label: 'All Ratings' },
  { value: '5', label: '5 Stars' },
  { value: '4', label: '4 Stars' },
  { value: '3', label: '3 Stars' },
  { value: '2', label: '2 Stars' },
  { value: '1', label: '1 Star' },
]

// Review Card Component
interface ReviewCardProps {
  review: BackendReview
  index: number
}

function ReviewCard({ review, index }: ReviewCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      <Card className="h-full hover:shadow-lg transition-shadow">
        <CardContent className="p-6">
          <div className="space-y-4">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100">
                  {review.customer.name}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {review.customer.email}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {formatDate(review.createdAt)}
                </p>
              </div>
            </div>

            {/* Professional Info */}
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Professional:
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {review.professional.businessName}
              </p>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-5 w-5 ${
                    star <= review.rating
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'fill-gray-200 text-gray-200 dark:fill-gray-700 dark:text-gray-700'
                  }`}
                />
              ))}
              <span className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                {review.rating}/5
              </span>
            </div>

            {/* Comment */}
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-4">
                {review.comment}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

export default function ReviewsManagement() {
  const dispatch = useAppDispatch()

  // URL-based state management
  const { getParam, getNumberParam, setParam, setParams } = useUrlParams()

  const search = getParam('search', '')
  const rating = getParam('rating', 'all')
  const page = getNumberParam('page', 1)
  const limit = getNumberParam('limit', 10)

  // RTK Query - Reviews (backend handles filtering/pagination)
  const {
    data: reviewsResponse,
    isLoading: reviewsLoading,
    isFetching: reviewsFetching,
  } = useGetReviewsQuery({
    searchTerm: search || undefined,
    rating: rating !== 'all' ? rating : undefined,
    page,
    limit,
  })

  // Extract reviews and pagination from response
  const reviews = useMemo(
    () => (Array.isArray(reviewsResponse?.data) ? reviewsResponse.data : []),
    [reviewsResponse?.data]
  )
  const reviewsMeta = reviewsResponse?.pagination

  // Sync URL params with Redux UI state
  useEffect(() => {
    dispatch(setFilters({ search, rating }))
    dispatch(setPage(page))
    dispatch(setLimit(limit))
  }, [search, rating, page, limit, dispatch])

  const handleSearch = (value: string) => {
    setParams({ search: value, page: 1 })
  }

  const handleRatingFilter = (value: string) => {
    setParams({ rating: value, page: 1 })
  }

  const handlePageChange = (newPage: number) => {
    setParam('page', newPage)
  }

  const handleLimitChange = (newLimit: number) => {
    setParams({ limit: newLimit, page: 1 })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <Card>
        <CardContent className="p-6">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row justify-end gap-4 mb-6">
            <SearchInput
              value={search}
              onChange={handleSearch}
              placeholder="Search by customer name or email..."
              className="sm:flex-1 max-w-md"
            />
            <FilterDropdown
              value={rating}
              options={RATING_OPTIONS}
              onChange={handleRatingFilter}
              placeholder="All Ratings"
              className="sm:w-48"
            />
          </div>

          {/* Reviews List */}
          {reviewsLoading || reviewsFetching ? (
            <GridSkeleton count={6} itemClassName="h-64" />
          ) : reviews.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {reviews.map((review: BackendReview, index: number) => (
                  <ReviewCard key={review._id} review={review} index={index} />
                ))}
              </div>
              <Pagination
                currentPage={reviewsMeta?.page ?? page}
                totalPages={reviewsMeta?.totalPage ?? 1}
                totalItems={reviewsMeta?.total ?? reviews.length}
                itemsPerPage={reviewsMeta?.limit ?? limit}
                onPageChange={handlePageChange}
                onItemsPerPageChange={handleLimitChange}
                className="mt-6"
              />
            </>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              No reviews found. Try adjusting your filters.
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
