import { baseApi } from "../baseApi"

const serviceApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getService: builder.query ({
            query: () => ({
                url: '/service',
                method: 'GET',
            }),
            providesTags: ['Service'],
        }),
        addService: builder.mutation ({
            query: (service) => ({
                url: '/service',
                method: 'POST',
                body: service,
            }),
            invalidatesTags: ['Service'],
        }),
        updateService: builder.mutation ({
            query: (service) => ({
                url: '/service',
                method: 'PUT',
                body: service,
            }),
            invalidatesTags: ['Service'],
        }),
        deleteService: builder.mutation ({
            query: (id) => ({
                url: `/service/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Service'],
        }),
        updateServiceStatus: builder.mutation ({
            query: (id) => ({
                url: `/service/${id}`,
                method: 'PUT',
            }),
            invalidatesTags: ['Service'],
        }),
    }),
})

export const { useGetServiceQuery, useAddServiceMutation, useUpdateServiceMutation, useDeleteServiceMutation, useUpdateServiceStatusMutation } = serviceApi