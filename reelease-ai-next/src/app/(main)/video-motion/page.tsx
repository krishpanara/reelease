'use client'

import VideoMotionContent from '@/components/feature/video-motion'
import { Suspense } from 'react'

export default function VideoMotionPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading Video Motion...</div>}>
      <VideoMotionContent />
    </Suspense>
  )
}
