import { baseApi } from "../baseApi";

const bonusManageApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getBonusManagement: builder.query<BonusManagementResponse, void>({
            query: (args) => {
                const queryParams = new URLSearchParams()
                if (args?.searchTerm) queryParams.append('searchTerm', args.searchTerm)
                if (args?.page) queryParams.append('page', args.page.toString())
                if (args?.limit) queryParams.append('limit', args.limit.toString())
                const queryString = queryParams.toString()
                return {
                    url: `/admin/settings/bonus-management${queryString ? `?${queryString}` : ''}`,
                    method: 'GET',
                }
            },
            providesTags: ['BonusManagement'],
        }),
        updateBonusManagementAmount: builder.mutation<BonusManagementResponse, BonusManagement>({
            query: (bonusManagement) => ({
                url: '/admin/settings/bonus-management',
                method: 'PATCH',
                body: bonusManagement,
            }),
            invalidatesTags: ['BonusManagement'],
        }),
        UpdateBonusManagementStatus: builder.mutation<BonusManagementResponse, BonusManagement>({
            query: (bonusManagement) => ({
                url: '/admin/settings/bonus-management',
                method: 'PATCH',
                body: bonusManagement,
            }),
            invalidatesTags: ['BonusManagement'],
        }),

    }), 

})

export const { useGetBonusManagementQuery, useUpdateBonusManagementAmountMutation, useUpdateBonusManagementStatusMutation } = bonusManageApi