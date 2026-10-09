'use client'

import { Button } from '@/components/ui/button'
import { ROUTES } from '@/constants/routes'
import { useSectionRefs } from '@/context/SectionRefsContext'
import { navLinks } from '@/data/landing'
import LanguageDropdown from '@/layout/header/LanguageDropdown'
import { cn } from '@/lib/utils'
import { scrollToAnchor } from '@/utils/counter'
import { AnimatePresence, motion } from 'framer-motion'
import { Menu, X } from 'lucide-react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import useSettings from '@/hooks/useSettings'
import { getMediaUrl } from '@/utils'

export default function LandingHeader() {
  const { sectionRefs } = useSectionRefs()
  const router = useRouter()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [activeHash, setActiveHash] = useState('')
  const { t } = useTranslation()
  const { settings } = useSettings()

  const landingLogoUrl = settings?.logo_dark_url ? getMediaUrl(settings.logo_dark_url) : '/images/dark-logo1.png'

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 50)

      const offsets = navLinks.map((l) => {
        const key = l.href.replace('#', '')
        const el = sectionRefs.current[key]
        if (!el) return { href: l.href, top: Infinity }

        const rect = el.getBoundingClientRect()
        return { href: l.href, top: rect.top + window.scrollY }
      })

      const current = offsets.filter((o) => o.top <= window.scrollY + 200).pop()
      setActiveHash(current?.href ?? '')
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [sectionRefs])

  const bodyRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    bodyRef.current = document.body
  }, [])

  useEffect(() => {
    if (bodyRef.current) {
      bodyRef.current.style.overflow = isMenuOpen ? 'hidden' : ''
    }
    return () => {
      if (bodyRef.current) {
        bodyRef.current.style.overflow = ''
      }
    }
  }, [isMenuOpen])

  const closeMenu = useCallback(() => setIsMenuOpen(false), [])

  return (
    <>
      <header
        className={cn(
          'fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-in-out',
          scrolled ? 'bg-dark-deep/95 backdrop-blur-md shadow-lg py-5' : 'bg-transparent py-5',
        )}
      >
        <div className=" mx-auto flex items-center justify-between px-4 sm:px-6 lg:px-15">
          {/* Logo */}
          <div className="flex items-center shrink-0">
            <Button
              className="flex items-center gap-2 cursor-pointer group outline-none bg-[unset]! p-0!"
              onClick={() => router.push('/')}
              aria-label="Go to home"
            >
              <Image
                src={landingLogoUrl as string}
                alt={settings?.app_name || "Logo"}
                width={10}
                height={10}
                className={cn(
                  'h-7 sm:h-9 md:h-10 w-auto object-contain transition-all duration-300 scale-100',
                  scrolled ? 'scale-95' : 'scale-100',
                )}
                unoptimized
              />
            </Button>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8 xl:gap-10 mx-auto" aria-label="Main navigation">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={(e) => {
                  e.preventDefault()
                  scrollToAnchor(link.href, undefined, sectionRefs.current[link.href.replace('#', '')])
                }}
                className={cn(
                  'text-[16px] font-bold transition-all duration-300 relative py-2',
                  activeHash === link.href ? 'text-primary' : 'text-white hover:text-white',
                )}
              >
                {t(link.label)}
                <span className={cn()} />
              </a>
            ))}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Language Dropdown */}
            <div className="hidden sm:block">
              <LanguageDropdown />
            </div>

            <Button
              className="hidden md:inline-flex items-center justify-center h-10 px-6! text-[15px] font-bold rounded-full text-white! bg-white/5 border border-white/10 transition-colors"
              onClick={() => router.push(ROUTES.AUTH.LOGIN)}
            >
              {t('sign_in')}
            </Button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push(ROUTES.AUTH.REGISTER)}
              className="flex items-center justify-center px-4 sm:px-6 py-2 sm:py-2.5 rounded-full primary-btn text-white font-bold text-[12px] sm:text-sm transition-all"
            >
              {t('get_started')}
            </motion.button>

            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              className="lg:hidden p-2! h-10! w-10! rounded-full text-white/70 hover:text-white hover:bg-white/10"
              onClick={() => setIsMenuOpen((v) => !v)}
              aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </Button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm lg:hidden"
              onClick={closeMenu}
            />

            <motion.div
              key="drawer"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 w-full max-w-[300px] z-[70] bg-dark-deep/95 backdrop-blur-xl lg:hidden shadow-2xl overflow-y-auto border-l border-white/10 custom-scrollbar"
            >
              <div className="flex flex-col h-full p-5">
                <div className="flex items-center justify-between mb-8">
                  <Image
                    src={landingLogoUrl as string}
                    alt={settings?.app_name || "Logo"}
                    width={120}
                    height={32}
                    className="h-7 sm:h-8 w-auto object-contain"
                    unoptimized
                  />
                  <Button
                    variant="ghost"
                    onClick={closeMenu}
                    className="p-2! h-10! w-10! rounded-full text-white/50 hover:text-white"
                  >
                    <X size={24} />
                  </Button>
                </div>



                <nav className="flex flex-col gap-2 mb-8">
                  {navLinks.map((link) => (
                    <a
                      key={link.label}
                      href={link.href}
                      onClick={(e) => {
                        e.preventDefault()
                        scrollToAnchor(link.href, closeMenu, sectionRefs.current[link.href.replace('#', '')])
                      }}
                      className={cn(
                        'flex items-center px-4 py-3 rounded-xl text-base font-bold transition-all',
                        activeHash === link.href
                          ? 'bg-primary/10 text-primary'
                          : 'text-white/60 hover:text-white hover:bg-white/5',
                      )}
                    >
                      {t(link.label)}
                    </a>
                  ))}
                </nav>

                <div className="flex flex-col gap-4 mt-auto">
                  <Button
                    variant="ghost"
                    className="w-full h-12 rounded-full text-white/70 font-bold border border-white/10"
                    onClick={() => {
                      closeMenu()
                      router.push(ROUTES.AUTH.LOGIN)
                    }}
                  >
                    {t('sign_in')}
                  </Button>
                  <Button
                    onClick={() => {
                      closeMenu()
                      router.push(ROUTES.AUTH.REGISTER)
                    }}
                    className="w-full h-12 rounded-full primary-btn text-white! font-bold"
                  >
                    {t('get_started_free')}
                  </Button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
