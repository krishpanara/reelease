import { GatewayConfig, Plan } from '@/types'
import { BookImage, FilePlay, Film, Image, Video, Captions, UserRound, ShoppingBag } from 'lucide-react'

export const gatewayFields = [
  {
    id: 'paypal_monthly',
    field: 'paypal_plan_id_monthly',
    label: 'PayPal Plan ID (Monthly)',
    placeholder: 'e.g. P-XXXXXXXXXXXX',
    note: 'Overrides global PayPal settings for this specific plan.',
  },
  {
    id: 'paypal_yearly',
    field: 'paypal_plan_id_yearly',
    label: 'PayPal Plan ID (Yearly)',
    placeholder: 'e.g. P-XXXXXXXXXXXX',
    note: 'Overrides global PayPal settings for this specific plan.',
  },
  {
    id: 'stripe_price_id',
    field: 'stripe_price_id',
    label: 'Stripe Price ID',
    placeholder: 'e.g. price_XXXXXXXXXXXX',
    note: null,
  },
  {
    id: 'razorpay_plan_id',
    field: 'razorpay_plan_id',
    label: 'Razorpay Plan ID',
    placeholder: 'e.g. plan_XXXXXXXXXXXX',
    note: null,
  },
]

export const currencySymbols: Record<string, string> = {
  USD: '$',
  INR: '₹',
  EUR: '€',
  GBP: '£',
}

export const gateways: GatewayConfig[] = [
  {
    id: 'stripe',
    label: 'Stripe',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/b/ba/Stripe_Logo%2C_revised_2016.svg',
    activeClass: 'border-primary bg-primary/5',
    hoverClass: 'hover:border-primary/50',
    checkClass: 'bg-primary',
    infoText: "Your card details are entered securely on Stripe's hosted checkout.",
    infoClass: 'bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300',
  },
  {
    id: 'paypal',
    label: 'PayPal',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg',
    activeClass: 'border-blue-500 bg-blue-50 dark:bg-blue-950/20',
    hoverClass: 'hover:border-blue-400',
    checkClass: 'bg-blue-500',
    infoText: "You'll be redirected to PayPal to complete your subscription securely.",
    infoClass:
      'bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-800 text-yellow-700 dark:text-yellow-300',
  },
  {
    id: 'razorpay',
    label: 'Razorpay',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/8/89/Razorpay_logo.svg',
    activeClass: 'border-social-blue bg-social-blue/5',
    hoverClass: 'hover:border-social-blue/50',
    checkClass: 'bg-social-blue',
    infoText: 'Complete your payment via UPI, Cards, or Netbanking using Razorpay.',
    infoClass:
      'bg-indigo-50 dark:bg-indigo-950/20 border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 font-medium',
  },
]

export const aiFeatureKeys = [
  { key: 'text_to_image', label: 'text_to_image' },
  { key: 'image_to_image', label: 'image_to_image' },
  { key: 'video_motion', label: 'video_motion' },
  { key: 'images_to_video', label: 'images_to_video' },
  { key: 'text_to_video', label: 'text_to_video' },
  { key: 'ai_caption_generator', label: 'ai_caption_generator' },
  { key: 'character_generation', label: 'character_generation' },
  { key: 'ecommerce_catalogue', label: 'ecommerce_catalogue' },
] as const

export const featureStyles: Record<string, { gradient: string; glow: string }> = {
  text_to_image: {
    gradient: 'linear-gradient(135deg, #0EA5E9 0%, #2563EB 100%)',
    glow: 'rgba(14, 165, 233, 0.1)',
  },
  image_to_image: {
    gradient: 'linear-gradient(135deg, #EC4899 0%, #D946EF 100%)',
    glow: 'rgba(236, 72, 153, 0.1)',
  },
  text_to_video: {
    gradient: 'linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)',
    glow: 'rgba(245, 158, 11, 0.1)',
  },
  images_to_video: {
    gradient: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
    glow: 'rgba(16, 185, 129, 0.1)',
  },
  video_motion: {
    gradient: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
    glow: 'rgba(139, 92, 246, 0.1)',
  },
  ai_caption_generator: {
    gradient: 'linear-gradient(135deg, #06B6D4 0%, #0891B2 100%)',
    glow: 'rgba(6, 182, 212, 0.1)',
  },
  character_generation: {
    gradient: 'linear-gradient(135deg, #F97316 0%, #EA580C 100%)',
    glow: 'rgba(249, 115, 22, 0.1)',
  },
  ecommerce_catalogue: {
    gradient: 'linear-gradient(135deg, #84CC16 0%, #65A30D 100%)',
    glow: 'rgba(132, 204, 22, 0.1)',
  },
}

