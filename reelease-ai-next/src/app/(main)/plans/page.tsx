'use client'

import PlansRouter from '@/components/feature/plans/PlansRouter'
import Spinner from '@/components/reusable/Spinner'
import { Suspense } from 'react'

export default function Page() {
  return (
    <div className="space-y-6">
      <Suspense fallback={<Spinner className="min-h-[40vh]" />}>
        <PlansRouter />
      </Suspense>
    </div>
  )
}
