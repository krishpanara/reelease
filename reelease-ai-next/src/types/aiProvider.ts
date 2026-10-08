import { Attachment } from './attachment'

export interface JobRequest {
  endpoint: string
  method: string
  payload: string
  job_id_path?: string
}

export interface PollJobStatus {
  endpoint: string
  method: string
  state_path: string
  success_state_value: string
  failed_state_value: string
  result_media_url_path: string
}

export interface ServiceConfig {
  api_key: string
  base_url: string
  auth_type: string
  create_job_request: JobRequest
  poll_job_status?: PollJobStatus
}

export interface AIProvider {
  id: string
  _id?: string
  name: string
  text_to_image?: ServiceConfig
  image_to_image?: ServiceConfig
  video_motion?: ServiceConfig
  images_to_video?: ServiceConfig
  text_to_video?: ServiceConfig
  created_at?: string
  updatedAt?: string
}

export interface GetAIProvidersResponse {
  message: string
  providers: AIProvider[]
}

export interface GetAIProviderResponse {
  message: string
  provider: AIProvider
}

export interface CreateAIProviderRequest {
  name: string
  text_to_image?: Partial<ServiceConfig>
  image_to_image?: Partial<ServiceConfig>
  video_motion?: Partial<ServiceConfig>
  images_to_video?: Partial<ServiceConfig>
  text_to_video?: Partial<ServiceConfig>
}

export type UpdateAIProviderRequest = Partial<CreateAIProviderRequest>

export type ServiceType = 'text_to_image' | 'image_to_image' | 'video_motion' | 'images_to_video' | 'text_to_video'

export interface AIFeatureCredit {
  id?: string
  _id?: string
  provider_id: string
  feature_key: string
  display_name: string
  description?: string
  icon?: string
  credits: number
  is_per_second: boolean
  created_at?: string
  updated_at?: string
}

export interface GetAIFeatureCreditsResponse {
  message: string
  credits: AIFeatureCredit[]
}

export interface UpsertAIFeatureCreditRequest {
  provider_id: string
  feature_key: string
  display_name: string
  description?: string
  icon?: string
  credits: number
  is_per_second: boolean
}
export interface TestProviderRequest {
  providerId: string
  serviceType: ServiceType
  prompt: string
  apiKey?: string
  aspectRatio?: string
  resolution?: string
  duration?: number
  sound?: boolean
  mode?: string
  attachmentId?: string
  videoAttachmentId?: string
  attachmentIds?: string[]
}

export interface ProviderCardProps {
  provider: AIProvider
  onEdit: (provider: AIProvider) => void
  onDelete: (id: string) => void
}

export interface ProviderFormProps {
  editingProvider?: AIProvider | null
  onSuccess: () => void
  onCancel: () => void
}

export interface ProviderCreditsConfigProps {
  enabledServices: Set<ServiceType>
  serviceTabs: any[]
}

export interface ProviderServiceConfigProps {
  activeTab: ServiceType
  tab: any
  isEnabled: boolean
  toggleService: (key: ServiceType) => void
  values: any
  onMenuClick?: () => void
}

export interface TestProviderInputViewProps {
  serviceType: ServiceType
  setServiceType: (v: ServiceType) => void
  aspectRatio: string
  setAspectRatio: (v: string) => void
  resolution: string
  setResolution: (v: string) => void
  referenceImages: Attachment[]
  setReferenceImages: (v: Attachment[] | ((prev: Attachment[]) => Attachment[])) => void
  referenceVideo: Attachment | null
  setReferenceVideo: (v: Attachment | null) => void
  duration: number
  setDuration: (v: number) => void
  mode: string
  setMode: (v: string) => void
  sound: boolean
  setSound: (v: boolean) => void
  prompt: string
  setPrompt: (v: string) => void
  apiKey: string
  setApiKey: (v: string) => void
  setMediaPickerTarget: (v: 'image' | 'video') => void
  setMediaPickerTargetIndex: (v: number | null) => void
  setIsMediaPickerOpen: (v: boolean) => void
}
type ModalView = 'input' | 'processing' | 'result'
export interface TestProviderModalProps {
  isOpen: boolean
  onClose: () => void
  providerId: string
  providerName: string
  taskId: string | null
  setTaskId: (id: string | null) => void
  view: ModalView
  setView: (view: ModalView) => void
  result: {
    url: string | null
    status: 'completed' | 'failed'
    message?: string
  } | null
  setResult: (res: { url: string | null; status: 'completed' | 'failed'; message?: string } | null) => void
}

export interface TestProviderProcessingViewProps {
  taskId: string | null
}

export interface TestProviderResultViewProps {
  result: {
    url: string | null
    status: 'completed' | 'failed'
    message?: string
  } | null
  isVideo: boolean
}

export interface FacebookContextType {
  isSDKReady: boolean
  appId: string | null
}

declare global {
  interface Window {
    FB: any
    fbAsyncInit: () => void
  }
}
