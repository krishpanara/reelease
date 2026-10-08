import { StyleOption, ResolutionOption } from '@/types/character'

export const characterStyles: StyleOption[] = [
  { value: 'realistic', label: 'character_style_realistic', defaultLabel: 'Realistic' },
  { value: 'anime', label: 'character_style_anime', defaultLabel: 'Anime' },
  { value: 'cartoon', label: 'character_style_cartoon', defaultLabel: 'Cartoon' },
  { value: '3d', label: 'character_style_3d', defaultLabel: '3D' },
  { value: 'illustration', label: 'character_style_illustration', defaultLabel: 'Illustration' },
  { value: 'pixel-art', label: 'character_style_pixel_art', defaultLabel: 'Pixel Art' },
]

export const characterResolutions: ResolutionOption[] = [
  { value: '1024x1024', label: 'character_resolution_1024_1024', defaultLabel: '1024x1024 (Square)' },
  { value: '768x768', label: 'character_resolution_768_768', defaultLabel: '768x768 (Square)' },
  { value: '512x512', label: 'character_resolution_512_512', defaultLabel: '512x512 (Square)' },
  { value: '512x768', label: 'character_resolution_512_768', defaultLabel: '512x768 (Portrait)' },
  { value: '768x512', label: 'character_resolution_768_512', defaultLabel: '768x512 (Landscape)' },
]
