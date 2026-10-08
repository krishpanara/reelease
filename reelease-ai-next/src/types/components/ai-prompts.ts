
export interface PromptFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: Partial<AiPrompt>) => Promise<void>
  prompt: AiPrompt | null
  isLoading: boolean
}

export interface PromptCardProps {
  prompt: AiPrompt
  onEdit?: (p: AiPrompt) => void
  onDelete?: (p: AiPrompt) => void
}

export interface PromptLibraryModalProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (prompt: string, extraData?: any) => void
  mode: 'text_to_image' | 'image_to_image' | 'text_to_video' | 'image_to_video' | 'video_motion'
}

export interface PromptLibraryEmptyStateProps {
  search: string
  categoryFilter: string
  handleOpenCreate: () => void
}

export interface PromptLibraryStatsProps {
  total: number
  categoriesCount: number
  currentPageCount: number
}

export interface PromptLibraryToolbarProps {
  search: string
  setSearch: (val: string) => void
  categoryFilter: string
  setCategoryFilter: (val: string) => void
  categories: string[]
  onResetPage: () => void
}
export interface AiPrompt {
  _id?: string
  id?: string
  category: string
  prompt: string
  created_at?: string
  updated_at?: string
}

export interface AiPromptResponse {
  prompts: AiPrompt[]
  total: number
  totalPages: number
  currentPage: number
}

export interface AiPromptParams {
  page?: number
  limit?: number
  search?: string
  category?: string
}
