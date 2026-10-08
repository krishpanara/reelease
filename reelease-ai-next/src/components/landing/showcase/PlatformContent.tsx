'use client'

import { motion } from 'framer-motion'
import { Layout } from 'lucide-react'

export function PlatformContent({
  currentContent,
  activeTab,
  t,
}: any) {
  return (
    <motion.div
      key={activeTab}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
    >
      <div
        className={`inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 ${currentContent.secondaryColor} text-xs font-bold uppercase tracking-widest mb-6`}
      >
        <Layout className="w-3.5 h-3.5" />
        {t(currentContent.badge)}
      </div>
      <h2 className="text-4xl md:text-5xl font-bold text-white mb-8 leading-tight">
        {t(currentContent.title)}{' '}
        <span className={`text-transparent bg-clip-text bg-gradient-to-r ${currentContent.gradient}`}>
          {t(currentContent.highlight)}
        </span>
      </h2>
      <p className="text-lg text-white/60 mb-10 max-w-xl">{t(currentContent.description)}</p>

      <div className="flex sm:flex-row flex-col gap-4">
        {currentContent.features.map((item: any, i: number) => (
          <motion.div
            key={item.title}
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 + i * 0.1 }}
            className="flex items-center gap-4 group"
          >
            <div
              className={`w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 group-hover:bg-white/10 group-hover:border-white/20 transition-colors`}
            >
              <item.icon
                className={`w-6 h-6 ${currentContent.secondaryColor} group-hover:scale-110 transition-transform`}
              />
            </div>
            <div>
              <h4 className="text-white font-bold mb-1">{t(item.title)}</h4>
              <p className="text-white/60 text-sm leading-relaxed">{t(item.desc)}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}
