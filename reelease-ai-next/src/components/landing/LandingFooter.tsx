'use client'

import { navLinks } from '@/data/landing'
import useSettings from '@/hooks/useSettings'
import { getMediaUrl } from '@/utils'
import { motion } from 'framer-motion'
import { Facebook, Instagram, Linkedin, Mail, MapPin, Youtube } from 'lucide-react'
import { XIcon as Twitter } from '@/components/ui/XIcon'
import { WhatsAppIcon, whatsAppLink } from '@/components/ui/WhatsAppIcon'
import Image from 'next/image'
import Link from 'next/link'
import { useTranslation } from 'react-i18next'
import { useGetPublicPagesQuery } from '@/redux/api/pageApi'
import { LandingPageData } from '@/types/landing'
import { ThreadsIcon } from '../ui/threadsIcon'

export default function LandingFooter({ data }: { data?: LandingPageData['footer'] }) {
  const { t } = useTranslation()
  const { settings } = useSettings()
  const { data: pagesData } = useGetPublicPagesQuery()
  const pages = pagesData?.pages || []

  const landingLogoUrl = settings?.logo_dark_url ? getMediaUrl(settings.logo_dark_url) : '/images/dark-logo1.png'
  const phone = data?.phone || '+91 99794 57999'
  const email = data?.email || 'info@omfinitive.com'

  return (
    <footer className="relative border-t border-white/5 bg-primary/2 pt-12 md:pt-20 pb-8 md:pb-10">
      {/* Dot Grid Background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `url(./images/bg.png)`,
          width: '100%',
          height: '100%',
        }}
      />

      {/* Background Decorative Glows */}
      <div className="absolute bottom-[100px] left-1/2 -translate-x-1/2 w-[60%] h-[400px] bg-primary/15 rounded-full blur-[150PX] pointer-events-none" />
      <div className="absolute bottom-[60px] left-1/2 -translate-x-1/2 w-[40%] h-[200px] bg-secondary/10 rounded-full blur-[100px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        className="container mx-auto px-6 relative z-10"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 mb-8">
          <div className="space-y-6">
            <Link href="/" className="inline-block">
              <Image
                src={landingLogoUrl as string}
                alt={settings?.app_name || 'Logo'}
                width={10}
                height={10}
                className="h-10 w-auto object-contain transition-all duration-300"
                unoptimized
              />
            </Link>
            <p className="pt-10 text-white/60 text-sm leading-relaxed max-w-xs">{data?.tagline || t('footer_tagline')}</p>
            <div className="flex items-center gap-4">
              {data?.social_links?.map((social, i) => {
                const Icon =
                  {
                    Facebook,
                    Twitter,
                    Instagram,
                    Linkedin,
                    Youtube,
                    ThreadsIcon
                  }[social.icon] || Mail

                return (
                  <motion.a
                    key={i}
                    href={social.href}
                    whileHover={{ y: -3, scale: 1.1 }}
                    className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/60 hover:text-primary hover:border-primary/50 transition-all"
                  >
                    <Icon className="w-5 h-5" />
                  </motion.a>
                )
              })}
            </div>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6 text-sm">{t('platform')}</h4>
            <ul className="space-y-4">
              {navLinks.map((item) => (
                <li key={item?.label}>
                  <Link href={item.href} className="text-white/60 hover:text-primary transition-colors text-sm">
                    {t(item?.label)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {pages.length > 0 && (
            <div>
              <h4 className="text-white font-bold mb-6 text-sm">{t('company')}</h4>
              <ul className="space-y-4">
                {pages.map((page) => (
                  <li key={page.id || page._id}>
                    <Link
                      href={`/p/${page.slug}`}
                      className="text-white/60 hover:text-primary transition-colors text-sm"
                    >
                      {page.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div>
            <h4 className="text-white font-bold mb-6 text-sm">{t('contact')}</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 text-white/60 text-sm">
                <MapPin className="w-5 h-5 text-primary shrink-0" />
                <span>{data?.address || 'Africa • Qatar • USA'}</span>
              </li>
              <li>
                <a
                  href={whatsAppLink(phone)}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`WhatsApp ${phone}`}
                  className="flex items-center gap-3 text-white/60 hover:text-primary transition-colors text-sm"
                >
                  <WhatsAppIcon className="w-5 h-5 text-primary shrink-0" />
                  <span>{phone}</span>
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${email}`}
                  className="flex items-center gap-3 text-white/60 hover:text-primary transition-colors text-sm"
                >
                  <Mail className="w-5 h-5 text-primary shrink-0" />
                  <span>{email}</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-white/20 text-sm font-bold text-center md:text-left">
          <p className="max-w-sm md:max-w-none text-white/60 leading-relaxed">
            {data?.copyright || `© ${new Date().getFullYear()} Smart AI Content Generation Suite. ALL RIGHTS RESERVED.`}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8">
            <Link href="#" className="text-white/60 hover:text-white transition-colors">
              Terms of Service
            </Link>
            <Link href="#" className="text-white/60 hover:text-white transition-colors">
              Cookie Policy
            </Link>
          </div>
        </div> */}
      </motion.div>
    </footer>
  )
}
