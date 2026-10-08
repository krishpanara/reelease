import { User } from './auth'

export interface Faq {
  id: string
  title: string
  description: string
  status: boolean
  created_at: string
  updated_at: string
}

export interface FaqResponse {
  total: number
  totalPages: number
  page: number
  limit: number
  faqs: Faq[]
}

export interface FaqQueryParams {
  page?: number
  limit?: number
  search?: string
  sort_by?: string
  sort_order?: 'asc' | 'desc'
  status?: boolean
}

export interface LoginResponse {
  message: string
  token: string
  user: User
}

export interface RegisterResponse {
  message: string
  token: string
  user: User
}

export interface GenericResponse {
  message: string
}

export interface ApiError {
  data?: {
    message?: string
    error?: string
    errors?: string[]
  }
  status?: number
  message?: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  name: string
  email: string
  password: string
}

export interface ForgotPasswordRequest {
  email: string
}

export interface VerifyOtpRequest {
  email: string
  otp: string
}

export interface ResetPasswordRequest {
  email: string
  otp: string
  newPassword: string
}

export interface ChangePasswordRequest {
  currentPassword: string
  newPassword: string
}

export interface UpdateProfileRequest {
  name?: string
  avatar?: File
  remove_avatar?: boolean
}

export interface ContactInquiry {
  id: string
  name: string
  email: string
  subject: string
  message: string
  created_at: string
  updated_at: string
}

export interface Contact {
  id: string
  email: string
  name: string
  tags: string[]
  lists: string[]
  phone: string
  attributes: Record<string, any>
  consent: {
    email: boolean
    lastConsentDate?: string
    unsubscribeToken?: string
  }
  source: 'manual' | 'csv' | 'registration' | 'form' | 'api'
  createdAt: string
  updatedAt: string
}

export interface ContactInquiryResponse {
  total: number
  totalPages: number
  page: number
  limit: number
  inquiries: ContactInquiry[]
}

export interface ContactInquiryQueryParams {
  page?: number
  limit?: number
  search?: string
  sort_by?: string
  sort_order?: 'asc' | 'desc'
}

export interface UserResponse {
  total: number
  totalPages: number
  page: number
  limit: number
  users: User[]
}

export interface ContactResponse {
  contacts: Contact[]
  totalPages: number
  currentPage: number
  totalContacts: number
}

export interface ContactQueryParams {
  page?: number
  limit?: number
  search?: string
  listId?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  type?: 'email' | 'whatsapp'
}

export interface ContactGroup {
  id: string
  name: string
  description?: string
  count: number
  created_at: string
  updated_at: string
  contacts?: Contact[]
  contactIds?: string[]
  type: 'email' | 'whatsapp'
}

export interface ContactGroupResponse {
  lists: ContactGroup[]
  totalPages?: number
  currentPage?: number
  totalLists?: number
}

export interface ContactGroupQueryParams {
  page?: number
  limit?: number
  search?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  type?: 'email' | 'whatsapp'
}

export interface Condition {
  field: keyof Contact
  operator: 'equals' | 'contains' | 'starts_with' | 'ends_with' | 'not_equals' | 'not_contains'
  value: string | number
}

export interface Segment {
  id: string
  name: string
  count?: number
  message?: string
  description?: string
  conditions: Condition[]
  created_at: string
  updated_at: string
}

export interface SegmentResponse {
  segments: Segment[]
  totalPages?: number
  currentPage?: number
  totalSegments?: number
}

export interface SegmentQueryParams {
  page?: number
  limit?: number
  search?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface UserQueryParams {
  page?: number
  limit?: number
  search?: string
  sort_by?: string
  sort_order?: 'asc' | 'desc'
  has_last_login?: string
}

export interface Page {
  id: string
  _id?: string
  title: string
  slug: string
  content: string | null
  meta_title: string | null
  meta_description: string | null
  status: boolean
  created_by: string | User
  created_at: string
  updated_at: string
  description?: string
}

export interface PageResponse {
  total: number
  totalPages: number
  page: number
  limit: number
  pages: Page[]
}

export interface PageQueryParams {
  page?: number
  limit?: number
  search?: string
  created_by?: string
  status?: boolean
}

export interface AIFeature {
  feature_key: string
  display_name: string
  description: string
  icon: string
  credits: number
}
export interface AIFeatureName {
    text_to_image: boolean;
    image_to_image: boolean;
    video_motion: boolean;
    images_to_video: boolean;
    text_to_video: boolean;
  
}

export interface DashboardCategory {
  _id: string
  name: string
  slug: string
  description?: string
  status: boolean
  attachment_id?: {
    _id: string
    file_path: string
  }
}

export interface DashboardTemplate {
  _id: string
  title: string
  description: string
  type: string
  status: boolean
  attachment_id: {
    _id: string
    file_path: string
    file_type: string
  }
  category_id: {
    _id: string
    name: string
    slug: string
  }
  created_at: string
}

export interface DashboardBlog {
  _id: string
  title: string
  slug: string
  description: string
  thumbnail_id: {
    _id: string
    file_path: string
  }
  categories: {
    _id: string
    name: string
    slug: string
  }[]
  tags: {
    _id: string
    title: string
  }[]
  status: boolean
  created_at: string
  id?: string
}

export interface AdminDashboardStats {
  statistics: {
    [key: string]: number
    totalUsers: number
    activeSubscribers: number
    totalRevenue: number
    totalMedia: number
    totalPublishedPost: number
    totalAIProviders: number
    totalBlogs: number
    totalInquiries: number
    totalTemplates: number
    totalUpcomingPosts: number
    totalConnectedChannels: number
    totalTasks: number
  }
  recentActivities: {
    recentUsers: any[]
    recentSocialActivity: any[]
    recentTemplates: any[]
  }
  charts: {
    revenuePerMonth: { month: string; amount: number }[]
    serviceUsagePieChart: { service: string; count: number }[]
  }
}

export interface DashboardStats {
  aiFeatures: AIFeature[]
  categories: DashboardCategory[]
  templates: {
    data: DashboardTemplate[]
    pagination: {
      total: number
      totalPages: number
      currentPage: number
      limit: number
    }
  }
  blogs: DashboardBlog[]
  moduleUsage?: Record<string, number>
  systemLimits?: Record<string, number>
}

export interface TelegramGroup {
  id: string
  chatId: string
  title: string
  type: 'group' | 'supergroup' | 'channel'
  memberCount: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface TelegramGroupsResponse {
  data: TelegramGroup[]
  total: number
  totalPages: number
  page: number
  limit: number
}

export interface TelegramGroupInput {
  chatId: string
  title: string
  type?: 'group' | 'supergroup' | 'channel'
  memberCount?: number
}

export interface TelegramSubscriber {
  id: string
  telegramId: string
  username: string
  firstName: string
  lastName: string
  name: string
  status: 'active' | 'blocked' | 'unsubscribed'
  createdAt: string
  updatedAt: string
}

export interface TelegramSubscribersResponse {
  data: TelegramSubscriber[]
  total: number
  totalPages: number
  page: number
  limit: number
}

export interface TelegramQueryParams {
  page?: number
  limit?: number
  search?: string
  sort_by?: string
  sort_order?: 'asc' | 'desc'
}
