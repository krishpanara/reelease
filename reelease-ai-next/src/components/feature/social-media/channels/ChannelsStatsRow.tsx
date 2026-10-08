'use client'

import { ChannelStatsProps } from '@/types/components/features'
import { ChannelStats } from './ChannelStats'
import QuickActionsCard from './QuickActionsCard'
import { ChannelsStatsRowProps } from '@/types/socialMedia'



const ChannelsStatsRow = ({
  total,
  active,
  paused,
  recent,
  onConnectNew,
  onReconnectAll,
  onExport,
  onChannelGroups,
  isReconnectingAll,
}: ChannelsStatsRowProps) => {
  return (
    <div className="flex flex-col xl:flex-row gap-4 items-stretch">
      <div className="flex-1 min-w-0">
        <ChannelStats total={total} active={active} paused={paused} recent={recent} />
      </div>
      <QuickActionsCard
        className="w-full xl:w-[280px] shrink-0"
        onConnectNew={onConnectNew}
        onReconnectAll={onReconnectAll}
        onExport={onExport}
        onChannelGroups={onChannelGroups}
        isReconnectingAll={isReconnectingAll}
      />
    </div>
  )
}

export default ChannelsStatsRow
