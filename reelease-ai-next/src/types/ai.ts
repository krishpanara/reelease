export interface GenerateMediaRequest {
  serviceType: string
  prompt?: string
  referenceUrl?: string
  attachmentId?: string
  referenceUrls?: string[]
  attachmentIds?: string[]
  videoUrl?: string
  videoAttachmentId?: string
  aspectRatio?: string
  resolution?: string
  duration?: number
  sound?: boolean
  mode?: string
  multiShots?: boolean
  multiPrompt?: string[]
  klingElements?: any[]
  addWatermark?: boolean
  allowWatermark?: boolean
  numImages?: number
  negativePrompt?: string
  n?: number
  backgroundMusicUrl?: string
  backgroundMusicPath?: string
  addSubtitles?: boolean
  subtitleStyle?: string
  videoQuality?: string
  renderingMode?: string
  voice?: string
  language?: string
  seed?: string
  autoSceneBreakdown?: boolean
  addBackgroundMusic?: boolean
  enhanceVisuals?: boolean
}

export interface GenerateMediaResponse {
  success: boolean
  message: string
  taskId: string
  credits_remaining: number
}

export interface AITask {
  _id: string
  id: string
  user_id: string
  provider_id: string
  service_type: string
  task_id: string
  status: 'running' | 'completed' | 'failed'
  credits_used: number
  result_url?: string
  error_message?: string
  created_at: string
  updated_at: string
  payload?: {
    prompt?: string
    text?: string
    input?: { prompt?: string }
    addWatermark?: boolean
    allowWatermark?: boolean
    [key: string]: any
  }
}

export interface UsageLogsResponse {
  logs: AITask[]
  totalPages: number
  currentPage: number
  total: number
}