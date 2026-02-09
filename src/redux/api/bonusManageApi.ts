import { baseApi } from "../baseApi";

const bonusManageApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getBonusManagement: builder.query<BonusManagementResponse, void>({
            query: (args) => {
                const queryParams = new URLSearchParams()
                if (args?.searchTerm) queryParams.append('searchTerm', args.searchTerm)
                if (args?.page) queryParams.append('page', args.page.toString())
                if (args?.limit) queryParams.append('limit', args.limit.toString())
                return {
                    url: '/admin/settings/bonus-management',
                    method: 'GET',
                }
            },
            providesTags: ['BonusManagement'],
        }),
    }),
})

export const { useGetBonusManagementQuery } = bonusManageApi