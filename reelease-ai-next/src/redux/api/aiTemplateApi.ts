import { AITemplate } from '@/types';
import { baseApi } from './baseApi'

export const aiTemplateApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getTemplates: builder.query<any, any>({
      query: (params) => ({
        url: '/ai-template',
        params,
      }),
      providesTags: ['AITemplateCategory'] as any,
    }),
    getTemplateById: builder.query<AITemplate, string>({
      query: (id) => `/ai-template/${id}`,
      providesTags: (result, error, id) => [{ type: 'AITemplateCategory', id }] as any,
    }),
    createTemplate: builder.mutation<any, any>({
      query: (data) => ({
        url: '/ai-template',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['AITemplateCategory'] as any,
    }),
    updateTemplate: builder.mutation<any, { id: string; data: any }>({
      query: ({ id, data }) => ({
        url: `/ai-template/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['AITemplateCategory'] as any,
    }),
    deleteTemplate: builder.mutation<any, string>({
      query: (id) => ({
        url: `/ai-template/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['AITemplateCategory'] as any,
    }),
  }),
})

export const { 
  useGetTemplatesQuery,
  useGetTemplateByIdQuery,
  useCreateTemplateMutation,
  useUpdateTemplateMutation,
  useDeleteTemplateMutation,
} = aiTemplateApi
