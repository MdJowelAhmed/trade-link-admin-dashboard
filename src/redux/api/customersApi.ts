import { baseApi } from "../baseApi";

// Query params for customers list
interface GetCustomersParams {
    searchTerm?: string
    status?: string
    page?: number
    limit?: number
}

// Backend customer shape (from API response)
interface BackendCustomer {
    _id: string
    name: string
    email: string
    phone?: string
    role: string
    status: 'ACTIVE' | 'INACTIVE'
    isVerified: boolean
    isPhoneVerified: boolean
    isEmailVerified: boolean
    createdAt: string
    updatedAt: string
    customer?: {
        address?: string
        profileImage?: string
    }
}

// Backend response type
interface CustomersResponse {
    success: boolean
    message: string
    pagination: {
        total: number
        limit: number
        page: number
        totalPage: number
    }
    data: BackendCustomer[]
}

const customersApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getCustomers: builder.query<CustomersResponse, GetCustomersParams | void>({
            query: (params) => {
                const queryParams = new URLSearchParams()
                if (params?.searchTerm) queryParams.append('searchTerm', params.searchTerm)
                if (params?.status && params.status !== 'all') queryParams.append('status', params.status)
                if (params?.page) queryParams.append('page', params.page.toString())
                if (params?.limit) queryParams.append('limit', params.limit.toString())

                const queryString = queryParams.toString()
                return {
                    url: `/admin/customers${queryString ? `?${queryString}` : ''}`,
                    method: 'GET',
                }
            },
            providesTags: ['Customer'],
        }),

        statusUpdateCustomer: builder.mutation<{ success: boolean; message: string }, { id: string; status: 'ACTIVE' | 'INACTIVE' }>({
            query: ({ id, status }) => ({
                url: `/admin/customers/${id}/status`,
                method: 'PATCH',
                body: { status },
            }),
            invalidatesTags: ['Customer'],
        }),
    }),
})

export const { useGetCustomersQuery, useStatusUpdateCustomerMutation } = customersApi

export type { CustomersResponse, BackendCustomer, GetCustomersParams }