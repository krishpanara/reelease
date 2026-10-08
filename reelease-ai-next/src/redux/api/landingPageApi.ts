import { LandingPageData } from '@/types/landing';
import { baseApi } from './baseApi'



export const landingPageApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getLandingPage: builder.query<{ message: string; landing_page: LandingPageData }, void>({
      query: () => '/landing-page',
      providesTags: ['LandingPage'],
    }),
    updateLandingPage: builder.mutation<{ message: string; landing_page: LandingPageData }, Partial<LandingPageData>>({
      query: (body) => ({
        url: '/landing-page',
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['LandingPage'],
    }),
  }),
})

export const { useGetLandingPageQuery, useUpdateLandingPageMutation } = landingPageApi
