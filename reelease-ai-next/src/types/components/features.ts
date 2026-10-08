import { LucideIcon } from 'lucide-react'
import { AITemplate, Attachment } from '..'
import { AiPrompt } from './ai-prompts'
import { watermarkBlendModes, watermarkPositions } from '@/data/watermark'

export type watermarkPosition = (typeof watermarkPositions)[number]
export type watermarkBlendMode = (typeof watermarkBlendModes)[number]['value']

export type AIFeaturePageHeaderProps = {
  title: string
  subtitle: string
  icon?: React.ReactNode
}

export type FeatureTag = {
  label: string
  icon: LucideIcon
  iconClassName?: string
}

export type AIFeatureTagsBarProps = {
  tags: FeatureTag[]
}
export type AIProTipsCardProps = {
  tips: string
  learnMoreMessage?: string
}

export type SelectedMusic = {
  name: string
  url: string
  serverPath: string
}

export type MusicAttachmentPickerProps = {
  selectedMusic: SelectedMusic | null
  onSelect: (music: SelectedMusic | null) => void
}
export type GenerationLogItem = {
  _id?: string
  id?: string
  task_id?: string
  status?: string
  result_url?: string | null
  created_at?: string
  payload?: Record<string, unknown>
}

export type AIRecentGenerationsHistoryProps = {
  logs: GenerationLogItem[]
  mediaType: 'image' | 'video'
  onSelectLog: (log: GenerationLogItem) => void
  title?: string
  emptyMessage?: string
}
export type GatewayId = 'stripe' | 'razorpay' | 'paypal'
export type ExportFormat = 'excel' | 'csv' | 'pdf'

export interface VideoGenerationOptionsProps {
  aspectRatio: string
  setAspectRatio: (value: string) => void
  duration: number
  setDuration: (value: number) => void
  mode: string
  setMode: (value: string) => void
  sound: boolean
  setSound: (value: boolean) => void
  hideDuration?: boolean
}

export interface WatermarkPreviewProps {
  watermarkType: 'image' | 'text'
  position: string
  opacity: number[]
  scale: number[]
  rotation: number[]
  padding: number[]
  blendMode: string
  tiling: boolean
  text: string
  selectedImage: string | null
  textStyle: string
  fontWeight: string
  isItalic: boolean
  isUnderline: boolean
  textColor: string
  fontFamily: string
}

export interface WatermarkImagePickerProps {
  selectedImage: string | null
  onOpenPicker: () => void
  onClearImage: (e: React.MouseEvent) => void
}

export interface WatermarkTextInputProps {
  text: string
  textStyle: string
  fontWeight: string
  isItalic: boolean
  isUnderline: boolean
  textColor: string
  fontFamily: string
  onTextChange: (value: string) => void
  onTextStyleChange: (value: string) => void
  onFontWeightChange: (value: string) => void
  onItalicChange: (value: boolean) => void
  onUnderlineChange: (value: boolean) => void
  onTextColorChange: (value: string) => void
  onFontFamilyChange: (value: string) => void
}

export interface WatermarkLeftPanelProps {
  watermarkType: 'image' | 'text'
  text: string
  selectedImage: string | null
  textStyle: string
  fontWeight: string
  isItalic: boolean
  isUnderline: boolean
  textColor: string
  fontFamily: string
  onTypeChange: (v: 'image' | 'text') => void
  onTextChange: (v: string) => void
  onTextStyleChange: (v: string) => void
  onFontWeightChange: (v: string) => void
  onItalicChange: (v: boolean) => void
  onUnderlineChange: (v: boolean) => void
  onTextColorChange: (v: string) => void
  onFontFamilyChange: (v: string) => void
  onOpenPicker: () => void
  onClearImage: (e: React.MouseEvent) => void
  transparent?: boolean
}

export interface WatermarkRightPanelProps {
  opacity: number[]
  scale: number[]
  rotation: number[]
  padding: number[]
  blendMode: string
  tiling: boolean
  position: string
  onOpacityChange: (v: number[]) => void
  onScaleChange: (v: number[]) => void
  onRotationChange: (v: number[]) => void
  onPaddingChange: (v: number[]) => void
  onBlendModeChange: (v: string) => void
  onTilingChange: (v: boolean) => void
  onPositionChange: (v: string) => void
  transparent?: boolean
  hideHeader?: boolean
}

export interface SliderRowProps {
  label: string
  value: number
  unit?: string
  children: React.ReactNode
}

export interface ChannelMetricsDisplay {
  postsThisMonth: number
  engagement: number
}

export interface Channel {
  id: string
  account_id?: string
  name: string
  username: string
  platform: string
  status: 'ACTIVE' | 'PAUSED' | 'EXPIRED'
  profile_picture?: string
  connected_at: string
  permissions?: string[]
}

