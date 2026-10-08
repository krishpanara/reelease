import { EmailConfigForm, ServiceType } from '@/types'

import { Image as ImageIcon, Images, Repeat2, Video, X } from 'lucide-react'

export const serviceLabels: Record<ServiceType, string> = {
  text_to_image: 'Text to Image',
  image_to_image: 'Image to Image',
  video_motion: 'Video Motion',
  images_to_video: 'Images to Video',
  text_to_video: 'Text to Video',
}

export const serviceColors: Record<ServiceType, string> = {
  text_to_image: 'from-violet-500/20 to-purple-500/20 border-violet-500/30 text-violet-500',
  image_to_image: 'from-blue-500/20 to-cyan-500/20 border-blue-500/30 text-blue-500',
  video_motion: 'from-orange-500/20 to-amber-500/20 border-orange-500/30 text-orange-500',
  images_to_video: 'from-rose-500/20 to-pink-500/20 border-rose-500/30 text-rose-500',
  text_to_video: 'from-emerald-500/20 to-teal-500/20 border-emerald-500/30 text-emerald-500',
}

export const serviceTabs: { key: ServiceType; label: string; icon: React.ReactNode; color: string }[] = [
  {
    key: 'text_to_image',
    label: 'Text to Image',
    icon: <ImageIcon className="w-5 h-5" />,
    color: 'text-violet-500 border-violet-500/40 bg-violet-500/10',
  },
  {
    key: 'image_to_image',
    label: 'Image to Image',
    icon: <Repeat2 className="w-5 h-5" />,
    color: 'text-blue-500 border-blue-500/40 bg-blue-500/10',
  },
  {
    key: 'video_motion',
    label: 'Video Motion',
    icon: <Video className="w-5 h-5" />,
    color: 'text-orange-500 border-orange-500/40 bg-orange-500/10',
  },
  {
    key: 'images_to_video',
    label: 'Images to Video',
    icon: <Images className="w-5 h-5" />,
    color: 'text-rose-500 border-rose-500/40 bg-rose-500/10',
  },
  {
    key: 'text_to_video',
    label: 'Text to Video',
    icon: <Video className="w-5 h-5" />,
    color: 'text-emerald-500 border-emerald-500/40 bg-emerald-500/10',
  },
]

export const defaultForm = {
  name: '',
  slug: '',
  description: '',
  attachment_id: '',
  status: true,
}

export const emailValue: EmailConfigForm = {
  emailProvider: 'nodemailer',
  fromName: '',
  fromEmail: '',
  config: {
    smtp_host: '',
    smtp_port: '',
    smtp_user: '',
    smtp_pass: '',
    mail_encryption: 'tls',
    sendgrid_api_key: '',
  },
}

export const generalSettingValue = {
  app_name: '',
  app_description: '',
  app_email: '',
  support_email: '',
  maintenance_mode: false,
  maintenance_title: '',
  maintenance_message: '',
  maintenance_image_url: '',
  maintenance_allowed_ips: [] as string[],
  maintenance_allowed_ips_text: '',
  page_404_title: '',
  page_404_content: '',
  page_404_image_url: '',
  no_internet_title: '',
  no_internet_content: '',
  no_internet_image_url: '',
  document_file_limit: 15,
  audio_file_limit: 15,
  video_file_limit: 20,
  image_file_limit: 10,
  multiple_file_share_limit: 10,
  maximum_message_length: 40000,
  smtp_host: '',
  smtp_port: 587,
  smtp_user: '',
  smtp_pass: '',
  mail_from_name: '',
  mail_from_email: '',
  mail_encryption: 'tls',
  otp_message: '',
  session_expiration_days: 7,
  session_limit: 10,
  demo_user_email: '',
  demo_user_password: '',
}

export const paymentSetupValue = {
  stripe: {
    enabled: false,
    secret_key: '',
    publishable_key: '',
    webhook_secret: '',
  },
  paypal: {
    enabled: false,
    client_id: '',
    client_secret: '',
    mode: 'sandbox',
    plan_id_monthly: '',
    plan_id_yearly: '',
  },
  razorpay: {
    enabled: false,
    key_id: '',
    key_secret: '',
    webhook_secret: '',
  },
}
