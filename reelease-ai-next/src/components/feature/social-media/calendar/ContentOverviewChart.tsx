'use client'

import { getCommonChartOptions } from '@/data/dashboard'
import { useTranslation } from 'react-i18next'
import dynamic from 'next/dynamic'
import { useTheme } from 'next-themes'
import { ContentOverviewChartProps } from '@/types/socialMedia'

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false })



const ContentOverviewChart = ({ data }: ContentOverviewChartProps) => {
  const { t } = useTranslation()
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'

  const total = data.reduce((sum, d) => sum + d.count, 0)
  const series = data.map((d) => d.count)
  const labels = data.map((d) => d.label)
  const colors = data.map((d) => d.color)

  const options: any = {
    ...getCommonChartOptions(isDark, t),
    chart: {
      ...getCommonChartOptions(isDark, t).chart,
      type: 'donut',
      sparkline: { enabled: false },
    },
    labels,
    colors: colors.length > 0 ? colors : ['var(--primary)', 'var(--chart-2)', 'var(--chart-3)'],
    plotOptions: {
      pie: {
        donut: {
          size: '72%',
          labels: {
            show: true,
            name: { show: false },
            value: { show: false },
            total: {
              show: true,
              label: t('total_posts', { defaultValue: 'Total Posts' }),
              fontSize: '11px',
              fontWeight: 600,
              color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)',
              formatter: () => String(total),
            },
          },
        },
        expandOnClick: false,
      },
    },
    dataLabels: { enabled: false },
    stroke: {
      show: true,
      colors: isDark ? ['var(--background)'] : ['var(--card)'],
      width: 3,
    },
    legend: {
      show: true,
      position: 'right',
      fontSize: '11px',
      fontWeight: 600,
      labels: { colors: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)' },
      formatter: (seriesName: string, opts: any) => {
        const val = opts.w.globals.series[opts.seriesIndex]
        return `${seriesName}  ${val}`
      },
    },
  }

  if (total === 0) {
    return (
      <p className="text-sm text-subtitle-color text-center py-10">
        {t('no_content_data', { defaultValue: 'No posts in this period.' })}
      </p>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 min-w-0">
        <Chart options={options} series={series} type="donut" height={200} />
      </div>
    </div>
  )
}

export default ContentOverviewChart
