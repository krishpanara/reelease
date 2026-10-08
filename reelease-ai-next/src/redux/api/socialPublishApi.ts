import { baseApi } from './baseApi'

export const socialPublishApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    publishContent: builder.mutation({
      query: (data) => ({
        url: '/social/publish',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['SocialPost'],
    }),
    bulkPublish: builder.mutation({
      query: (data) => ({
        url: '/social/publish/bulk',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['SocialPost'],
    }),
    generateCaption: builder.mutation({
      query: (data) => ({
        url: '/social/publish/generate-caption',
        method: 'POST',
        body: data,
      }),
    }),
    getSupportedPlatforms: builder.query({
      query: () => '/social/publish/supported-platforms',
    }),
    getPostHistory: builder.query({
      query: (params) => ({
        url: '/social/publish/history',
        params,
      }),
      providesTags: ['SocialPost'],
    }),
    getPostById: builder.query({
      query: (historyId) => `/social/publish/history/${historyId}`,
      providesTags: (result, error, id) => [{ type: 'SocialPost', id }],
    }),
    deletePost: builder.mutation({
      query: (historyId) => ({
        url: `/social/publish/history/${historyId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['SocialPost'],
    }),
    // Draft endpoints
    saveDraft: builder.mutation({
      query: (data) => ({
        url: '/social/publish/drafts',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['SocialDraft'],
    }),
    getDrafts: builder.query({
      query: (params) => ({
        url: '/social/publish/drafts',
        params,
      }),
      providesTags: ['SocialDraft'],
    }),
    getDraftById: builder.query({
      query: (draftId) => `/social/publish/drafts/${draftId}`,
      providesTags: (result, error, id) => [{ type: 'SocialDraft', id }],
    }),
    updateDraft: builder.mutation({
      query: ({ draftId, ...data }) => ({
        url: `/social/publish/drafts/${draftId}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { draftId }) => ['SocialDraft', { type: 'SocialDraft', id: draftId }],
    }),
    deleteDraft: builder.mutation({
      query: (draftId) => ({
        url: `/social/publish/drafts/${draftId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['SocialDraft'],
    }),
  }),
  overrideExisting: true,
})

export const {
  usePublishContentMutation,
  useBulkPublishMutation,
  useGenerateCaptionMutation,
  useGetSupportedPlatformsQuery,
  useGetPostHistoryQuery,
  useGetPostByIdQuery,
  useDeletePostMutation,
  useSaveDraftMutation,
  useGetDraftsQuery,
  useGetDraftByIdQuery,
  useUpdateDraftMutation,
  useDeleteDraftMutation,
} = socialPublishApi
