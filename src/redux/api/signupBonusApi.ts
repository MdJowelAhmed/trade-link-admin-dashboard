import { baseApi } from "../baseApi";

// Signup Bonus data type from API
export interface SignupBonus {
    _id: string
    key: string
    __v: number
    createdAt: string
    updatedAt: string
    value: number
}

// API Response type
interface SignupBonusResponse {
    success: boolean
    message: string
    data: SignupBonus
}

// Update payload type
interface UpdateSignupBonusPayload {
    value: number
}

const signupBonusApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getSignupBonus: builder.query<SignupBonusResponse, void>({
            query: () => ({
                url: '/admin/settings/professional-signup-bonus',
                method: 'GET',
            }),
            providesTags: ['SignupBonus'],
        }),
        updateSignupBonus: builder.mutation<SignupBonusResponse, UpdateSignupBonusPayload>({
            query: (payload) => ({
                url: '/admin/settings/professional-signup-bonus',
                method: 'PATCH',
                body: payload,
            }),
            invalidatesTags: ['SignupBonus'],
        }),
    }),
})

export const { useGetSignupBonusQuery, useUpdateSignupBonusMutation } = signupBonusApi
export type { SignupBonusResponse, UpdateSignupBonusPayload }