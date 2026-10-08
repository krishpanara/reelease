'use client'

import { spinnerSizes } from '@/data/reusable'
import { cn } from '@/lib/utils'
import { SpinnerProps } from '@/types'
import { Loader2 } from 'lucide-react'

const Spinner = ({ className, size = 'lg', text }: SpinnerProps) => {


  return (
    <div className={cn('flex flex-col items-center justify-center h-full min-h-[200px] w-full gap-4', className)}>
      <Loader2 className={cn('animate-spin text-primary', spinnerSizes[size])} />
      {text && (
        <p className={cn('text-muted-foreground font-medium animate-pulse', size === 'sm' ? 'text-xs' : 'text-sm')}>
          {text}
        </p>
      )}
    </div>
  )
}

export default Spinner
