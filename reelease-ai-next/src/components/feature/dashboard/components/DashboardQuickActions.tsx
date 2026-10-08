'use client'

import { Card } from '@/components/ui/card'
import { dashboardItemVariants, featureRoutes } from '@/data/dashboard'
import { iconMap } from '@/data/plan'
import { ROUTES } from '@/constants/routes'
import { motion } from 'framer-motion'
import { ArrowRight, Zap, SquarePen, Link as LinkIcon, Calendar, Image as ImageIcon } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import React, { useMemo } from 'react'

const generalActionIcons: Record<string, any> = {
  create_post: SquarePen,
  connect_channel: LinkIcon,
  view_calendar: Calendar,
  media_library: ImageIcon,
}

export const DashboardQuickActions = ({ aiFeatures, subscription, t }: any) => {
  const permittedFeatures = useMemo(() => {
    let list: any[] = []
    if (aiFeatures && Array.isArray(aiFeatures)) {
      list = aiFeatures
        .filter((feature: any) => {
          const aiFeaturesAccess = subscription?.plan_id?.ai_features
          if (!aiFeaturesAccess) return false
          return aiFeaturesAccess[feature.feature_key] !== false
        })
        .map((f: any) => ({
          display_name: f.display_name,
          feature_key: f.feature_key,
          href: featureRoutes[f.feature_key] || ROUTES.AI_TEMPLATES,
          isAi: true,
        }))
    }

    // Standard fallback actions to fill up the grid
    const standardActions = [
      {
        display_name: t('create_post', { defaultValue: 'Create Post' }),
        feature_key: 'create_post',
        href: ROUTES.SOCIAL_MEDIA.COMPOSER,
        isAi: false,
      },
      {
        display_name: t('connect_channel', { defaultValue: 'Connect Channel' }),
        feature_key: 'connect_channel',
        href: ROUTES.SOCIAL_MEDIA.CHANNELS,
        isAi: false,
      },
      {
        display_name: t('view_calendar', { defaultValue: 'View Calendar' }),
        feature_key: 'view_calendar',
        href: ROUTES.SOCIAL_MEDIA.CALENDAR,
        isAi: false,
      },
      {
        display_name: t('media_library', { defaultValue: 'Media Library' }),
        feature_key: 'media_library',
        href: ROUTES.MEDIA_LIBRARY,
        isAi: false,
      },
    ]

    // Append standard actions until we have exactly 6 items
    const combined = [...list]
    for (const action of standardActions) {
      if (combined.length >= 6) break
      if (!combined.some((item) => item.feature_key === action.feature_key)) {
        combined.push(action)
      }
    }

    return combined.slice(0, 6)
  }, [aiFeatures, subscription, t])

  return (
    <motion.section className="h-[340px]" variants={dashboardItemVariants}>
      <Card className="relative h-full glass-card glass-dark-card overflow-hidden rounded-border-radius  gradient-border border border-glass-border p-4 sm:p-5 flex flex-col gap-5 ">
        <div className="space-y-1.5 relative z-10">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-full primary-btn border border-primary/20">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-title-color dark:text-white mb-0 tracking-tight flex items-center gap-2">
                {t('quick_actions', { defaultValue: 'Quick Actions' })}
              </h3>
              <p className="text-sm text-subtitle-color font-medium leading-relaxed line-clamp-1">
                {t('quick_actions_desc', { defaultValue: 'Jump straight into your daily tasks.' })}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 2xl:grid-cols-2 gap-3  relative z-10 justify-center  mt-2 overflow-auto no-scrollbar">
          {permittedFeatures.length > 0 ? (
            permittedFeatures.map((feature: any, index: number) => {
              const href = feature.href || ROUTES.AI_TEMPLATES
              const isAi = feature.isAi

              let iconElement = null
              if (isAi) {
                const iconData = iconMap[feature.feature_key] || Zap
                if (typeof iconData === 'string') {
                  iconElement = (
                    <Image
                      src={iconData}
                      width={20}
                      height={20}
                      unoptimized
                      className="w-5 h-5 object-contain"
                      alt={feature.display_name}
                    />
                  )
                } else {
                  iconElement = React.createElement(iconData, { className: 'w-5 h-5' })
                }
              } else {
                const IconComponent = generalActionIcons[feature.feature_key] || Zap
                iconElement = <IconComponent className="w-5 h-5 text-white" />
              }

              return (
                <Link key={index} href={href}>
                  <div className="flex  backdrop-blur-3xl  items-center justify-between p-2 rounded-xl border border-glass-border dark:bg-white/5 hover:border-primary/20 transition-all duration-300 group cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full primary-btn flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                        {iconElement}
                      </div>
                      <span className="text-sm font-bold text-title-color dark:text-white group-hover:text-primary transition-colors">
                        {feature.display_name}
                      </span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-subtitle-color group-hover:text-primary transition-all group-hover:translate-x-1" />
                  </div>
                </Link>
              )
            })
          ) : (
            <div className="col-span-3 py-12">
              <p className="text-base text-subtitle-color text-center ">
                {t('no_quick_actions', { defaultValue: 'No quick actions available.' })}
              </p>
            </div>
          )}
        </div>
      </Card>
    </motion.section>
  )
}
