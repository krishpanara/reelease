'use client'

import { motion } from 'framer-motion'
import { TFunction } from 'i18next'
import { Shield } from 'lucide-react'

export function PricingHeader({ sectionBadge, sectionTitle, sectionDescription, billingCycle, setBillingCycle, t }: any) {
  return (
    <div className="flex-1 lg:text-left text-center">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-widest mb-6"
      >
        <Shield className="w-3.5 h-3.5" />
        {sectionBadge}
      </motion.div>

      <motion.h2
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight"
      >
        {sectionTitle}{' '}
        {sectionTitle === t('simple_transparent') && (
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-secondary to-primary bg-[length:200%_auto] animate-gradient">
            {t('pricing')}
          </span>
        )}
      </motion.h2>

      <motion.p
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        className="text-lg text-white/60 mb-10 "
      >
        {sectionDescription}
      </motion.p>
    </div>
  )
}
