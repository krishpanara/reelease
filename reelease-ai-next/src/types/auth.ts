import { LucideIcon } from 'lucide-react'
import { LoginRequest, RegisterRequest } from './api'

export interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
}

export interface SubmodulePermission {
  id: string
  name: string
  read: boolean
  write: boolean
}

export interface ModulePermission {
  id: string
  module: string
  submodules: SubmodulePermission[]
}

export interface User {
  _id: string
  id?: string
  name: string
  email: string
  role: string
  roleId?: string
  permissions: string[]
  avatar?: string | null
  isActive: boolean
  total_credits?: number
  caption_credits?: number
  used_credits?: number
  lastLogin?: string
  remaining_credits?: number
  top_up_credits?: number
  top_up_expires_at?: string | null
}

export interface LoginFormValues extends LoginRequest {}

export interface RegisterFormValues extends RegisterRequest {
  confirmPassword: string
}

export interface ForgotPasswordFormValues {
  email: string
}

export interface VerifyOtpFormValues {
  otp: string
}

export interface ResetPasswordFormValues {
  password: string
  confirmPassword: string
}

export interface AuthInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  name: string
  label?: string
  icon?: LucideIcon
  className?: string
}