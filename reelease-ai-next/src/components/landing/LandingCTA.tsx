'use client'

import { motion } from 'framer-motion'
import { ArrowRight, ShieldCheck, Clock, RefreshCw, BadgePercent } from 'lucide-react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { ROUTES } from '@/constants/routes'

export default function LandingCTA() {
  const router = useRouter()

  const items = [
    { icon: BadgePercent, label: 'No Credit Card' },
    { icon: RefreshCw, label: 'Cancel Anytime' },
    { icon: ShieldCheck, label: 'Secure & Trusted' },
  ]

  return (
    <section className="relative py-12 pb-24 overflow-hidden bg-black">
      {/* Glow Effects */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-primary/10 rounded-full blur-[120px] pointer-events-none -z-10" />

      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="relative bg-black rounded-border-radius flex flex-col-reverse md:flex-row items-center justify-between gap-10 overflow-hidden backdrop-blur-xl group hover:border-white/20 transition-all duration-300"
        >
          {/* Card Border Background glow */}

          {/* Left Text and CTA Actions */}
          <div className="flex-1 text-center md:text-left space-y-6 z-10">
            <div className="space-y-3">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
                Start <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-indigo-400 font-black">Creating Viral Content</span> Today
              </h2>
              <p className="text-white/60 text-base md:text-lg max-w-xl">
                Join thousands of creators who are growing faster with Reelease AI.
              </p>
            </div>

            {/* Buttons Row */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
              <motion.button
                onClick={() => router.push(ROUTES.AUTH.LOGIN)}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                className="px-6 py-3.5  primary-btn rounded-xl text-white font-bold flex items-center gap-2 shadow-[0_0_20px_rgba(124,58,237,0.3)] transition-all text-sm md:text-base border border-violet-500/20"
              >
                Try Live Demo
                <ArrowRight className="w-4 h-4 md:w-5 h-5" />
              </motion.button>

              <motion.button
                onClick={() => {
                  const element = document.getElementById('pricing')
                  if (element) {
                    element.scrollIntoView({ behavior: 'smooth' })
                  }
                }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                className="px-6 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white font-bold hover:bg-white/10 transition-all text-sm md:text-base backdrop-blur-md"
              >
                View Pricing
              </motion.button>
            </div>

            {/* Features list below buttons */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-6 gap-y-3 pt-6">
              {items.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2 text-white/50 text-xs md:text-sm">
                  <item.icon className="w-4 h-4 text-violet-400/80" />
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Floating 3D Play Button Asset */}
          <div className="relative w-48 h-48 md:w-64 md:h-64 lg:w-72 lg:h-72 shrink-0 flex items-center justify-center z-10">
            {/* outer background glow */}
            <div className="absolute inset-0 bg-violet-500/15 rounded-full blur-[40px] animate-pulse" />
            <motion.div
              animate={{
                y: [0, -10, 0],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="relative w-full h-full"
            >
              <Image
                src="/images/icons/play-3d.png"
                alt="3D Play Button"
                fill
                className="object-contain drop-shadow-[0_10px_20px_rgba(0,0,0,0.3)] mix-blend-screen"
                unoptimized
              />
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
