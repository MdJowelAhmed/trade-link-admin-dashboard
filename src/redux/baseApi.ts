import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import type { RootState } from './store'

export const baseApi = createApi({
    reducerPath: 'baseApi',
    baseQuery: fetchBaseQuery({
        baseUrl: import.meta.env.VITE_API_BASE_URL + '/api/v1',
        prepareHeaders: (headers, { getState }) => {
            const token = (getState() as RootState).auth.token
            if (token) {
                headers.set('authorization', `Bearer ${token}`)
            }
            return headers
        },
    }),
    tagTypes: [
        'Auth',
        'User',
        'Product',
        'Category',
        'Car',
        'Client',
        'Agency',
        'Calendar',
        'Transaction',
        'Faq',
        'Customer',
        'TradePerson',
        'Lead',
        'Service',
        'ServiceQuestion',
    ],
    endpoints: () => ({}),
})