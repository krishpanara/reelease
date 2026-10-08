'use client'

import { NoDataFound } from '@/components/reusable/NoDataFound'
import { Card } from '@/components/ui/card'
import { formatChartData, getCommonChartOptions } from '@/data/dashboard'
import { PieChart as PieChartIcon } from 'lucide-react'
import dynamic from 'next/dynamic'
import { useTranslation } from 'react-i18next'

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false })

export const SubscriptionChart = ({ data, isDark }: { data: Record<string, number>; isDark: boolean }) => {
  const { t } = useTranslation()
  const chartData = formatChartData(data)

  const total = chartData.values.reduce((a, b) => a + b, 0)
  const percentages = chartData.values.map(v => total > 0 ? Math.round((v / total) * 100) : 0)

  const options: any = {
    ...getCommonChartOptions(isDark, t),
    chart: {
      ...getCommonChartOptions(isDark, t).chart,
      type: 'radialBar',
    },
    colors: ['#7c3aed', '#00d492', '#ffb900', '#51a2ff'],
    labels: chartData.names,
    plotOptions: {
      radialBar: {
        offsetY: 0,
        startAngle: -90,
        endAngle: 270,
        hollow: {
          margin: 5,
          size: '30%',
        },
        track: {
          background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
          strokeWidth: '100%',
          margin: 6,
        },
        dataLabels: {
          show: true,
          name: {
            show: false,
          },
          value: {
            show: false,
          },
          total: {
            show: true,
            label: t('total', { defaultValue: 'Total' }),
            fontSize: '13px',
            fontWeight: 500,
            color: isDark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.45)',
            formatter: () => String(total),
          },
        },
        barLabels: {
          enabled: false,
        },
      },
    },
    legend: {
      show: true,
      position: 'right',
      offsetY: 10,
      fontSize: '13px',
      fontWeight: 500,
      markers: {
        width: 8,
        height: 8,
        radius: 4,
        offsetX: -2,
      },
      itemMargin: { vertical: 6 },
      labels: {
        colors: isDark ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.55)',
      },
      formatter: (seriesName: string, opts: any) => {
        const val = chartData.values[opts.seriesIndex]
        return `${seriesName} <span style="font-weight:600;color:${isDark ? 'var(--white)' : 'var(--input-background)'}">${val}</span>`
      },
    },
    dataLabels: { enabled: false },
    grid: { padding: { top: -20, bottom: -20 } },
    stroke: { lineCap: 'round' },
  }

  return (
    <Card className="p-px rounded-[2rem] border-none shadow-none h-full w-full">
      <div className="p-4 sm:p-6 h-full flex flex-col">
        <div className="flex flex-col xl:flex-row items-start justify-between mb-4 gap-6 relative z-10">
          <div className="space-y-1">
            <h3 className="text-xl mb-0 font-medium text-title-color dark:text-white">
              {t('user_subscriptions', { defaultValue: 'User Subscriptions' })}
            </h3>
            <p className="text-base font-medium text-subtitle-color">{t('subscription_overview', { defaultValue: 'Overview of user subscription plans' })}</p>
          </div>
        </div>

        <div className="flex-1 min-h-[260px] w-full min-w-0 overflow-hidden relative">
          {chartData.values.length > 0 ? (
            <Chart
              options={options}
              series={percentages}
              type="radialBar"
              height="100%"
              width="100%"
            />
          ) : (
            <NoDataFound icon={PieChartIcon} height="h-full" />
          )}
        </div>
      </div>
    </Card>
  )
}
