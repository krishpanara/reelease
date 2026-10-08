import { baseApi } from './baseApi'

export const userSettingApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getUserSettings: builder.query({
      query: () => ({
        url: '/user-setting',
      }),
      providesTags: ['UserSettings'],
    }),
    updateEmailConfig: builder.mutation({
      query: (data) => ({
        url: '/user-setting/update',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['UserSettings'],
    }),
    updateUserSettings: builder.mutation({
      query: (data) => ({
        url: '/user-setting/update',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['UserSettings'],
    }),
    testEmailConfig: builder.mutation({
      query: (data) => ({
        url: '/setting/send-test-email',
        method: 'POST',
        body: data,
      }),
    }),
  }),
})

export const {
  useGetUserSettingsQuery,
  useUpdateEmailConfigMutation,
  useTestEmailConfigMutation,
  useUpdateUserSettingsMutation,
} = userSettingApi
