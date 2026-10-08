import { GenerateMediaRequest, GenerateMediaResponse, UsageLogsResponse } from '@/types/ai'
import { baseApi } from './baseApi'

export const aiApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    generateMedia: builder.mutation<GenerateMediaResponse, GenerateMediaRequest>({
      query: (data) => ({
        url: '/ai/generate',
        method: 'POST',
        body: data,
      }),
    }),
    getUsageLogs: builder.query<UsageLogsResponse, any>({
      query: (params) => ({
        url: '/ai/usage-logs',
        params: params || undefined,
      }),
    }),
    saveToMedia: builder.mutation<any, { taskId: string }>({
      query: (data) => ({
        url: '/ai/save-to-media',
        method: 'POST',
        body: data,
      }),
    }),
  }),
})

export const {
  useGenerateMediaMutation,
  useGetUsageLogsQuery,
  useSaveToMediaMutation,
} = aiApi
