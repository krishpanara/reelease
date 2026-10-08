'use client'

import LandingFooter from '@/components/landing/LandingFooter'
import LandingHeader from '@/components/landing/LandingHeader'
import { SectionRefsProvider } from '@/context/SectionRefsContext'
import { useGetLandingPageQuery } from '@/redux/api/landingPageApi'
import { useGetPublicPageBySlugQuery } from '@/redux/api/pageApi'
import DOMPurify from 'dompurify'
import { motion } from 'framer-motion'
import { Loader2 } from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'

export default function DynamicPage() {
  const params = useParams()
  const slug = params.slug as string

  const { data: pageData, isLoading: isPageLoading } = useGetPublicPageBySlugQuery(slug)
  const { data: landingData } = useGetLandingPageQuery()

  const page = pageData?.page
  const footerData = landingData?.landing_page?.footer

  const sanitizedContent = DOMPurify.sanitize(page?.content || '', {
    ALLOWED_TAGS: ['p', 'h1', 'h2', 'h3', 'h4', 'strong', 'ul', 'ol', 'li', 'br'],
  })

  if (isPageLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    )
  }

  if (!page) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white p-6">
        <h1 className="text-4xl font-bold mb-4">404</h1>
        <p className="text-white/60 mb-8">Page not found</p>
        <Link href="/" className="px-6 py-3 bg-primary text-black font-bold rounded-xl">
          Go Back Home
        </Link>
      </div>
    )
  }

  return (
    <SectionRefsProvider>
      <div className="min-h-screen bg-black text-white selection:bg-primary/30 selection:text-white">
        <LandingHeader />

        <main className="relative pt-32 pb-20">
          {/* Ambient Background Effects */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />

          <div className="container mx-auto px-6 max-w-4xl relative z-10">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
              <h1 className="text-4xl md:text-6xl font-bold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-white/50">
                {page.title}
              </h1>

              <div
                className="prose prose-invert prose-primary max-w-none 
                  prose-headings:text-white prose-p:text-white/70 prose-p:leading-relaxed 
                  prose-li:text-white/70 prose-strong:text-white prose-a:text-primary 
                  hover:prose-a:text-primary/80 transition-colors"
                dangerouslySetInnerHTML={{ __html: sanitizedContent }}
              />
            </motion.div>
          </div>
        </main>

        <LandingFooter data={footerData} />
      </div>
    </SectionRefsProvider>
  )
}