export const iconMap: Record<string, string> = {
  text_to_image: '/images/Frame-1.png',
  image_to_image: '/images/Frame-2.png',
  video_motion: '/images/Frame-5.png',
  images_to_video: '/images/Frame-4.png',
  text_to_video: '/images/Frame-3.png',
  ai_caption_generator: '/images/Frame-6.png',
  character_generation: '/images/Frame-7.png',
  ecommerce_catalogue: '/images/Frame-8.png',
}

export const getFeaturesList = (t: (key: string) => string) =>
  [
    {
      key: 'text_to_image',
      label: t('text_to_image'),
      icon: BookImage,
      color: 'text-blue-500',
    },
    {
      key: 'image_to_image',
      label: t('image_to_image'),
      icon: Image,
      color: 'text-purple-500',
    },
    {
      key: 'video_motion',
      label: t('video_motion'),
      icon: FilePlay,
      color: 'text-yellow-500',
    },
    {
      key: 'images_to_video',
      label: t('images_to_video'),
      icon: Film,
      color: 'text-orange-500',
    },
    {
      key: 'text_to_video',
      label: t('text_to_video'),
      icon: Video,
      color: 'text-red-500',
    },
    {
      key: 'ai_caption_generator',
      label: t('ai_caption_generator'),
      icon: Captions,
      color: 'text-cyan-500',
    },
    {
      key: 'character_generation',
      label: t('character_generation'),
      icon: UserRound,
      color: 'text-orange-500',
    },
    {
      key: 'ecommerce_catalogue',
      label: t('ecommerce_catalogue'),
      icon: ShoppingBag,
      color: 'text-lime-500',
    },
  ] as const

export const getAiFeaturesList = (t: (key: string) => string) =>
  [
    {
      key: 'text_to_image',
      icon: BookImage,
      color: 'text-blue-400',
      label: t('text_to_image'),
    },
    {
      key: 'image_to_image',
      icon: Image,
      color: 'text-purple-400',
      label: t('image_to_image'),
    },
    {
      key: 'video_motion',
      icon: FilePlay,
      color: 'text-yellow-400',
      label: t('video_motion'),
    },
    {
      key: 'images_to_video',
      icon: Film,
      color: 'text-orange-400',
      label: t('images_to_video'),
    },
    {
      key: 'text_to_video',
      icon: Video,
      color: 'text-red-400',
      label: t('text_to_video'),
    },
    {
      key: 'ai_caption_generator',
      icon: Captions,
      color: 'text-cyan-400',
      label: t('ai_caption_generator'),
    },
    {
      key: 'character_generation',
      icon: UserRound,
      color: 'text-orange-400',
      label: t('character_generation'),
    },
    {
      key: 'ecommerce_catalogue',
      icon: ShoppingBag,
      color: 'text-lime-400',
      label: t('ecommerce_catalogue'),
    },
  ] as const

export const defaultPlanForm: Partial<Plan> = {
  name: '',
  slug: '',
  description: '',
  billing_cycle: 'monthly',
  amount: 0,
  currency: 'USD',
  trial_days: 0,
  total_credits: 0,
  caption_credits: 0,
  is_active: true,
  is_default: false,
  is_featured: false,
  sort_order: 0,
  ai_features: {
    text_to_image: false,
    image_to_image: false,
    video_motion: false,
    images_to_video: false,
    text_to_video: false,
    ai_caption_generator: false,
    character_generation: false,
    ecommerce_catalogue: false,
  },
  channel_limit: 2,
  remove_watermark: false,
}

export const defaultModalForm: Partial<Plan> = {
  name: '',
  slug: '',
  description: '',
  billing_cycle: 'monthly',
  plan_type: 'subscription',
  amount: 0,
  currency: 'USD',
  module_access: [],
  validity_days: null,
  total_credits: 0,
  status: 'active',
  is_default: false,
  trial_period_days: 0,
  display_order: 0,
  features: {},
  paypal_plan_id_monthly: '',
  paypal_plan_id_yearly: '',
  stripe_price_id: '',
  razorpay_plan_id: '',
  ai_features: {
    text_to_image: false,
    image_to_image: false,
    video_motion: false,
    images_to_video: false,
    text_to_video: false,
    ai_caption_generator: false,
    character_generation: false,
    ecommerce_catalogue: false,
  },
}
