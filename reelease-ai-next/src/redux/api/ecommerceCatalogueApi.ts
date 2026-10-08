import { CatalogueTask, GenerateCatalogueRequest, GenerateCatalogueResponse } from '@/types/ecommerceCatalogue';
import { baseApi } from './baseApi'

export const ecommerceCatalogueApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getCatalogueVideos: builder.query<{ success: boolean; data: CatalogueTask[] }, void>({
      query: () => ({
        url: '/ecommerce-catalogue/list',
        method: 'GET',
      }),
    }),
    generateCatalogueVideo: builder.mutation<GenerateCatalogueResponse, GenerateCatalogueRequest>({
      query: (body) => ({
        url: '/ecommerce-catalogue/generate',
        method: 'POST',
        body,
      }),
    }),
    deleteCatalogueVideo: builder.mutation<{ success: boolean; message: string }, string>({
      query: (id) => ({
        url: `/ecommerce-catalogue/${id}`,
        method: 'DELETE',
      }),
    }),
  }),
})

export const { useGetCatalogueVideosQuery, useGenerateCatalogueVideoMutation, useDeleteCatalogueVideoMutation } =
  ecommerceCatalogueApi
