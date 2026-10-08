import { Attachment } from '../attachment'

export interface AITemplateCategory {
  _id: string
  id: string
  name: string
  slug: string
  description?: string
  attachment_id?: string | Attachment
  status: boolean
  created_at: string
  updated_at: string
}

export interface CategoryCardProps {
  category: AITemplateCategory
  onEdit: (c: AITemplateCategory) => void
  onDelete: (id: string) => void
  onStatusChange: (id: string, status: boolean, c: AITemplateCategory) => void
  canUpdate?: boolean
  canDelete?: boolean
}

export interface AITemplateCategoryModalProps {
  isOpen: boolean
  onClose: () => void
  category: AITemplateCategory | null
}

export interface TemplateCardProps {
  template: AITemplate
  onEdit: (t: AITemplate) => void
  onDelete: (id: string) => void
  onStatusChange: (id: string, status: boolean, t: AITemplate) => void
  onView?: (t: AITemplate) => void
  canUpdate?: boolean
  canDelete?: boolean
}

export interface AITemplateModalProps {
  isOpen: boolean
  onClose: () => void
  template: AITemplate | null
}

export interface AITemplate {
  _id: string
  id: string
  title: string
  prompt: string
  category_id: any
  status: boolean
  file_path?: string
  attachment_id?: any
  created_at: string
  updated_at: string
}

export interface EmailTemplate {
  id: string | null;
  slug: string;
  name: string;
  description: string;
  default_subject: string;
  default_content: string;
  subject: string;
  content: string;
  status: boolean;
  is_configured: boolean;
  shortcodes: { type: string; text: string; action: string }[];
}
