import { baseApi } from './baseApi'

export const userSettingsApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getUserSettings: builder.query({
      query: () => ({
        url: '/user-setting',
      }),
      providesTags: ['UserSettings'],
    }),
    updateUserSettings: builder.mutation({
      query: (data) => ({
        url: '/user-setting/update',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['UserSettings'],
    }),
  }),
})

export const { useGetUserSettingsQuery, useUpdateUserSettingsMutation } = userSettingsApi
