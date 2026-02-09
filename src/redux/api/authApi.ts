import { baseApi } from "../baseApi";

interface LoginResponse {
  success: boolean;
  message: string;
  data?: {
    accessToken?: string;
  };
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface ChangePasswordResponse {
  success: boolean;
  message: string;
}

const authApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        login: builder.mutation<LoginResponse, LoginCredentials>({
            query: (credentials) => ({
                url: '/auth/login',
                method: 'POST',
                body: credentials,
            }),
            invalidatesTags: ['Auth'],
        }),
        register: builder.mutation ({
            query: (credentials) => ({
                url: '/auth/register',
                method: 'POST',
                body: credentials,
            }),
            invalidatesTags: ['Auth'],
        }),
        logout: builder.mutation ({
            query: () => ({
                url: '/auth/logout',
                method: 'POST',
            }),
            invalidatesTags: ['Auth'],
        }),
        getCurrentUser: builder.query ({
            query: () => ({
                url: '/auth/current-user',
                method: 'GET',
            }),
            providesTags: ['Auth'],
        }),
        changePassword: builder.mutation<ChangePasswordResponse, ChangePasswordPayload> ({
            query: (credentials) => ({
                url: '/auth/change-password',
                method: 'POST',
                body: credentials,
            }),
            invalidatesTags: ['Auth'],
        }),
        forgotPassword: builder.mutation ({
            query: (credentials) => ({
                url: '/auth/forgot-password',
                method: 'POST',
                body: credentials,
            }),
            invalidatesTags: ['Auth'],
        }),
         verifyEmail: builder.mutation ({
            query: (credentials) => ({
                url: '/auth/verify-email',
                method: 'POST',
                body: credentials,
            }),
            invalidatesTags: ['Auth'],
        }), 
        resetPassword: builder.mutation ({
            query: (credentials) => ({
                url: '/auth/reset-password',
                method: 'POST',
                body: credentials,
            }),
            invalidatesTags: ['Auth'],
        }),
       

    }),

})

export const { useLoginMutation, useRegisterMutation, useLogoutMutation, useGetCurrentUserQuery, useChangePasswordMutation, useForgotPasswordMutation, useVerifyEmailMutation, useResetPasswordMutation } = authApi