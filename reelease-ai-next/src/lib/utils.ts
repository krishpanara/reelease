import { avatarColors } from '@/data/lib'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


export function getAvatarColorClass(name: string | undefined | null) {
  if (!name) return 'bg-slate-800 text-white dark:bg-slate-950 dark:text-slate-300 border border-slate-800/50'

  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  return avatarColors[Math.abs(hash) % avatarColors.length]
}
