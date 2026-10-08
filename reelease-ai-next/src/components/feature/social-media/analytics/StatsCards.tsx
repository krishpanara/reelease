import React from 'react'
import { Card } from '@/components/ui/card'
import { Users, Send, TrendingUp, Award } from 'lucide-react'
import { StatsCardsProps } from '@/types/analytics'

export default function StatsCards({
  totalFollowers,
  totalPostsCount,
  totalEngagement,
  avgEngagementRate,
  t,
}: StatsCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Card 1: Followers */}
      <Card className="p-5 glass-card dark:bg-white/3 border-none flex flex-col justify-between relative overflow-hidden group hover:-translate-y-1 transition-all duration-300">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm font-semibold text-subtitle-color">
              {t('audience_size', { defaultValue: 'Total Audience' })}
            </p>
            <h3 className="text-2xl font-bold text-title-color dark:text-white mt-1">
              {totalFollowers >= 1000 ? `${(totalFollowers / 1000).toFixed(1)}K` : totalFollowers}
            </h3>
          </div>
          <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-500">
            <Users className="w-6 h-6" />
          </div>
        </div>
        <div className="text-sm text-muted-foreground">
          {t('active_followers_desc', { defaultValue: 'Across all connected profiles' })}
        </div>
      </Card>

      {/* Card 2: Total Posts */}
      <Card className="p-5 glass-card dark:bg-white/3 border-none flex flex-col justify-between relative overflow-hidden group hover:-translate-y-1 transition-all duration-300">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm font-semibold text-subtitle-color">
              {t('published_content', { defaultValue: 'Published Content' })}
            </p>
            <h3 className="text-2xl font-bold text-title-color dark:text-white mt-1">{totalPostsCount}</h3>
          </div>
          <div className="p-3 rounded-2xl bg-purple-500/10 text-purple-500">
            <Send className="w-6 h-6" />
          </div>
        </div>
        <div className="text-sm text-muted-foreground">
          {t('posts_published_period', { defaultValue: 'Posts published in selected period' })}
        </div>
      </Card>

      {/* Card 3: Engagement */}
      <Card className="p-5 glass-card dark:bg-white/3 border-none flex flex-col justify-between relative overflow-hidden group hover:-translate-y-1 transition-all duration-300">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm font-semibold text-subtitle-color">
              {t('total_engagement', { defaultValue: 'Total Engagement' })}
            </p>
            <h3 className="text-2xl font-bold text-title-color dark:text-white mt-1">
              {totalEngagement >= 1000 ? `${(totalEngagement / 1000).toFixed(1)}K` : totalEngagement}
            </h3>
          </div>
          <div className="p-3 rounded-2xl bg-pink-500/10 text-pink-500">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>
        <div className="text-sm text-muted-foreground">
          {t('likes_comments_shares_sum', { defaultValue: 'Sum of likes, comments, and shares' })}
        </div>
      </Card>

      {/* Card 4: Avg Engagement Rate */}
      <Card className="p-5 glass-card dark:bg-white/3 border-none flex flex-col justify-between relative overflow-hidden group hover:-translate-y-1 transition-all duration-300">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm font-semibold text-subtitle-color">
              {t('avg_engagement_rate', { defaultValue: 'Avg. Engagement Rate' })}
            </p>
            <h3 className="text-2xl font-bold text-title-color dark:text-white mt-1">{avgEngagementRate}%</h3>
          </div>
          <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-500">
            <Award className="w-6 h-6" />
          </div>
        </div>
        <div className="text-sm text-muted-foreground">
          {t('rate_per_follower', { defaultValue: 'Total engagement divided by audience' })}
        </div>
      </Card>
    </div>
  )
}
