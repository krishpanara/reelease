'use client'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdownMenu'
import { themes } from '@/data/layout'
import { cn } from '@/lib/utils'
import { Check, Monitor, MoonStar, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import * as React from 'react'

interface ThemeDropdownProps {
  variant?: 'default' | 'pill'
}

const ThemeDropdown = ({ variant = 'default' }: ThemeDropdownProps) => {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  // Avoid hydration mismatch
  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    if (variant === 'pill') {
      return (
        <Button variant="ghost" size="icon" className="h-9 w-9 sm:h-11 sm:w-11 rounded-full! hover:bg-transparent hover:text-primary transition-all duration-300">
          <Sun className="h-5! w-5! text-subtitle-color" />
        </Button>
      )
    }
    return (
      <Button
        variant="ghost"
        size="icon"
        className="h-9 w-9 sm:h-11 sm:w-11 rounded-full!"
      >
        <Sun className="h-5! w-5! text-subtitle-color" />
      </Button>
    )
  }



  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {variant === 'pill' ? (
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 sm:h-11 sm:w-11 transition-all duration-300 group rounded-full! cursor-pointer hover:bg-transparent hover:text-primary"
          >
            <div className="flex items-center justify-center text-subtitle-color dark:text-white/70 group-hover:text-primary transition-transform duration-200">
              {theme === 'dark' ? (
                <MoonStar className="h-5! w-5!" />
              ) : theme === 'light' ? (
                <Sun className="h-5! w-5!" />
              ) : (
                <Monitor className="h-5! w-5!" />
              )}
            </div>
          </Button>
        ) : (
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 sm:h-11 sm:w-11 transition-all duration-300 group bg-black/3 dark:bg-white/3 rounded-border-radius-inner! cursor-pointer hover:bg-black/3!"
          >
            <div className="flex items-center justify-center text-title-color transition-transform duration-200">
              {theme === 'dark' ? (
                <MoonStar className="h-5! w-5!" />
              ) : theme === 'light' ? (
                <Sun className="h-5! w-5!" />
              ) : (
                <Monitor className="h-5! w-5!" />
              )}
            </div>
          </Button>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        collisionPadding={16}
        className="w-[calc(100vw-32px)] sm:w-56 p-2 mt-2 border border-border bg-white dark:bg-white/3 backdrop-blur-3xl rounded-border-radius! glass-dark-card shadow-2xl animate-in fade-in zoom-in duration-200 z-50"
      >
        <DropdownMenuLabel className="px-2 py-2 text-sm font-bold tracking-widest text-subtitle-color">
          Appearance
        </DropdownMenuLabel>
        <div className="space-y-1">
          {themes.map(({ id, label, icon: Icon }) => {
            const isActive = theme === id
            return (
              <DropdownMenuItem
                key={id}
                onClick={() => setTheme(id)}
                className={cn(
                  'flex items-center justify-between px-3 py-2.5 rounded-radius cursor-pointer transition-all duration-200 group',
                  isActive
                    ? 'primary-btn text-white! '
                    : 'hover:bg-primary/10 text-subtitle-color hover:text-primary dark:text-white/70 dark:hover:text-white',
                )}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      'p-1.5 rounded-lg transition-colors',
                      isActive ? 'bg-white/20' : 'bg-primary/5 group-hover:bg-primary/10',
                    )}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <span className="text-sm font-medium">{label}</span>
                </div>
                {isActive && <Check className="h-4 w-4 stroke-[3px]" />}
              </DropdownMenuItem>
            )
          })}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default ThemeDropdown
