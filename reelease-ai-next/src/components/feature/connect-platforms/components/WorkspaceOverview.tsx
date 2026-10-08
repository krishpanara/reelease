import { useTranslation } from 'react-i18next'
import { Link2, User, CheckCircle2, Zap, BarChart2, Radio } from 'lucide-react'
import { WorkspaceOverviewProps } from '@/types'

const WorkspaceOverview = ({ stats }: WorkspaceOverviewProps) => {
  const { t } = useTranslation()

  return (
    <div className="rounded-border-radius bg-white dark:bg-white/5 border border-glass-border dark:border-white/10 p-6 shadow-xl shadow-black/5 dark:shadow-none">
      <h3 className="text-lg font-bold text-title-color dark:text-white transition-colors mb-1">
        {t('workspace_overview')}
      </h3>
      <p className="text-sm text-subtitle-color mb-6 font-medium leading-relaxed">
        {t('workspace_overview_desc')}
      </p>

      <div className="space-y-5">
        {/* Connected Platforms */}
        <div>
          <div className="flex justify-between items-center text-sm font-semibold mb-2">
            <div className="flex items-center gap-2 text-title-color dark:text-white">
              <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-500">
                <Link2 className="w-4 h-4" />
              </div>
              <span>{t('connected_platforms')}</span>
            </div>
            <span className="text-title-color dark:text-white">{stats.connectedPlatforms}</span>
          </div>
          {/* Progress Bar */}
          <div className="w-full h-1.5 bg-black/5 dark:bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-500"
              style={{ width: `${stats.progressPercentage}%` }}
            />
          </div>
        </div>

        {/* Active Accounts */}
        <div className="flex justify-between items-center text-sm font-semibold py-6 mb-0! border-b border-glass-border">
          <div className="flex items-center gap-2 text-title-color dark:text-white">
            <div className="p-1.5 rounded-lg bg-green-500/10 text-green-500">
              <User className="w-4 h-4" />
            </div>
            <span>{t('active_accounts')}</span>
          </div>
          <span className="text-title-color dark:text-white">{stats.activeAccounts}</span>
        </div>

        {/* Publishing Ready */}
        <div className="flex justify-between items-center text-sm font-semibold py-6 mb-0! border-b border-glass-border">
          <div className="flex items-center gap-2 text-title-color dark:text-white">
            <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-500">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <span>{t('publishing_ready')}</span>
          </div>
          <span className="text-title-color dark:text-white">{stats.publishingReady}</span>
        </div>

        {/* Auto-Publish Active */}
        <div className="flex justify-between items-center text-sm font-semibold py-6 mb-0! border-b border-glass-border">
          <div className="flex items-center gap-2 text-title-color dark:text-white">
            <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-500">
              <Zap className="w-4 h-4" />
            </div>
            <span>{t('auto_publish_active')}</span>
          </div>
          <span className="text-title-color dark:text-white">{stats.autoPublishActive}</span>
        </div>

        {/* Total Posts This Month */}
        <div className="flex justify-between items-center text-sm font-semibold py-6 mb-0! border-b border-glass-border">
          <div className="flex items-center gap-2 text-title-color dark:text-white">
            <div className="p-1.5 rounded-lg bg-rose-500/10 text-rose-500">
              <BarChart2 className="w-4 h-4" />
            </div>
            <span>{t('total_posts_this_month')}</span>
          </div>
          <span className="text-title-color dark:text-white">{stats.totalPostsThisMonth}</span>
        </div>

        {/* Total Reach */}
        <div className="flex justify-between items-center text-sm font-semibold py-6 pb-0!">
          <div className="flex items-center gap-2 text-title-color dark:text-white">
            <div className="p-1.5 rounded-lg bg-pink-500/10 text-pink-500">
              <Radio className="w-4 h-4" />
            </div>
            <span>{t('total_reach')}</span>
          </div>
          <span className="text-title-color dark:text-white">{stats.totalReach}</span>
        </div>
      </div>
    </div>
  )
}

export default WorkspaceOverview
