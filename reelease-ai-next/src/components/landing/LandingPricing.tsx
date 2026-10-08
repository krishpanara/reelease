'use client'

import { useSectionRefs } from '@/context/SectionRefsContext'
import { motion, useScroll, useTransform, useSpring } from 'framer-motion'
import { Plan } from '@/types/components/plans'
import { useRouter } from 'next/navigation'
import { useState, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { plans } from '@/data/landing'
import { ROUTES } from '@/constants/routes'
import { Zap, Crown, Shield } from 'lucide-react'
import { PricingHeader } from './PricingHeader'
import { PricingCard } from './PricingCard'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay, Pagination } from 'swiper/modules'
import { cn } from '@/lib/utils'

// Import Swiper styles
import 'swiper/css'
import 'swiper/css/pagination'
import { LandingPageData } from '@/types/landing'
import { AIFeatureName } from '@/types'

export default function LandingPricing({ data }: { data?: LandingPageData['pricing'] }) {
  const { t } = useTranslation()
  const { registerRef } = useSectionRefs()
  const router = useRouter()

  const sectionBadge = data?.badge || t('license') || 'CHOOSE YOUR PLAN'
  const sectionTitle = data?.title || t('simple_transparent')
  const sectionDescription = data?.description || t('pricing_description')

  const dynamicPlans = data?.plan_ids?.map((plan: Plan, index: number) => {
    const aiFeatures = plan.ai_features
    const featureList = aiFeatures ? Object.keys(aiFeatures).map(key => ({
      name: key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      included: !!(aiFeatures as AIFeatureName)
    })) : []

    if (plan.total_credits) {
      featureList.unshift({ name: `${plan.total_credits} Credits`, included: true })
    }

    return {
      id: plan._id || `plan-${index}`,
      name: plan.name,
      icon: index === 0 ? Zap : index === 1 ? Crown : Shield,
      price: {
        monthly: plan.amount?.toString() || '0',
        yearly: plan.amount ? (plan.amount * 12 * 0.8).toFixed(0).toString() : '0'
      },
      description: plan.description || '',
      features: featureList,
      isPopular: !!plan.is_featured,
      color: index === 0 ? 'from-blue-400 to-cyan-400' : index === 1 ? 'from-primary via-secondary to-primary' : 'from-purple-400 to-pink-400',
    }
  })

  const displayPlans = (dynamicPlans && dynamicPlans.length > 0) ? dynamicPlans : plans

  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly')
  const sectionRef = useRef<HTMLElement>(null)

  // Scroll tracking
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"]
  })

  const snappyConfig = { stiffness: 150, damping: 30, restDelta: 0.001 }
  const smoothProgress = useSpring(scrollYProgress, snappyConfig)
  const opacity = useSpring(useTransform(smoothProgress, [0, 0.15], [0, 1]), snappyConfig)

  // Transforms
  const y1 = useSpring(useTransform(smoothProgress, [0, 0.4, 1], [120, 0, 0]), snappyConfig)
  const ry1 = useSpring(useTransform(smoothProgress, [0, 0.4, 1], [25, 0, 0]), snappyConfig)
  const rz1 = useSpring(useTransform(smoothProgress, [0, 0.4, 1], [-8, 0, 0]), snappyConfig)
  const s1 = useSpring(useTransform(smoothProgress, [0, 0.4, 1], [0.9, 1, 1]), snappyConfig)

  const y2 = useSpring(useTransform(smoothProgress, [0, 0.4, 1], [120, 0, 0]), snappyConfig)
  const s2 = useSpring(useTransform(smoothProgress, [0, 0.4, 1], [0.85, 1, 1]), snappyConfig)

  const y3 = useSpring(useTransform(smoothProgress, [0, 0.4, 1], [120, 0, 0]), snappyConfig)
  const ry3 = useSpring(useTransform(smoothProgress, [0, 0.4, 1], [-25, 0, 0]), snappyConfig)
  const rz3 = useSpring(useTransform(smoothProgress, [0, 0.4, 1], [8, 0, 0]), snappyConfig)
  const s3 = useSpring(useTransform(smoothProgress, [0, 0.4, 1], [0.9, 1, 1]), snappyConfig)

  return (
    <section
      id="pricing"
      ref={(el) => {
        if (el) sectionRef.current = el
        registerRef('pricing', el)
      }}
      className="relative py-24 md:py-35 bg-light-body"
    >
      <div className="absolute bottom-[70%] right-[-15%] w-[30%] h-[90%]  bg-primary/30 rounded-full blur-[100px] pointer-events-none opacity-40" />
      <div className="absolute bottom-[55%] right-[-15%] w-[30%] h-[90%] bg-secondary/10 blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-40%] left-[-10%] w-[40%] h-[90%] bg-secondary/10 blur-[100px] rounded-full pointer-events-none" />

      <div className="container mx-auto relative z-10 md:px-0 px-6">
        <div className="flex flex-col lg:flex-row md:gap-16 gap-10 lg:items-center">
          <PricingHeader
            sectionBadge={sectionBadge}
            sectionTitle={sectionTitle}
            sectionDescription={sectionDescription}
            billingCycle={billingCycle}
            setBillingCycle={setBillingCycle}
            t={t}
          />

          {/* Desktop Grid (Only for 3 or fewer plans) */}
          {displayPlans.length <= 3 && (
            <div className="hidden xl:grid flex-[2] grid-cols-3 gap-6" style={{ perspective: '1200px' }}>
              {displayPlans.map((plan, index) => {
                const mod = index % 3
                const animProps = {
                  y: mod === 0 ? y1 : mod === 1 ? y2 : y3,
                  rotateY: mod === 0 ? ry1 : mod === 1 ? 0 : ry3,
                  rotateZ: mod === 0 ? rz1 : mod === 1 ? 0 : rz3,
                  scale: mod === 0 ? s1 : mod === 1 ? s2 : s3,
                }

                return (
                  <PricingCard
                    key={plan.id}
                    plan={plan}
                    billingCycle={billingCycle}
                    {...animProps}
                    opacity={opacity}
                    t={t}
                    onPlanClick={() => router.push(ROUTES.PLANS)}
                  />
                )
              })}
            </div>
          )}

          {/* Slider (For all mobile/tablet views, and desktop with >3 plans) */}
          <div
            className={cn('flex-[2] grid-cols-3 gap-6 w-[250px]', displayPlans.length <= 3 ? 'xl:hidden' : 'block')}
            style={{ perspective: '1200px' }}
          >
            <Swiper
              modules={[Autoplay, Pagination]}
              spaceBetween={24}
              slidesPerView={1.1}
              breakpoints={{
                768: {
                  slidesPerView: 2.2,
                },
                1280: {
                  slidesPerView: 3,
                },
              }}
              autoplay={{
                delay: 3000,
                disableOnInteraction: false,
                pauseOnMouseEnter: true,
              }}
              pagination={{ clickable: true }}
              className="pricing-swiper !pb-12"
            >
              {displayPlans.map((plan, index) => {
                const mod = index % 3
                const animProps = {
                  y: mod === 0 ? y1 : mod === 1 ? y2 : y3,
                  rotateY: mod === 0 ? ry1 : mod === 1 ? 0 : ry3,
                  rotateZ: mod === 0 ? rz1 : mod === 1 ? 0 : rz3,
                  scale: mod === 0 ? s1 : mod === 1 ? s2 : s3,
                }

                return (
                  <SwiperSlide key={plan.id}>
                    <PricingCard
                      plan={plan}
                      billingCycle={billingCycle}
                      {...animProps}
                      opacity={opacity}
                      t={t}
                      onPlanClick={() => router.push(ROUTES.PLANS)}
                    />
                  </SwiperSlide>
                )
              })}
            </Swiper>
          </div>
        </div>
      </div>
    </section>
  )
}
