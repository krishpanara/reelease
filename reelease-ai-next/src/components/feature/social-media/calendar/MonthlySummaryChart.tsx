'use client'

import { getCommonChartOptions } from '@/data/dashboard'
import { useTranslation } from 'react-i18next'
import dynamic from 'next/dynamic'
import { useTheme } from 'next-themes'
import { TrendingUp } from 'lucide-react'
import { MonthlySummaryChartProps } from '@/types/socialMedia'

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false })



const MonthlySummaryChart = ({
  total,
  changePct,
  engagementRate,
  engagementChangePct,
  dailyCounts,
  prevMonthLabel,
}: MonthlySummaryChartProps) => {
  const { t } = useTranslation()
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'

  const options: any = {
    ...getCommonChartOptions(isDark, t),
    chart: {
      ...getCommonChartOptions(isDark, t).chart,
      type: 'bar',
      toolbar: { show: false },
      sparkline: { enabled: true },
    },
    plotOptions: {
      bar: {
        borderRadius: 3,
        columnWidth: '60%',
      },
    },
    colors: ['var(--primary)'],
    xaxis: {
      labels: { show: false },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: { show: false },
    grid: { show: false },
    dataLabels: { enabled: false },
    tooltip: { enabled: false },
  }

  const changeSign = changePct >= 0 ? '+' : ''

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3.5">
        {/* Total Posts Card */}
        <div className="p-3.5 rounded-border-radius-inner border border-glass-border bg-subcard dark:bg-white/5  flex flex-col justify-between min-h-[100px]">
          <p className="text-xs font-black  text-muted-foreground">
            {t('total_posts', { defaultValue: 'Total Posts' })}
          </p>
          <p className="text-2xl font-black text-foreground my-1">{total}</p>
          <p className="text-xs font-bold text-emerald-500 flex items-center gap-1 mt-auto">
            <TrendingUp className="w-3 h-3 shrink-0" />
            <span>
              {changeSign}
              {changePct}% {t('vs', { defaultValue: 'vs' })} {prevMonthLabel}
            </span>
          </p>
        </div>

        {/* Engagement Rate Card */}
        <div className="p-3.5 rounded-border-radius-inner border border-glass-border bg-subcard dark:bg-white/5  flex flex-col justify-between min-h-[100px]">
          <p className="text-xs font-black  text-muted-foreground">
            {t('engagement_rate', { defaultValue: 'Engagement Rate' })}
          </p>
          <p className="text-2xl font-black text-foreground my-1">{engagementRate}%</p>
          <p className="text-xs font-bold text-emerald-500 flex items-center gap-1 mt-auto">
            <TrendingUp className="w-3 h-3 shrink-0" />
            <span>+{engagementChangePct}%</span>
          </p>
        </div>
      </div>
      <Chart options={options} series={[{ name: t('posts', { defaultValue: 'Posts' }), data: dailyCounts }]} type="bar" height={80} />
    </div>
  )
}

export default MonthlySummaryChart
