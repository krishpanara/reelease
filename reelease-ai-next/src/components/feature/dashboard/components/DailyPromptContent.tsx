'use client'

import { Badge } from '@/components/ui/badge'
import { DailyPromptContentProps } from '@/types'
import { AnimatePresence, motion } from 'framer-motion'
import { Check, Copy } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export const DailyPromptContent = ({
  keyIndex,
  prompt,
  category,
  copied,
  isLoading,
  onCopy
}: DailyPromptContentProps) => {
  const { t } = useTranslation()

  return (
    <div className="relative z-10 flex-1 my-4 flex flex-col justify-center">
      <AnimatePresence mode="wait">
        <motion.div
          key={keyIndex}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.25 }}
          onClick={onCopy}
          className={`group/box w-full text-left p-4 rounded-border-radius-inner border border-glass-border bg-subcard dark:bg-white/3 cursor-pointer transition-all duration-300 ${isLoading ? 'opacity-65 animate-pulse' : 'hover:border-primary/30'
            }`}
        >
          <div className="flex items-center justify-between">
            <Badge
              variant="secondary"
              className="bg-primary/10 border-primary/20 text-primary text-xs font-bold px-2.5 py-0.5 mb-1"
            >
              {category}
            </Badge>
            <div className="opacity-0 group-hover/box:opacity-100 transition-opacity duration-300 flex items-center gap-1.5 text-xs text-primary font-bold">
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">{t('copied', { defaultValue: 'Copied!' })}</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  {/* <span>{t('copy', { defaultValue: 'Copy' })}</span> */}
                </>
              )}
            </div>
          </div>

          <p className="text-sm text-subtitle-color font-medium leading-relaxed italic line-clamp-3 text-wrap break-words">
            &ldquo;{prompt}&rdquo;
          </p>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
