'use client'

import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'

export function PlatformTabs({ displayPlatforms, activeTab, setActiveTab }: any) {
  return (
    <div className="flex flex-wrap xl:flex-wrap 2xl:flex-nowrap gap-2 mb-10 p-1.5 bg-white/5 rounded-lg w-fit border border-white/10">
      {displayPlatforms.map((platform: any) => (
        <Button
          key={platform.id}
          onClick={() => setActiveTab(platform.id)}
          className={`relative flex items-center gap-2 px-6 py-2.5 rounded-xl transition-all duration-300 ${activeTab === platform.id ? 'text-white!' : 'text-white! hover:text-white/60'
            }`}
        >
          {activeTab === platform.id && (
            <motion.div
              layoutId="activePlatform"
              className="absolute inset-0 bg-secondary rounded-xl"
              transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
              style={{ backgroundColor: platform.color }}
            />
          )}
          <platform.icon className={`relative z-10 w-4 h-4 ${activeTab === platform.id ? 'text-white' : ''}`} />
          <span className="relative z-10 font-semibold text-sm">{platform.name}</span>
        </Button>
      ))}
    </div>
  )
}
