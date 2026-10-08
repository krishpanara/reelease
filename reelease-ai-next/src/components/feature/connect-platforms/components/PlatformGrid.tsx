import React from 'react'
import PlatformCard from './PlatformCard'
import { availablePlatforms } from '@/data/connectPlatformsData'
import { PlatformGridProps } from '@/types'

const PlatformGrid = ({ accounts, connectingPlatform, onConnect, isLoading }: PlatformGridProps) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 2xl:grid-cols-3 gap-6">
      {availablePlatforms.map((platform) => (
        <PlatformCard
          key={platform.id}
          platform={platform}
          accounts={accounts}
          isConnecting={connectingPlatform === platform.id}
          onConnect={onConnect}
          isLoading={isLoading}
        />
      ))}
    </div>
  )
}

export default PlatformGrid
