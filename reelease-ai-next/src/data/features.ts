import { Crown, Monitor, Shield, Smartphone, Square, Zap } from 'lucide-react'

export const aspectRatioOptions = [
  { value: '16:9', label: '16:9' },
  { value: '9:16', label: '9:16' },
  { value: '1:1', label: '1:1' },
]

export const durationOptions = [
  { value: 3, label: '3 Seconds' },
  { value: 5, label: '5 Seconds' },
  { value: 10, label: '10 Seconds' },
]

export const modeOptions = [
  { value: 'std', label: 'Standard' },
  { value: 'pro', label: 'Pro' },
]

export const categoryColors: Record<string, string> = {
  Marketing: 'bg-pink-500/10 text-pink-500 border-pink-500/20',
  Copywriting: 'bg-violet-500/10 text-violet-500 border-violet-500/20',
  'Social Media': 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  SEO: 'bg-green-500/10 text-green-500 border-green-500/20',
  Email: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
  Blog: 'bg-cyan-500/10 text-cyan-500 border-cyan-500/20',
  'Video Script': 'bg-red-500/10 text-red-500 border-red-500/20',
  'Ad Copy': 'bg-orange-500/10 text-orange-500 border-orange-500/20',
  Sales: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
  default: 'bg-primary/10 text-primary border-primary/20',
}

export const aiVideoTools = [
  { value: '16:9', label: '16:9', icon: Monitor },
  { value: '9:16', label: '9:16', icon: Smartphone },
  { value: '1:1', label: '1:1', icon: Square },
]

export const resolutionOptions = [
  { value: '720p', label: '720P' },
  { value: '1080p', label: '1080P' },
]

export const videoGenerationOptions = [
  { value: 'std', label: 'Standard', icon: Zap },
  { value: 'pro', label: 'Pro', icon: Shield },
  { value: '4k', label: '4K', icon: Crown },
]

export const surprisePrompts = [
  'A majestic lion standing in a lush green forest, sunlight filtering through trees, ultra realistic, high detail',
  'A futuristic cyberpunk city at night with flying vehicles and glowing neon signs, photorealistic, 8k',
  'A cozy wooden cabin by a peaceful lake in autumn, golden hour light, highly detailed digital painting',
  'A surreal fantasy landscape with floating islands and waterfalls, vibrant pastel colors, magical atmosphere',
  'A cute fluffy red panda wearing a tiny wizard hat, reading a spellbook, cinematic lighting, 3D render style',
  'A gorgeous glass greenhouse filled with exotic glowing plants under a starry night sky, hyper-detailed',
]

