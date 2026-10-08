import { baseApi } from './baseApi'
import {
  GetAIProvidersResponse,
  GetAIProviderResponse,
  CreateAIProviderRequest,
  UpdateAIProviderRequest,
  AIFeatureCredit,
  GetAIFeatureCreditsResponse,
  UpsertAIFeatureCreditRequest,
  TestProviderRequest,
} from '@/types'

export const aiProviderApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getAIProviders: builder.query<GetAIProvidersResponse, void>({
      query: () => '/ai-provider',
      providesTags: (result) =>
        result?.providers
          ? [
              ...result.providers.map((p) => ({ type: 'AIProvider' as const, id: p.id || p._id })),
              { type: 'AIProvider', id: 'LIST' },
            ]
          : [{ type: 'AIProvider', id: 'LIST' }],
    }),

    getAIProviderById: builder.query<GetAIProviderResponse, string>({
      query: (id) => `/ai-provider/${id}`,
      providesTags: (result, error, id) => [{ type: 'AIProvider', id }],
    }),

    createAIProvider: builder.mutation<GetAIProviderResponse, CreateAIProviderRequest>({
      query: (body) => ({
        url: '/ai-provider',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'AIProvider', id: 'LIST' }],
    }),

    updateAIProvider: builder.mutation<GetAIProviderResponse, { id: string; data: UpdateAIProviderRequest }>({
      query: ({ id, data }) => ({
        url: `/ai-provider/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'AIProvider', id },
        { type: 'AIProvider', id: 'LIST' },
      ],
    }),

    deleteAIProvider: builder.mutation<{ message: string }, string>({
      query: (id) => ({
        url: `/ai-provider/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'AIProvider', id: 'LIST' }],
    }),

    getAIFeatureCredits: builder.query<GetAIFeatureCreditsResponse, string>({
      query: (providerId) => `/ai-feature-credit/provider/${providerId}`,
      providesTags: (result, error, providerId) => [{ type: 'AIFeatureCredit', id: providerId }],
    }),

    upsertAIFeatureCredit: builder.mutation<{ message: string; credit: AIFeatureCredit }, UpsertAIFeatureCreditRequest>(
      {
        query: (body) => ({
          url: '/ai-feature-credit/upsert',
          method: 'POST',
          body,
        }),
        invalidatesTags: (result, error, { provider_id }) => [{ type: 'AIFeatureCredit', id: provider_id }],
      },
    ),

    deleteAIFeatureCredit: builder.mutation<{ message: string }, { id: string; provider_id: string }>({
      query: ({ id }) => ({
        url: `/ai-feature-credit/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, { provider_id }) => [{ type: 'AIFeatureCredit', id: provider_id }],
    }),

    testProvider: builder.mutation<
      { success: boolean; message: string; taskId?: string; data?: any },
      TestProviderRequest
    >({
      query: (body) => ({
        url: '/ai-provider/test',
        method: 'POST',
        body,
      }),
    }),

    getTaskStatus: builder.query<any, string>({
      query: (taskId) => `/ai-provider/task/${taskId}`,
    }),
  }),
})

export const {
  useGetAIProvidersQuery,
  useGetAIProviderByIdQuery,
  useCreateAIProviderMutation,
  useUpdateAIProviderMutation,
  useDeleteAIProviderMutation,
  useGetAIFeatureCreditsQuery,
  useUpsertAIFeatureCreditMutation,
  useDeleteAIFeatureCreditMutation,
  useTestProviderMutation,
  useGetTaskStatusQuery,
} = aiProviderApi
