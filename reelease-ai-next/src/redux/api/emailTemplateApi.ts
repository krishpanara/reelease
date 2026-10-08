import { EmailTemplate } from '@/types';
import { baseApi } from './baseApi';



export const emailTemplateApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getEmailTemplates: builder.query<{ templates: EmailTemplate[] }, void>({
      query: () => '/email-template',
      providesTags: ['EmailTemplate'],
    }),
    updateEmailTemplate: builder.mutation<void, { slug: string; subject: string; content: string; status: boolean }>({
      query: ({ slug, ...body }) => ({
        url: `/email-template/${slug}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['EmailTemplate'],
    }),
  }),
});

export const { useGetEmailTemplatesQuery, useUpdateEmailTemplateMutation } = emailTemplateApi;
