import { LucideIcon } from 'lucide-react'

export interface BrandColorsState {
  primary: string
  secondary: string
  accents: string[]
}

export type LogoLayout = 'icon-only' | 'text-only' | 'horizontal' | 'vertical'
export type LogoBackgroundType = 'transparent' | 'dark' | 'light'

export interface LogoDesignConfig {
  symbolId: string
  text: string
  fontFamily: string
  fontWeight: string
  fontSize: number
  textColor: string
  textGradientEnabled?: boolean
  iconSize: number
  iconColor: string
  gradientEnabled: boolean
  gradientColor: string
  layout: LogoLayout
  bgType: LogoBackgroundType
  borderRadius: number
  padding: number
  customSymbolUrl?: string
}

export interface BrandingSymbol {
  id: string
  name: string
  icon: LucideIcon
}

export interface LogoItemConfig {
  key: string
  label: string
  description: string
  url: string | null | undefined
}

export interface LogoEditorCardProps {
  config: LogoDesignConfig
  setConfig: React.Dispatch<React.SetStateAction<LogoDesignConfig>>
  primaryColor: string
  secondaryColor: string
  customFileRef: React.RefObject<HTMLInputElement | null>
  handleCustomSymbolUpload: (e: React.ChangeEvent<HTMLInputElement>) => void
  validationWarning: string | null
}

export interface LogoPreviewCardProps {
  config: LogoDesignConfig
  targetKey: string
  setTargetKey: (key: string) => void
  onApply: () => void
  onDownload: () => void
  getSvgMarkup: (width: number, height: number) => string
}
