'use client'

import { useSectionRefs } from '@/context/SectionRefsContext'
import { LandingHeroProps } from '@/types/landing'
import { useScroll } from 'framer-motion'
import { useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { HeroFloatingIcon } from './HeroFloatingIcon'
import { HeroContent } from './HeroContent'
import { HeroMockup } from './HeroMockup'
import { heroFloatingIcons } from '@/data/heroIcons'

export default function LandingHero({ data }: LandingHeroProps) {
  const { t } = useTranslation()
  const { registerRef } = useSectionRefs()
  const containerRef = useRef<HTMLElement>(null)

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  })

  // Spring config for smoother motion
  const springConfig = { stiffness: 100, damping: 30, restDelta: 0.001 }

  return (
    <section
      id="home"
      ref={(el) => {
        if (el) (containerRef).current = el
        registerRef('home', el)
      }}
      className="relative pt-24 sm:pt-32 lg:pt-40 min-h-screen overflow-hidden flex flex-col items-center"
    >
      {/* Left Side Glows */}
      <div className="absolute bottom-[20%] left-[-15%] w-[60%] sm:w-[30%] h-[50%] sm:h-[80%] bg-primary/40 rounded-full blur-[60px] sm:blur-[100px] pointer-events-none opacity-20 sm:opacity-40" />
      <div className="absolute bottom-[15%] left-[-15%] w-[60%] sm:w-[30%] h-[50%] sm:h-[80%] bg-secondary/10 blur-[60px] sm:blur-[100px] rounded-full pointer-events-none" />

      {/* Right Side Glows */}
      <div className="absolute bottom-[20%] right-[-15%] w-[60%] sm:w-[30%] h-[50%] sm:h-[80%] bg-primary/40 rounded-full blur-[60px] sm:blur-[100px] pointer-events-none opacity-20 sm:opacity-40" />
      <div className="absolute bottom-[15%] right-[-15%] w-[60%] sm:w-[30%] h-[50%] sm:h-[80%] bg-secondary/10 blur-[60px] sm:blur-[100px] rounded-full pointer-events-none" />

      {/* Floating Decorative Elements */}
      {heroFloatingIcons.map((iconProps, index) => (
        <HeroFloatingIcon
          key={index}
          {...iconProps}
          scrollYProgress={scrollYProgress}
          springConfig={springConfig}
        />
      ))}

      <HeroContent data={data} t={t} />
      <HeroMockup data={data}  />

      {/* Decorative Elements */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
    </section>
  )
}
