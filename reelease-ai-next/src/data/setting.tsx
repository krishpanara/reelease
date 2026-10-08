import { FileText, Sparkles } from 'lucide-react'

export const creditFields = [
  {
    name: 'registration_free_credits',
    label: 'Welcome Free Credits',
    icon: <Sparkles className="w-5 h-5" />,
    color: 'text-amber-500',
    isCredit: true,
  },
  {
    name: 'registration_free_caption_credits',
    label: 'Welcome Caption Credits',
    icon: <FileText className="w-5 h-5" />,
    color: 'text-purple-500',
    isCredit: true,
  },
]

export const generalResourceLimit = [
  { name: 'video_file_limit', label: 'Video Limit (MB)', icon: '🎬' },
  { name: 'image_file_limit', label: 'Image Limit (MB)', icon: '🖼️' },
  { name: 'session_expiration_days', label: 'Session Expiration (Days)', icon: '⏳' },
  { name: 'session_limit', label: 'Device Login Limit', icon: '📱' },
]

export const emailInstruction = [
  "Choose 'sendmail' for the Mail Driver if you run into problems with SMTP.",
  "Use the Mail Host settings provided by your email service's manual.",
  'Set the Mail port to 587.',
  'If there are issues with TLS, set the Mail Encryption to SSL.',
]

export const emailInstructionSSL = [
  "Again, choose 'sendmail' if there are issues with SMTP.",
  "Use the Mail Host settings provided by your email service's manual.",
  'Set the Mail port to 465.',
  'Set the Mail Encryption to SSL.',
]

