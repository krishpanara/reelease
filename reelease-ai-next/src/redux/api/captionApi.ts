import { baseApi } from './baseApi'

export const captionApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCaptions: builder.query({
      query: (params) => ({
        url: '/caption',
        params,
      }),
      providesTags: ['Caption'],
    }),
    getCaptionById: builder.query({
      query: (id) => `/caption/${id}`,
      providesTags: (result, error, id) => [{ type: 'Caption', id }],
    }),
    createCaption: builder.mutation({
      query: (data) => ({
        url: '/caption',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Caption'],
    }),
    updateCaption: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/caption/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => ['Caption', { type: 'Caption', id }],
    }),
    deleteCaption: builder.mutation({
      query: (id) => ({
        url: `/caption/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Caption'],
    }),
  }),
})

export const {
  useGetCaptionsQuery,
  useGetCaptionByIdQuery,
  useCreateCaptionMutation,
  useUpdateCaptionMutation,
  useDeleteCaptionMutation,
} = captionApi
