'use client'

import { Card } from '@/components/ui/card'
import { statItems } from '@/data/socialMedia'
import { StatsCardsProps } from '@/types/socialMedia'
import { ArrowDown, ArrowUp } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useTranslation } from 'react-i18next'
import { Skeleton } from '@/components/ui/skeleton'

function getTrendFor(key: string, stats: StatsCardsProps['stats']): { value: number; isUp: boolean; isNeutral: boolean } {
  if (!stats) return { value: 0, isUp: false, isNeutral: true }
  switch (key) {
    case 'totalAccounts': return { value: stats.accountsTrend, isUp: stats.accountsTrend > 0, isNeutral: stats.accountsTrend === 0 }
    case 'totalPosts': return { value: stats.postsTrend, isUp: stats.postsTrend > 0, isNeutral: stats.postsTrend === 0 }
    case 'publishedToday': return { value: 0, isUp: false, isNeutral: true }
    case 'scheduledCount': return { value: 0, isUp: false, isNeutral: true }
    case 'engagement30d': return { value: stats.engagementTrend, isUp: stats.engagementTrend > 0, isNeutral: stats.engagementTrend === 0 }
    default: return { value: 0, isUp: false, isNeutral: true }
  }
}

export const StatsCards = ({ stats, isLoading }: StatsCardsProps) => {
  const { t } = useTranslation()
  const router = useRouter()
  const statsMap = stats as unknown as Record<string, number>

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 sm:gap-4">
      {statItems.map((item) => {
        const Icon = item.icon
        const rawValue = statsMap?.[item.key] ?? 0
        const value = item.format ? item.format(rawValue) : String(rawValue)
        const trend = getTrendFor(item.key, stats)

        return (
          <Card
            onClick={() => router.push(item.route)}
            key={item.key}
            className="p-3.5 sm:p-5 gradient-border transition-all duration-500 group relative overflow-hidden flex items-center gap-3 sm:gap-5 hover:-translate-y-1.5 hover:shadow-[0_12px_40px_-12px_rgba(0,0,0,0.15)] bg-white dark:bg-white/3 dark:hover:bg-transparent cursor-pointer"
          >
            <div className={`p-2.5 sm:p-3 rounded-2xl ${item.bg} flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110`}>
              <Icon className={`w-5.5 h-5.5 sm:w-6 sm:h-6 ${item.color}`} />
            </div>

            <div className="flex flex-col ">
              <span className="text-sm sm:text-base font-bold text-title-color">
                {t(item.labelKey, { defaultValue: item.defaultLabel })}
              </span>
              {isLoading ? (
                <Skeleton className="h-6 w-16 rounded mt-1.5" />
              ) : (
                <span className="text-xl sm:text-2xl xl:text-3xl font-bold text-title-color dark:text-white mt-1 leading-none">
                  {value}
                </span>
              )}
              {isLoading ? (
                <Skeleton className="h-4 w-10 rounded mt-1.5" />
              ) : !trend.isNeutral ? (
                <span className={`flex items-center gap-0.5 text-3xs sm:text-base font-semibold mt-1.5 w-fit px-1!  rounded-full! ${trend.isUp ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {trend.isUp ? <ArrowUp className="w-3.5 h-3.5 shrink-0" /> : <ArrowDown className="w-3.5 h-3.5 shrink-0" />}
                  {trend.isUp ? '+' : ''}{trend.value}{item.key === 'engagement30d' ? '%' : ''}
                </span>
              ) : (
                <span className="flex items-center gap-0.5 text-[11px] sm:text-xs font-semibold mt-1.5 text-primary">
                  {/* <ArrowRight className="w-3 h-3" /> */}
                  0%
                </span>
              )}
            </div>

          </Card>
        )
      })}
    </div>
  )
}
