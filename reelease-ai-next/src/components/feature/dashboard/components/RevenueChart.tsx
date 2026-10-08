'use client'

import { NoDataFound } from '@/components/reusable/NoDataFound'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { getCommonChartOptions } from '@/data/dashboard'
import { ClipboardMinus, TrendingUp } from 'lucide-react'
import dynamic from 'next/dynamic'
import { useTranslation } from 'react-i18next'

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false })

export const RevenueChart = ({ data, isDark, value = 'this_month', onChange }: { data: any[]; isDark: boolean; value?: string; onChange?: (val: string) => void }) => {
  const { t } = useTranslation()

  const options: any = {
    ...getCommonChartOptions(isDark, t),
    chart: {
      ...getCommonChartOptions(isDark, t).chart,
      type: 'area',
    },
    colors: ['var(--primary)'],
    stroke: {
      curve: 'smooth',
      width: 4,
      dashArray: 0,
    },
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.2,
        opacityTo: 0,
        stops: [0, 90, 100],
      },
    },
    grid: {
      show: true,
      borderColor: isDark
        ? 'rgba(156, 163, 175, 0.25)'
        : 'rgba(107, 114, 128, 0.15)',
      strokeDashArray: 4,
      padding: {
        left: 10,
        right: 10,
        bottom: 0,
      },
      row: {
        colors: isDark
          ? ['rgba(255,255,255,0.02)']
          : ['rgba(0,0,0,0.01)'],
        opacity: 1,
      },
    },
    markers: {
      size: 5,
      colors: ['var(--white)'],
      strokeColors: 'var(--primary)',
      strokeWidth: 3,
      hover: {
        size: 7,
      },
    },
    xaxis: {
      categories: (data || []).map((item) => item.month),
      axisBorder: { show: false },
      axisTicks: { show: false },
      tooltip: { enabled: false },
      labels: {
        style: {
          colors: isDark ? '#9CA3AF' : '#6B7280',
          fontSize: '11px',
          fontWeight: 400,
        },
        offsetY: 5,
      },
      crosshairs: {
        show: true,
        width: 1,
        position: 'back',
        stroke: {
          color: 'var(--primary)',
          width: 1,
          dashArray: 4,
        },
      },
    },
    yaxis: {
      labels: {
        formatter: (val: number) => (val >= 1000 ? `${(val / 1000).toFixed(1)}k` : val),
        style: {
          colors: isDark ? '#9CA3AF' : '#6B7280',
          fontSize: '11px',
          fontWeight: 400,
        },
      },
    },
    tooltip: {
      enabled: true,
      theme: isDark ? 'dark' : 'light',
      followCursor: true,
      intersect: false,
      shared: true,
      custom: ({ series, seriesIndex, dataPointIndex, w }: any) => {
        const value = series[seriesIndex]?.[dataPointIndex] || 0
        const formattedValue = `$${value.toLocaleString()}`
        return `
          <div class="relative bg-white dark:bg-input-background border border-slate-200 dark:border-white/10 shadow-lg rounded-[12px] px-4 py-2 flex flex-col min-w-[80px] transition-all duration-300">
            <div class="flex items-baseline gap-1">
              <span class="text-xl font-bold text-slate-900 dark:text-white tracking-tight leading-tight">${formattedValue}</span>
            </div>
          </div>
        `
      },
    },
  }

  return (
    <Card className="p-px rounded-[2rem] border-none shadow-none relative overflow-hidden group w-full h-full transition-all duration-300 dark:bg-white/3 ">
      <div className="p-4 sm:p-6 h-full relative z-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-3 sm:gap-6 relative z-10">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 flex justify-center items-center rounded-[9px] bg-primary shrink-0">
              <ClipboardMinus className='text-white! w-5.5 h-5.5' />
            </div>
            <div className="space-y-1">
              <h3 className="sm:text-xl text-lg mb-0 font-extrabold text-title-color dark:text-white flex items-center gap-2">
                {t('revenue_overview', { defaultValue: 'Revenue Reports' })}
              </h3>
              <p className="text-base font-medium text-subtitle-color">
                {t('revenue_overview_desc', { defaultValue: 'Real-time financial activity and trends' })}
              </p>
            </div>
          </div>
          <Select value={value} onValueChange={onChange}>
            <SelectTrigger className="h-8 w-full sm:w-fit min-w-[110px] shadow-none glass-card rounded-full! bg-light-body! text-xs font-semibold focus:ring-0 cursor-pointer border-none! mt-2 sm:mt-0">
              <SelectValue placeholder={t('this_month', { defaultValue: 'This Month' })} />
            </SelectTrigger>
            <SelectContent className="bg-light-body rounded-[8px] border-glass-border">
              <SelectItem value="this_month" className="text-xs font-medium rounded-[8px] hover:bg-light-primary">
                {t('this_month', { defaultValue: 'This Month' })}
              </SelectItem>
              <SelectItem value="last_month" className="text-xs font-medium rounded-[8px] hover:bg-light-primary">
                {t('last_month', { defaultValue: 'Last Month' })}
              </SelectItem>
              <SelectItem value="this_year" className="text-xs font-medium rounded-[8px] hover:bg-light-primary">
                {t('this_year', { defaultValue: 'This Year' })}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex-1 min-h-[320px] w-full min-w-0 overflow-hidden mt-2">
          {data && data.length > 0 ? (
            <Chart
              key={value}
              options={options}
              series={[
                {
                  name: t('revenue', { defaultValue: 'Sales' }),
                  data: data.map((d) => d.amount ?? d.totalRevenue ?? 0),
                },
              ]}
              type="area"
              height="100%"
            />
          ) : (
            <NoDataFound icon={TrendingUp} height="h-full" />
          )}
        </div>
      </div>
    </Card>
  )
}
