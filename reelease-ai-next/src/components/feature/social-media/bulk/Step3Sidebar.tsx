'use client'

import React from 'react'
import { Clock } from 'lucide-react'
import { cn } from '@/lib/utils'

export const Step3Sidebar = () => {
  const guidelines = [
    {
      title: 'Posting Interval',
      badge: 'Recommended',
      desc: 'Maintain a 10–30 minute buffer between posts to maximize visibility and respect platform rate limits.',
      badgeClass: 'bg-purple-600/10 text-purple-600 dark:text-purple-400 border-purple-600/20',
    },
    {
      title: 'Timezone Selection',
      badge: 'Important',
      desc: "Align your post schedule with your target audience's active hours to boost initial reach and engagement.",
      badgeClass: 'bg-amber-600/10 text-amber-600 dark:text-amber-400 border-amber-600/20',
    },
    {
      title: 'Auto Hashtags',
      badge: 'Tip',
      desc: 'Inject preset hashtag pools into your captions automatically. Helpful for categorizing bulk imports.',
      badgeClass: 'bg-cyan-600/10 text-cyan-600 dark:text-cyan-400 border-cyan-600/20',
    },
    {
      title: 'Smart Fallbacks',
      badge: 'Settings',
      desc: 'Utilize "Stop on error" to prevent consecutive failures if media links or platform API tokens expire.',
      badgeClass: 'bg-emerald-600/10 text-emerald-600 dark:text-emerald-400 border-emerald-600/20',
    },
  ]

  return (
    <div className="p-5 rounded-2xl border border-glass-border bg-white dark:bg-white/3! space-y-4 backdrop-blur-md animate-in fade-in duration-300">
      <h4 className="text-base font-black text-subtitle-color pb-3 border-b border-glass-border flex items-center gap-2">
        <Clock className="w-4 h-4 text-primary animate-pulse" />
        Scheduling Guidelines
      </h4>
      <div className="space-y-4">
        {guidelines.map((item) => (
          <div
            key={item.title}
            className="p-3.5 rounded-border-radius border border-glass-border hover:border-primary/20 bg-black/3 dark:bg-white/3  transition-all duration-300 space-y-2"
          >
            <div className="flex justify-between items-center">
              <h5 className="text-sm font-extrabold text-title-color dark:text-white flex items-center gap-2">
                {item.title}
              </h5>
              <span className={cn('text-3xs font-medium px-2 py-0.5 rounded-full border', item.badgeClass)}>
                {item.badge}
              </span>
            </div>
            <p className="text-xs text-subtitle-color leading-relaxed">{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
