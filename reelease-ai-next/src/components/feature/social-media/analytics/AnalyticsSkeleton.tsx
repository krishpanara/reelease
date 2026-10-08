import React from 'react'
import { Card } from '@/components/ui/card'

export default function AnalyticsSkeleton() {
  return (
    <div className="space-y-6">
      {/* Filters Bar Skeleton */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-white/3 dark:bg-white/3 border border-glass-border animate-pulse">
        <div className="flex flex-wrap items-center gap-1.5">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-9 w-28 rounded-xl bg-white/5 dark:bg-white/5" />
          ))}
        </div>
        <div className="h-10 w-32 rounded-xl bg-white/5 dark:bg-white/5" />
      </div>

      {/* Stats Cards Grid Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="p-5 glass-card dark:bg-white/3 border-none flex flex-col justify-between h-[135px] animate-pulse">
            <div className="flex items-center justify-between mb-4">
              <div className="space-y-2">
                <div className="h-4 w-24 rounded bg-white/5 dark:bg-white/5" />
                <div className="h-8 w-20 rounded bg-white/5 dark:bg-white/5" />
              </div>
              <div className="w-12 h-12 rounded-2xl bg-white/5 dark:bg-white/5" />
            </div>
            <div className="h-3 w-40 rounded bg-white/5 dark:bg-white/5" />
          </Card>
        ))}
      </div>

      {/* Charts Row Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="p-5 glass-card dark:bg-white/3 border-none lg:col-span-2 flex flex-col h-[380px] animate-pulse">
          <div className="flex items-center gap-2.5 mb-6">
            <div className="w-10 h-10 rounded-xl bg-white/5 dark:bg-white/5" />
            <div className="space-y-2">
              <div className="h-5 w-36 rounded bg-white/5 dark:bg-white/5" />
              <div className="h-3 w-56 rounded bg-white/5 dark:bg-white/5" />
            </div>
          </div>
          <div className="flex-1 rounded-xl bg-white/5 dark:bg-white/5 w-full" />
        </Card>

        <Card className="p-5 glass-card dark:bg-white/3 border-none flex flex-col h-[380px] animate-pulse">
          <div className="flex items-center gap-2.5 mb-6">
            <div className="w-10 h-10 rounded-xl bg-white/5 dark:bg-white/5" />
            <div className="space-y-2">
              <div className="h-5 w-32 rounded bg-white/5 dark:bg-white/5" />
              <div className="h-3 w-44 rounded bg-white/5 dark:bg-white/5" />
            </div>
          </div>
          <div className="flex-1 rounded-xl bg-white/5 dark:bg-white/5 w-full" />
        </Card>
      </div>

      {/* Top Performing Content Section Skeleton */}
      <Card className="p-5 glass-card bg-subcard dark:bg-white/3 border-none animate-pulse">
        <div className="flex items-center gap-2.5 mb-6">
          <div className="w-10 h-10 rounded-xl bg-white/5 dark:bg-white/5" />
          <div className="space-y-2">
            <div className="h-5 w-48 rounded bg-white/5 dark:bg-white/5" />
            <div className="h-3 w-64 rounded bg-white/5 dark:bg-white/5" />
          </div>
        </div>
        <div className="space-y-3">
          <div className="h-10 w-full rounded-lg bg-white/5 dark:bg-white/5" />
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-16 w-full rounded-xl bg-white/3 dark:bg-white/3" />
          ))}
        </div>
      </Card>

      {/* Best Time to Post card & Channel list Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-5 glass-card dark:bg-white/3 border-none h-[280px] flex flex-col justify-between animate-pulse">
          <div>
            <div className="flex items-center gap-2.5 mb-6">
              <div className="w-10 h-10 rounded-xl bg-white/5 dark:bg-white/5" />
              <div className="space-y-2">
                <div className="h-5 w-36 rounded bg-white/5 dark:bg-white/5" />
                <div className="h-3 w-48 rounded bg-white/5 dark:bg-white/5" />
              </div>
            </div>
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-12 w-full rounded-xl bg-white/5 dark:bg-white/5" />
              ))}
            </div>
          </div>
        </Card>

        <Card className="p-5 glass-card dark:bg-white/3 border-none h-[280px] animate-pulse">
          <div className="flex items-center gap-2.5 mb-6">
            <div className="w-10 h-10 rounded-xl bg-white/5 dark:bg-white/5" />
            <div className="space-y-2">
              <div className="h-5 w-36 rounded bg-white/5 dark:bg-white/5" />
              <div className="h-3 w-48 rounded bg-white/5 dark:bg-white/5" />
            </div>
          </div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 w-full rounded-xl bg-white/5 dark:bg-white/5" />
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
