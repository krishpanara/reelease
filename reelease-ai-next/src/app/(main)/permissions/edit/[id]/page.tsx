'use client'

import RoleForm from '@/components/feature/permissions/RoleForm'
import { ROUTES } from '@/constants/routes'
import { 
  useGetRoleByIdQuery, 
  useUpdateRoleMutation, 
  useUpdateRolePermissionsMutation 
} from '@/redux/api/roleApi'
import { useParams, useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Skeleton } from '@/components/ui/skeleton'
import { useMemo } from 'react'

const EditRoleSkeleton = () => {
  return (
    <div className="w-full pb-8 animate-in fade-in duration-300">
      {/* Header Skeleton */}
      <div className="flex items-center gap-3 mb-8">
        <Skeleton className="h-10 w-10 bg-slate-200/80 dark:bg-white/10 rounded-radius shrink-0" />
        <Skeleton className="h-9 w-60 bg-slate-200/80 dark:bg-white/10 rounded-md" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        {/* Sidebar - General Information Skeleton */}
        <div className="xl:col-span-4 space-y-6">
          <div className="glass-card dark:bg-white/3 bg-white rounded-border-radius sm:p-6 p-4 space-y-6">
            {/* Card Header */}
            <div className="flex items-center sm:gap-4 gap-2 border-b border-glass-border pb-4">
              <Skeleton className="sm:w-12 sm:h-12 w-10 h-10 rounded-radius bg-slate-200/80 dark:bg-white/10 shrink-0" />
              <Skeleton className="h-6 w-44 bg-slate-200/80 dark:bg-white/10 rounded" />
            </div>

            <div className="space-y-6">
              {/* Name Field */}
              <div className="space-y-2 flex flex-col">
                <Skeleton className="h-4 w-32 bg-slate-200/80 dark:bg-white/10 rounded" />
                <Skeleton className="h-12 w-full bg-slate-200/80 dark:bg-white/10 rounded-[10px]" />
              </div>

              {/* Description Field */}
              <div className="space-y-2 flex flex-col">
                <Skeleton className="h-4 w-24 bg-slate-200/80 dark:bg-white/10 rounded" />
                <Skeleton className="h-12 w-full bg-slate-200/80 dark:bg-white/10 rounded-[10px]" />
              </div>

              {/* Active Status Container */}
              <div className="flex items-center justify-between p-5 rounded-border-radius border border-glass-border">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-28 bg-slate-200/80 dark:bg-white/10 rounded" />
                  <Skeleton className="h-3 w-36 bg-slate-200/80 dark:bg-white/10 rounded" />
                </div>
                <Skeleton className="h-6 w-11 bg-slate-200/80 dark:bg-white/10 rounded-full" />
              </div>
            </div>
          </div>
        </div>

        {/* Main Content - Access Permissions Skeleton */}
        <div className="xl:col-span-8">
          <div className="glass-card rounded-border-radius border border-glass-border sm:p-6 p-4 bg-white dark:bg-white/3 backdrop-blur-xl h-full space-y-6">
            {/* Header */}
            <div className="flex items-center sm:gap-4 gap-2 border-b border-glass-border pb-4">
              <Skeleton className="sm:w-12 sm:h-12 w-10 h-10 rounded-radius bg-slate-200/80 dark:bg-white/10 shrink-0" />
              <Skeleton className="h-6 w-44 bg-slate-200/80 dark:bg-white/10 rounded" />
            </div>

            {/* Search Input Skeleton */}
            <Skeleton className="h-11 w-full bg-slate-200/80 dark:bg-white/10 rounded-radius" />

            {/* Permissions Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="p-4 rounded-xl border border-glass-border space-y-4">
                  {/* Module header */}
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-5 w-5 bg-slate-200/80 dark:bg-white/10 rounded" />
                    <Skeleton className="h-4 w-20 bg-slate-200/80 dark:bg-white/10 rounded" />
                  </div>
                  {/* Checkbox rows */}
                  <div className="grid grid-cols-2 gap-2">
                    <Skeleton className="h-8 w-full bg-slate-200/80 dark:bg-white/10 rounded-[6px]" />
                    <Skeleton className="h-8 w-full bg-slate-200/80 dark:bg-white/10 rounded-[6px]" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons Skeleton */}
      <div className="flex items-center justify-end mt-8">
        <Skeleton className="h-12 w-32 bg-slate-200/80 dark:bg-white/10 rounded-radius" />
      </div>
    </div>
  )
}

const EditRolePage = () => {
  const params = useParams()
  const id = params.id as string
  const router = useRouter()
  
  const { data: roleData, isLoading: isFetching } = useGetRoleByIdQuery(id)
  const [updateRole, { isLoading: isUpdatingRole }] = useUpdateRoleMutation()
  const [updatePermissions, { isLoading: isUpdatingPermissions }] = useUpdateRolePermissionsMutation()
 
  const handleSubmit = async (values: any) => {
    try {
      // 1. Update basic info
      await updateRole({
        id,
        data: {
          name: values.name,
          description: values.description,
          status: values.status
        }
      }).unwrap()

      // 2. Update permissions
      await updatePermissions({
        id,
        permission_ids: values.permission_ids
      }).unwrap()

      toast.success('Role updated successfully')
      router.push(ROUTES.PERMISSIONS)
    } catch (error: any) {
      toast.error(error?.data?.message || 'Failed to update role')
    }
  }

  const initialValues = useMemo(() => {
    if (!roleData?.data) return undefined;
    if ('role' in roleData.data && 'permissions' in roleData.data) {
      return {
        ...roleData.data.role,
        permissions: roleData.data.permissions.map((p: any) => p._id || p.id)
      };
    }
    return undefined;
  }, [roleData]);

  if (isFetching) {
    return <EditRoleSkeleton />
  }

  return (
    <div>
      <RoleForm 
        key={id}
        mode="edit" 
        initialValues={initialValues as any} 
        onSubmit={handleSubmit} 
        isLoading={isUpdatingRole || isUpdatingPermissions} 
      />
    </div>
  )
}

export default EditRolePage
