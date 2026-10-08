'use client'

import { cn } from '@/lib/utils'

export function AISwitch({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={cn(
        'relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden',
        checked ? 'bg-primary ' : 'bg-black/10 dark:bg-white/10',
      )}
    >
      <span
        className={cn(
          'pointer-events-none inline-block h-3.5 w-3.5 transform absolute top-px rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out',
          'ltr:left-0.5 rtl:right-0.5',
          checked ? 'ltr:translate-x-4 rtl:-translate-x-4' : 'translate-x-0',
        )}
      />
    </button>
  )
}
