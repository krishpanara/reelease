export interface Caption {
  id: string
  _id?: string
  name: string
  source: 'manual' | 'ai'
  status: 'active' | 'inactive' | 'draft'
  content: string
  tags: string[]
  notes?: string
  created_at: string
  updated_at: string
}

export interface CaptionResponse {
  captions: Caption[]
  total: number
  pages: number
  currentPage: number
}
