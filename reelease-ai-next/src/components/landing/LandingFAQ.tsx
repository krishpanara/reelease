'use client'

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { useSectionRefs } from '@/context/SectionRefsContext'
import { FAQItem, LandingPageData } from '@/types/landing'
import { motion } from 'framer-motion'
import { HelpCircle, Minus, Plus } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export default function LandingFAQ({ data }: { data?: LandingPageData['faq'] & { items?: FAQItem[] } }) {
  const { t } = useTranslation()
  const { registerRef } = useSectionRefs()

  const sectionBadge = data?.section_badge || t('faq_badge') || 'Common Questions'
  const sectionTitle = data?.section_heading || t('frequently_asked')
  const sectionDescription = data?.section_subheading || t('faq_description')
  const faqItems: FAQItem[] = data?.faq_ids || []

  return (
    <section
      id="faq"
      ref={(el) => registerRef('faq', el)}
      className="relative py-24 md:py-30"
    >
      {/* Background Decorative Glows */}
      <div className="absolute bottom-[480px] left-1/2 -translate-x-1/2 w-[100%] h-[700px] bg-primary/10 rounded-full blur-[150PX] pointer-events-none" />
      <div className="absolute bottom-[480px] left-1/2 -translate-x-1/2 w-[40%] h-[400px] bg-secondary/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="container mx-auto px-6 max-w-7xl relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="inline-flex items-center gap-2 px-3 py-1 mb-6 rounded-full bg-white/5 border border-white/10 backdrop-blur-xl text-primary text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em]"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>{sectionBadge}</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="text-4xl md:text-5xl font-bold text-white mb-3 leading-tight"
          >
            {sectionTitle}{' '}
            {sectionTitle === t('frequently_asked') && (
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-secondary to-primary bg-[length:200%_auto] animate-gradient">
                {t('questions')}
              </span>
            )}
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="text-lg text-white/60 leading-relaxed"
          >
            {sectionDescription}
          </motion.p>
        </div>

        {faqItems.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-col items-center justify-center py-16 px-4 bg-white/[0.02] border border-white/5 rounded-[2.5rem] backdrop-blur-xl max-w-3xl mx-auto"
          >
            <div className="w-16 h-16 mb-4 rounded-full bg-white/5 flex items-center justify-center">
              <HelpCircle className="w-8 h-8 text-white/20" />
            </div>
            <h3 className="text-xl font-medium text-white mb-2">No FAQs Found</h3>
            <p className="text-white/40 text-center">
              There are currently no frequently asked questions available to display in this section.
            </p>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            <Accordion type="single" collapsible className="flex flex-col md:flex-row gap-4 md:gap-x-8">
              {/* Left Column */}
              <div className="flex-1 flex flex-col gap-4 md:gap-6">
                {faqItems.slice(0, Math.ceil(faqItems.length / 2)).map((faq: FAQItem, index: number) => (
                  <AccordionItem
                    key={index}
                    value={`item-${index}`}
                    className="border border-white/10 rounded-border-radius sm:px-8 px-4 bg-white/[0.02] backdrop-blur-2xl overflow-hidden transition-all duration-300 hover:bg-white/[0.04] hover:border-primary/30 group h-fit"
                  >
                    <AccordionTrigger className="text-white hover:no-underline transition-colors font-bold text-left py-7 text-lg  group-data-[state=open]:text-primary [&>svg]:hidden">
                      <span className="flex-grow pr-4">{faq.title}</span>
                      <div className="relative w-5 h-5 shrink-0 transition-colors duration-300">
                        <Plus className="absolute inset-0 w-5 h-5 transition-transform duration-300 group-data-[state=open]:rotate-90 group-data-[state=open]:opacity-0 text-white/40" />
                        <Minus className="absolute inset-0 w-5 h-5 transition-transform duration-300 -rotate-90 opacity-0 group-data-[state=open]:rotate-0 group-data-[state=open]:opacity-100 text-primary" />
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="text-white/60 text-base leading-relaxed pb-8 border-t border-white/5 mt-[-1px]">
                      {faq.description}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </div>

              {/* Right Column */}
              <div className="flex-1 flex flex-col gap-4 md:gap-6">
                {faqItems.slice(Math.ceil(faqItems.length / 2)).map((faq: FAQItem, index: number) => {
                  const globalIndex = index + Math.ceil(faqItems.length / 2)
                  return (
                    <AccordionItem
                      key={globalIndex}
                      value={`item-${globalIndex}`}
                      className="border border-white/10 rounded-border-radius sm:px-8 px-4 bg-white/[0.02] backdrop-blur-2xl overflow-hidden transition-all duration-300 hover:bg-white/[0.04] hover:border-primary/30 group h-fit"
                    >
                      <AccordionTrigger className="text-white hover:no-underline transition-colors font-bold text-left py-7 text-lg md:text-xl group-data-[state=open]:text-primary [&>svg]:hidden">
                        <span className="flex-grow pr-4">{faq.title}</span>
                        <div className="relative w-5 h-5 shrink-0 transition-colors duration-300">
                          <Plus className="absolute inset-0 w-5 h-5 transition-transform duration-300 group-data-[state=open]:rotate-90 group-data-[state=open]:opacity-0 text-white/40" />
                          <Minus className="absolute inset-0 w-5 h-5 transition-transform duration-300 -rotate-90 opacity-0 group-data-[state=open]:rotate-0 group-data-[state=open]:opacity-100 text-primary" />
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="text-white/60 text-base md:text-lg leading-relaxed pb-8 mt-[-1px]">
                        {faq.description}
                      </AccordionContent>
                    </AccordionItem>
                  )
                })}
              </div>
            </Accordion>
          </motion.div>
        )}

      </div>

      <style jsx global>{`
        .group-data-\\[state\\=open\\]\:rotate-45[data-state=open] {
          transform: rotate(45deg);
        }
      `}</style>
    </section>
  )
}
