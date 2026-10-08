import { PERMISSIONS } from "@/constants/permissions";
import { CreateRoleRequest, Role, Permission as RolePermission } from "./role";

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS]

export interface PermissionPickerProps {
  permissions: RolePermission[]
  selectedIds: string[]
  onChange: (ids: string[]) => void;
  disabled?: boolean
}

export interface RoleFormProps {
  initialValues?: Role & { permissions: string[] }
  onSubmit: (values: CreateRoleRequest & { permission_ids: string[] }) => Promise<void>
  isLoading: boolean
  mode: 'create' | 'edit'
}

export interface GroupedPermissionModule {
  id: string
  module: string
  submodules: {
    id: string
    name: string
    slug: string
    description?: string
  }[]
}
export interface SubmodulePermission {
  name: string
  slug: string
  read?: boolean
  write?: boolean
}

export interface ModulePermission {
  submodules?: SubmodulePermission[]
}

export type UserPermission = string | ModulePermission