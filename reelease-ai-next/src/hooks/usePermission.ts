'use client'

import { useAppSelector } from '@/redux/hooks'
import { ModulePermission, UserPermission } from '@/types/permission'

export const usePermission = () => {
  const { user, isAuthenticated } = useAppSelector((state) => state.auth)
  const userPermissions: UserPermission[] = user?.permissions || []
  const userRole = user?.role || 'user'

  const hasPermission = (permissionName: string, type: 'read' | 'write' = 'read') => {
    // Check for essential default permissions
    if (permissionName === 'View API Keys' || permissionName === 'Manage APIs' || 
        permissionName === 'view.api_keys' || permissionName === 'manage.apis' ||
        permissionName === 'manage.settings') return true
    
    if (!userPermissions || userPermissions.length === 0) return false

    // 1. Check if userPermissions is a flat array of strings (slugs or names)
    if (typeof userPermissions[0] === 'string') {
      const perms = userPermissions as string[]
      return perms.includes(permissionName) || 
             perms.includes(permissionName.toLowerCase()) ||
             perms.some(p => p.toLowerCase() === permissionName.toLowerCase())
    }

    // 2. Check if userPermissions is an array of ModulePermission objects (nested structure)
    if (typeof userPermissions[0] === 'object') {
      for (const mod of (userPermissions as any[])) {
        if (!mod.submodules) continue
        const found = mod.submodules.find((s: any) => 
          s.name === permissionName || 
          s.slug === permissionName ||
          s.name?.toLowerCase() === permissionName.toLowerCase() ||
          s.slug?.toLowerCase() === permissionName.toLowerCase()
        )
        if (found) {
          return type === 'write' ? found.write : (found.read || found.write || true)
        }
      }
    }
    
    return false
  }

  const hasAnyPermission = (permissionNames: string[], type: 'read' | 'write' = 'read') => {
    return permissionNames.some(p => hasPermission(p, type))
  }

  const hasAllPermissions = (permissionNames: string[], type: 'read' | 'write' = 'read') => {
    return permissionNames.every(p => hasPermission(p, type))
  }

  const isAdmin = () => userRole === 'admin' || userRole === 'super_admin'
  const isAgent = () => userRole === 'agent'
  const isAssigner = () => userRole === 'assigner'

  return {
    user,
    isAuthenticated,
    permissions: userPermissions,
    role: userRole,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    isAdmin,
    isAgent,
    isAssigner
  }
}
