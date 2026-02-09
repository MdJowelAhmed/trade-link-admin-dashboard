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

interface VerifyEmailPayload {
    email: string;
    oneTimeCode: number ;
}

interface VerifyEmailResponse {
    success: boolean;
    message: string;
    // Backend returns the reset token in the "data" field
    data: string;
}

interface ResetPasswordPayload {
    newPassword: string;
    confirmPassword: string;
}

interface ResetPasswordResponse {
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
        register: builder.mutation({
            query: (credentials) => ({
                url: '/auth/register',
                method: 'POST',
                body: credentials,
            }),
            invalidatesTags: ['Auth'],
        }),
        logout: builder.mutation({
            query: () => ({
                url: '/auth/logout',
                method: 'POST',
            }),
            invalidatesTags: ['Auth'],
        }),
        getCurrentUser: builder.query({
            query: () => ({
                url: '/auth/current-user',
                method: 'GET',
            }),
            providesTags: ['Auth'],
        }),
        changePassword: builder.mutation<ChangePasswordResponse, ChangePasswordPayload>({
            query: (credentials) => ({
                url: '/auth/change-password',
                method: 'POST',
                body: credentials,
            }),
            invalidatesTags: ['Auth'],
        }),
        forgotPassword: builder.mutation({
            query: (credentials) => ({
                url: '/auth/forget-password',
                method: 'POST',
                body: credentials,
            }),
            invalidatesTags: ['Auth'],
        }),
        resentOtp: builder.mutation({
            query: (credentials) => ({
                url: '/auth/resend-otp',
                method: 'POST',
                body: credentials,
            }),
            invalidatesTags: ['Auth'],
        }),
        verifyEmail: builder.mutation<VerifyEmailResponse, VerifyEmailPayload>({
            query: (credentials) => ({
                url: '/auth/verify-email',
                method: 'POST',
                body: credentials,
            }),
            async onQueryStarted(_arg, { queryFulfilled }) {
                try {
                    const { data } = await queryFulfilled;
                    // Safely store the reset token from response.data into localStorage
                    if (data?.data) {
                        try {
                            if (typeof localStorage !== 'undefined') {
                                localStorage.setItem('resetPasswordToken', data.data);
                            }
                        } catch {
                            // ignore storage errors
                        }
                    }
                } catch {
                    // ignore errors; normal RTK Query error handling will apply
                }
            },
            invalidatesTags: ['Auth'],
        }),
        resetPassword: builder.mutation<ResetPasswordResponse, ResetPasswordPayload>({
            query: (credentials) => {
                // Read the reset token that was returned from verify-email
                let resetToken: string | null = null;
                try {
                    resetToken = typeof localStorage !== 'undefined'
                        ? localStorage.getItem('resetPasswordToken')
                        : null;
                } catch {
                    resetToken = null;
                }

                const headers: Record<string, string> = {};
                if (resetToken) {
                    // Backend expects this token in the Authorization header
                    headers.Authorization = resetToken;
                }

                return {
                    url: '/auth/reset-password',
                    method: 'POST',
                    body: credentials,
                    headers,
                };
            },
            invalidatesTags: ['Auth'],
        }),


    }),

})

export const {
    useLoginMutation,
    useRegisterMutation,
    useLogoutMutation,
    useGetCurrentUserQuery,
    useChangePasswordMutation,
    useForgotPasswordMutation,
    useVerifyEmailMutation,
    useResetPasswordMutation,
    useResentOtpMutation } =
    authApi