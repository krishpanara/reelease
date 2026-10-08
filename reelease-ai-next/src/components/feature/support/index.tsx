'use client'

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { usePermission } from '@/hooks/usePermission'
import { useGetFaqsQuery } from '@/redux/api/faqApi'
import { useGetPublicPagesQuery } from '@/redux/api/pageApi'
import DOMPurify from 'dompurify'
import { FileText, HelpCircle, MessageCircle } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ContactInquiryModal } from './ContactInquiryModal'
import { ROUTES } from '@/constants/routes'

export function SupportFaqClient() {
  const { t } = useTranslation()
  const { hasPermission } = usePermission()
  const canCreateInquiries = hasPermission('create.inquiries')
  const [activeTab, setActiveTab] = useState('faq')
  const [isInquiryModalOpen, setIsInquiryModalOpen] = useState(false)

  const handleTabClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'center',
    })
  }

  const { data: faqData, isLoading: isLoadingFaqs } = useGetFaqsQuery({
    status: true,
  })

  const { data: pageData } = useGetPublicPagesQuery()

  const faqs = faqData?.faqs || []
  const pages = pageData?.pages || []

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      <div className="flex-1 min-w-0 space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="w-full overflow-hidden mb-6 rounded-full ">
            <TabsList className="border-glass-border mx-0.5 p-1.5 h-13 flex items-center justify-start rtl:justify-end dark:bg-white/3 overflow-x-auto no-scrollbar scroll-smooth w-full shadow-none bg-white">
              <TabsTrigger
                value="faq"
                onClick={handleTabClick}
                className="relative rtl:order-2 data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:dark:text-black  data-[state=active]:shadow-[0_0_20px_rgba(147,197,253,0.3)]  text-muted-foreground rounded-full px-6 py-2.5 h-full border-none transition-all duration-500 flex items-center gap-2.5 font-bold group whitespace-nowrap shrink-0"
              >
                <HelpCircle className="w-5 rtl:order-1 h-5 transition-transform group-hover:rotate-12 shrink-0" />
                <span className="relative z-10">{t('faq', { defaultValue: 'FAQ' })}</span>
              </TabsTrigger>
              {pages.map((page) => (
                <TabsTrigger
                  key={page.id}
                  value={page.slug}
                  onClick={handleTabClick}
                  className="relative data-[state=active]:bg-primary dark:data-[state=active]:text-black data-[state=active]:text-white data-[state=active]:shadow-[0_0_20px_rgba(147,197,253,0.3)]  text-muted-foreground rounded-full px-6 py-2.5 h-full border-none transition-all duration-500 flex items-center gap-2.5 font-bold group whitespace-nowrap shrink-0"
                >
                  <FileText className="w-5 h-5 transition-transform group-hover:scale-110 shrink-0" />
                  <span className="relative z-10">{page.title}</span>
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          <TabsContent value="faq" className="mt-0 focus-visible:outline-none">
            {isLoadingFaqs ? (
              <div className="space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-16 rounded-2xl bg-muted/10 animate-pulse" />
                ))}
              </div>
            ) : faqs.length > 0 ? (
              <Accordion type="single" collapsible className="space-y-5">
                {faqs.map((faq) => (
                  <AccordionItem
                    key={faq.id}
                    value={faq.id}
                    className="rounded-border-radius overflow-hidden sm:px-6 px-4 glass-card transition-all hover:border-primary/30 group/item border-transparent"
                  >
                    <AccordionTrigger className="hover:no-underline py-3 data-[state=open]:pb-2 rtl:flex-row-reverse  cursor-pointer">
                      <div className="flex items-center  rtl:flex-row-reverse gap-5 text-left w-full">
                        <div className="w-10 h-10 rounded-radius bg-primary/10 text-primary flex items-center justify-center shrink-0 group-hover/item:bg-primary group-hover/item:text-white transition-all duration-300">
                          <HelpCircle className="h-5 w-5" />
                        </div>
                        <span className="text-lg font-semibold text-title-color dark:text-white transition-colors break-all whitespace-normal line-clamp-2">
                          {faq.title}
                        </span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pb-6 pt-2 text-subtitle-color text-base leading-relaxed pl-[3.75rem] opacity-90">
                      <p className="line-clamp-3">{faq.description}</p>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            ) : (
              <Card className="p-16 text-center bg-muted/5 border-dashed border-2 rounded-3xl">
                <HelpCircle className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                <p className="text-muted-foreground text-lg">{t('no_faqs_found')}</p>
              </Card>
            )}
          </TabsContent>

          {pages.map((page) => {
            const rawSanitized = DOMPurify.sanitize(page?.content || '', {
              ALLOWED_TAGS: ['p', 'h1', 'h2', 'h3', 'h4', 'strong', 'ul', 'ol', 'li', 'br'],
            })
            const cleanedContent = rawSanitized.replace(/(?:<p>\s*(?:<br\s*\/?>|&nbsp;)?\s*<\/p>|<br\s*\/?>|\s)+$/gi, '')

            return (
              <TabsContent key={page.id} value={page.slug} className="mt-0 focus-visible:outline-none">
                <Card className="sm:p-6 p-4 rounded-border-radius glass-card border-glass-border shadow-xl">
                  <div
                    className="prose dark:prose-invert max-w-none text-subtitle-color prose-headings:text-title-color dark:prose-headings:text-white prose-p:leading-relaxed"
                    dangerouslySetInnerHTML={{
                    __html: DOMPurify.sanitize(page?.content || '', {
                      ALLOWED_TAGS: ['p', 'h1', 'h2', 'h3', 'h4', 'strong', 'ul', 'ol', 'li', 'br'],
                    }),
                    }}
                  />
                </Card>
              </TabsContent>
            )
          })}
        </Tabs>
      </div>

      <div className="w-full lg:w-80 shrink-0">
        {canCreateInquiries ? (
          <Card className="sm:p-6 p-4 rounded-3xl glass-card border-glass-border  space-y-6 relative overflow-hidden group">
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/10 rounded-full blur-3xl group-hover:bg-primary/20 transition-all duration-500" />
            <div className="space-y-3 relative z-10">
              <h3 className="text-xl font-bold text-title-color dark:text-white flex items-center gap-2">
                <MessageCircle className="w-6 h-6 text-primary" />
                {t('contact_support_title', { defaultValue: 'Contact Support' })}
              </h3>
              <p className="text-sm text-subtitle-color leading-relaxed opacity-80">
                {t('contact_support_sidebar_desc', {
                  defaultValue: "Can't find what you're looking for? Our support team is here to help you.",
                })}
              </p>
            </div>
            <Button
              className="w-full h-12 rounded-radius primary-btn text-white! font-medium text-sm flex items-center justify-center gap-2"
              onClick={() => setIsInquiryModalOpen(true)}
            >
              {t('manage_inquiries', { defaultValue: 'Manage Inquiries' })}
              <MessageCircle className="w-5 h-5 transition-transform group-hover:scale-110" />
            </Button>
          </Card>
        ) : (
          <Card className="sm:p-6 p-4 rounded-3xl glass-card border-glass-border  space-y-6 relative overflow-hidden group bg-transparent">
            <div className="space-y-3 relative z-10">
              <h3 className="text-[17px] font-bold  dark:text-white flex items-center gap-2">
                {t('pages_management_title', { defaultValue: 'Pages Management' })}
              </h3>
              <p className="text-sm text-subtitle-color leading-relaxed opacity-80 font-medium">
                {t('pages_management_desc', {
                  defaultValue: 'Easily manage and create additional pages for your support center.',
                })}
              </p>
            </div>
            <Link href={`${ROUTES.APP_SETTINGS.WEB_PAGES}`}>
              <Button className="w-full h-11 rounded-radius primary-btn  text-white! font-semibold flex items-center justify-center gap-2 text-[13px]">
                {t('manage_pages', { defaultValue: 'Manage Pages' })}
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2.5"
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
              </Button>
            </Link>
          </Card>
        )}
      </div>

      <ContactInquiryModal isOpen={isInquiryModalOpen} onClose={() => setIsInquiryModalOpen(false)} />
    </div>
  )
}
