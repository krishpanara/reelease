import { catalogueAspectRatios } from "@/data/ecommerceCatalogue"
import { Character } from "./character"
import { TFunction } from "i18next"

export type CatalogueAspectRatio = (typeof catalogueAspectRatios)[number]
export interface CatalogueModelItem {
  id: string
  name: string
  description: string
  image_url: string
  isFromLibrary?: boolean
}

export interface CatalogueProductItem {
  id: string
  name: string
  image_url: string
}

export type CataloguePickerMode = 'otherCharacter' | 'product' | null
export type CatalogueView = 'library' | 'create'

export interface CatalogueCharacterPickerProps {
  selectedModel: CatalogueModelItem | null
  isLoading: boolean
  hasNoCharacters: boolean
  onPickFromLibrary: () => void
}

export interface CatalogueCreateViewProps {
  selectedModel: CatalogueModelItem | null
  selectedProduct: CatalogueProductItem | null
  promptText: string
  aspectRatio: string
  duration: number
  isGenerating: boolean
  isEnhancingPrompt: boolean
  isLoadingCharacters: boolean
  characters: Character[]
  onBack: () => void
  onPickCharacterFromLibrary: () => void
  onPickProduct: () => void
  onClearProduct: () => void
  onPromptChange: (v: string) => void
  onImprovePrompt: () => void
  onAddDetails: () => void
  onSurpriseMe: () => void
  onOpenPromptLibrary: () => void
  sound: boolean
  onDurationChange: (v: number) => void
  onAspectRatioChange: (ar: string) => void
  onSoundChange: (v: boolean) => void
  onGenerate: () => void
}

export interface CatalogueEmptyStateProps {
  onCreateClick: () => void
}

export interface CatalogueVideoPlayerProps {
  videoUrl: string | null
  prompt?: string | null
  onClose: () => void
}

export interface CatalogueProductPickerProps {
  selectedProduct: CatalogueProductItem | null
  onPickProduct: () => void
  onClearProduct: () => void
}

export interface CatalogueSummarySidebarProps {
  selectedModel: CatalogueModelItem | null
  selectedProduct: CatalogueProductItem | null
  aspectRatio: string
  duration: number
  isGenerating: boolean
  promptText: string
  onGenerate: () => void
}

export interface CatalogueVideoCardProps {
  task: CatalogueTask
  onPlay: (url: string, prompt: string | null) => void
  onDelete: (id: string) => void
}

export interface CatalogueVideoSettingsProps {
  stepNumber?: number
  title?: string
  description?: string
  duration: number
  aspectRatio: string
  sound: boolean
  addWatermark: boolean
  addBackgroundMusicToggle: boolean
  customMusicUrl: string
  onDurationChange: (v: number) => void
  onAspectRatioChange: (ar: string) => void
  onSoundChange: (v: boolean) => void
  onAddWatermarkChange: (v: boolean) => void
  onAddBackgroundMusicToggleChange: (v: boolean) => void
  onCustomMusicUrlChange: (v: string) => void
}

export type AIPromptDescribeSectionProps = {
  stepNumber?: number
  title: string
  description: string
  placeholder: string
  prompt: string
  onPromptChange: any
  maxLength?: number
  isEnhancingPrompt?: boolean
  onImprovePrompt?: boolean
  onAddDetails?: boolean
  onSurpriseMe?: boolean
  onOpenPromptLibrary: () => void
  improveLabel?: string
  addDetailsLabel?: string
  surpriseLabel?: string
  promptLibraryLabel?: string
  generateCaption?:any
  t:TFunction
}

export interface ModelItem {
  id: string
  name: string
  description: string
  image_url: string
  isCustom?: boolean
}

export interface ProductItem {
  id: string
  name: string
  image_url: string
}
export interface CatalogueTask {
  _id: string
  id: string
  user_id: string
  service_type: string
  task_id: string
  status: 'pending' | 'running' | 'completed' | 'failed'
  result_url?: string
  credits_used: number
  payload: {
    character: {
      id: string
      name: string
      image_url: string
      description?: string
    }
    product: {
      id: string
      name: string
      image_url: string
    }
    prompt: string
    aspectRatio: string
    duration: string
  }
  error_message?: string
  created_at: string
  updated_at: string
}

export interface GenerateCatalogueRequest {
  character: {
    id: string
    name: string
    image_url: string
    description?: string
  }
  product: {
    id: string
    name: string
    image_url: string
  }
  prompt: string
  aspectRatio?: string
  duration?: string
  sound?:boolean
  addWatermark?: boolean
  addBackgroundMusic?: boolean
  backgroundMusicUrl?: string
}

export interface GenerateCatalogueResponse {
  success: boolean
  message: string
  taskId: string
  task: CatalogueTask
}