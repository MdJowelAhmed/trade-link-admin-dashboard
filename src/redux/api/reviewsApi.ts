import { baseApi } from "../baseApi"

// Type for review query params (backend handles filtering/pagination)
interface GetReviewsParams {
    searchTerm?: string
    rating?: string
    page?: number
    limit?: number
}

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

// Type for backend response
interface ReviewsResponse {
    success: boolean
    message: string
    pagination: {
        total: number
        limit: number
        page: number
        totalPage: number
    }
    data: BackendReview[]
}

const reviewsApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getReviews: builder.query<ReviewsResponse, GetReviewsParams | void>({
            query: (params) => {
                const queryParams = new URLSearchParams()
                if (params?.searchTerm) queryParams.append('searchTerm', params.searchTerm)
                if (params?.rating && params.rating !== 'all') queryParams.append('rating', params.rating)
                if (params?.page) queryParams.append('page', params.page.toString())
                if (params?.limit) queryParams.append('limit', params.limit.toString())

                const queryString = queryParams.toString()
                return {
                    url: `/admin/reviews${queryString ? `?${queryString}` : ''}`,
                    method: 'GET',
                }
            },
            providesTags: ['Review'],
        }),
    }),
})

export const { useGetReviewsQuery } = reviewsApi

export type { BackendReview, ReviewsResponse, GetReviewsParams }