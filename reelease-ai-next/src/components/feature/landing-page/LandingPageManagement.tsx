'use client'

import { PageHeader } from '@/components/reusable/PageHeader'
import { Button } from '@/components/ui/button'
import { TABS } from '@/data/landing'
import { Skeleton } from '@/components/ui/skeleton'
import { useGetLandingPageQuery, useUpdateLandingPageMutation } from '@/redux/api/landingPageApi'
import { LandingPageData } from '@/types/landing'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Globe,
  RefreshCw
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import BlogForm from './forms/BlogForm'
import ContactForm from './forms/ContactForm'
import FAQForm from './forms/FAQForm'
import FeaturesForm from './forms/FeaturesForm'
import FooterForm from './forms/FooterForm'
import HeroForm from './forms/HeroForm'
import PricingForm from './forms/PricingForm'
import SocialForm from './forms/SocialForm'
import TestimonialsForm from './forms/TestimonialsForm'

export default function LandingPageManagement() {
  const { t } = useTranslation()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('hero')
  const { data, isLoading, refetch } = useGetLandingPageQuery()
  const [updateLandingPage, { isLoading: isUpdating }] = useUpdateLandingPageMutation()

  const handleUpdate = async (section: keyof LandingPageData, values: any) => {
    try {
      await updateLandingPage({ [section]: values }).unwrap()
      toast.success(t('landing_page_updated_successfully'))
    } catch (err: any) {
      toast.error(err?.data?.message || t('something_went_wrong'))
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-8 animate-pulse p-1">
        {/* Page Header Skeleton */}
        <div className="space-y-2">
          <Skeleton className="w-64 h-8 bg-slate-200/80 dark:bg-white/10 rounded-lg" />
          <Skeleton className="w-[450px] max-w-full h-4 bg-slate-200/80 dark:bg-white/10 rounded" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Sidebar Tabs Skeleton */}
          <div className="lg:col-span-3">
            <div className="flex lg:flex-col overflow-x-auto lg:overflow-visible pb-4 lg:pb-0 gap-4">
              {Array.from({ length: 9 }).map((_, i) => (
                <Skeleton key={i} className="w-full h-[65px] bg-slate-200/80 dark:bg-white/10 rounded-[12px] shrink-0" />
              ))}
            </div>
          </div>

          {/* Content Area Skeleton */}
          <div className="lg:col-span-9">
            <div className="bg-white dark:bg-white/3 border border-glass-border rounded-border-radius p-4 md:p-6 space-y-6 h-[550px] flex flex-col justify-between">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 h-full">
                {/* Left Form Skeleton */}
                <div className="md:col-span-7 space-y-4">
                  <div className="space-y-2">
                    <Skeleton className="w-48 h-6 bg-slate-200/80 dark:bg-white/10 rounded" />
                    <Skeleton className="w-64 h-4 bg-slate-200/80 dark:bg-white/10 rounded" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="w-24 h-4 bg-slate-200/80 dark:bg-white/10 rounded" />
                    <Skeleton className="w-full h-11 bg-slate-200/80 dark:bg-white/10 rounded-xl" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="w-24 h-4 bg-slate-200/80 dark:bg-white/10 rounded" />
                    <Skeleton className="w-full h-11 bg-slate-200/80 dark:bg-white/10 rounded-xl" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="w-24 h-4 bg-slate-200/80 dark:bg-white/10 rounded" />
                    <Skeleton className="w-full h-24 bg-slate-200/80 dark:bg-white/10 rounded-xl" />
                  </div>
                </div>

                {/* Right Image/Viewport Skeleton */}
                <div className="md:col-span-5 flex flex-col justify-center items-center">
                  <div className="w-full h-[320px] bg-slate-200/80 dark:bg-white/10 rounded-[1.5rem] p-4 flex flex-col justify-between">
                    <Skeleton className="w-32 h-4 bg-slate-200/80 dark:bg-white/10 rounded" />
                    <Skeleton className="w-20 h-20 rounded-full bg-slate-200/80 dark:bg-white/10 mx-auto" />
                    <Skeleton className="w-40 h-4 bg-slate-200/80 dark:bg-white/10 rounded mx-auto" />
                  </div>
                </div>
              </div>

              {/* Save Button Skeleton */}
              <div className="flex justify-end pt-4 border-t border-glass-border shrink-0">
                <Skeleton className="w-36 h-11 bg-slate-200/80 dark:bg-white/10 rounded-xl" />
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const landingData = data?.landing_page

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        {/* <div className='flex items-center gap-3'>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold title-color leading-[1.5]">{t('manage_landing_page')}</h1>
          </div>
        </div> */}
        <PageHeader
          icon={<Globe className="w-6 h-6 text-primary animate-pulse" />}
          title={t('manage_landing_page')}
          subtitle={t('manage_landing_page_desc', { defaultValue: 'Manage your Landing Pages' })}
          showBackButton={false}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Sidebar Tabs */}
        <div className="lg:col-span-3">
          <div className="sticky top-4">
            <div className="flex lg:flex-col overflow-x-auto lg:overflow-visible pb-4 lg:pb-0 gap-4 custom-scrollbar -mx-4 px-4 lg:mx-0 lg:px-0">
              {TABS.map((tab) => (
                <Button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-none sm:h-17.5! h-12 justify-start lg:w-full flex items-center lg:items-start gap-3 lg:gap-4 p-3 lg:p-4 rounded-[12px]! text-left rtl:text-right group whitespace-nowrap lg:whitespace-normal ${
                    activeTab === tab.id
                      ? 'primary-btn  text-white! scale-100 z-10'
                      : ' border border-glass-border text-subtitle-color hover:border-primary/50 bg-white! dark:bg-white/3!'
                  }`}
                >
                  <div
                    className={`p-2 lg:p-2.5 rounded-radius transition-colors ${
                      activeTab === tab.id ? 'bg-black/10' : 'bg-white/5 group-hover:bg-primary/10'
                    }`}
                  >
                    <tab.icon
                      className={`w-4 h-4 lg:w-5 h-5 ${activeTab === tab.id ? 'text-white ' : 'text-primary'}`}
                    />
                  </div>
                  <div className="flex flex-col">
                    <span
                      className={`block font-bold text-xs lg:text-sm ${activeTab === tab.id ? ' text-white ' : 'text-title-color dark:text-white!'}`}
                    >
                      {t(tab.label.toLowerCase())}
                    </span>
                    <span
                      className={`hidden lg:block text-xs font-medium truncate ${
                        activeTab === tab.id ? 'text-white' : 'text-subtitle-color'
                      }`}
                    >
                      {t(tab.description.toLowerCase().replace(/ /g, '_'))}
                    </span>
                  </div>
                </Button>
              ))}
            </div>
          </div>
        </div>
        {/* Content Area */}
        <div className="lg:col-span-9">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="glass-card border border-glass-border rounded-border-radius p-4 md:p-6  overflow-hidden relative bg-white dark:bg-white/3 "
            >
              {activeTab === 'hero' && (
                <HeroForm
                  data={landingData?.hero}
                  isLoading={isUpdating}
                  onSubmit={(values) => handleUpdate('hero', values)}
                />
              )}
              {activeTab === 'features' && (
                <FeaturesForm
                  data={landingData?.features}
                  isLoading={isUpdating}
                  onSubmit={(values) => handleUpdate('features', values)}
                />
              )}
              {activeTab === 'social' && (
                <SocialForm
                  data={landingData?.social}
                  isLoading={isUpdating}
                  onSubmit={(values) => handleUpdate('social', values)}
                />
              )}
              {activeTab === 'pricing' && (
                <PricingForm
                  data={landingData?.pricing}
                  isLoading={isUpdating}
                  onSubmit={(values) => handleUpdate('pricing', values)}
                />
              )}
              {activeTab === 'blog' && (
                <BlogForm
                  data={landingData?.blog}
                  isLoading={isUpdating}
                  onSubmit={(values) => handleUpdate('blog', values)}
                />
              )}
              {activeTab === 'testimonials' && (
                <TestimonialsForm
                  data={landingData?.testimonials}
                  isLoading={isUpdating}
                  onSubmit={(values) => handleUpdate('testimonials', values)}
                />
              )}
              {activeTab === 'faq' && (
                <FAQForm
                  data={landingData?.faq}
                  isLoading={isUpdating}
                  onSubmit={(values) => handleUpdate('faq', values)}
                />
              )}
              {activeTab === 'contact' && (
                <ContactForm
                  data={landingData?.contact}
                  isLoading={isUpdating}
                  onSubmit={(values) => handleUpdate('contact', values)}
                />
              )}
              {activeTab === 'footer' && (
                <FooterForm
                  data={landingData?.footer}
                  isLoading={isUpdating}
                  onSubmit={(values) => handleUpdate('footer', values)}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
