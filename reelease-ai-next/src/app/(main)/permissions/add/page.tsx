'use client'

import RoleForm from '@/components/feature/permissions/RoleForm'
import { ROUTES } from '@/constants/routes'
import { useCreateRoleMutation, useUpdateRolePermissionsMutation } from '@/redux/api/roleApi'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

const AddRolePage = () => {
  const router = useRouter()
  const [createRole, { isLoading: isCreating }] = useCreateRoleMutation()
  const [updatePermissions] = useUpdateRolePermissionsMutation()

  const handleSubmit = async (values: any) => {
    try {
      // 1. Create the role
      const roleRes = await createRole({
        name: values.name,
        description: values.description,
        status: values.status
      }).unwrap()
      
      const roleId = roleRes.data.id || roleRes.data._id

      // 2. Assign permissions
      if (roleId && values.permission_ids.length > 0) {
        await updatePermissions({
          id: roleId,
          permission_ids: values.permission_ids
        }).unwrap()
      }

      toast.success(roleRes.message || 'Role created successfully with permissions')
      router.push(ROUTES.PERMISSIONS)
    } catch (error: any) {
      toast.error(error?.data?.message || 'Failed to create role')
    }
  }

  return (
    <div>
      <RoleForm 
        mode="create" 
        onSubmit={handleSubmit} 
        isLoading={isCreating} 
      />
    </div>
  )
}

export default AddRolePage
