import { baseApi } from './baseApi'
import {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  ForgotPasswordRequest,
  VerifyOtpRequest,
  ResetPasswordRequest,
  GenericResponse,
} from '@/types'

export const authApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    login: builder.mutation<LoginResponse, LoginRequest>({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
    }),
    register: builder.mutation<RegisterResponse, RegisterRequest>({
      query: (data) => ({
        url: '/auth/register',
        method: 'POST',
        body: data,
      }),
    }),
    logout: builder.mutation<{ message: string }, void>({
      query: () => ({
        url: '/auth/logout',
        method: 'POST',
      }),
    }),
    getProfile: builder.query<{ user: any }, void>({
      query: () => '/auth/profile',
      providesTags: ['User'],
      keepUnusedDataFor: 300,
    }),
    updateProfile: builder.mutation<{ message: string; user: any }, FormData>({
      query: (data) => ({
        url: '/auth/profile',
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['User'],
    }),
    requestPasswordReset: builder.mutation<GenericResponse & { demo_otp?: string | null }, ForgotPasswordRequest>({
      query: (data) => ({
        url: '/auth/request-password-reset',
        method: 'POST',
        body: data,
      }),
    }),
    verifyOtp: builder.mutation<GenericResponse, VerifyOtpRequest>({
      query: (data) => ({
        url: '/auth/verify-otp',
        method: 'POST',
        body: data,
      }),
    }),
    // Separate endpoint for registration OTP verification — creates the user account
    verifyRegistration: builder.mutation<GenericResponse & { user?: any }, VerifyOtpRequest>({
      query: (data) => ({
        url: '/auth/register-verify',
        method: 'POST',
        body: data,
      }),
    }),
    resendOtp: builder.mutation<GenericResponse & { demo_otp?: string | null }, ForgotPasswordRequest>({
      query: (data) => ({
        url: '/auth/resend-otp',
        method: 'POST',
        body: data,
      }),
    }),
    resetPassword: builder.mutation<GenericResponse, ResetPasswordRequest>({
      query: (data) => ({
        url: '/auth/reset-password',
        method: 'POST',
        body: data,
      }),
    }),
    changePassword: builder.mutation<GenericResponse, any>({
      query: (data) => ({
        url: '/auth/change-password',
        method: 'POST',
        body: data,
      }),
    }),

    deactivateAccount: builder.mutation<GenericResponse, void>({
      query: () => ({
        url: '/auth/deactivate',
        method: 'POST',
      }),
    }),

    getDemoCredentials: builder.query<{
      demo: boolean;
      admin?: { email: string; password: string };
      user?: { email: string; password: string };
    }, void>({
      query: () => '/demo',
    }),
  }),
})

export const {
  useLoginMutation,
  useRegisterMutation,
  useLogoutMutation,
  useGetProfileQuery,
  useUpdateProfileMutation,
  useRequestPasswordResetMutation,
  useVerifyOtpMutation,
  useVerifyRegistrationMutation,
  useResendOtpMutation,
  useResetPasswordMutation,
  useChangePasswordMutation,
  useDeactivateAccountMutation,
  useGetDemoCredentialsQuery,
} = authApi
