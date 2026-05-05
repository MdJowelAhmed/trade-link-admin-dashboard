import { useMemo, useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  SearchInput,
  FilterDropdown,
  Pagination,
  GridSkeleton,
  ConfirmDialog,
} from '@/components/common'
import { useAppDispatch } from '@/redux/hooks'
import { setFilters, setPage, setLimit } from '@/redux/slices/reviewsSlice'
import {
  useGetReviewsQuery,
  useDeleteReviewMutation,
  type BackendReview,
} from '@/redux/api/reviewsApi'
import { useUrlParams } from '@/hooks/useUrlState'
import { motion } from 'framer-motion'
import { Star, Trash2 } from 'lucide-react'
import { toast } from '@/utils/toast'

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
  onDeleteRequest: (review: BackendReview) => void
  deleteDisabled?: boolean
}

function ReviewCard({ review, index, onDeleteRequest, deleteDisabled }: ReviewCardProps) {
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
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100">
                  {review.customer.name}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {review.customer.email}
                </p>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-2">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {formatDate(review.createdAt)}
                </p>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  className="h-8 w-8 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                  disabled={deleteDisabled}
                  onClick={() => onDeleteRequest(review)}
                  aria-label={`Delete review from ${review.customer.name}`}
                  title="Delete review"
                >
                  <Trash2 className="h-5 w-5" />
                </Button>
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
  const [reviewToDelete, setReviewToDelete] = useState<BackendReview | null>(null)

  const [deleteReview, { isLoading: isDeletingReview }] = useDeleteReviewMutation()

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

  const handleDeleteRequest = (review: BackendReview) => {
    setReviewToDelete(review)
  }

  const handleConfirmDeleteReview = async () => {
    if (!reviewToDelete) return
    try {
      await deleteReview(reviewToDelete._id).unwrap()
      toast({
        title: 'Review deleted',
        description: 'The review has been removed.',
        variant: 'success',
      })
      setReviewToDelete(null)
    } catch (error: unknown) {
      const errorMessage =
        error && typeof error === 'object' && 'data' in error
          ? (error as { data?: { message?: string } }).data?.message
          : undefined
      toast({
        title: 'Error',
        description: errorMessage || 'Failed to delete review.',
        variant: 'destructive',
      })
    }
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
          {reviewsLoading ? (
            <GridSkeleton count={6} itemClassName="h-64" />
          ) : reviews.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {reviews.map((review: BackendReview, index: number) => (
                  <ReviewCard
                    key={review._id}
                    review={review}
                    index={index}
                    onDeleteRequest={handleDeleteRequest}
                    deleteDisabled={isDeletingReview}
                  />
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

      {reviewToDelete && (
        <ConfirmDialog
          open
          onClose={() => setReviewToDelete(null)}
          onConfirm={handleConfirmDeleteReview}
          title="Delete review"
          description={`Remove this review from ${reviewToDelete.customer.name}? This cannot be undone.`}
          confirmText="Delete"
          cancelText="Cancel"
          variant="danger"
          isLoading={isDeletingReview}
        />
      )}
    </motion.div>
  )
}
