import { clearAuth } from '@/redux/slices/authSlice'
import { isBrowser } from '@/utils/environment'
import { authUtils } from '@/utils'
import { createApi, fetchBaseQuery, BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query/react'

const API_BASE_URL = '/api'

const baseQuery = fetchBaseQuery({
  baseUrl: API_BASE_URL,
  prepareHeaders: (headers, { endpoint, getState }) => {
    // Try to get token from state first, then from cookies
    const state = getState() as { auth: { token: string | null } }
    const token = state.auth?.token || authUtils.getToken()

    const publicEndpoints = ['getActivePlans', 'getFaqs', 'getPublicSettings', 'getDemoCredentials', 'getPublicPages', 'getPublicPageBySlug']
    if (publicEndpoints.includes(endpoint)) {
      return headers
    }

    if (token && token !== 'undefined' && token !== 'null') {
      headers.set('Authorization', `Bearer ${token}`)
    }
    return headers
  },
})

const baseQueryWithReauth: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
  args,
  api,
  extraOptions
) => {
  let result = await baseQuery(args, api, extraOptions)
  
  // Get token from state or cookies for the 401 check
  const state = api.getState() as { auth: { token: string | null } }
  const token = state.auth?.token || authUtils.getToken()

  if (result.error && result.error.status === 401) {
    if (token) {
      // If we have a token but got 401, try to wait a bit and retry once before clearing auth
      // This handles race conditions where the session might not be ready in the DB yet
      await new Promise((resolve) => setTimeout(resolve, 500));
      result = await baseQuery(args, api, extraOptions);

      if (result.error && result.error.status === 401) {
        authUtils.clearAuth()
        api.dispatch(clearAuth())
        api.dispatch(baseApi.util.resetApiState())
        
        if (isBrowser) {
          const publicPaths = [
            '/login',
            '/register',
            '/forgot-password',
            '/reset-password',
            '/',
          ]
          const pathname = window.location.pathname
          const isPublicPath =
            publicPaths.some((p) => pathname === p || pathname.startsWith(p + '/')) ||
            pathname.startsWith('/p/')

          // Only redirect to login if not already on a public path
          if (!isPublicPath) {
            window.location.href = '/'
          }
        }
      }
    }
  }

  return result
}

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  refetchOnMountOrArgChange: true,
  refetchOnReconnect: true,
  tagTypes: [
    'User',
    'Faq',
    'ContactInquiry',
    'AdminSettings',
    'UserSettings',
    'Role',
    'Permission',
    'Plan',
    'Subscription',
    'Language',
    'Notification',
    'Page',
    'Dashboard',
    'Attachment',
    'PaymentGateway',
    'SocialAccount',
    'ChannelStats',
    'SocialDashboard',
    'SocialPost',
    'AIProvider',
    'Blog',
    'Category',
    'Tag',
    'AITemplateCategory',
    'Testimonial',
    'AIFeatureCredit',
    'AiPrompt',
    'LandingPage',
    'EmailTemplate',
    'Caption',
    'SocialDraft',
    'CaptionModel',
    'ActiveCaptionModels',
    'Character',
  ],
  endpoints: () => ({}),
})
