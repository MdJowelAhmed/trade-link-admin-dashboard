import { baseApi } from "../baseApi"

// Query params for leads list (backend may handle filtering/pagination)
interface GetLeadsParams {
    searchTerm?: string
    status?: string
    page?: number
    limit?: number
}

// Backend lead shape (from API response)
interface BackendLead {
    _id: string
    creator: {
        name: string
        email: string
        phone?: string
        customer?: Record<string, unknown>
    }
    service: {
        name: string
    }
    jobNumber: string
    country: string
    status: string
    answeredQuestions?: Array<{
        questionText?: string
        answerText?: string
        question?: string
        answer?: string | string[]
        _id?: string
    }>
    createdAt: string
    updatedAt: string
}

// Backend response type
interface LeadsResponse {
    success: boolean
    message: string
    pagination: {
        total: number
        limit: number
        page: number
        totalPage: number
    }
    data: BackendLead[]
}

const leadsApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getLeads: builder.query<LeadsResponse, GetLeadsParams | void>({
            query: (params) => {
                const queryParams = new URLSearchParams()
                if (params?.searchTerm) queryParams.append('searchTerm', params.searchTerm)
                if (params?.status && params.status !== 'all') queryParams.append('status', params.status)
                if (params?.page) queryParams.append('page', params.page.toString())
                if (params?.limit) queryParams.append('limit', params.limit.toString())

                const queryString = queryParams.toString()
                return {
                    url: `/admin/leads${queryString ? `?${queryString}` : ''}`,
                    method: 'GET',
                }
            },
            providesTags: ['Lead'],
        }),
        getLeadById: builder.query({
            query: (id) => ({
                url: `/admin/leads/${id}`,
                method: 'GET',
            }),
            providesTags: ['Lead'],
        }),

        updateLead: builder.mutation({
            query: (lead) => ({
                url: '/admin/leads',
                method: 'PUT',
                body: lead,
            }),
            invalidatesTags: ['Lead'],
        }),
        deleteLead: builder.mutation({
            query: (id) => ({
                url: `/admin/leads/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Lead'],
        }),
        updateLeadStatus: builder.mutation({
            query: (id) => ({
                url: `/admin/leads/${id}`,
                method: 'PUT',
            }),
            invalidatesTags: ['Lead'],
        }),
    }),

})

export const {
    useGetLeadsQuery,
    useGetLeadByIdQuery,
    useUpdateLeadMutation,
    useDeleteLeadMutation,
    useUpdateLeadStatusMutation,
} = leadsApi

export type { LeadsResponse, BackendLead, GetLeadsParams }
