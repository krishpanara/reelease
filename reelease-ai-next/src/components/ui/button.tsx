import { cn } from '@/lib/utils'
import { ButtonProps } from '@/types/shared'
import { Slot } from '@radix-ui/react-slot'
import { cva } from 'class-variance-authority'
import * as React from 'react'

const buttonVariants = cva(
  'inline-flex items-center h-11 justify-center gap-2 whitespace-nowrap text-xs rounded-[18px] font-bold transition-all duration-300 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 active:scale-95 cursor-pointer leading-0',
  {
    variants: {
      variant: {
        default: 'bg-black/3!  dark:text-light-text-color bg-white cursor-pointer',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90 cursor-pointer',
        outline: 'border  inner-card cursor-pointer',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80 cursor-pointer',
        ghost: 'hover:bg-accent hover:text-accent-foreground  cursor-pointer',
        link: 'text-primary underline-offset-4 hover:underline cursor-pointer',
        premium:
          'bg-primary text-white shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:scale-[1.02] border border-white/10 font-semibold cursor-pointer',
        glass:
          'bg-glass-bg backdrop-blur-md text-foreground hover:bg-white/20 dark:hover:bg-white/10 shadow-sm cursor-pointer',
      },
      size: {
        default: ' h-10 p-button-padding',
        sm: 'h-9! rounded-lg px-3 text-xs',
        lg: 'h-12 rounded-2xl px-8 text-base',
        icon: 'size-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)


const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp
        suppressHydrationWarning
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  },
)
Button.displayName = 'Button'

export { Button, buttonVariants }
