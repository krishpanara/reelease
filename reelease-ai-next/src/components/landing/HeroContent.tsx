'use client'

import { Button } from '@/components/ui/button'
import { ROUTES } from '@/constants/routes'
import { LandingPageData } from '@/types/landing'
import { motion } from 'framer-motion'
import { TFunction } from 'i18next'
import { ArrowRight, Sparkles, Zap } from 'lucide-react'
import { useRouter } from 'next/navigation'

export function HeroContent({ data, t }: any) {
  const router = useRouter()

  return (
    <div className="container mx-auto px-6 relative z-10 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 mb-4 rounded-full bg-white/5 border border-white/10 backdrop-blur-xl text-primary text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] group"
      >
        <Zap className="w-3.5 h-3.5 fill-current animate-pulse text-yellow-400" />
        <span className="bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">
          {data?.badge || t('next_gen_ai_platform')}
        </span>
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-[1.1] text-white mb-4 sm:mb-6"
      >
        {data?.heading || (
          <>
            {t('unleash_your')}{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-secondary to-primary bg-[length:200%_auto] animate-gradient">
              {t('creative_potential')}
            </span>
          </>
        )}
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        className="text-base sm:text-lg md:text-xl text-white/60 max-w-2xl mx-auto font-normal leading-relaxed mb-6 sm:mb-10 px-4 sm:px-0"
      >
        {data?.subheading || t('hero_subtitle')}
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-col sm:flex-row items-center justify-center gap-4"
      >
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => router.push(ROUTES.AUTH.LOGIN)}
          className="relative p-[1px] rounded-full transition-all duration-300 group overflow-hidden primary-btn cursor-pointer text-white"
        >
          <div className="relative px-8 py-3 rounded-full flex items-center solid-btn justify-center gap-3">
            <Sparkles className="w-5 h-5 text-white" />
            <span className="text-sm font-medium text-white tracking-wide group-hover:transition-none!">
              {data?.cta_primary_text || t('get_started_now')}
            </span>
          </div>
        </motion.button>

        <Button
          variant="ghost"
          size="lg"
          className="px-8 py-3 h-auto rounded-full font-medium sidebar-active-item  text-sm  text-white border border-white/10 bg-white/5 hover:bg-white/10 transition-all group"
          onClick={() => {
            const el = document.getElementById('features')
            el?.scrollIntoView({ behavior: 'smooth' })
          }}
        >
          {data?.cta_secondary_text || t('explore_features')}
          <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </Button>
      </motion.div>
    </div>
  )
}
