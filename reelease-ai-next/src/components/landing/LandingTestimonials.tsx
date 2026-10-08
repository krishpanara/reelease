'use client'

import { useSectionRefs } from '@/context/SectionRefsContext'
import { motion } from 'framer-motion'
import { Quote, Star } from 'lucide-react'
import Image from 'next/image'
import { useTranslation } from 'react-i18next'
import { Autoplay, Navigation, Pagination } from 'swiper/modules'
import { Swiper, SwiperSlide } from 'swiper/react'
import { LandingPageData, Testimonial } from '@/types/landing'

export default function LandingTestimonials({
  data,
}: {
  data?: LandingPageData['testimonials'] & { items?: Testimonial[] }
}) {
  const { t } = useTranslation()
  const { registerRef } = useSectionRefs()
  const sectionBadge = data?.section_badge || t('testimonials_badge') || 'Wall of Love'
  const sectionTitle = data?.section_heading || t('loved_by')
  const sectionDescription = data?.section_subheading || t('testimonials_description')
  const testimonialItems: Testimonial[] = data?.testimonial_ids || []

  return (
    <section id="testimonials" ref={(el) => registerRef('testimonials', el)} className="relative py-24 md:py-30 pb-0!">
      {/* Dot Grid Background */}
      <div
        className="absolute top-[26px] inset-0 pointer-events-none"
        style={{
          backgroundImage: `url(./images/bg.png)`,
          width: '200%',
          height: '200%',
        }}
      />

      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center max-w-4xl mx-auto mb-16 md:mb-24">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="inline-flex items-center gap-2 px-3 py-1 mb-6 rounded-full bg-white/5 border border-white/10 backdrop-blur-xl text-primary text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em]"
          >
            <Star className="w-3.5 h-3.5 fill-current" />
            <span>{sectionBadge}</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="text-4xl md:text-5xl font-bold text-white mb-3 leading-tight md:whitespace-nowrap"
          >
            {sectionTitle?.includes('100K+') ? (
              <>
                {sectionTitle.split('100K+')[0]}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-indigo-400 font-extrabold bg-[length:200%_auto] animate-gradient text-[1.25em] inline-block">
                  100K+
                </span>
                {sectionTitle.split('100K+')[1]}
              </>
            ) : (
              <>
                {sectionTitle}{' '}
                {sectionTitle === t('loved_by') && (
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-secondary to-primary bg-[length:200%_auto] animate-gradient">
                    {t('creators_everywhere')}
                  </span>
                )}
              </>
            )}
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="text-lg  text-white/60 leading-relaxed"
          >
            {sectionDescription}
          </motion.p>
        </div>

        {testimonialItems.length > 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 1, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="relative px-4 md:px-0"
          >
            <Swiper
              modules={[Autoplay, Pagination, Navigation]}
              spaceBetween={30}
              slidesPerView={1}
              centeredSlides={false}
              loop={true}
              autoplay={{
                delay: 4000,
                disableOnInteraction: false,
              }}
              pagination={{
                clickable: true,
                bulletClass: 'swiper-pagination-bullet !bg-white/20 !opacity-100',
                bulletActiveClass: '!bg-primary !w-8 !rounded-full transition-all duration-300',
              }}
              breakpoints={{
                640: {
                  slidesPerView: 2,
                },
                1024: {
                  slidesPerView: 3,
                },
              }}
              className="testimonials-swiper !pb-20"
            >
              {testimonialItems.map((testimonial: Testimonial, index: number) => (
                <SwiperSlide key={index}>
                  <div className="h-full p-8 flex-1 rounded-[2.5rem] bg-white/[0.03] border border-white/10 backdrop-blur-2xl relative group transition-all duration-500 hover:bg-white/[0.06] hover:border-primary/30">
                    {/* Quote Icon */}
                    <div className="absolute top-8 right-8 text-primary/10 group-hover:text-primary/20 transition-colors duration-500">
                      <Quote className="w-12 h-12 rotate-180" />
                    </div>

                    {/* Rating Stars */}
                    <div className="flex gap-1 mb-8">
                      {[...Array(Math.max(0, testimonial.rating || 0))].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                      ))}
                    </div>

                    {/* Content */}
                    <p className="text-white/80 text-lg leading-relaxed mb-10 line-clamp-2 flex-grow text-wrap transition-colors duration-500 group-hover:text-white">
                      {testimonial.description || testimonial.content}
                    </p>

                    {/* Author info */}
                    <div className="flex items-center gap-4 mt-auto">
                      <div className="relative w-14 h-14 rounded-2xl overflow-hidden border-2 border-white/10 group-hover:border-primary/30 transition-colors">
                        {testimonial.user_image || testimonial.avatar ? (
                          <Image
                            src={
                              testimonial.user_image && process.env.NEXT_PUBLIC_STORAGE_URL
                                ? process.env.NEXT_PUBLIC_STORAGE_URL +
                                (testimonial.user_image.startsWith('/') ? '' : '/') +
                                testimonial.user_image
                                : testimonial.avatar || '/images/default-avatar.png'
                            }
                            alt={testimonial.user_name || testimonial.name || 'User'}
                            fill
                            unoptimized
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-primary/10 flex items-center justify-center">
                            <Star className="w-6 h-6 text-primary/40" />
                          </div>
                        )}
                      </div>
                      <div>
                        <h4 className="text-white font-bold text-lg">{testimonial.user_name || testimonial.name}</h4>
                        <p className="text-primary/60 text-sm font-medium">
                          {testimonial.user_post || testimonial.role}
                        </p>
                      </div>
                    </div>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-col items-center justify-center py-16 px-4 bg-white/[0.02] border border-white/5 rounded-[2.5rem] backdrop-blur-xl max-w-3xl mx-auto"
          >
            <div className="w-16 h-16 mb-4 rounded-full bg-white/5 flex items-center justify-center">
              <Quote className="w-8 h-8 text-white/20" />
            </div>
            <h3 className="text-xl font-medium text-white mb-2">No Testimonials Found</h3>
            <p className="text-white/40 text-center">
              There are currently no testimonials available to display in this section.
            </p>
          </motion.div>
        )}
      </div>

      <style jsx global>{`
        .testimonials-swiper .swiper-pagination {
          bottom: 0 !important;
        }
        .testimonials-swiper .swiper-pagination-bullet {
          height: 8px !important;
          width: 8px !important;
        }
      `}</style>
    </section>
  )
}
