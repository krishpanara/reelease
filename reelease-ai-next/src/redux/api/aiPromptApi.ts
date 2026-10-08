import { AiPrompt, AiPromptParams, AiPromptResponse } from '@/types/components/ai-prompts';
import { baseApi } from './baseApi'


export const aiPromptApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getPrompts: builder.query<AiPromptResponse, AiPromptParams>({
      query: (params) => ({
        url: '/ai-prompt',
        params,
      }),
      providesTags: ['AiPrompt'],
    }),
    getPrompt: builder.query<AiPrompt, string>({
      query: (id) => `/ai-prompt/${id}`,
      providesTags: (result, error, id) => [{ type: 'AiPrompt', id }],
    }),
    createPrompt: builder.mutation<{ message: string; prompt: AiPrompt }, Partial<AiPrompt>>({
      query: (body) => ({
        url: '/ai-prompt',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['AiPrompt'],
    }),
    updatePrompt: builder.mutation<{ message: string; prompt: AiPrompt }, Partial<AiPrompt> & { id: string }>({
      query: ({ id, ...body }) => ({
        url: `/ai-prompt/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (result, error, { id }) => ['AiPrompt', { type: 'AiPrompt', id }],
    }),
    deletePrompts: builder.mutation<{ message: string; deletedCount: number }, { ids: string[] }>({
      query: (data) => ({
        url: '/ai-prompt/delete',
        method: 'DELETE',
        body: data,
      }),
      invalidatesTags: ['AiPrompt'],
    }),
    getPromptCategories: builder.query<any, void>({
      query: () => '/ai-prompt/categories',
      providesTags: ['AiPrompt'],
    }),
  }),
})

export const {
  useGetPromptsQuery,
  useGetPromptCategoriesQuery,
  useGetPromptQuery,
  useCreatePromptMutation,
  useUpdatePromptMutation,
  useDeletePromptsMutation,
} = aiPromptApi
