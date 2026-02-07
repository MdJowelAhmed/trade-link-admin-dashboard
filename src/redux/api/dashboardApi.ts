import { baseApi } from "../baseApi";
import { ApiResponse } from "@/types";

// API Response Types
interface EarningsDataItem {
    month: number;
    totalEarnings: number;
}

interface EarningsResponse extends ApiResponse<EarningsDataItem[]> {}

interface DashboardSummaryData {
    totalCustomers: number;
    totalProfessionals: number;
    totalEarnings: number;
}

interface DashboardSummaryResponse extends ApiResponse<DashboardSummaryData> {}

// Query Parameters
interface GetEarningsParams {
    year?: string;
    month?: string;
}

// Exported types for components
export type DashboardData = DashboardSummaryData;
export type EarningsData = EarningsDataItem[];

const dashboardApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getDashboardData: builder.query<DashboardSummaryData, void>({
            query: () => ({
                url: '/analytics/summary-card',
                method: 'GET',
            }),
            transformResponse: (response: DashboardSummaryResponse) => response.data,
            providesTags: ['Dashboard'],
        }),
        getEarningsData: builder.query<EarningsDataItem[], GetEarningsParams>({
            query: (args) => {
                const queryParams = new URLSearchParams()
                if (args?.year) queryParams.append('year', args.year)
                if (args?.month) queryParams.append('month', args.month)
                return {
                    url: `/analytics/earnings-by-month${queryParams.toString() ? `?${queryParams.toString()}` : ''}`,
                    method: 'GET',
                }
            },
            transformResponse: (response: EarningsResponse) => response.data,
            providesTags: ['Dashboard'],
        }),
    }),
})

export const { useGetDashboardDataQuery, useGetEarningsDataQuery } = dashboardApi