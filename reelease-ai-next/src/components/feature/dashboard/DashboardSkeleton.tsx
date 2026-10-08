'use client'

import { Skeleton } from '@/components/ui/skeleton'

export const DashboardSkeleton = () => {
  return (
    <div className="space-y-10 animate-pulse">
      {/* Welcome Banner Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-12 gap-6">
        <div className="md:col-span-2 lg:col-span-4 2xl:col-span-6 h-[200px] w-full rounded-border-radius bg-muted/40 dark:bg-white/5 border border-glass-border flex flex-col justify-between p-6">
          <div className="space-y-3">
            <Skeleton className="h-8 w-2/3 rounded-lg" />
            <Skeleton className="h-4 w-1/2 rounded-md" />
          </div>
          <div className="flex gap-4">
            <Skeleton className="h-10 w-32 rounded-xl" />
            <Skeleton className="h-10 w-32 rounded-xl" />
          </div>
        </div>
        <div className="md:col-span-1 lg:col-span-2 2xl:col-span-3 h-[200px] w-full rounded-border-radius bg-muted/40 dark:bg-white/5 border border-glass-border p-6 flex flex-col justify-between">
          <Skeleton className="h-5 w-1/3 rounded-md" />
          <Skeleton className="h-16 w-full rounded-xl" />
          <Skeleton className="h-9 w-24 rounded-lg self-end" />
        </div>
        <div className="md:col-span-1 lg:col-span-2 2xl:col-span-3 h-[200px] w-full rounded-border-radius bg-muted/40 dark:bg-white/5 border border-glass-border p-6 flex flex-col justify-between">
          <Skeleton className="h-5 w-1/3 rounded-md" />
          <Skeleton className="h-12 w-full rounded-xl" />
          <Skeleton className="h-9 w-full rounded-lg" />
        </div>
      </div>

      {/* Connected Accounts & Platform Actions Skeleton */}
      <div className="w-full rounded-border-radius bg-muted/40 dark:bg-white/5 border border-glass-border p-5 space-y-4">
        <Skeleton className="h-5 w-48 rounded-md" />
        <div className="flex flex-wrap gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 dark:bg-white/3 border border-glass-border/30 w-44">
              <Skeleton className="w-10 h-10 rounded-full shrink-0" />
              <div className="space-y-1.5 flex-1">
                <Skeleton className="h-3.5 w-3/4 rounded" />
                <Skeleton className="h-2.5 w-1/2 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Stats Cards Row Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5 gap-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="p-5 rounded-border-radius bg-muted/40 dark:bg-white/5 border border-glass-border flex flex-col gap-3 h-32 justify-center">
            <div className="flex items-center gap-3">
              <Skeleton className="w-10 h-10 rounded-xl shrink-0" />
              <div className="space-y-1.5 flex-1">
                <Skeleton className="h-3 w-1/2 rounded" />
                <Skeleton className="h-6 w-3/4 rounded-md" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Two/Three Column Charts Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-border-radius bg-muted/40 dark:bg-white/5 border border-glass-border p-6 h-[380px] flex flex-col justify-between">
            <div className="space-y-2">
              <Skeleton className="h-5 w-1/2 rounded-md" />
              <Skeleton className="h-3 w-1/3 rounded" />
            </div>
            <div className="flex-1 flex items-end justify-between gap-3 px-4 py-8">
              {[40, 60, 45, 80, 50, 75, 90, 65].map((h, j) => (
                <div key={j} className="w-full bg-muted/20 dark:bg-white/5 rounded-t-lg" style={{ height: `${h}%` }}>
                  <Skeleton className="w-full h-full rounded-t-lg bg-muted/30 dark:bg-white/10" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
