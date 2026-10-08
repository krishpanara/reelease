'use client'

import React, { Suspense } from 'react'
import SocialCaptions from '@/components/feature/social-media/publish/SocialCaptions'
import { Loader2 } from 'lucide-react'

export default function SocialCaptionsPage() {
  return (
    <div className="space-y-6">
      <Suspense fallback={<div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="w-10 h-10 animate-spin text-primary" /></div>}>
        <SocialCaptions />
      </Suspense>
    </div>
  )
}
