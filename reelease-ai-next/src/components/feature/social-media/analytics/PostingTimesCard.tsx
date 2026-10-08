import React from 'react'
import { Card } from '@/components/ui/card'
import { Clock } from 'lucide-react'
import { PostingTimesProps } from '@/types/analytics'

export default function PostingTimesCard({ t }: PostingTimesProps) {
  return (
    <Card className="p-5 glass-card dark:bg-white/3 border-none flex flex-col justify-between">
      <div>
        <div className="flex items-center gap-2.5 mb-4">
          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-title-color dark:text-white">
              {t('optimal_posting_times', { defaultValue: 'Best Time to Post' })}
            </h3>
            <p className="text-sm text-subtitle-color">
              {t('times_when_your_audience_is_active', { defaultValue: 'Recommended times for maximum reach' })}
            </p>
          </div>
        </div>

        <div className="space-y-3 mt-4">
          <div className="p-3.5 rounded-border-radius-inner bg-subcard border border-glass-border flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
              <span className="text-xs font-bold text-subtitle-color">Best Day</span>
            </div>
            <span className="text-sm font-extrabold text-subtitle-color">Wednesday</span>
          </div>
          <div className="p-3.5 rounded-border-radius-inner bg-subcard border border-glass-border flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
              <span className="text-xs font-bold text-subtitle-color">Morning Peak</span>
            </div>
            <span className="text-sm font-extrabold text-subtitle-color">09:00 AM - 11:00 AM</span>
          </div>
          <div className="p-3.5 rounded-border-radius-inner bg-subcard border border-glass-border flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
              <span className="text-xs font-bold text-subtitle-color">Evening Peak</span>
            </div>
            <span className="text-sm font-extrabold text-subtitle-color">06:00 PM - 08:00 PM</span>
          </div>
        </div>
      </div>
      <p className="text-sm text-muted-foreground mt-4 leading-normal">
        * Optimal times are calculated based on engagement rates of historical posts in your region.
      </p>
    </Card>
  )
}
