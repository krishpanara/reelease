'use client'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Skeleton } from '@/components/ui/skeleton'
import { platformColors } from '@/data/socialMedia'
import { ChannelWiseChartProps } from '@/types/socialMedia'
import { BarChart3, ChevronDown } from 'lucide-react'
import dynamic from 'next/dynamic'
import { useTranslation } from 'react-i18next'

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false })

export const ChannelWiseChart = ({ channelData, period = 'month', onPeriodChange, isLoading }: ChannelWiseChartProps) => {
  const { t } = useTranslation()
  const hasData = channelData && channelData.some((d) => d.total > 0)

  const options: any = {
    chart: {
      type: 'bar',
      toolbar: { show: false },
      background: 'transparent',
      foreColor: '#9CA3AF',
      animations: {
        enabled: false,
      },
    },
    plotOptions: {
      bar: {
        borderRadius: 8,
        columnWidth: '50%',
        distributed: true,
        dataLabels: { position: 'top' },
      },
    },
    dataLabels: {
      enabled: false,
    },
    grid: {
      show: true,
      borderColor: 'rgba(156, 163, 175, 0.12)',
      strokeDashArray: 4,
      padding: { top: 30, bottom: 0 },
    },
    xaxis: {
      categories: channelData?.map((d) => d.platform.charAt(0).toUpperCase() + d.platform.slice(1)) || [],
      labels: { style: { colors: '#9CA3AF', fontSize: '12px', fontWeight: 500 } },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      labels: { style: { colors: '#9CA3AF', fontSize: '12px' } },
      min: 0,
    },
    colors: channelData?.map((d) => platformColors[d.platform] || 'var(--primary)') || [],
    legend: { show: false },
    tooltip: {
      enabled: true,
      custom: ({ series, seriesIndex, dataPointIndex, w }: any) => {
        const value = series[seriesIndex]?.[dataPointIndex] ?? 0
        const name = w.globals.labels[dataPointIndex] || ''
        const color = w.config.colors[dataPointIndex] || 'var(--primary)'

        return `
          <div class="relative bg-white dark:bg-input-background border border-slate-200 dark:border-white/10 shadow-lg rounded-[12px] px-4 py-2 flex flex-col min-w-[100px] transition-all duration-300">
            <div class="flex items-center gap-2 mb-1">
              <div class="w-2.5 h-2.5 rounded-full shadow-sm" style="background-color: ${color}"></div>
              <span class="text-sm font-medium text-slate-500  leading-none">${name}</span>
            </div>
            <div class="flex items-baseline gap-1">
              <span class="text-base font-bold text-title-color  tracking-tight leading-tight">${value} ${t('posts', { defaultValue: 'posts' })}</span>
            </div>
          </div>
        `
      },
    },
  }

  const series = [
    {
      name: t('total_posts', { defaultValue: 'Total Posts' }),
      data: channelData?.map((d) => d.total) || [],
    },
  ]

  const chartPeriods = [
    { value: 'today', labelKey: 'today', defaultLabel: 'Today' },
    { value: 'month', labelKey: 'this_month', defaultLabel: 'This Month' },
    { value: 'year', labelKey: 'this_year', defaultLabel: 'This Year' },
  ]
  const selectedPeriod = chartPeriods.find((p) => p.value === period)

  return (
    <Card className="p-px rounded-border-radius border-none dark:bg-white/3 glass-card overflow-hidden h-full">
      <div className="p-4 sm:p-5 h-full flex flex-col">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 flex justify-center items-center rounded-[9px] bg-purple-500 shrink-0">
              <BarChart3 className="w-5.5 h-5.5 text-white!" />
            </div>
            <div>
              <h3 className="sm:text-xl text-lg mb-0 font-extrabold text-title-color dark:text-white tracking-tight flex items-center gap-2">
                {t('channel_wise_posts', { defaultValue: 'Channel Wise Posts' })}
              </h3>
              <p className="text-base text-subtitle-color">
                {t('posts_per_platform', { defaultValue: 'Posts distribution per platform' })}
              </p>
            </div>
          </div>

          {onPeriodChange && (
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="gap-1.5 rounded-xl border-glass-border text-xs font-semibold   text-title-color! bg-light-body  px-3 w-full sm:w-auto justify-center mt-2 sm:mt-0">
                  {selectedPeriod ? t(selectedPeriod.labelKey, { defaultValue: selectedPeriod.defaultLabel }) : t('this_month', { defaultValue: 'This Month' })}
                  <ChevronDown className="w-3 h-3" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-36 px-2 py-2 border-glass-border bg-white dark:bg-white/3 backdrop-blur-3xl rounded-xl " align="end">
                {chartPeriods.map((p) => (
                  <button
                    key={p.value}
                    onClick={() => onPeriodChange?.(p.value)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-colors ${period === p.value ? 'bg-primary/10 text-primary' : 'text-subtitle-color hover:text-primary! hover:bg-primary/10!'}`}
                  >
                    {t(p.labelKey, { defaultValue: p.defaultLabel })}
                  </button>
                ))}
              </PopoverContent>
            </Popover>
          )}
        </div>

        <div className="flex-1 min-h-[300px] w-full min-w-0 overflow-hidden">
          {isLoading ? (
            <div className="flex h-full w-full items-end justify-between gap-3 px-4 py-8 animate-pulse">
              {[40, 60, 45, 80, 50].map((h, j) => (
                <div key={j} className="w-full bg-muted/20 dark:bg-white/5 rounded-t-lg" style={{ height: `${h}%` }}>
                  <Skeleton className="w-full h-full rounded-t-lg bg-muted/30 dark:bg-white/10" />
                </div>
              ))}
            </div>
          ) : hasData ? (
            <div className="w-full h-full">
              <Chart key={`${period}-${channelData?.length}`} options={options} series={series} type="bar" height="100%" width="100%" />
            </div>
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center text-center">
              <BarChart3 className="w-10 h-10 text-muted-foreground mb-2" />
              <p className="text-base text-muted-foreground">
                {t('no_post_data', { defaultValue: 'No post data available yet' })}
              </p>
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}
