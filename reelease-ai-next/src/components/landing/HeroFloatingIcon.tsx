'use client'

import { HeroFloatingIconProps } from '@/types/landing'
import { motion, useSpring, useTransform, } from 'framer-motion'
import Image from 'next/image'



export function HeroFloatingIcon({
  icon: Icon, image, color, glowColor, top, bottom, left, right,
  range, yRange, xRange, delay,
  animateY, animateX, animateScale, animateRotate,
  scrollYProgress, springConfig
}: HeroFloatingIconProps) {
  const y = useSpring(useTransform(scrollYProgress, range, yRange), springConfig)
  const x = useSpring(useTransform(scrollYProgress, range, xRange), springConfig)
  const scale = useSpring(useTransform(scrollYProgress, range, [1, 0.6]), springConfig)
  const opacity = useSpring(useTransform(scrollYProgress, range, [1, 0]), springConfig)

  return (
    <motion.div
      style={{ y, x, scale, opacity, top, bottom, left, right }}
      className="absolute hidden lg:block z-0"
    >
      <motion.div
        animate={{
          y: animateY || 0,
          x: animateX || 0,
          scale: animateScale || 1,
          rotate: animateRotate || 0
        }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay }}
        className="relative group"
      >
        <div className={`absolute -inset-4 ${glowColor} blur-xl rounded-full opacity-30 group-hover:opacity-100 transition-opacity`} />
        <div className="p-5 rounded-full bg-white/5 border border-white/10 backdrop-blur-2xl shadow-2xl relative z-10 flex items-center justify-center">
          {image ? (
            <Image width={30} height={30} src={image} unoptimized alt="image" />
          ) : (
            <Icon className={`w-8 h-8 ${color}`} />
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}

