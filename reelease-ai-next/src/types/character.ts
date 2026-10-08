export interface Character {
  _id: string
  id: string
  name: string
  description?: string
  prompt: string
  negative_prompt?: string
  image_url: string
  style: string
  resolution: string
  provider?: string
  model_used?: string
  credits_used?: number
  user_id?: string
  tags?: string[]
  status?: 'active' | 'inactive' | 'draft'
  usage_count?: number
  created_at?: string
  updated_at?: string
}

export interface StyleOption {
  value: string
  label: string
  defaultLabel:string
}

export interface ResolutionOption {
  value: string
  label: string
  defaultLabel:string
}

export interface CharacterFormProps {
  name: string
  setName: (val: string) => void
  description: string
  setDescription: (val: string) => void
  prompt: string
  setPrompt: (val: string) => void
  negativePrompt: string
  setNegativePrompt: (val: string) => void
  style: string
  setStyle: (val: string) => void
  resolution: string
  setResolution: (val: string) => void
  tags: string
  setTags: (val: string) => void
  imagePreview: string
  setImagePreview: (val: string) => void
  setReferenceImageUrl: (val: string) => void
  isGenerating: boolean
  onGenerate: () => void
}

export interface CharacterResultProps {
  isGenerating: boolean
  resultImage: string | null
  currentCharacter: Character | null
  isSaving: boolean
  onSaveToMedia: () => void
  onDownload: () => void
}

export interface GetCharactersResponse {
  success: boolean
  data: {
    characters: Character[]
    pagination: {
      total: number
      page: number
      limit: number
      pages: number
    }
  }
}

export interface CharTaskProp {
  taskId: string
  type: string
  status: string
  character: Character
  message: string
}
