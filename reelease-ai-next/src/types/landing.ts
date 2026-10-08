import { MotionValue, SpringOptions } from 'framer-motion'
import { LucideIcon } from 'lucide-react'

export interface BaseFeature {
  title: string
  description: string
  image_id?: any
  icon?: string
}

export interface DynamicPlatform {
  platform_id?: any
  name: string
  badge: string
  title: string
  highlight: string
  image_id?: any
  features: BaseFeature[]
  // features: {
  //   icon: string
  //   title: string
  //   description: string
  //   image_id?: any
  // }[]
}

export interface PlatformContentData {
  badge: string
  title: string
  highlight: string
  description: string
  gradient: string
  secondaryColor: string
  features: Feature[]
}
export interface Feature extends BaseFeature {
  image?: string
  bg?: string
  color?: string
  cardBg?: string
}

export interface BlogPost {
  id: string | number
  title: string
  excerpt: string
  image: string
  thumbnail_id?: any
  date?: string
  author?: string
  readTime?: string
  category: string
}

export interface FAQItem {
  title: string
  description: string
}

export interface LandingHeroProps {
  data?: LandingPageData['hero']
}

export interface Testimonial {
  _id?: string
  user_name?: string
  user_post?: string
  description?: string
  user_image?: string | null
  name?: string
  role?: string
  content?: string
  avatar?: string
  rating: number
}

export interface BlogFormProps {
  data?: any
  onSubmit: (values: any) => void
  isLoading?: boolean
}

export interface ContactFormProps {
  data?: any
  onSubmit: (values: any) => void
  isLoading?: boolean
}

export interface FAQFormProps {
  data?: any
  onSubmit: (values: any) => void
  isLoading?: boolean
}

export interface FeaturesFormProps {
  data?: any
  onSubmit: (values: any) => void
  isLoading?: boolean
}

export interface FooterFormProps {
  data?: any
  onSubmit: (values: any) => void
  isLoading?: boolean
}
export interface HeroFormProps {
  data?: any
  onSubmit: (values: any) => void
  isLoading?: boolean
}

export interface PricingFormProps {
  data?: any
  onSubmit: (values: any) => void
  isLoading?: boolean
}

export interface SocialFormProps {
  data?: any
  onSubmit: (values: any) => void
  isLoading?: boolean
}

export interface TestimonialsFormProps {
  data?: any
  onSubmit: (values: any) => void
  isLoading?: boolean
}

export interface HeroFloatingIconProps {
  icon: LucideIcon
  image?: string
  color: string
  glowColor: string
  top?: string
  bottom?: string
  left?: string
  right?: string
  range: number[]
  yRange: number[]
  xRange: number[]
  delay: number
  animateY?: number[]
  animateX?: number[]
  animateScale?: number[]
  animateRotate?: number[]
  scrollYProgress: MotionValue<number>
  springConfig: SpringOptions
}

export interface LandingPageData {
  hero: {
    badge: string
    heading: string
    subheading: string
    cta_primary_text: string
    cta_secondary_text: string
    dashboard_image_id: any
  }
  features: {
    section_badge: string
    section_heading: string
    section_subheading: string
    items: {
      title: string
      description: string
      image_id: any
      color: string
    }[]
  }
  social: {
    platforms: {
      platform_id: any
      name: string
      badge: string
      title: string
      highlight: string
      description: string
      image_id: any
      features: {
        icon: string
        title: string
        description: string
        image_id: any
      }[]
    }[]
  }
  stats: {
    items: {
      val: string
      label: string
    }[]
  }
  pricing: {
    badge: string
    title: string
    description: string
    plan_ids: any[]
  }
  blog: {
    badge: string
    title: string
    description: string
    blog_ids: any[]
  }
  testimonials: {
    section_badge: string
    section_heading: string
    section_subheading: string
    testimonial_ids: any[]
  }
  faq: {
    section_badge: string
    section_heading: string
    section_subheading: string
    faq_ids: any[]
  }
  contact: {
    section_badge: string
    heading: string
    subheading: string
    email: string
    phone: string
    address: string
    live_chat_label: string
  }
  footer: {
    tagline: string
    copyright: string
    address: string
    phone: string
    email: string
    social_links: {
      name: string
      href: string
      icon: string
    }[]
  }
}

import { TFunction } from 'i18next'

export interface PricingFeature {
  name: string
  included: boolean
}

export interface PricingPlan {
  id: string
  name: string
  icon: LucideIcon
  price: {
    monthly: string
    yearly: string
  }
  description: string
  features: PricingFeature[]
  isPopular?: boolean
  color: string
}

export interface PricingCardProps {
  plan: PricingPlan
  billingCycle: 'monthly' | 'yearly'

  y: MotionValue<number>

  rotateY: MotionValue<number> | number
  rotateZ: MotionValue<number> | number
  scale: MotionValue<number> | number
  opacity: MotionValue<number> | number

  t: TFunction
  onPlanClick: () => void
}

export interface ContactFormValues {
  name: string
  email: string
  subject: string
  message: string
}