import { LucideIcon } from "lucide-react"

export interface ApiIntegrationForm {
  huggingface_api_key: string
  winston_api_key: string
  gemini_api_key: string
  openai_api_key: string
  groq_api_key: string
  openrouter_api_key: string
  grok_api_key: string
  stable_diffusion_api_key: string
  aiProvider: string
}

export interface ImageUploadItemProps {
  label: string
  description: string
  currentUrl: string | null | undefined
  onFileSelect: (file: File | null) => void
  onRemove: () => void
  isUploading: boolean
}

export interface InlineImageUploadProps {
  label: string
  currentUrl: string | null | undefined
  onFileSelect: (file: File | null) => void
  onRemove: () => void
}

export interface EmailTestModalProps {
  show: boolean
  onClose: () => void
  onSend: () => void
  testEmail: string
  setTestEmail: (email: string) => void
  isTesting: boolean
}

export interface MaintenanceModeCardProps {
  files: Record<string, File | 'null' | null>
  setFiles: React.Dispatch<React.SetStateAction<Record<string, File | 'null' | null>>>
  currentImageUrl?: string | null
  userIp?: string
}

export interface SystemPagesCardProps {
  files: Record<string, File | 'null' | null>
  setFiles: React.Dispatch<React.SetStateAction<Record<string, File | 'null' | null>>>
  settings: any
}

type EmailProvider = 'nodemailer' | 'sendgrid'

export interface EmailConfigForm {
  emailProvider: EmailProvider
  fromName: string
  fromEmail: string
  config: {
    smtp_host: string
    smtp_port: string
    smtp_user: string
    smtp_pass: string
    mail_encryption: 'ssl' | 'tls'
    sendgrid_api_key: string
  }
}

export interface StatusPageProps {
  title: string
  description: string
  icon?: LucideIcon
  image?: string
  showHome?: boolean
  showRetry?: boolean
  onRetry?: () => void
  isRetrying?: boolean
  errorCode?: string
  isMaintenance?: boolean
  statusBadge?: string
}

export interface BrandAssetsTabsProps {
  faviconUrl?: string | null
  appIconUrl?: string | null
  emailLogoUrl?: string | null
  onFileSelect: (key: string, file: File | null) => void
  isUpdating: boolean
}

export interface LivePreviewProps {
  primaryColor: string
  secondaryColor: string
  logoDarkUrl?: string | null
  logoLightUrl?: string | null
  sidebarLogoDarkUrl?: string | null
  sidebarLogoLightUrl?: string | null
  liveLogo?: { url: string; target: string } | null
  logoConfig?: any
}

export interface BrandColorsProps {
  primaryColor: string
  secondaryColor: string
  accents: string[]
  onChangePrimary: (color: string) => void
  onChangeSecondary: (color: string) => void
  onChangeAccents: (colors: string[]) => void
}

export interface BrandPlacementProps {
  files: Record<string, File | 'null' | null>
  settings: any
  onFileSelect?: (key: string, file: File | null) => void
  keysToShow?: string[]
}

export interface LogoDesignerProps {
  primaryColor: string
  secondaryColor: string
  onApplyLogo: (key: string, file: File) => void
  isSaving: boolean
  onDesignChange?: (url: string, target: string) => void
}
