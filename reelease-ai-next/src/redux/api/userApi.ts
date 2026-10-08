import { baseApi } from './baseApi'
import { User, UserResponse, UserQueryParams } from '@/types'

export const userApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getUsers: builder.query<UserResponse, UserQueryParams>({
      query: (params) => ({
        url: '/user/all',
        params,
      }),
      providesTags: ['User'],
    }),
    createUser: builder.mutation<{message:string; data: User}, FormData>({
      query: (body) => ({
        url: '/user/create',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['User'],
    }),
    updateUser: builder.mutation<{ message: string; user: User }, FormData>({
      query: (body) => ({
        url: '/user/update',
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['User'],
    }),
    updateUserStatus: builder.mutation<{message?: string}, { id: string; status: boolean }>({
      query: ({ id, status }) => ({
        url: `/user/${id}/update/status`,
        method: 'PUT',
        body: { status },
      }),
      invalidatesTags: ['User'],
    }),
    deleteUsers: builder.mutation<{message?: string}, string[]>({
      query: (ids) => ({
        url: '/user/delete',
        method: 'DELETE',
        body: { ids },
      }),
      invalidatesTags: ['User'],
    }),
  }),
})

export const {
  useGetUsersQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useUpdateUserStatusMutation,
  useDeleteUsersMutation,
} = userApi
