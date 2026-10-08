import { BrandingSymbol } from '@/types/components/branding'
import {
  ChessQueen,
  Clapperboard,
  Crown,
  Flame,
  Heart,
  Infinity as InfinityIcon,
  Play,
  Sparkles,
  Zap
} from 'lucide-react'

export interface BrandingSymbolWithPath extends BrandingSymbol {
  svgContent: string
}

export const DESIGNER_SYMBOLS: BrandingSymbolWithPath[] = [
  {
    id: 'sparkles',
    name: 'AI Sparkles',
    icon: Sparkles,
    svgContent: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-sparkles-icon lucide-sparkles"><path d="M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z"/><path d="M20 2v4"/><path d="M22 4h-4"/><circle cx="4" cy="20" r="2"/></svg>'
  },
  {
    id: 'sleek_r',
    name: 'Sleek R Badge',
    icon: Crown,
    svgContent: '<circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" fill="none"/><path d="M9 17V7h4.5a3 3 0 0 1 0 6H9m0 0h3l3.5 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>'
  },
  {
    id: 'clapperboard',
    name: 'Clapperboard',
    icon: Clapperboard,
    svgContent: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-clapperboard-icon lucide-clapperboard"><path d="m12.296 3.464 3.02 3.956"/><path d="M20.2 6 3 11l-.9-2.4c-.3-1.1.3-2.2 1.3-2.5l13.5-4c1.1-.3 2.2.3 2.5 1.3z"/><path d="M3 11h18v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="m6.18 5.276 3.1 3.899"/></svg>'
  },
  {
    id: 'infinity',
    name: 'Infinity Loop',
    icon: InfinityIcon,
    svgContent: '<path d="M12 12c-2-2.67-4-4-6-4a4 4 0 1 0 0 8c2 0 4-1.33 6-4zm0 0c2 2.67 4 4 6 4a4 4 0 1 0 0-8c-2 0-4 1.33-6 4z" stroke="currentColor" stroke-width="2" stroke-linecap="round" fill="none"/>'
  },
  {
    id: 'flame',
    name: 'Trending Flame',
    icon: Flame,
    svgContent: '<path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>'
  },
  {
    id: 'zap',
    name: 'Automate Zap',
    icon: Zap,
    svgContent: '<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>'
  },
  {
    id: 'heart',
    name: 'Engagement Heart',
    icon: Heart,
    svgContent: '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round" fill="none"/>'
  }
]

export const PRESET_PALETTES = [
  { name: 'Royal Purple', primary: '#6366F1', secondary: '#22D3EE', accents: ['#818CF8', '#A5B4FC', '#C7D2FE', '#E0E7FF'] },
  { name: 'Emerald Wave', primary: '#059669', secondary: '#34D399', accents: ['#10B981', '#6EE7B7', '#A7F3D0', '#D1FAE5'] },
  { name: 'Cyberpunk Sunset', primary: '#EC4899', secondary: '#F59E0B', accents: ['#F472B6', '#FEE2E2', '#FEF3C7', '#FFFBEB'] },
  { name: 'Ocean Breeze', primary: '#2563EB', secondary: '#38BDF8', accents: ['#60A5FA', '#93C5FD', '#BFDBFE', '#EFF6FF'] },
  { name: 'Crimson Ember', primary: '#DC2626', secondary: '#F87171', accents: ['#EF4444', '#FCA5A5', '#FECACA', '#FEE2E2'] }
]

export const FONT_FAMILIES = [
  { id: 'inter', name: 'Inter', className: 'font-sans' },
  { id: 'roboto', name: 'Roboto', className: 'font-serif' },
  { id: 'outfit', name: 'Outfit', className: 'font-sans' },
  { id: 'playfair', name: 'Playfair Display', className: 'font-serif' },
  { id: 'monospace', name: 'Space Mono', className: 'font-mono' }
]
