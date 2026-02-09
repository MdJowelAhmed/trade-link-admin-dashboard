import { baseApi } from "../baseApi";

// Query params for bonus management
interface GetBonusManagementParams {
    searchTerm?: string
    page?: number
    limit?: number
}

// Backend professional shape (from API response)
export interface BackendProfessional {
    _id: string
    name: string
    email: string
    phone: string
    role: string
    status: 'ACTIVE' | 'INACTIVE'
    isVerified: boolean
    isPhoneVerified: boolean
    isEmailVerified: boolean
    createdAt: string
    updatedAt: string
    professional: {
        address: string
        approveStatus: 'PENDING' | 'APPROVED' | 'REJECTED'
        services?: string[]
    }
    walletBalance: number
}

// Backend response type
interface BonusManagementResponse {
    success: boolean
    message: string
    pagination: {
        total: number
        limit: number
        page: number
        totalPage: number
    }
    data: BackendProfessional[]
}

// Update amount payload
interface UpdateAmountPayload {
    amount: number
}

// Update status payload
interface UpdateStatusPayload {
    approveStatus: 'APPROVED' | 'REJECTED' | 'PENDING'
}

const bonusManageApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getBonusManagement: builder.query<BonusManagementResponse, GetBonusManagementParams | void>({
            query: (params) => {
                const queryParams = new URLSearchParams()
                if (params?.searchTerm) queryParams.append('searchTerm', params.searchTerm)
                if (params?.page) queryParams.append('page', params.page.toString())
                if (params?.limit) queryParams.append('limit', params.limit.toString())
                const queryString = queryParams.toString()
                return {
                    url: `/admin/professionals${queryString ? `?${queryString}` : ''}`,
                    method: 'GET',
                }
            },
            providesTags: ['BonusManagement'],
        }),
        updateBonusManagementAmount: builder.mutation<{ success: boolean; message: string }, { id: string; payload: UpdateAmountPayload }>({
            query: ({ id, payload }) => ({
                url: `/admin/professional/${id}/balance`,
                method: 'PATCH',
                body: payload,
            }),
            invalidatesTags: ['BonusManagement'],
        }),
        updateBonusManagementStatus: builder.mutation<{ success: boolean; message: string }, { id: string; payload: UpdateStatusPayload }>({
            query: ({ id, payload }) => ({
                url: `/admin/professionals/${id}/approveStatus`,
                method: 'PATCH',
                body: payload,
            }),
            invalidatesTags: ['BonusManagement'],
        }),
    }), 
})

export const { 
    useGetBonusManagementQuery, 
    useUpdateBonusManagementAmountMutation, 
    useUpdateBonusManagementStatusMutation 
} = bonusManageApi

export type { BonusManagementResponse, GetBonusManagementParams, UpdateAmountPayload, UpdateStatusPayload }