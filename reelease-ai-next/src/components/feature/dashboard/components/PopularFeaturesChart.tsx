'use client'

import { NoDataFound } from '@/components/reusable/NoDataFound'
import { Card } from '@/components/ui/card'
import { getCommonChartOptions } from '@/data/dashboard'
import { TriangleAlert, Zap, Bot } from 'lucide-react'
import dynamic from 'next/dynamic'
import { useTranslation } from 'react-i18next'
import { useRouter } from 'next/navigation'
import { ROUTES } from '@/constants/routes'

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false })

export const PopularFeaturesChart = ({ data, isDark }: { data: any[]; isDark: boolean }) => {
  const { t } = useTranslation()
  const router = useRouter()

  const series = data?.map((d) => d.count) || []
  const labels = data?.map((d) => d.service) || []

  const options: any = {
    ...getCommonChartOptions(isDark, t),
    chart: {
      ...getCommonChartOptions(isDark, t).chart,
      type: 'donut',
    },
    labels: labels,
    colors: [
      'var(--primary)',
      'var(--indigo-light)',
      'var(--role-color-1)',
      'var(--role-color-2)',
      'var(--green-success)',
      'var(--amber-accent)',
    ],
    plotOptions: {
      pie: {
        donut: {
          size: '70%',
          background: 'transparent',
        },
        expandOnClick: false,
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      show: true,
      colors: isDark ? ['var(--gray-900)'] : ['var(--white)'],
      width: 2,
    },
    legend: {
      show: false,
    },
    tooltip: {
      ...getCommonChartOptions(isDark, t).tooltip,
      y: {
        formatter: function (val: number) {
          return val + ' ' + t('uses', { defaultValue: 'Uses' })
        },
      },
    },
  }

  return (
    <Card className="p-px rounded-[2rem] border-none shadow-none relative overflow-hidden group w-full h-full dark:bg-white/3">
      <div className="p-4 sm:p-6 h-full flex flex-col relative z-10">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 lg:mb-6 gap-3 lg:gap-6 relative z-10">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 flex justify-center items-center rounded-[9px] bg-primary shrink-0">
              <Bot className="text-white! w-5.5 h-5.5" />
            </div>
            <div className="space-y-1">
              <h3 className="sm:text-xl text-lg mb-0 font-extrabold text-title-color dark:text-white tracking-tight flex items-center gap-2">
                {t('popular_features', { defaultValue: 'Popular AI Features' })}
              </h3>
              <p className="text-base font-medium text-subtitle-color">
                {t('popular_features_desc', { defaultValue: 'Most used AI templates and generators' })}
              </p>
            </div>
          </div>
          <button
            onClick={() => router.push(ROUTES.AI_TEMPLATES)}
            className="text-sm font-semibold text-primary hover:text-primary/80 transition-colors border border-glass-border px-3 py-0.5 rounded-xl shrink-0 w-full sm:w-auto text-center mt-2 sm:mt-0 cursor-pointer"
          >
            {t('see_all', { defaultValue: 'See all' })}
          </button>
        </div>

        <div className="flex-1 min-h-[300px] w-full flex items-center justify-center relative">
          {series.length > 0 && series.some((s: number) => s > 0) ? (
            <div className="w-full flex flex-col items-center">
              <div className="w-full max-w-[280px] flex justify-center">
                <Chart options={options} series={series} type="donut" height="230" width="100%" />
              </div>
              <div className="grid grid-cols-3 gap-x-4 gap-y-2 mt-4 text-xs font-semibold px-4 w-full justify-items-start max-w-[420px]">
                {data.map((item, index) => {
                  const colors = [
                    'var(--primary)',
                    'var(--indigo-light)',
                    'var(--role-color-1)',
                    'var(--role-color-2)',
                    'var(--green-success)',
                    'var(--amber-accent)',
                  ]
                  const color = colors[index % colors.length]
                  return (
                    <div key={index} className="flex items-center gap-1.5 text-subtitle-color dark:text-white/70 overflow-hidden w-full">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: color }} />
                      <span className="truncate text-[11px] font-medium" title={item.service}>
                        {item.service}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          ) : (
            <NoDataFound icon={TriangleAlert} height="h-[200px]" />
          )}
        </div>
      </div>
    </Card>
  )
}
