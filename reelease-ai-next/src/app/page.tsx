'use client'

import LandingBlog from '@/components/landing/LandingBlog'
import LandingContact from '@/components/landing/LandingContact'
import LandingFAQ from '@/components/landing/LandingFAQ'
import LandingFeatures from '@/components/landing/LandingFeatures'
import LandingFooter from '@/components/landing/LandingFooter'
import LandingHeader from '@/components/landing/LandingHeader'
import LandingHero from '@/components/landing/LandingHero'
import LandingPricing from '@/components/landing/LandingPricing'
import LandingScrollToTop from '@/components/landing/LandingScrollToTop'
import LandingTestimonials from '@/components/landing/LandingTestimonials'
import SocialMediaShowcase from '@/components/landing/SocialMediaShowcase'
import HowItWorks from '@/components/landing/HowItWorks'
import LandingCTA from '@/components/landing/LandingCTA'
import DataLoader from '@/components/reusable/DataLoader'
import { SectionRefsProvider } from '@/context/SectionRefsContext'
import { useGetLandingPageQuery } from '@/redux/api/landingPageApi'
import { ThemeProvider } from 'next-themes'

export default function Home() {
  const { data: landingData, isLoading } = useGetLandingPageQuery()

  if (isLoading) {
    return <DataLoader fullPage />
  }

  const landing_page = landingData?.landing_page

  return (
    <ThemeProvider attribute="class" forcedTheme="dark">
      <div className="dark min-h-screen bg-light-body text-foreground transition-colors duration-500">
        <SectionRefsProvider>
          <div className="min-h-screen bg-black text-white selection:bg-primary/30 selection:text-white overflow-clip">

            <LandingHeader />

            <main className="relative">
              <LandingHero data={landing_page?.hero} />

              <div className="relative">
                {/* Ambient Background Effects */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[1000px] bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />

                <LandingFeatures data={landing_page?.features} />
                <SocialMediaShowcase data={landing_page?.social} />
                <HowItWorks />
                <LandingPricing data={landing_page?.pricing} />
                <LandingBlog data={landing_page?.blog} />
                <LandingTestimonials data={landing_page?.testimonials} />
                <LandingFAQ data={landing_page?.faq} />
                <LandingContact data={landing_page?.contact} />
                <LandingCTA />
              </div>
            </main>

            <LandingFooter data={landing_page?.footer} />
            <LandingScrollToTop />
          </div>
        </SectionRefsProvider>
      </div>
    </ThemeProvider>
  )
}
