import { baseApi } from "../baseApi"

const categoriesApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getCategories: builder.query({
            query: (args) => {
                const params = new URLSearchParams();
                if (args) {
                    args.forEach((arg: any) => {
                        params.append(arg.name, arg.value);
                    });
                }
                return {
                    url: '/admin/categories',
                    method: 'GET',
                }
            },
            providesTags: ['Category'],
        }),
        getCategoryById: builder.query({
            query: (id) => ({
                url: `/category/${id}`,
                method: 'GET',
            }),
            providesTags: ['Category'],
        }),
        addCategory: builder.mutation({
            query: (category) => ({
                url: '/category',
                method: 'POST',
                body: category,
            }),
            invalidatesTags: ['Category'],
        }),
        updateCategory: builder.mutation({
            query: (category) => ({
                url: '/category',
                method: 'PUT',
                body: category,
            }),
            invalidatesTags: ['Category'],
        }),
        deleteCategory: builder.mutation({
            query: (id) => ({
                url: `/category/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Category'],
        }),
        updateCategoryStatus: builder.mutation({
            query: (id) => ({
                url: `/category/${id}`,
                method: 'PUT',
            }),
            invalidatesTags: ['Category'],
        }),
    }),
})

export const { useGetCategoriesQuery, useGetCategoryByIdQuery, useAddCategoryMutation, useUpdateCategoryMutation, useDeleteCategoryMutation, useUpdateCategoryStatusMutation } = categoriesApi
