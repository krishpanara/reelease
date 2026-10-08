'use client'

import { useSectionRefs } from '@/context/SectionRefsContext'
import { Feature, LandingPageData } from '@/types/landing'
import { motion, useScroll, useSpring } from 'framer-motion'
import { Zap } from 'lucide-react'
import { useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { FeatureCard } from './FeatureCard'
import { landingFeatures } from '@/data/landing'

export default function LandingFeatures({ data }: { data?: LandingPageData['features'] }) {
  const { t } = useTranslation()
  const { registerRef } = useSectionRefs()
  const containerRef = useRef<HTMLElement | null>(null)

  const featureItems = data?.items && data.items.length > 0 ? data.items : landingFeatures
  const sectionBadge = data?.section_badge || t('powerful_capabilities')
  const sectionHeading = data?.section_heading || t('everything_you_need_to')
  const sectionSubheading = data?.section_subheading || t('hero_subtitle')

  // Track scroll progress of the entire features section
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  })

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  })

  return (
    <section
      id="features"
      ref={(el) => {
        registerRef('features', el)
        if (el) containerRef.current = el
      }}
      className="relative py-12 md:py-24 pb-0! bg-light-body"
    >
      {/* Dot Grid Background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `url(./images/bg.png)`,
          width: '100%',
          height: '100%',
        }}
      />
      <div className="h-[420vh] relative">
        <div className="sticky top-0 h-screen w-full flex flex-col justify-start md:justify-center items-center pt-2 md:pt-0">
          <div className="container mx-auto px-6 mb-4 md:mb-10 text-center relative z-20">
            <div className="absolute top-0 right-[-200px] w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute top-0 right-[-200px] w-[200px] h-[200px] bg-secondary/20 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-900px] left-[-200px] w-[600px] h-[600px] bg-primary/20 rounded-full blur-[100px] pointer-events-none z-10" />
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="inline-flex items-center gap-2 px-4 md:px-5 py-1.5 md:py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] md:text-xs font-black uppercase tracking-[0.2em] mb-4 md:mb-6"
            >
              <Zap className="w-4 h-4 fill-primary" />
              {sectionBadge}
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="text-xl sm:text-2xl md:text-5xl font-bold text-white mb-2 md:mb-4 tracking-tight leading-[1.1]"
            >
              {sectionHeading}{' '}
              {sectionHeading === t('everything_you_need_to') && (
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-secondary to-primary bg-[length:200%_auto] animate-gradient">
                  {t('create_content')}
                </span>
              )}
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="text-sm md:text-lg text-white/60 max-w-2xl mx-auto font-normal leading-relaxed"
            >
              {sectionSubheading}
            </motion.p>
          </div>

          <div className="relative max-w-7xl mx-auto px-4 md:px-6 w-full h-[55vh] md:h-[60vh] lg:h-[55vh] min-h-[400px] md:min-h-[500px]">
            {featureItems.map((feature: Feature, index: number) => (
              <FeatureCard
                key={index}
                feature={feature}
                index={index}
                total={featureItems.length}
                t={t}
                scrollYProgress={smoothProgress}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
