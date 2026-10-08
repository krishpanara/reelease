import { baseApi } from './baseApi'
import { DashboardStats } from '@/types'

export const dashboardApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getDashboardStats: builder.query<DashboardStats, { page?: number; limit?: number; type?: string; timeFilter?: string; startDate?: string; endDate?: string } | void>({
      query: (params) => {
        if (!params) return '/dashboard'
        const { page, limit, type, timeFilter, startDate, endDate } = params
        const url = '/dashboard'
        const queryParams = new URLSearchParams()
        if (page) queryParams.append('page', page.toString())
        if (limit) queryParams.append('limit', limit.toString())
        if (type) queryParams.append('type', type)
        if (timeFilter) queryParams.append('timeFilter', timeFilter)
        if (startDate) queryParams.append('startDate', startDate)
        if (endDate) queryParams.append('endDate', endDate)
        const queryString = queryParams.toString()
        return queryString ? `${url}?${queryString}` : url
      },
      providesTags: ['Dashboard'],
    }),
    getAdminDashboardStats: builder.query<any, { timeFilter?: string; startDate?: string; endDate?: string; revenueFilter?: string } | void>({
      query: (params) => {
        if (!params) return '/dashboard/admin'
        const { timeFilter, startDate, endDate, revenueFilter } = params
        let url = '/dashboard/admin'
        const queryParams = new URLSearchParams()
        if (timeFilter) queryParams.append('timeFilter', timeFilter)
        if (startDate) queryParams.append('startDate', startDate)
        if (endDate) queryParams.append('endDate', endDate)
        if (revenueFilter) queryParams.append('revenueFilter', revenueFilter)
        const queryString = queryParams.toString()
        return queryString ? `${url}?${queryString}` : url
      },
      providesTags: ['Dashboard'],
    }),
  }),
})

export const { useGetDashboardStatsQuery, useGetAdminDashboardStatsQuery } = dashboardApi
