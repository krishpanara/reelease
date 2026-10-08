import { cn } from '@/lib/utils'
import * as React from 'react'

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<'input'>>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'flex h-11 w-full dark:text-white text-black rounded-border-radius-inner!  border border-glass-border  dark:bg-white/3! px-3 py-2 text-base transition-all file:border-0  file:text-sm file:font-medium file:text-foreground text-left rtl:text-right! placeholder:text-muted-foreground placeholder:text-left rtl:placeholder:text-right focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm inner-card ',
          className,
        )}
        ref={ref}
        suppressHydrationWarning
        {...props}
      />
    )
  },
)
Input.displayName = 'Input'

export default Input
