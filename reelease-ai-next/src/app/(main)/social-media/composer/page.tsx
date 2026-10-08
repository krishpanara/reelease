'use client'

import React, { Suspense } from 'react'
import SocialComposer from '@/components/feature/social-media/publish/SocialComposer'
import { Loader2 } from 'lucide-react'

export default function SocialComposerPage() {
  return (
    <div>
      <Suspense fallback={<div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="w-10 h-10 animate-spin text-primary" /></div>}>
        <SocialComposer />
      </Suspense>
    </div>
  )
}
