import { baseApi } from './baseApi'

export const socialApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getSocialDashboard: builder.query<any, string | void>({
      query: (period = 'month') => ({
        url: '/social/dashboard',
        params: { period: period || 'month' }
      }),
      providesTags: ['SocialDashboard'],
    }),
    getSocialAccounts: builder.query<any, string | { platform?: string; include_inactive?: boolean } | void>({
      query: (arg) => {
        if (typeof arg === 'string') {
          return {
            url: '/social/accounts',
            params: { platform: arg },
          }
        }
        return {
          url: '/social/accounts',
          params: arg || {},
        }
      },
      providesTags: ['SocialAccount'],
    }),
    getChannelStats: builder.query<
      Record<string, { postsThisMonth: number; engagement: number }>,
      string | void
    >({
      query: (period = 'month') => ({
        url: '/social/accounts/stats',
        params: { period: period || 'month' },
      }),
      transformResponse: (response: {
        success?: boolean
        data?: Record<string, { postsThisMonth: number; engagement: number }>
      }) => response?.data || {},
      providesTags: ['ChannelStats'],
    }),
    setChannelPaused: builder.mutation({
      query: ({ accountId, paused }: { accountId: string; paused: boolean }) => ({
        url: `/social/account/${accountId}/pause`,
        method: 'PATCH',
        body: { paused },
      }),
      invalidatesTags: ['SocialAccount', 'ChannelStats', 'SocialDashboard'],
    }),
    getFacebookSDKConfig: builder.query({
      query: () => '/social/facebook/config',
    }),
    connectFacebookAccount: builder.mutation({
      query: (data) => ({
        url: '/social/facebook/connect',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['SocialAccount', 'ChannelStats', 'SocialDashboard'],
    }),
    getThreadsSDKConfig: builder.query({
      query: () => '/social/threads/config',
      transformResponse: (response: any) => response.data,
      providesTags: ['AdminSettings'],
    }),
    connectThreadsAccount: builder.mutation({
      query: (data) => ({
        url: '/social/threads/connect',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['SocialAccount', 'ChannelStats', 'SocialDashboard'],
    }),
    getLinkedInSDKConfig: builder.query({
      query: () => '/social/linkedin/config',
      transformResponse: (response: any) => response.data,
      providesTags: ['AdminSettings'],
    }),
    connectLinkedInAccount: builder.mutation({
      query: (data) => ({
        url: '/social/linkedin/connect',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['SocialAccount', 'ChannelStats', 'SocialDashboard'],
    }),
    getTwitterSDKConfig: builder.query({
      query: () => '/social/twitter/config',
      transformResponse: (response: any) => response.data,
      providesTags: ['AdminSettings'],
    }),
    connectTwitterAccount: builder.mutation({
      query: (data) => ({
        url: '/social/twitter/connect',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['SocialAccount', 'ChannelStats', 'SocialDashboard'],
    }),
    getYouTubeSDKConfig: builder.query({
      query: () => '/social/youtube/config',
      transformResponse: (response: any) => response.data,
      providesTags: ['AdminSettings'],
    }),
    connectYouTubeAccount: builder.mutation({
      query: (data) => ({
        url: '/social/youtube/connect',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['SocialAccount', 'ChannelStats', 'SocialDashboard'],
    }),
    disconnectSocialAccount: builder.mutation({
      query: (accountId) => ({
        url: `/social/account/${accountId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['SocialAccount', 'ChannelStats', 'SocialDashboard'],
    }),
    validateSocialToken: builder.mutation({
      query: (accountId) => ({
        url: `/social/account/${accountId}/validate`,
        method: 'POST',
      }),
      invalidatesTags: ['ChannelStats', 'SocialDashboard'],
    }),
  }),
})

export const {
  useGetSocialDashboardQuery,
  useGetSocialAccountsQuery,
  useGetChannelStatsQuery,
  useGetFacebookSDKConfigQuery,
  useConnectFacebookAccountMutation,
  useGetThreadsSDKConfigQuery,
  useConnectThreadsAccountMutation,
  useGetLinkedInSDKConfigQuery,
  useConnectLinkedInAccountMutation,
  useGetTwitterSDKConfigQuery,
  useConnectTwitterAccountMutation,
  useGetYouTubeSDKConfigQuery,
  useConnectYouTubeAccountMutation,
  useDisconnectSocialAccountMutation,
  useValidateSocialTokenMutation,
  useSetChannelPausedMutation,
} = socialApi
