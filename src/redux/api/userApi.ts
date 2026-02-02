import { baseApi } from "../baseApi"

const userApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getUsers: builder.query ({
            query: () => ({
                url: '/user',
                method: 'GET',
            }),
            providesTags: ['User'],
        }),
        getUserById: builder.query ({
            query: (id) => ({
                url: `/user/${id}`,
                method: 'GET',
            }),
            providesTags: ['User'],
        }),
        addUser: builder.mutation ({
            query: (user) => ({
                url: '/user',
                method: 'POST',
                body: user,
            }),
            invalidatesTags: ['User'],
        }),
        updateUser: builder.mutation ({
            query: (user) => ({
                url: '/user',
                method: 'PUT',
                body: user,
            }),
            invalidatesTags: ['User'],
        }),
        deleteUser: builder.mutation ({
            query: (id) => ({
                url: `/user/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['User'],
        }),
        updateUserStatus: builder.mutation ({
            query: (id) => ({
                url: `/user/${id}`,
                method: 'PUT',
            }),
            invalidatesTags: ['User'],
        }),
    }),

})

export const { useGetUsersQuery, useGetUserByIdQuery, useAddUserMutation, useUpdateUserMutation, useDeleteUserMutation, useUpdateUserStatusMutation } = userApi
