'use client'

import { BlogNavigationProps } from '@/types'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export default function BlogNavigation({ prevBlog, nextBlog, onNavigate }: BlogNavigationProps) {
  const { t } = useTranslation()

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {prevBlog ? (
        <div
          onClick={() => onNavigate(prevBlog)}
          className="group sm:p-6 p-4 rounded-border-radius glass-card border border-border/40 flex items-center gap-4 sm:gap-5 cursor-pointer hover:border-primary/40 transition-all text-left"
        >
          <div className="w-12 h-12 rounded-radius bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-white transition-all duration-300">
            <ChevronLeft className="h-6 w-6" />
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-bold text-primary mb-1">{t('previous_post')}</p>
            <h4 className="text-sm font-bold text-title-color dark:text-white line-clamp-1">{prevBlog.title}</h4>
          </div>
        </div>
      ) : (
        <div />
      )}

      {nextBlog ? (
        <div
          onClick={() => onNavigate(nextBlog)}
          className="group sm:p-6 p-4 rounded-border-radius border border-glass-border flex items-center justify-between sm:justify-end gap-4 sm:gap-5 cursor-pointer hover:border-primary/40 transition-all text-left sm:text-right bg-white dark:bg-white/3"
        >
          <div className="flex-1 overflow-hidden order-first">
            <p className="text-sm font-bold text-primary mb-1">{t('next_post')}</p>
            <h4 className="text-sm font-bold text-title-color dark:text-white line-clamp-1 break-all whitespace-normal">
              {nextBlog.title}
            </h4>
          </div>
          <div className="w-12 h-12 rounded-radius bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-white transition-all duration-300 sm:order-last">
            <ChevronRight className="h-6 w-6" />
          </div>
        </div>
      ) : (
        <div />
      )}
    </div>
  )
}
