import { Globe, ShieldCheck, Zap } from 'lucide-react'

export const features = [
  {
    icon: ShieldCheck,
    color: 'text-emerald-500 bg-emerald-500/10',
    title: 'AES-256 Encryption',
    desc: 'Your keys never touch our logs. They are encrypted before storage and only decrypted at the edge for API calls.',
  },
  {
    icon: Zap,
    color: 'text-orange-500 bg-orange-500/10',
    title: 'Instant Validation',
    desc: 'We perform a silent handshake with providers when you save to ensure your tokens are active and ready.',
  },
  {
    icon: Globe,
    color: 'text-blue-500 bg-blue-500/10',
    title: 'Global Uptime',
    desc: 'Our proxy system automatically handles provider rate limits and connectivity retries for you.',
  },
]
