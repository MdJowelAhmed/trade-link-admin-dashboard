import { baseApi } from "../baseApi"

// Type for category query params (backend handles filtering/pagination)
interface GetCategoriesParams {
    searchTerm?: string
    status?: string
    page?: number
    limit?: number
}

// Type for backend response
interface CategoryResponse {
    success: boolean
    message: string
    data: Array<{
        _id: string
        name: string
        slug: string
        description?: string
        image?: string
        isActive: boolean
        serviceCount: number
        createdAt: string
        updatedAt: string
    }>
    meta: {
        page: number
        limit: number
        total: number
        totalPage: number
    }
}

const categoriesApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getCategories: builder.query<CategoryResponse, GetCategoriesParams | void>({
            query: (params) => {
                const queryParams = new URLSearchParams()
                if (params?.searchTerm) queryParams.append('searchTerm', params.searchTerm)
                if (params?.status && params.status !== 'all') queryParams.append('status', params.status)
                if (params?.page) queryParams.append('page', params.page.toString())
                if (params?.limit) queryParams.append('limit', params.limit.toString())

                const queryString = queryParams.toString()
                return {
                    url: `/admin/categories${queryString ? `?${queryString}` : ''}`,
                    method: 'GET',
                }
            },
            providesTags: ['Category'],
        }),
        getCategoryById: builder.query({
            query: (id) => ({
                url: `/category/${id}`,
                method: 'GET',
            }),
            providesTags: ['Category'],
        }),
        addCategory: builder.mutation({
            query: (category) => ({
                url: '/admin/categories/',
                method: 'POST',
                body: category,
            }),
            invalidatesTags: ['Category'],
        }),
        updateCategory: builder.mutation({
            query: ({category, id}) => ({
                url: `/admin/categories/${id}`,
                method: 'PATCH',
                body: category,
            }),
            invalidatesTags: ['Category'],
        }),
        deleteCategory: builder.mutation({
            query: (id) => ({
                url: `/category/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Category'],
        }),
        updateCategoryStatus: builder.mutation({
            query: (id) => ({
                url: `/category/${id}`,
                method: 'PUT',
            }),
            invalidatesTags: ['Category'],
        }),
    }),
})

export const { useGetCategoriesQuery, useGetCategoryByIdQuery, useAddCategoryMutation, useUpdateCategoryMutation, useDeleteCategoryMutation, useUpdateCategoryStatusMutation } = categoriesApi
