'use client'

import RolePermissionsForm from '@/components/feature/permissions/RolePermissionsForm'
import { ROUTES } from '@/constants/routes'
import { useUpdateRolePermissionsMutation } from '@/redux/api/roleApi'
import { ApiError } from '@/types'
import { useParams, useRouter } from 'next/navigation'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

const RolePermissionsPage = () => {
  const { t } = useTranslation()
  const router = useRouter()
  const { id } = useParams()
  const [updatePermissions, { isLoading }] = useUpdateRolePermissionsMutation()

  const handleSavePermissions = async (permissions: { submodule: string; access: 'read' | 'write' }[]) => {
    if (!id) return
    try {
      const permission_ids = permissions.map((p: any) => p.submodule)
      await updatePermissions({ id: id as string, permission_ids }).unwrap()
      toast.success(t('permissions_assigned_successfully'))
      router.push(ROUTES.PERMISSIONS)
    } catch (error) {
      const apiError = error as ApiError
      toast.error(apiError?.data?.message || t('something_went_wrong'))
    }
  }

  return (
    <div>
      <RolePermissionsForm roleId={id as string} onSave={handleSavePermissions} isLoading={isLoading} />
    </div>
  )
}

export default RolePermissionsPage
