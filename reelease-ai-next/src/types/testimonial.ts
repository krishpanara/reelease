
export interface TestimonialCardProps {
  testimonial: Testimonial
  onEdit: (testimonial: Testimonial) => void
  onDelete: (testimonial: Testimonial) => void
  onToggleStatus: (testimonial: Testimonial) => void
  canUpdate?: boolean
  canDelete?: boolean
}

export interface TestimonialFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: FormData) => Promise<void>
  testimonial?: Testimonial | null
  isLoading?: boolean
}

export interface Testimonial {
  _id?: string
  id?: string
  title: string
  description: string
  status: boolean
  rating: number
  user_name: string
  user_post: string
  user_image: string | null
  created_at?: string
  updated_at?: string
}

export interface TestimonialResponse {
  message: string
  testimonials: Testimonial[]
  total: number
  totalPages: number
  page: number
  limit: number
}