import { watermarkBlendMode, watermarkPosition } from "@/types/components/features"

export const watermarkPositions = [
  'top-left',
  'top-center',
  'top-right',
  'center-left',
  'center',
  'center-right',
  'bottom-left',
  'bottom-center',
  'bottom-right',
] as const



export const watermarkBlendModes = [
  { value: 'normal', label: 'Normal' },
  { value: 'multiply', label: 'Multiply (Darken)' },
  { value: 'screen', label: 'Screen (Lighten)' },
  { value: 'overlay', label: 'Overlay' },
  { value: 'color-burn', label: 'Color Burn' },
] as const


export const watermarkDefaults = {
  type: 'image' as 'image' | 'text',
  position: 'bottom-right' as watermarkPosition,
  scale: [24] as number[],
  opacity: [72] as number[],
  rotation: [0] as number[],
  padding: [10] as number[],
  blendMode: 'normal' as watermarkBlendMode,
  tiling: false,
  text: 'My Watermark',
  textStyle: 'solid',
  fontWeight: 'bold',
  isItalic: false,
  isUnderline: false,
  textColor: 'white',
  fontFamily: 'inter',
} as const

export const watermarkTextStyles = [
  { value: 'solid', label: 'Solid' },
  { value: 'outline', label: 'Outline' },
  { value: 'glass', label: 'Glass' },
] as const

export const watermarkFontWeights = [
  { value: 'normal', label: 'Regular' },
  { value: 'medium', label: 'Medium' },
  { value: 'semibold', label: 'Semibold' },
  { value: 'bold', label: 'Bold' },
  { value: 'black', label: 'Black' },
] as const

export const watermarkFontFamilies = [
  { value: 'inter', label: 'Inter' },
  { value: 'roboto', label: 'Roboto' },
  { value: 'outfit', label: 'Outfit' },
  { value: 'serif', label: 'Playfair (Serif)' },
  { value: 'poppins', label: 'Poppins' },
  { value: 'montserrat', label: 'Montserrat' },
  { value: 'mono', label: 'Monospace' },
] as const

export const watermarkTextColors = [
  { value: 'white', label: 'White', css: 'bg-white text-black border-gray-200' },
  { value: 'dark', label: 'Dark', css: 'bg-slate-900 text-white border-slate-700' },
  { value: 'system', label: 'System', css: 'bg-primary text-primary-foreground border-primary' },
  { value: 'emerald', label: 'Emerald', css: 'bg-emerald-500 text-white border-emerald-400' },
  { value: 'amber', label: 'Amber', css: 'bg-amber-500 text-white border-amber-400' },
  { value: 'violet', label: 'Violet', css: 'bg-violet-500 text-white border-violet-400' },
  { value: 'cyan', label: 'Cyan', css: 'bg-cyan-500 text-white border-cyan-400' },
  { value: 'sunset', label: 'Sunset', css: 'bg-gradient-to-tr from-[var(--watermark-sunset-start)] to-[var(--watermark-sunset-end)] text-white border-orange-400' },
  { value: 'ocean', label: 'Ocean', css: 'bg-gradient-to-tr from-[var(--watermark-ocean-start)] to-[var(--watermark-ocean-end)] text-white border-blue-400' },
  { value: 'neon', label: 'Neon', css: 'bg-gradient-to-tr from-[var(--watermark-neon-start)] to-[var(--watermark-neon-end)] text-white border-purple-400' },
  { value: 'gold', label: 'Gold', css: 'bg-gradient-to-tr from-[var(--watermark-gold-start)] to-[var(--watermark-gold-end)] text-white border-yellow-300' },
  { value: 'rose', label: 'Rose', css: 'bg-gradient-to-tr from-[var(--watermark-rose-start)] to-[var(--watermark-rose-end)] text-white border-rose-300' },
] as const
