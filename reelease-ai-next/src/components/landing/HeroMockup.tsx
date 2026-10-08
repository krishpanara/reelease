'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import { getResolvedImageUrl } from '@/utils/image'
import { LandingHeroProps } from '@/types/landing'

export function HeroMockup({ data }: any) {
  // dashboard_image_id is a populated attachment object { file_path, ... }
  const heroSrc = getResolvedImageUrl(
    data?.dashboard_image_id?.file_path || data?.dashboard_image_id,
    ''
  )

  return (
    <motion.div
      initial={{ opacity: 0, y: 80 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1.2, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="relative max-w-6xl mx-auto group px-4 mt-12 sm:mt-20 lg:mt-24 z-20"
    >
      <div className="relative rounded-2xl sm:rounded-[2rem] overflow-hidden border border-white/10 bg-dark-deep/50 backdrop-blur-2xl shadow-[0_20px_50px_-20px_rgba(0,0,0,1)] sm:shadow-[0_50px_100px_-20px_rgba(0,0,0,1)] transition-all duration-700 group-hover:scale-[1.01] group-hover:border-primary/30">
        <Image
          src={heroSrc}
          alt="Dashboard Preview"
          width={1200}
          height={800}
          className="w-full h-auto opacity-90 group-hover:opacity-100 transition-opacity duration-700"
          unoptimized
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
      </div>

      <div className="absolute -inset-8 bg-gradient-to-r from-primary/30 via-blue-500/20 to-primary/30 blur-[100px] -z-10 opacity-50 group-hover:opacity-50 transition-opacity duration-700" />
    </motion.div>
  )
}
