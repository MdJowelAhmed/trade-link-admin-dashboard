import { baseApi } from "../baseApi"

// Type for service query params (backend handles filtering/pagination)
interface GetServicesParams {
    searchTerm?: string
    isActive?: boolean
    categoryId?: string
    page?: number
    limit?: number
}

// Backend service type (from API response)
interface BackendService {
    _id: string
    categoryId: {
        _id: string
        name: string
    }
    name: string
    isActive: boolean
    createdAt: string
    updatedAt: string
    slug: string
    __v?: number
}

// Type for backend response
interface ServiceResponse {
    success: boolean
    message: string
    pagination: {
        total: number
        limit: number
        page: number
        totalPage: number
    }
    data: BackendService[]
}

const serviceApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getServices: builder.query<ServiceResponse, GetServicesParams | void>({
            query: (params) => {
                const queryParams = new URLSearchParams()
                if (params?.searchTerm) queryParams.append('searchTerm', params.searchTerm)
                if (params?.isActive !== undefined) queryParams.append('isActive', params.isActive.toString())
                if (params?.categoryId && params.categoryId !== 'all') queryParams.append('categoryId', params.categoryId)
                if (params?.page) queryParams.append('page', params.page.toString())
                if (params?.limit) queryParams.append('limit', params.limit.toString())

                const queryString = queryParams.toString()
                return {
                    url: `/admin/services${queryString ? `?${queryString}` : ''}`,
                    method: 'GET',
                }
            },
            providesTags: ['Service'],
        }),
        getServiceById: builder.query({
            query: (id) => ({
                url: `/admin/services/${id}`,
                method: 'GET',
            }),
            providesTags: ['Service'],
        }),
        addService: builder.mutation({
            query: (service) => ({
                url: '/admin/services',
                method: 'POST',
                body: service,
            }),
            invalidatesTags: ['Service'],
        }),
        updateService: builder.mutation({
            query: ({ formData, id }) => ({
                url: `/admin/services/${id}`,
                method: 'PATCH',
                body: formData,
            }),
            invalidatesTags: ['Service'],
        }),
        deleteService: builder.mutation({
            query: (id) => ({
                url: `/admin/services/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Service'],
        }),
        updateServiceStatus: builder.mutation({
            query: ({ id, isActive }) => ({
                url: `/admin/services/${id}`,
                method: 'PATCH',
                body: { isActive },
            }),
            invalidatesTags: ['Service'],
        }),
    }),
})

export const { 
    useGetServicesQuery, 
    useGetServiceByIdQuery,
    useAddServiceMutation, 
    useUpdateServiceMutation, 
    useDeleteServiceMutation, 
    useUpdateServiceStatusMutation 
} = serviceApi

export type { BackendService, ServiceResponse, GetServicesParams }