import React from 'react'
import dynamic from 'next/dynamic'
import { Card } from '@/components/ui/card'
import { TrendingUp, Layers, BarChart3 } from 'lucide-react'
import { format } from 'date-fns'
import { platformColors } from '@/data/analyticsData'
import { ChartsRowProps } from '@/types/analytics'

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false })

export default function ChartsRow({
  filteredTopPosts,
  channelData,
  selectedPlatform,
  period,
  resolvedTheme,
  t,
}: ChartsRowProps) {
  // 1. Chart Options for Platform Distribution (Donut Chart)
  const donutOptions: Record<string, unknown> = {
    chart: {
      type: 'donut',
      background: 'transparent',
      foreColor: '#9CA3AF',
      animations: {
        enabled: false,
      },
    },
    labels: channelData.map((d) => d.platform.charAt(0).toUpperCase() + d.platform.slice(1)),
    colors: channelData.map((d) => platformColors[d.platform] || '#8B5CF6'),
    stroke: { show: false },
    dataLabels: { enabled: false },
    legend: {
      position: 'bottom',
      fontSize: '13px',
      markers: { radius: 12 },
      labels: { colors: '#9CA3AF' },
    },
    plotOptions: {
      pie: {
        donut: {
          size: '70%',
          labels: {
            show: true,
            name: { show: true, fontSize: '14px', color: '#9CA3AF' },
            value: {
              show: true,
              fontSize: '20px',
              fontWeight: 'bold',
              color: resolvedTheme === 'dark' ? '#FFF' : '#000',
            },
            total: {
              show: true,
              label: t('total_posts', { defaultValue: 'Total Posts' }),
              formatter: () => channelData.reduce((sum: number, d) => sum + d.total, 0),
            },
          },
        },
      },
    },
    tooltip: {
      theme: 'dark',
      y: {
        formatter: (val: number) => `${val} ${t('posts', { defaultValue: 'posts' })}`,
      },
    },
  }

  const donutSeries = channelData.map((d) => d.total)

  // 2. Chart Options for Engagement Trend over Top Posts (Area Chart)
  const areaOptions: Record<string, unknown> = {
    chart: {
      type: 'area',
      toolbar: { show: false },
      background: 'transparent',
      foreColor: '#9CA3AF',
      animations: {
        enabled: false,
      },
    },
    stroke: { curve: 'smooth', width: 3 },
    colors: [selectedPlatform !== 'all' ? platformColors[selectedPlatform] : '#8B5CF6'],
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.45,
        opacityTo: 0.05,
        stops: [0, 100],
      },
    },
    grid: {
      borderColor: 'rgba(156, 163, 175, 0.08)',
      strokeDashArray: 4,
    },
    xaxis: {
      categories: filteredTopPosts.map((_, index: number) => `Post ${index + 1}`),
      labels: { show: false },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      labels: { style: { colors: '#9CA3AF' } },
    },
    tooltip: {
      theme: 'dark',
      custom: ({
        series,
        seriesIndex,
        dataPointIndex,
      }: {
        series: number[][]
        seriesIndex: number
        dataPointIndex: number
      }) => {
        const val = series[seriesIndex][dataPointIndex]
        const post = filteredTopPosts[dataPointIndex]
        if (!post) return ''
        const dateStr = post.published_at ? format(new Date(post.published_at), 'MMM dd') : ''
        return `
          <div class="bg-white dark:bg-slate-900 border border-glass-border dark:border-white/10 rounded-border-radius-inner p-3 shadow-xl max-w-[200px]">
            <p class="text-[11px] text-muted-foreground font-semibold mb-1">${dateStr}</p>
            <p class="text-xs font-medium text-title-color dark:text-white line-clamp-2 mb-2">"${
              post.caption || 'No caption'
            }"</p>
            <div class="flex items-center gap-1.5 text-xs text-amber-500 dark:text-amber-400 font-bold">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-3.5 h-3.5"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline><polyline points="16 7 22 7 22 13"></polyline></svg>
              <span>${val} Engagement</span>
            </div>
          </div>
        `
      },
    },
  }

  const areaSeries = [
    {
      name: 'Engagement',
      data: filteredTopPosts.map((post) => post.engagementCount || 0),
    },
  ]

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Engagement Trend (Area Chart) */}
      <Card className="p-5 glass-card dark:bg-white/3 border-none lg:col-span-2 flex flex-col">
        <div className="flex items-center gap-2.5 mb-6">
          <div className="p-2 rounded-xl bg-primary/10 text-primary">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-title-color dark:text-white">
              {t('engagement_trend', { defaultValue: 'Engagement Trend' })}
            </h3>
            <p className="text-sm text-subtitle-color">
              {t('engagement_performance_over_posts', {
                defaultValue: 'Performance dynamics of recent publications',
              })}
            </p>
          </div>
        </div>
        <div className="flex-1 min-h-[300px] flex items-center justify-center">
          {filteredTopPosts.length > 0 ? (
            <div className="w-full h-full">
              <Chart
                key={`area-${selectedPlatform}-${period}-${filteredTopPosts.length}`}
                options={areaOptions}
                series={areaSeries}
                type="area"
                height="300px"
                width="100%"
              />
            </div>
          ) : (
            <div className="text-center text-muted-foreground flex flex-col items-center">
              <BarChart3 className="w-12 h-12 mb-2 opacity-50" />
              <p className="text-sm">
                {t('no_performance_data', { defaultValue: 'No post history available for this platform' })}
              </p>
            </div>
          )}
        </div>
      </Card>

      {/* Platform Share (Donut Chart) */}
      <Card className="p-5 glass-card dark:bg-white/3 border-none flex flex-col">
        <div className="flex items-center gap-2.5 mb-6">
          <div className="p-2 rounded-xl bg-purple-500/10 text-purple-500">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-title-color dark:text-white">
              {t('platform_distribution', { defaultValue: 'Platform Share' })}
            </h3>
            <p className="text-xs text-subtitle-color">
              {t('share_of_content_per_platform', { defaultValue: 'Content volume breakdown per platform' })}
            </p>
          </div>
        </div>
        <div className="flex-1 min-h-[300px] flex items-center justify-center">
          {channelData.some((d) => d.total > 0) ? (
            <div className="w-full h-full">
              <Chart
                key={`donut-${period}-${channelData.length}`}
                options={donutOptions}
                series={donutSeries}
                type="donut"
                height="300px"
                width="100%"
              />
            </div>
          ) : (
            <div className="text-center text-muted-foreground flex flex-col items-center">
              <Layers className="w-12 h-12 mb-2 opacity-50" />
              <p className="text-sm">
                {t('no_distribution_data', { defaultValue: 'No active accounts connected' })}
              </p>
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}