export interface ChannelStatsProps {
  total: number
  active: number
  paused: number
  recent: number
}

export type ChannelStatsPeriod = 'today' | 'week' | 'month' | 'year' | 'all'

export type ChannelSortOption = 'name_asc' | 'name_desc' | 'platform' | 'recent' | 'status'
export type ChannelViewMode = 'grid' | 'list'

export interface ChannelsContentProps {
  isModalOpen?: boolean
  setIsModalOpen?: (open: boolean) => void
}

export interface ChannelControlBarProps {
  searchQuery: string
  onSearchChange: (v: string) => void
  viewMode: ChannelViewMode
  onViewModeChange: (v: ChannelViewMode) => void
  platformFilter: string
  onPlatformFilterChange: (v: string) => void
  statusFilter: string
  onStatusFilterChange: (v: string) => void
  sortBy: ChannelSortOption
  onSortChange: (v: ChannelSortOption) => void
  onClearFilters: () => void
  hasActiveFilters: boolean
}

export interface ChannelCardProps {
  channel: Channel
  viewMode: 'grid' | 'list'
  onOpen: (id: string) => void
  onAnalytics: (id: string) => void
  onReconnect: (id: string) => void
  onReauth: (id: string) => void
  onPause: (id: string) => void
  onDelete: (id: string) => void
  metrics?: ChannelMetricsDisplay
  isMetricsLoading?: boolean
  isPauseLoading?: boolean
}

export interface ImageToImageOutputProps {
  isGenerating: boolean
  resultImage: string | null
  isSaving: boolean
  handleSaveToMedia: () => void
  handleDownload: () => void
}

export interface ImageToImageTemplatesSidebarProps {
  isLoadingTemplates: boolean
  templates: AITemplate[]
  onTemplateClick: (template: AITemplate) => void
}

export interface ImageToImageTemplatesSidebarProps {
  isLoadingTemplates: boolean
  templates: AITemplate[]
  onTemplateClick: (template: AITemplate) => void
}

export interface ReferenceImageUploadProps {
  selectedAttachments: Attachment[]
  setSelectedAttachments: (value: Attachment[] | ((prev: Attachment[]) => Attachment[])) => void
  setIsMediaPickerOpen: (open: boolean) => void
}

export interface GenerationOutputProps {
  isGenerating: boolean
  resultVideo: string | null
  isSaving: boolean
  handleSaveToMedia: () => void
  handleDownload: () => void
  recentLogs?: any[]
  onSelectRecentLog?: (log: any) => void
}

export interface ReferenceImagesProps {
  isMultiShot: boolean
  shots: { image: Attachment | null; prompt: string; duration: number }[]
  setShots: React.Dispatch<React.SetStateAction<{ image: Attachment | null; prompt: string; duration: number }[]>>
  startAttachment: Attachment | null
  endAttachment: Attachment | null
  setStartAttachment: (a: Attachment | null) => void
  setEndAttachment: (a: Attachment | null) => void
  onOpenPicker: (type: 'start' | 'end' | 'shot', index?: number) => void
}

export interface TemplateSidebarProps {
  isLoadingTemplates: boolean
  templates: AITemplate[]
  setPrompt: (prompt: string) => void
}

export interface TextToImageOutputProps {
  isGenerating: boolean
  resultImage: string | null
  isSaving: boolean
  handleSaveToMedia: () => void
  handleDownload: () => void
}

export interface TextToImageTemplatesSidebarProps {
  isLoadingTemplates: boolean
  templates: AiPrompt[]
  onTemplateClick: (template: AiPrompt) => void
}

export interface TextToVideoOutputProps {
  isGenerating: boolean
  resultVideo: string | null
  isSaving: boolean
  handleSaveToMedia: () => void
  handleDownload: () => void
}

export interface TextToVideoTemplatesSidebarProps {
  isLoadingTemplates: boolean
  templates: AITemplate[]
  setPrompt: (prompt: string) => void
}

export interface PreviewStageProps {
  isGenerating: boolean
  resultVideo: string | null
  isSaving: boolean
  onSave: () => void
  onDownload: () => void
}

export interface PromptConsoleProps {
  prompt: string
  setPrompt: (v: string) => void
  isGenerating: boolean
  credits: number | undefined
  onGenerate: () => void
  onOpenPromptLibrary: () => void
  disabled?: boolean
}

export interface Attachments {
  file_path: string
  id?: string
  _id?: string
}

export interface ReferenceMediaPanelProps {
  selectedVideo: Attachments | null
  selectedImage: Attachments | null
  onOpenPicker: (type: 'video' | 'image') => void
}

export interface ChannelMetrics {
  postsThisMonth: number
  engagement: number
}

export interface MediaTaskProp {
  taskId: string
  status: string
  resultUrl: string
  message: string
}

export interface TestProviderProps {
  status: string
  resultUrl?: string
  message?: string
}