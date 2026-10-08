'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Input from '@/components/ui/input'
import Label from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { ROUTES } from '@/constants/routes'
import { cn } from '@/lib/utils'
import { useGetAllPermissionsQuery } from '@/redux/api/roleApi'
import { RoleFormProps } from '@/types/permission'
import { Form, Formik } from 'formik'
import { ArrowLeft, Check, Loader2, Save, ShieldCheck } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import * as Yup from 'yup'
import PermissionPicker from './PermissionPicker'
import { Skeleton } from '@/components/ui/skeleton'



const RoleForm = ({ initialValues, onSubmit, isLoading, mode }: RoleFormProps) => {
  const { t } = useTranslation();
  const router = useRouter()
  const isReadOnly = initialValues?.system_reserved || false
  const { data: permissionsData, isLoading: isLoadingPermissions } = useGetAllPermissionsQuery()

  // Initialize state from initialValues. 
  // We use key prop on this component to re-mount when initialValues change significantly.
  const validationSchema = Yup.object({
    name: Yup.string().required('Role name is required'),
    permission_ids: Yup.array().min(1, 'Assign at least one permission'),
  })

  const handleSubmit = async (values: any) => {
    try {
      await onSubmit({
        ...values,
        name: values.name.trim(),
        description: values.description.trim(),
        status: values.isActive ? 'active' : 'inactive',
      })
    } catch (err: any) {
      console.error('Submission error:', err)
      toast.error(err?.data?.message || 'Failed to save role')
    }
  }

  return (
    <div className="w-full  animate-in fade-in slide-in-from-bottom-2 duration-500">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8 relative overflow-hidden">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => router.push(ROUTES.PERMISSIONS)}
          className="h-10 w-10 bg-primary/10 text-primary hover:bg-primary/10 hover:text-primary dark:bg-primary/20 rounded-radius transition-all shrink-0 border-none!"
        >
          <ArrowLeft size={20} className="text-primary" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold dark:text-white tracking-tight">
            <span className="text-title-color dark:text-white">
              {(mode === 'create' ? 'Create New Role' : isReadOnly ? 'View Role Permissions' : 'Edit Role Settings').split(' ')[0]}
            </span>{' '}
            <span className="text-primary title-color">
              {(mode === 'create' ? 'Create New Role' : isReadOnly ? 'View Role Permissions' : 'Edit Role Settings').split(' ').slice(1).join(' ')}
            </span>
          </h1>
        </div>
      </div>

      <Formik
        initialValues={{
          name: initialValues?.name || '',
          description: initialValues?.description || '',
          isActive: initialValues ? initialValues.status === 'active' : true,
          permission_ids: initialValues?.permissions || [],
        }}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
        enableReinitialize
      >
        {({ values, errors, touched, setFieldValue, dirty }) => (
          <Form id="role-form" className="space-y-6">
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
              {/* Sidebar - General Information */}
              <div className="xl:col-span-4 space-y-6">
                <div className="glass-card dark:bg-white/3 bg-white rounded-border-radius sm:p-6 p-4 space-y-6 relative overflow-hidden">
                  <div className="flex items-center sm:gap-4 gap-2 border-b border-glass-border pb-4">
                    <div className="sm:w-12 sm:h-12 w-10 h-10 rounded-radius bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                      <ShieldCheck className="sm:w-6 sm:h-6 w-5 h-5" />
                    </div>
                    <h2 className="text-xl font-medium text-title-color dark:text-white">General Information</h2>
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-2 flex flex-col">
                      <Label htmlFor="role-name" className="text-sm font-bold text-foreground ml-1">
                        Role Display Name <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="role-name"
                        name="name"
                        value={values.name}
                        onChange={(e) => setFieldValue('name', e.target.value)}
                        className={cn(
                          'h-12 bg-white/50 dark:bg-white/3 border-glass-border focus-visible:ring-2 focus-visible:ring-primary/20 transition-all rounded-[10px]',
                          errors.name && touched.name && 'border-destructive',
                        )}
                        placeholder="e.g. System Administrator"
                        disabled={initialValues?.system_reserved}
                      />
                      {errors.name && touched.name && (
                        <p className="text-destructive text-xs font-bold mt-1 px-1">{errors.name}</p>
                      )}
                    </div>

                    <div className="space-y-2 flex flex-col">
                      <Label htmlFor="role-description" className="text-sm font-bold text-foreground ml-1">
                        Description
                      </Label>
                      <Input
                        id="role-description"
                        name="description"
                        value={values.description}
                        onChange={(e) => setFieldValue('description', e.target.value)}
                        className="h-12 bg-white/50 dark:bg-white/3 border-glass-border focus-visible:ring-2 focus-visible:ring-primary/20 transition-all rounded-[10px]"
                        placeholder="Briefly explain what this role can do..."
                        disabled={isReadOnly}
                      />
                    </div>

                    {/* Active Status */}
                    <div
                      className={cn(
                        'flex items-center justify-between p-5 rounded-border-radius border transition-all cursor-pointer group',
                        values.isActive
                          ? 'bg-primary/5 border-primary/20 hover:bg-primary/10'
                          : ' border-glass-border ',
                      )}
                      onClick={() => !isReadOnly && setFieldValue('isActive', !values.isActive)}
                    >
                      <div className="flex-1">
                        <p className="font-bold text-title-color dark:text-white">Active Status</p>
                        <p className="text-[11px] text-muted-foreground mt-0.5">Available for assignment</p>
                      </div>
                      <Switch
                        checked={values.isActive}
                        onCheckedChange={(val) => setFieldValue('isActive', val)}
                        disabled={isReadOnly}
                        onClick={(e) => e.stopPropagation()}
                        className="data-[state=checked]:bg-primary"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Main Content - Access Permissions */}
              <div className="xl:col-span-8">
                <div className="glass-card rounded-border-radius border border-glass-border sm:p-6 p-4 relative overflow-hidden bg-white dark:bg-white/3 backdrop-blur-xl h-full">
                  <div className="flex items-center justify-between mb-6 border-b border-glass-border pb-4">
                    <div className="flex items-center gap-4">
                      <div className="sm:w-12 sm:h-12 w-10 h-10 rounded-radius bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                        <Check className="sm:w-6 sm:h-6 w-5 h-5" />
                      </div>
                      <h2 className="text-xl font-medium text-title-color dark:text-white">Access Permissions</h2>
                    </div>
                    {errors.permission_ids && touched.permission_ids && (
                      <Badge
                        variant="destructive"
                        className="animate-pulse bg-destructive/10 text-destructive border-destructive/20 h-8 px-4 font-bold"
                      >
                        {errors.permission_ids}
                      </Badge>
                    )}
                  </div>

                  {isLoadingPermissions ? (
                    <div className="space-y-6 animate-in fade-in duration-300">
                      {/* Search input skeleton */}
                      <Skeleton className="h-11 w-full bg-slate-200/80 dark:bg-white/10 rounded-radius" />

                      {/* Permissions Grid Skeleton */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {[...Array(6)].map((_, i) => (
                          <div key={i} className="p-4 rounded-xl border border-glass-border space-y-4 bg-slate-50/20 dark:bg-white/1 flex flex-col justify-between">
                            <div className="flex items-center gap-2">
                              <Skeleton className="h-5 w-5 bg-slate-200/80 dark:bg-white/10 rounded" />
                              <Skeleton className="h-4 w-24 bg-slate-200/80 dark:bg-white/10 rounded" />
                            </div>
                            <div className="grid grid-cols-2 gap-2 mt-2">
                              <Skeleton className="h-8 w-full bg-slate-200/80 dark:bg-white/10 rounded-[6px]" />
                              <Skeleton className="h-8 w-full bg-slate-200/80 dark:bg-white/10 rounded-[6px]" />
                              <Skeleton className="h-8 w-full bg-slate-200/80 dark:bg-white/10 rounded-[6px]" />
                              <Skeleton className="h-8 w-full bg-slate-200/80 dark:bg-white/10 rounded-[6px]" />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <PermissionPicker
                      permissions={permissionsData?.data || []}
                      selectedIds={values.permission_ids}
                      onChange={(ids) => setFieldValue('permission_ids', ids)}
                      disabled={isReadOnly}
                    />
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end flex-wrap gap-4 mt-6 ">
              {!isReadOnly && (
                <Button
                  type="submit"
                  className="primary-btn h-12 text-white! rounded-radius transition-all  gap-2"
                  disabled={isLoading || (mode === 'edit' && !dirty)}
                >
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                  {isLoading ? 'Working...' : mode === 'create' ? t('create_role') : t('save_changes')}
                </Button>
              )}
            </div>
          </Form>
        )}
      </Formik>
    </div>
  )
}

export default RoleForm
