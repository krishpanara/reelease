import { baseApi } from './baseApi'

export const aiCaptionModelApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCaptionModels: builder.query({
      query: (params) => ({
        url: '/ai-caption-models',
        params: params || {}
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ id }: { id: string }) => ({ type: 'CaptionModel' as const, id })),
              { type: 'CaptionModel', id: 'LIST' },
            ]
          : [{ type: 'CaptionModel', id: 'LIST' }]
    }),
    getActiveCaptionModels: builder.query({
      query: () => '/ai-caption-models/active',
      providesTags: ['ActiveCaptionModels']
    }),
    getCaptionModelById: builder.query({
      query: (id) => `/ai-caption-models/${id}`,
      providesTags: (result, error, id) => [{ type: 'CaptionModel', id }]
    }),
    createCaptionModel: builder.mutation({
      query: (data) => ({
        url: '/ai-caption-models',
        method: 'POST',
        body: data
      }),
      invalidatesTags: [{ type: 'CaptionModel', id: 'LIST' }, 'ActiveCaptionModels']
    }),
    updateCaptionModel: builder.mutation({
      query: ({ id, data }) => ({
        url: `/ai-caption-models/${id}`,
        method: 'PUT',
        body: data
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'CaptionModel', id },
        { type: 'CaptionModel', id: 'LIST' },
        'ActiveCaptionModels'
      ]
    }),
    deleteCaptionModel: builder.mutation({
      query: (id) => ({
        url: `/ai-caption-models/${id}`,
        method: 'DELETE'
      }),
      invalidatesTags: [{ type: 'CaptionModel', id: 'LIST' }, 'ActiveCaptionModels']
    }),
    deleteCaptionModels: builder.mutation({
      query: (ids) => ({
        url: '/ai-caption-models/delete',
        method: 'DELETE',
        body: { ids }
      }),
      invalidatesTags: [{ type: 'CaptionModel', id: 'LIST' }, 'ActiveCaptionModels']
    }),
    setDefaultModel: builder.mutation({
      query: (id) => ({
        url: `/ai-caption-models/${id}/set-default`,
        method: 'POST'
      }),
      invalidatesTags: [{ type: 'CaptionModel', id: 'LIST' }, 'ActiveCaptionModels']
    }),
    toggleModelActive: builder.mutation({
      query: (id) => ({
        url: `/ai-caption-models/${id}/toggle-active`,
        method: 'POST'
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'CaptionModel', id },
        { type: 'CaptionModel', id: 'LIST' },
        'ActiveCaptionModels'
      ]
    })
  })
})

export const {
  useGetCaptionModelsQuery,
  useGetActiveCaptionModelsQuery,
  useGetCaptionModelByIdQuery,
  useCreateCaptionModelMutation,
  useUpdateCaptionModelMutation,
  useDeleteCaptionModelMutation,
  useDeleteCaptionModelsMutation,
  useSetDefaultModelMutation,
  useToggleModelActiveMutation
} = aiCaptionModelApi
