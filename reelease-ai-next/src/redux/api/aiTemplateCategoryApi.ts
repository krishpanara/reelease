import { AITemplateCategory } from '@/types';
import { baseApi } from './baseApi'

export const aiTemplateCategoryApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getAiTemplateCategories: builder.query<{ categories: AITemplateCategory[]; totalPages: number; total: number; currentPage: number }, any>({ 
      query: (params) => ({
        url: '/ai-template-category',
        params,
      }),
      providesTags: ['AITemplateCategory'],
    }),
    getAiTemplateCategoryById: builder.query<AITemplateCategory, string>({
      query: (id) => `/ai-template-category/${id}`,
      providesTags: (result, error, id) => [{ type: 'AITemplateCategory', id }],
    }),
    createAiTemplateCategory: builder.mutation<any, Partial<AITemplateCategory>>({
      query: (data) => ({
        url: '/ai-template-category',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['AITemplateCategory'],
    }),
    updateAiTemplateCategory: builder.mutation<any, { id: string; data: Partial<AITemplateCategory> }>({
      query: ({ id, data }) => ({
        url: `/ai-template-category/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => ['AITemplateCategory', { type: 'AITemplateCategory', id }],
    }),
    deleteAiTemplateCategory: builder.mutation<any, string>({
      query: (id) => ({
        url: `/ai-template-category/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['AITemplateCategory'],
    }),
  }),
})

export const {
  useGetAiTemplateCategoriesQuery,
  useGetAiTemplateCategoryByIdQuery,
  useCreateAiTemplateCategoryMutation,
  useUpdateAiTemplateCategoryMutation,
  useDeleteAiTemplateCategoryMutation,
} = aiTemplateCategoryApi
