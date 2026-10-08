'use client'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ROUTES } from '@/constants/routes'
import { dashboardItemVariants } from '@/data/dashboard'
import { usePermission } from '@/hooks/usePermission'
import { useAppSelector } from '@/redux/hooks'
import { motion } from 'framer-motion'
import { BarChart3, Send, Sparkles, Wand2 } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useTranslation } from 'react-i18next'

export const DashboardWelcome = () => {
  const { t } = useTranslation()
  const { user } = useAppSelector((state) => state.auth)
  const { isAdmin } = usePermission()

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return t('good_morning', { defaultValue: 'Good Morning' })
    if (hour < 17) return t('good_afternoon', { defaultValue: 'Good Afternoon' })
    if (hour < 21) return t('good_evening', { defaultValue: 'Good Evening' })
    return t('good_night', { defaultValue: 'Good Night' })
  }

  return (
    <motion.section className="h-full" variants={dashboardItemVariants}>
      {/* Gradient border wrapper — 2px padding creates the border illusion */}
      <div
        className="h-full rounded-border-radius gradient-border light-no-border transition-all duration-500 bg-white dark:bg-transparent"
        style={{
          backgroundImage:
            'linear-gradient(to left, color-mix(in srgb, var(--primary) 8%, transparent) 0%, color-mix(in srgb, var(--secondary) 8%, transparent) 40%, transparent 100%)',
        }}
      >
        <Card className="relative h-full overflow-hidden rounded-border-radius bg-subcard dark:bg-slate-950/80 border-0 p-6 sm:p-8 flex flex-col justify-between gap-6">
          <Image
            src={'/images/bot.png'}
            alt={'Welcome'}
            width={350}
            height={350}
            unoptimized
            className="object-cover absolute bottom-10 top-20 2xl:top-15 right-0 rtl:left-0 rtl:right-auto opacity-20 sm:opacity-40 md:opacity-100 pointer-events-none rtl:-scale-x-100 sm:block hidden 2xl:block"
          />
          {/* <ZapIcon className="absolute top-25 left-160 w-38 h-38 opacity-10 sm:opacity-40 md:opacity-30 fill-primary/30 pointer-events-none animate-pulse" /> */}
          {/* ── Soft glow orbs (themed to primary/secondary) ── */}
          <div className="absolute -top-10 -left-10 w-48 h-48 rounded-full opacity-20 blur-3xl pointer-events-none dark:bg-primary" />
          <div className="absolute -bottom-10 -right-10 w-48 h-48 rounded-full opacity-15 blur-3xl pointer-events-none dark:bg-secondary" />

          {/* ── Dot grid ── */}
          <div
            className="absolute inset-0 opacity-[0.04] pointer-events-none"
            style={{
              backgroundImage: 'radial-gradient(circle, var(--primary) 1px, transparent 1px)',
              backgroundSize: '22px 22px',
            }}
          />

          {/* ── Main content ── */}
          <div className="relative z-10 flex flex-col justify-between gap-6 h-full w-full max-w-2xl">
            {/* Top Section */}
            <div className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm font-semibold text-primary/95 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-primary animate-pulse" />
                  <span>
                    {getGreeting()}, {user?.name}!
                  </span>
                </p>
                <h2 className="text-3xl sm:text-5xl max-w-[400px] font-extrabold  text-title-color leading-tight tracking-tight">
                  {t('one_tap_to_viral_content', { defaultValue: 'One Tap to Viral Content' })}
                  {/* <br /> */}
                </h2>
                <p className="text-sm sm:text-base text-subtitle-color font-medium leading-relaxed 2xl:max-w-[350px] xl:max-w-[500px] max-w-[400px]">
                  {t('generate_attention_grabbing_reels_instantly_using_the_latest_trends_and_aipowered_automation', { defaultValue: 'Generate attention-grabbing reels instantly using the latest trends and AI-powered automation.' })}
                </p>
              </div>
            </div>

            {/* Buttons Section */}
            <div className="flex flex-wrap items-center gap-4 mt-2">
              {isAdmin() ? (
                <Button
                  asChild
                  className="h-11 px-6 rounded-xl primary-btn text-white! font-bold text-sm shadow-lg border-0 cursor-pointer flex items-center gap-2 transition-all duration-300 hover:scale-105 active:scale-95 leading-none"
                >
                  <Link href={ROUTES.SOCIAL_MEDIA.COMPOSER}>
                    <Send className="w-4 h-4" />
                    <span>{t('publish_posts', { defaultValue: 'Publish Posts' })}</span>
                  </Link>
                </Button>
              ) : (
                <Button
                  asChild
                  className="h-11 px-6 rounded-xl primary-btn hover:opacity-90 text-white! font-bold text-sm shadow-lg border-0 cursor-pointer flex items-center gap-2 transition-all duration-300 hover:scale-105 active:scale-95 leading-none"
                >
                  <Link href={ROUTES.TEXT_TO_VIDEO}>
                    <Wand2 className="w-4 h-4" />
                    <span>{t('auto_generate_reel', { defaultValue: 'Auto-Generate Reel' })}</span>
                  </Link>
                </Button>
              )}
              <Button
                asChild
                variant="outline"
                className="h-11 px-6 rounded-xl  bg-light-body border border-black dark:border-white! dark:bg-slate-900/40 text-title-color  font-semibold text-sm cursor-pointer flex items-center gap-2 transition-all duration-300 hover:scale-105 active:scale-95 leading-none"
              >
                <Link href={ROUTES.SOCIAL_MEDIA.ANALYTICS}>
                  <BarChart3 className="w-4 h-4" />
                  <span>{t('view_analytics', { defaultValue: 'View Analytics' })}</span>
                </Link>
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </motion.section>
  )
}
