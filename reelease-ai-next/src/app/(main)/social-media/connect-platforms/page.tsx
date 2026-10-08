'use client'

import { Suspense } from 'react'
import ConnectPlatformsContent from '@/components/feature/connect-platforms/ConnectPlatformsContent'

const ConnectPlatformsPage = () => {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-[400px]">Loading platforms...</div>}>
      <ConnectPlatformsContent />
    </Suspense>
  )
}

export default ConnectPlatformsPage
