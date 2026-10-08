'use client'

import React, { Suspense } from 'react'
import { Loader2 } from 'lucide-react'
import BulkScheduleContent from '@/components/feature/social-media/bulk/BulkScheduleContent'

export default function BulkPostsPage() {
  return (
    <div>
      <Suspense
        fallback={
          <div className="flex items-center justify-center min-h-[60vh]">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
          </div>
        }
      >
        <BulkScheduleContent />
      </Suspense>
    </div>
  )
}
