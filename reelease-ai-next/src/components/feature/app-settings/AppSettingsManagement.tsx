'use client'

import CreditSettings from '@/components/feature/app-settings/CreditSettings'
import GeneralSettings from '@/components/feature/app-settings/GeneralSettings'
import LogoSettings from '@/components/feature/app-settings/LogoSettings'
import SocialSettings from '@/components/feature/app-settings/SocialSettings'
import { PageHeader } from '@/components/reusable/PageHeader'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAppDirection } from '@/hooks/useAppDirection'
import { cn } from '@/lib/utils'
import { Coins, Globe, Layout, Settings, Share2, Sparkles } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

export default function AppSettingsManagement() {
  const { t } = useTranslation()
  const router = useRouter()
  const searchParams = useSearchParams()
  const tab = searchParams.get('tab')
  const [activeTab, setActiveTab] = useState(tab || 'general')
  const [bubbleStyle, setBubbleStyle] = useState({ left: 0, width: 0, opacity: 0 })
  const tabsRef = useRef<Map<string, HTMLButtonElement | null>>(new Map())
  const direction = useAppDirection()

  useEffect(() => {
    const updateBubble = () => {
      const activeTrigger = tabsRef.current.get(activeTab)
      if (activeTrigger) {
        setBubbleStyle({
          left: activeTrigger.offsetLeft,
          width: activeTrigger.offsetWidth,
          opacity: 1,
        })
      }
    }

    updateBubble()
    window.addEventListener('resize', updateBubble)
    return () => window.removeEventListener('resize', updateBubble)
  }, [activeTab])

  useEffect(() => {
    const activeElement = tabsRef.current.get(activeTab)

    if (activeElement) {
      activeElement.scrollIntoView({
        behavior: 'smooth',
        inline: 'center',
        block: 'nearest',
      })
    }
  }, [activeTab])

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-0">
        <PageHeader
          icon={<Settings className="w-6 h-6 text-primary animate-pulse" />}
          title={t('settings_title')}
          subtitle={t('settings_desc', {
            defaultValue:
              'Configure core application preferences, maintenance controls, branding, and system integrations.',
          })}
          showBackButton={false}
        />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6" dir={direction}>
        <div className="z-20 pb-2 -mx-2 px-2 flex flex-col lg:flex-row items-center justify-between gap-4">
          <div className="flex-1 overflow-x-auto no-scrollbar w-full flex lg:justify-center justify-start">
            <TabsList className="h-14 w-max flex group relative p-1.5 border-none! rounded-border-radius bg-unset">
              <div
                className="absolute h-[calc(100%-12px)] top-1.5  text-white! rounded-[calc(var(--border-radius)-4px)] transition-all duration-500 "
                style={{
                  left: bubbleStyle.left,
                  width: bubbleStyle.width,
                  opacity: bubbleStyle.opacity,
                }}
              />
              <TabsTrigger
                value="general"
                ref={(el) => {
                  tabsRef.current.set('general', el)
                }}
                className={cn(
                  'shrink-0 px-4 sm:px-8 flex gap-2 items-center transition-all duration-300 font-bold text-xs relative z-10 h-full whitespace-nowrap cursor-pointer',
                  activeTab === 'general' ? 'primary-btn text-white!' : 'text-muted-foreground hover:text-foreground',
                )}
              >
                <Globe className="w-4 h-4" />
                {t('general')}
              </TabsTrigger>
              <TabsTrigger
                value="credits"
                ref={(el) => {
                  tabsRef.current.set('credits', el)
                }}
                className={cn(
                  'cursor-pointer px-4 sm:px-8 flex gap-2 items-center transition-all bg-transparent! shadow-none! duration-300 font-bold text-xs relative z-10 h-full whitespace-nowrap',
                  activeTab === 'credits' ? 'primary-btn text-white!' : 'text-muted-foreground hover:text-foreground',
                )}
              >
                <Coins className="w-4 h-4" />
                {t('credits', { defaultValue: 'Credits' })}
              </TabsTrigger>
              <TabsTrigger
                value="logos"
                ref={(el) => {
                  tabsRef.current.set('logos', el)
                }}
                className={cn(
                  'cursor-pointer px-4 sm:px-8 flex gap-2 items-center transition-all bg-transparent! shadow-none! duration-300 font-bold text-xs relative z-10 h-full whitespace-nowrap',
                  activeTab === 'logos' ? 'primary-btn text-white!' : 'text-muted-foreground hover:text-foreground',
                )}
              >
                <Layout className="w-4 h-4" />
                {t('branding', { defaultValue: 'Branding' })}
              </TabsTrigger>
              <TabsTrigger
                value="social"
                ref={(el) => {
                  tabsRef.current.set('social', el)
                }}
                className={cn(
                  'cursor-pointer px-4 sm:px-8 flex gap-2 items-center  transition-all  duration-300 font-bold text-xs relative z-10 h-full whitespace-nowrap',
                  activeTab === 'social' ? 'primary-btn text-white!' : 'text-muted-foreground hover:text-foreground',
                )}
              >
                <Share2 className="w-4 h-4" />
                {t('social_integration', { defaultValue: 'Social Integration' })}
              </TabsTrigger>
            </TabsList>
          </div>
        </div>

        <TabsContent value="general" className="animate-in fade-in slide-in-from-left-4 duration-500 delay-100">
          <GeneralSettings />
        </TabsContent>
        <TabsContent value="credits" className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
          <CreditSettings />
        </TabsContent>
        <TabsContent value="logos" className="animate-in fade-in slide-in-from-right-4 duration-500 delay-100">
          <LogoSettings />
        </TabsContent>
        <TabsContent value="social" className="animate-in fade-in slide-in-from-right-4 duration-500 delay-100">
          <SocialSettings />
        </TabsContent>
      </Tabs>
    </div>
  )
}
