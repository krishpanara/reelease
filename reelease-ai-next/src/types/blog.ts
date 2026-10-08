import { Attachment } from './attachment'

export interface Category {
  _id: string
  id: string
  name: string
  slug: string
  description?: string
  image_id?: string | Attachment
  meta_title?: string
  meta_description?: string
  meta_image_id?: string | Attachment
  status: boolean
  parent_id?: string | Category
  children?: Category[]
  created_at: string
  updated_at: string
}

export interface Tag {
  _id: string
  id: string
  title: string
  description?: string
  status: boolean
  created_at: string
  updated_at: string
}

export interface Blog {
  _id: string
  id: string
  title: string
  slug: string
  description: string
  content: string
  thumbnail_id: string | Attachment
  meta_title?: string
  meta_description?: string
  meta_image_id?: string | Attachment
  categories: string[] | Category[]
  tags: string[] | Tag[]
  is_featured: boolean
  status: boolean
  created_at: string
  updated_at: string
}

export interface BlogResponse {
  blogs: Blog[]
  totalPages: number
  currentPage: number
  total: number
}

export interface BlogCardProps {
  blog: Blog
  onEdit?: (blog: Blog) => void
  onDelete?: (id: string) => void
  onClick: (blog: Blog) => void
}

export interface BlogFormProps {
  blog: Blog | null
  onClose: () => void
}

export interface BlogDetailsProps {
  blog: Blog
  allBlogs: Blog[]
  onClose: () => void
  onNavigate: (blog: Blog) => void
}

export interface CategoryModalProps {
  isOpen: boolean
  onClose: () => void
  category?: Category | null
}

export interface TagModalProps {
  isOpen: boolean
  onClose: () => void
  tag?: Tag | null
}

export interface BlogDetailsSidebarProps {
  recentBlogs: Blog[]
  onNavigate: (blog: Blog) => void
  onClose: () => void
}

export interface BlogHeaderProps {
  blog: Blog
}

export interface BlogNavigationProps {
  prevBlog: Blog | null
  nextBlog: Blog | null
  onNavigate: (blog: Blog) => void
}

export interface BlogGeneralInfoProps {
  setFieldValue: (field: string, value: any) => void
  values: any
  isEditing: boolean
}

export interface BlogFormSidebarProps {
  values: any
  setFieldValue: (field: string, value: any) => void
  touched: any
  errors: any
  categories: Category[]
  tags: Tag[]
  thumbnailUrl: string | null
  setThumbnailUrl: (url: string | null) => void
  uploadAttachment: any
  isUploading: boolean
  isLoading: boolean
  isEditing: boolean
  onClose: () => void
  dirty?: boolean
}

export interface BlogListProps {
  search: string
  onEdit: (blog: Blog) => void
}
export interface CategoryFormProps {
  category: Category | null
  availableCategories: Category[]
  onSuccess: () => void
  onCancel?: () => void
}