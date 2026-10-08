import { useSectionRefs } from '@/context/SectionRefsContext'
import { motion, AnimatePresence } from 'framer-motion'
import { Instagram, Facebook, Linkedin, Youtube, Sparkles } from 'lucide-react'
import { XIcon as Twitter } from '@/components/ui/XIcon'
import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { platformContent } from '@/data/landing'
import { PlatformTabs } from './showcase/PlatformTabs'
import { PlatformContent } from './showcase/PlatformContent'
import { PlatformMockup } from './showcase/PlatformMockup'
import { DynamicPlatform, LandingPageData } from '@/types/landing'
import { ThreadsIcon } from '../ui/threadsIcon'

export default function SocialMediaShowcase({ data }: { data?: LandingPageData['social'] }) {
  const { t } = useTranslation()
  const { registerRef } = useSectionRefs()

  // Use data from props if available, otherwise use hardcoded platforms
  const dynamicPlatforms = data?.platforms || []
  const initialTab = (dynamicPlatforms.length > 0
    ? dynamicPlatforms[0]?.name
    : 'instagram').toLowerCase()

  const [activeTab, setActiveTab] = useState(initialTab)

  // Update active tab when dynamic platforms load
  useEffect(() => {
    if (dynamicPlatforms.length > 0) {
      setActiveTab(dynamicPlatforms[0]?.name?.toLowerCase())
    }
  }, [dynamicPlatforms])

  // Merge dynamic content with static content (gradients, colors, icons)
  const getPlatformConfig = (id: string) => {
    const staticConfig = platformContent[id as keyof typeof platformContent] || platformContent.instagram
    const dynamicConfig = dynamicPlatforms.find((p: DynamicPlatform) => p.name?.toLowerCase() === id)

    if (dynamicConfig) {
      return {
        ...staticConfig,
        badge: dynamicConfig.badge || staticConfig.badge,
        title: dynamicConfig.title || staticConfig.title,
        highlight: dynamicConfig.highlight || staticConfig.highlight,
        description: dynamicConfig.description || staticConfig.description,
        features: dynamicConfig.features?.length > 0
          ? dynamicConfig.features.map((f: { title: string, description: string, image_id?: any }, i: number) => ({
            title: f.title,
            description: f.description,
            image_id: f.image_id,
            icon: staticConfig.features[i]?.icon || Sparkles
          }))
          : staticConfig.features
      }
    }
    return staticConfig
  }

  const currentContent = getPlatformConfig(activeTab)

  const getPlatformIcon = (id: string) => {
    switch (id) {
      case 'facebook': return Facebook
      case 'linkedin': return Linkedin
      case 'youtube': return Youtube
      case 'twitter': return Twitter
      case 'threads': return ThreadsIcon
      case 'instagram':
      default: return Instagram
    }
  }

  const getPlatformColor = (id: string) => {
    switch (id) {
      case 'facebook': return '#1877F2'
      case 'linkedin': return '#0A66C2'
      case 'youtube': return '#FF0000'
      case 'twitter': return '#1DA1F2'
      case 'threads': return '#000000'
      case 'instagram':
      default: return '#E1306C'
    }
  }

  const displayPlatforms = dynamicPlatforms.length > 0
    ? dynamicPlatforms.map((p: DynamicPlatform) => ({
      id: p.name?.toLowerCase(),
      name: p.name,
      icon: getPlatformIcon(p.name?.toLowerCase() || ''),
      color: getPlatformColor(p.name?.toLowerCase() || '')
    }))
    : [
      { id: 'instagram', name: 'Instagram', icon: Instagram, color: '#E1306C' },
      { id: 'facebook', name: 'Facebook', icon: Facebook, color: '#1877F2' },
      { id: 'linkedin', name: 'LinkedIn', icon: Linkedin, color: '#0A66C2' },
      { id: 'twitter', name: 'Twitter', icon: Twitter, color: '#1DA1F2' },
      { id: 'youtube', name: 'YouTube', icon: Youtube, color: '#FF0000' },
      { id: 'threads', name: 'Threads', icon: ThreadsIcon, color: '#000000' },
    ]

  return (
    <section
      id="social"
      ref={(el) => registerRef('social', el)}
      className="relative py-24 md:py-30 bg-light-body"
    >
      <div className="container mx-auto px-6">
        <div className="flex flex-col lg:flex-row gap-16 items-center justify-center">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="flex-1 text-left"
          >
            <PlatformTabs
              displayPlatforms={displayPlatforms}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
            />

            <AnimatePresence mode="wait">
              <PlatformContent
                currentContent={currentContent}
                activeTab={activeTab}
                t={t}
              />
            </AnimatePresence>
          </motion.div>

          <PlatformMockup activeTab={activeTab} currentContent={currentContent} />
        </div>
      </div>

      <style jsx>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        :global(.swiper-pagination-bullet) {
          background: rgba(255, 255, 255, 0.4) !important;
        }
        :global(.swiper-pagination-bullet-active) {
          background: white !important;
        }
      `}</style>
    </section>
  )
}
