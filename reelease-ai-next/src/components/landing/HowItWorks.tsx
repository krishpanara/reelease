'use client'

import { motion } from 'framer-motion'
import { SquarePen, Sparkles, Send, ArrowRight, Instagram, Youtube, Facebook, Linkedin, Cpu, Settings } from 'lucide-react'
import { XIcon as Twitter } from '@/components/ui/XIcon'
import { useTranslation } from 'react-i18next'
import Image from 'next/image'
import { useGetLandingPageQuery } from '@/redux/api/landingPageApi'
import { getResolvedImageUrl } from '@/utils/image'
import { ThreadsIcon } from '../ui/threadsIcon'

export default function HowItWorks() {
  const { t } = useTranslation()
  const { data: landingData } = useGetLandingPageQuery()
  const heroImage = landingData?.landing_page?.hero?.dashboard_image_id
  const dashboardSrc = getResolvedImageUrl(
    heroImage?.file_path || heroImage,
    '/images-1.png'
  )

  const steps = [
    {
      num: '1',
      title: 'Describe Your Idea',
      desc: 'Enter a prompt or upload an image.',
      icon: SquarePen,
      themeColor: '#8b5cf6',
    },
    {
      num: '2',
      title: 'AI Generates Content',
      desc: 'AI creates video, voiceover, caption, and hashtags.',
      icon: Sparkles,
      themeColor: '#3b82f6',
    },
    {
      num: '3',
      title: 'Publish Everywhere',
      desc: 'Auto-publish to all your social platforms.',
      icon: Send,
      themeColor: '#10b981',
    },
  ]

  const platforms = [
    { id: 'instagram', name: 'Instagram', icon: Instagram, color: '#E1306C', shadow: 'shadow-[0_0_15px_rgba(225,48,108,0.15)] border-[#E1306C]/20' },
    { id: 'youtube', name: 'YouTube', icon: Youtube, color: '#FF0000', shadow: 'shadow-[0_0_15px_rgba(255,0,0,0.15)] border-[#FF0000]/20' },
    { id: 'facebook', name: 'Facebook', icon: Facebook, color: '#1877F2', shadow: 'shadow-[0_0_15px_rgba(24,119,242,0.15)] border-[#1877F2]/20' },
    { id: 'linkedin', name: 'LinkedIn', icon: Linkedin, color: '#0A66C2', shadow: 'shadow-[0_0_15px_rgba(10,102,194,0.15)] border-[#0A66C2]/20' },
    { id: 'twitter', name: 'Twitter', icon: Twitter, color: '#FFFFFF', shadow: 'shadow-[0_0_15px_rgba(255,255,255,0.1)] border-white/10' },
    { id: 'threads', name: 'Threads', icon: ThreadsIcon, color: '#FFFFFF', shadow: 'shadow-[0_0_15px_rgba(255,255,255,0.1)] border-white/10' },
  ]

  return (
    <section className="relative py-24 bg-black overflow-hidden border-t border-white/5">
      {/* Background radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[160px] pointer-events-none -z-10" />

      <div className="container mx-auto px-6">
        {/* Section 1: How Reelease AI Works */}
        <div className="text-center mb-20">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-xl sm:text-2xl md:text-5xl font-bold text-white mb-2 md:mb-4 tracking-tight leading-[1.1]"
          >
            How{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-secondary to-primary bg-[length:200%_auto] animate-gradient font-black">
              Reelease AI
            </span>{' '}
            Works
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-white/60 text-lg max-w-xl mx-auto"
          >
            From idea to viral content in 3 simple steps.
          </motion.p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 w-full mb-28">
          {steps.map((step, idx) => (
            <div key={idx} className="relative flex items-stretch w-full">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: idx * 0.15 }}
                className="w-full h-full bg-[#111118]/80 border border-white/10 rounded-2xl p-6 md:p-8 flex items-center gap-5 hover:border-white/20 transition-all duration-300 backdrop-blur-md relative group"
              >
                {/* Brand border hover effect */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-primary/10 to-secondary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10" />

                {/* Left side: Icon in circular container */}
                <div
                  className="w-18 h-18 rounded-full flex items-center justify-center shrink-0 border relative"
                  style={{
                    backgroundColor: `${step.themeColor}12`,
                    borderColor: `${step.themeColor}30`,
                    boxShadow: `0 0 18px ${step.themeColor}15`
                  }}
                >
                  {/* Inner solid circle */}
                  <div
                    className="w-14 h-14 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: step.themeColor }}
                  >
                    <step.icon className="w-7 h-7 text-white" />
                  </div>
                </div>

                {/* Right side: Text details */}
                <div className="text-left">
                  <h4 className="text-white font-bold text-lg mb-1">
                    {step.num}. {t(step.title)}
                  </h4>
                  <p className="text-white/60 text-sm leading-relaxed">{t(step.desc)}</p>
                </div>
              </motion.div>

              {/* Connecting arrow (only visible on desktop between items) */}
              {idx < 2 && (
                <div className="hidden lg:flex absolute left-full top-1/2 -translate-y-1/2 w-8 justify-center items-center z-20 text-purple-400/80">
                  <ArrowRight className="w-6 h-6" strokeWidth={3} />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Section 2: Publish Everywhere, Instantly */}
        <div className="text-center mb-16">
          <motion.h3
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-xl sm:text-2xl md:text-5xl font-bold text-white mb-2 md:mb-4 tracking-tight leading-[1.1]"
          >
            Publish Everywhere, Instantly
          </motion.h3>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-white/60 text-base max-w-xl mx-auto"
          >
            Schedule and publish your content directly to all major platforms.
          </motion.p>
        </div>

        {/* Platforms Row */}
        <div className="flex flex-wrap md:flex-nowrap items-center justify-between gap-y-4 gap-x-3 md:gap-x-4 px-4 w-full">
          {platforms.map((platform, idx) => (
            <div key={platform.id} className="flex-1 min-w-[130px] md:min-w-0 flex items-center justify-between gap-3 md:gap-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.08 }}
                whileHover={{ y: -4 }}
                className={`flex-1 flex items-center justify-center gap-2 md:gap-2.5 px-3.5 py-3.5 md:px-5 md:py-2.5 rounded-border-radius-inner bg-[#111118]/90 border ${platform.shadow} cursor-pointer group transition-all duration-300`}
              >
                {/* Platform Icon */}
                <div
                  className="w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center shrink-0"
                  style={{ backgroundColor: `${platform.color}15` }}
                >
                  <platform.icon className="w-4 h-4" style={{ color: platform.color }} />
                </div>
                {/* Platform Name */}
                <span className="text-white/90 group-hover:text-white font-semibold text-xs md:text-base transition-colors">
                  {platform.name}
                </span>
              </motion.div>

              {/* Connector Arrow */}
              {idx < platforms.length - 1 && (
                <span className="text-purple-400/80 text-xs md:text-sm font-light select-none shrink-0">
                  <ArrowRight className="w-4 h-4" strokeWidth={3} />
                </span>
              )}
            </div>
          ))}
        </div>

        {/* Section 3: Built for Creators. by Creators */}
        <div className="text-center mt-28 mb-16">
          <motion.h3
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-xl sm:text-2xl md:text-5xl font-bold text-white mb-2 md:mb-4 tracking-tight leading-[1.1]"
          >
            Built for <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-indigo-400 font-extrabold bg-[length:200%_auto] animate-gradient">Creators.</span> by <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-indigo-400 font-extrabold bg-[length:200%_auto] animate-gradient">Creators</span>
          </motion.h3>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-white/60 text-base max-w-xl mx-auto"
          >
            Powerful features designed to make content creation effortless.
          </motion.p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full">
          {/* Card 1: Powered by Next-Gen AI */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-3 bg-[#111118]/80 border border-white/10 rounded-2xl p-6 flex flex-row lg:flex-col items-center lg:items-start justify-between gap-6 hover:border-white/20 transition-all duration-300 backdrop-blur-md relative overflow-hidden group"
          >
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-primary/5 to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10" />
            <div className="flex flex-col text-left">
              <span className="text-white/60 text-xs font-semibold uppercase tracking-wider">Powered by</span>
              <h4 className="text-white font-bold text-xl md:text-2xl mt-1 leading-tight">Next-Gen AI</h4>
              <p className="text-white/50 text-sm mt-3 leading-relaxed">Unmatched speed and intelligence.</p>
            </div>

            <div className="relative w-16 h-16 shrink-0 flex items-center justify-center">
              <div className="absolute inset-0 bg-blue-500/10 rounded-full blur-md animate-pulse" />
              <div className="relative w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/30 flex items-center justify-center shadow-[0_0_15px_rgba(59,130,246,0.2)]">
                <Cpu className="w-5 h-5 text-blue-400" />
              </div>
            </div>
          </motion.div>

          {/* Card 2: Seamless Workflow */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="lg:col-span-6 bg-[#111118]/80 border border-white/10 rounded-2xl p-6 pb-0 flex flex-col items-center justify-between gap-6 hover:border-white/20 transition-all duration-300 backdrop-blur-md relative overflow-hidden group min-h-[320px]"
          >
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-primary/5 to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10" />
            <div className="text-center">
              <h4 className="text-white font-bold text-xl md:text-2xl">Seamless Workflow</h4>
              <p className="text-white/50 text-sm mt-1">Everything you need in one powerful dashboard.</p>
            </div>

            {/* Dashboard Mockup Image */}
            <div className="relative w-[100%] h-[180px] md:h-[220px] rounded-t-xl border-t border-x border-white/10 overflow-hidden shadow-[0_0_30px_rgba(0,0,0,0.5)]">
              <Image
                src={dashboardSrc}
                alt="Dashboard Preview"
                fill
                className="object-cover object-top opacity-80 group-hover:opacity-100 transition-opacity duration-700"
                unoptimized
              />
            </div>
          </motion.div>

          {/* Card 3: Smart Automation */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="lg:col-span-3 bg-[#111118]/80 border border-white/10 rounded-2xl p-6 flex flex-row lg:flex-col items-center lg:items-start justify-between gap-6 hover:border-white/20 transition-all duration-300 backdrop-blur-md relative overflow-hidden group"
          >
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-primary/5 to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10" />
            <div className="flex flex-col text-left">
              <span className="text-white/60 text-xs font-semibold uppercase tracking-wider">Features</span>
              <h4 className="text-white font-bold text-xl md:text-2xl mt-1 leading-tight">Smart Automation</h4>
              <p className="text-white/50 text-sm mt-3 leading-relaxed">Save time with auto-captions, scheduling & publishing.</p>
            </div>

            <div className="relative w-16 h-16 shrink-0 flex items-center justify-center">
              <div className="absolute inset-0 bg-emerald-500/10 rounded-full blur-md animate-pulse" />
              <div className="relative w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                <Settings className="w-5 h-5 text-emerald-400" />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
