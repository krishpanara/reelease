'use client'
import { ROUTES } from '@/constants/routes'
import useSettings from '@/hooks/useSettings'
import LanguageDropdown from '@/layout/header/LanguageDropdown'
import ThemeDropdown from '@/layout/header/ThemeDropdown'
import { RootState } from '@/redux/store'
import { getMediaUrl } from '@/utils'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import React, { useEffect } from 'react'
import { useSelector } from 'react-redux'
import { useTheme } from 'next-themes'
import { Sun, MoonStar } from 'lucide-react'
import { cn } from '@/lib/utils'


const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  const [mounted, setMounted] = React.useState(false)
  const router = useRouter()

  useEffect(() => {
    setTimeout(() => {
      setMounted(true)
    }, 0)
  }, [])

  const { isAuthenticated, isLoading } = useSelector((state: RootState) => state.auth)
  const { settings } = useSettings()
  const { resolvedTheme, setTheme } = useTheme()

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push(ROUTES.DASHBOARD)
    }
  }, [isLoading, isAuthenticated, router])

  const isDark = resolvedTheme === 'dark'
  const darkExpanded = settings?.logo_dark_url ? getMediaUrl(settings.logo_dark_url) : '/images/dark-logo1.png'
  const lightExpanded = settings?.logo_light_url ? getMediaUrl(settings.logo_light_url) : '/images/light-logo1.png'
  const displayLogo = !mounted ? darkExpanded : (isDark ? darkExpanded : lightExpanded)

  if (isLoading || isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="h-10 w-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen w-full flex bg-[#F8F9FE] dark:bg-black overflow-hidden relative transition-colors duration-700">

      {/* Full Screen Background Layer */}
      <div className="absolute inset-0 z-0 pointer-events-none w-full h-full">
        <Image
          src={!mounted ? '/images/auth/bg.png' : (isDark ? '/images/auth/dark/darkbg.png' : '/images/auth/bg.png')}
          alt="background"
          fill
          className="object-cover"
          priority
        />
      </div>

      {/* Top Right Controls */}
      <div className="absolute top-6 right-6 lg:right-12 flex items-center gap-3 z-40">
        <LanguageDropdown variant="auth" />

        {/* Custom Theme Switcher Pill */}
        <div className="flex items-center gap-1 h-10 px-1 rounded-full border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 backdrop-blur-2xl shadow-sm shrink-0">
          <button
            type="button"
            onClick={() => setTheme('light')}
            title="Light Mode"
            className={cn(
              "flex items-center justify-center w-8 h-8 rounded-full transition-all duration-300 cursor-pointer",
              resolvedTheme === 'light'
                ? "primary-btn text-white!"
                : "text-gray-400 dark:text-white/40 hover:text-gray-600 dark:hover:text-white/60"
            )}
          >
            <Sun className="w-4.5 h-4.5" />
          </button>
          <button
            type="button"
            onClick={() => setTheme('dark')}
            title="Dark Mode"
            className={cn(
              "flex items-center justify-center w-8 h-8 rounded-full transition-all duration-300 cursor-pointer",
              resolvedTheme === 'dark'
                ? "bg-[#ECE9FF] dark:bg-white/10 text-primary dark:text-white"
                : "text-gray-400 dark:text-white/40 hover:text-gray-600 dark:hover:text-white/60"
            )}
          >
            <MoonStar className="w-4.5 h-4.5" />
          </button>
        </div>
      </div>

      {/* Left Column (Illustration & Graphics) - Hidden on Mobile */}
      <div className="hidden lg:flex flex-1 flex-col items-center justify-center relative z-10 p-6 xl:p-12 lg:w-1/2">
        <div className="relative w-full max-w-[700px] aspect-square flex items-center justify-center">

          {/* Rounded glow/background behind bot */}
          <div className="absolute -left-[30%] -top-[30%] w-[210%] h-[180%] z-10 opacity-60 dark:opacity-30">
            <Image
              src={!mounted ? '/images/auth/rounded.png' : (isDark ? '/images/auth/dark/darkrounded.png' : '/images/auth/rounded.png')}
              alt="Glow"
              fill
              className="object-contain"
              priority
            />
          </div>

          {/* Social Icons exactly positioned with smooth floating animations */}
          <motion.div
            className="absolute left-[15%] top-[0%] w-[21.4%] aspect-square z-20"
            animate={{ y: [0, -12, 0] }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <Image
              src={!mounted ? '/images/auth/x.png' : (isDark ? '/images/auth/dark/xl.png' : '/images/auth/x.png')}
              alt="X (Twitter)"
              fill
              className="object-contain drop-shadow-xl"
            />
          </motion.div>

          <motion.div
            className="absolute left-[38%] top-[0%] w-[21.4%] aspect-square z-20"
            animate={{ y: [0, -10, 0] }}
            transition={{
              duration: 3.6,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.3
            }}
          >
            <Image
              src="/images/auth/threds.png"
              alt="Threads"
              fill
              className="object-contain drop-shadow-xl"
            />
          </motion.div>

          <motion.div
            className="absolute right-[20%] top-[13%] w-[42.8%] aspect-[15/13] z-30"
            animate={{ y: [0, -15, 0] }}
            transition={{
              duration: 4.5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.5
            }}
          >
            <Image
              src={!mounted ? '/images/auth/youtube.png' : (isDark ? '/images/auth/dark/you.png' : '/images/auth/youtube.png')}
              alt="YouTube"
              fill
              className="object-contain drop-shadow-xl"
            />
          </motion.div>

          <motion.div
            className="absolute -left-[1%] top-[20%] w-[24.3%] aspect-square z-30"
            animate={{ y: [0, -10, 0] }}
            transition={{
              duration: 3.8,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.2
            }}
          >
            <Image
              src={!mounted ? '/images/auth/facebook.png' : (isDark ? '/images/auth/dark/facebook.png' : '/images/auth/facebook.png')}
              alt="Facebook"
              fill
              className="object-contain drop-shadow-xl"
            />
          </motion.div>

          <motion.div
            className="absolute -left-[4%] lg:-left-[5%] xl:-left-[8%] 2xl:-left-[15%] top-[40%] w-[27.1%] aspect-square z-20"
            animate={{ y: [0, -14, 0] }}
            transition={{
              duration: 4.2,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.8
            }}
          >
            <Image
              src={!mounted ? '/images/auth/instagram.png' : (isDark ? '/images/auth/dark/insta.png' : '/images/auth/instagram.png')}
              alt="Instagram"
              fill
              className="object-contain drop-shadow-xl"
            />
          </motion.div>

          <motion.div
            className="absolute -left-[2%] lg:-left-[2%] xl:-left-[5%] 2xl:-left-[10%] bottom-[10%] w-[28.5%] aspect-square z-30"
            animate={{ y: [0, -8, 0] }}
            transition={{
              duration: 3.5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.4
            }}
          >
            <Image
              src={!mounted ? '/images/auth/linkdin.png' : (isDark ? '/images/auth/dark/in.png' : '/images/auth/linkdin.png')}
              alt="LinkedIn"
              fill
              className="object-contain drop-shadow-xl"
            />
          </motion.div>

          {/* Floating Mobile Phone */}
          <div className="absolute right-[-15%] lg:right-[-8%] xl:right-[-12%] 2xl:right-[-15%] top-[13%] w-[48.5%] lg:w-[42%] xl:w-[45%] 2xl:w-[48.5%] aspect-[17/25] z-20">
            <Image
              src={!mounted ? '/images/auth/moblie.png' : (isDark ? '/images/auth/dark/mob.png' : '/images/auth/moblie.png')}
              alt="Mobile UI"
              fill
              className="object-contain drop-shadow-2xl"
            />
          </div>

          {/* Main Bot & Laptop Image */}
          <div className="absolute -bottom-[15%] z-40 w-[82%] aspect-[576/527] left-[9%] lg:left-[14%] xl:left-[12%] 2xl:left-[9%]">
            <Image
              src={!mounted ? '/images/auth/bot.png' : (isDark ? '/images/auth/dark/bot.png' : '/images/auth/bot.png')}
              alt="Social Ominfinitive Bot"
              fill
              className="object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,0.15)]"
              priority
            />
          </div>
        </div>
      </div>

      {/* Right Column (Form Area) */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-8 relative z-20">

        {/* Auth Card Container */}
        <motion.div
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-[480px]"
        >


          {/* Form wrapper */}
          <div className="rounded-[24px] sm:px-10 sm:py-10 p-4 bg-white dark:bg-white/5 backdrop-blur-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 dark:border-gray-800">
            {/* Logo at top of card */}
            {displayLogo && (
              <div className="flex justify-center mb-6">
                <Image
                  src={displayLogo}
                  alt={settings?.app_name || 'Logo'}
                  width={160}
                  height={48}
                  className="h-10 w-auto object-contain"
                  unoptimized
                  priority
                />
              </div>
            )}
            {children}
          </div>
        </motion.div>
      </div>

    </div>
  )
}

export default AuthLayout
