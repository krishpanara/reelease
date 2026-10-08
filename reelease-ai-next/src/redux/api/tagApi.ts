import { Tag } from '@/types';
import { baseApi } from './baseApi'

export const tagApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getTags: builder.query<{ tags: Tag[]; totalPages: number; currentPage: number; total: number }, any>({
      query: (params) => ({
        url: '/tag',
        params,
      }),
      providesTags: ['Tag'],
    }),
    getTagById: builder.query<Tag, string>({
      query: (id) => `/tag/${id}`,
      providesTags: (result, error, id) => [{ type: 'Tag', id }],
    }),
    createTag: builder.mutation<any, Partial<Tag>>({
      query: (data) => ({
        url: '/tag',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Tag'],
    }),
    updateTag: builder.mutation<any, { id: string; data: Partial<Tag> }>({
      query: ({ id, data }) => ({
        url: `/tag/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => ['Tag', { type: 'Tag', id }],
    }),
    deleteTag: builder.mutation<any, string>({
      query: (id) => ({
        url: `/tag/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Tag'],
    }),
  }),
})

export const {
  useGetTagsQuery,
  useGetTagByIdQuery,
  useCreateTagMutation,
  useUpdateTagMutation,
  useDeleteTagMutation,
} = tagApi
