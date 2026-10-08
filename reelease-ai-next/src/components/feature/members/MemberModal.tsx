'use client'

import SelectField from '@/components/shared/form-fields/SelectField'
import TextInput from '@/components/shared/form-fields/TextInput'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import Input from '@/components/ui/input'
import Label from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { cn, getAvatarColorClass } from '@/lib/utils'
import { useGetRolesQuery } from '@/redux/api/roleApi'
import { useCreateUserMutation, useUpdateUserMutation } from '@/redux/api/userApi'
import { ApiError, MemberModalProps } from '@/types'
import { getMediaUrl } from '@/utils'
import { userSchemas } from '@/utils/validation-schemas'
import { Form, Formik } from 'formik'
import { Camera, Loader2 } from 'lucide-react'
import React, { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

export function MemberModal({ isOpen, onClose, user }: MemberModalProps) {
  const { t } = useTranslation()
  const [createUser, { isLoading: isCreating }] = useCreateUserMutation()
  const [updateUser, { isLoading: isUpdating }] = useUpdateUserMutation()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [previewImage, setPreviewImage] = useState<string | null>(null)

  const isEditing = !!user

  const { data: rolesData } = useGetRolesQuery({ page: 1, limit: 100 })
  const roles = rolesData?.data?.roles || []

  const initialValues = {
    name: user?.name || '',
    email: user?.email || '',
    password: '',
    confirmPassword: '',
    roleId: user?.roleId || '',
    isActive: user?.isActive ?? true,
    avatar: null as File | null,
    isEditing,
  }

  // Returns true if any field differs from the saved user (always true when creating)
  const getIsDirty = (values: typeof initialValues) => {
    if (!isEditing) return true
    return (
      values.avatar !== null ||
      values.name !== (user?.name || '') ||
      values.email !== (user?.email || '') ||
      values.roleId !== (user?.roleId || '') ||
      values.isActive !== (user?.isActive ?? true) ||
      (values.password !== '' && values.password !== undefined)
    )
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>, setFieldValue: any) => {
    const file = e.currentTarget.files?.[0]
    if (file) {
      setFieldValue('avatar', file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviewImage(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (values: typeof initialValues) => {
    try {
      const formData = new FormData()
      formData.append('name', values.name)
      formData.append('email', values.email)
      if (values.password) formData.append('password', values.password)
      formData.append('roleId', values.roleId)
      formData.append('isActive', String(values.isActive))
      if (values.avatar) formData.append('avatar', values.avatar)
      if (isEditing && user) {
        formData.append('id', user._id)
        const res = await updateUser(formData).unwrap()
        toast.success(res.message || t('user_updated_successfully'))
      } else {
        const res = await createUser(formData).unwrap()
        toast.success(res.message || t('user_created_successfully'))
      }
      onClose()
      setPreviewImage(null)
    } catch (error) {
      const apiError = error as ApiError
      toast.error(apiError?.data?.message || t('something_went_wrong'))
    }
  }

  const isLoading = isCreating || isUpdating

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-xl max-w-[95vw] sm:p-6 p-4 h-fit border-none rounded-border-radius dark:bg-modal-bg-color no-scrollbar">
        <DialogHeader className="px-0">
          <DialogTitle>{isEditing ? t('edit_member') : t('create_member')}</DialogTitle>
        </DialogHeader>
        <Formik
          initialValues={initialValues}
          enableReinitialize
          validationSchema={userSchemas.create(t)}
          onSubmit={handleSubmit}
        >
          {({ setFieldValue, values }) => (
            <Form className="space-y-4 h-fit">
              <div className="flex flex-col items-center justify-center space-y-2  mb-4">
                <div className="relative group">
                  <Avatar className="h-24 w-24 border-2 border-primary/10 rounded-full">
                    <AvatarImage src={previewImage || getMediaUrl(user?.avatar!)} />
                    <AvatarFallback className={cn('text-3xl! font-semibold', getAvatarColorClass(values.name))}>
                      {values.name.charAt(0).toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <Button
                    variant="ghost"
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute font-bold p-px! bottom-[-4] right-[-5] rtl:left-[-5] w-10 h-10 flex items-center justify-center text-black dark:text-white bg-white! dark:bg-light-body! rounded-full "
                  >
                    <Camera size={25} className="text-text-3xl" />
                  </Button>
                </div>
                <Input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={(e) => handleImageChange(e, setFieldValue)}
                />
                <span className="text-base font-medium text-muted-foreground">{t('upload_image')}</span>
              </div>

              <TextInput name="name" label={t('name')} placeholder={t('enter_name')} />
              <TextInput name="email" label={t('email')} placeholder={t('enter_your_email')} />

              {user?.role !== 'super_admin' && (
                <div className="space-y-1.5 ">
                  <Label className='text-start rtl:text-end! block'>{t('role')}</Label>
                  <Select
                    value={values.roleId}
                    onValueChange={(value) => setFieldValue('roleId', value)}
                  >
                    <SelectTrigger className="h-11 bg-transparent dark:bg-white/3 border-glass-border">
                      <SelectValue placeholder={t('select_role')} />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-modal-bg-color rounded-border-radius">
                      {roles
                        .filter((r: any) => r.name !== 'super_admin')
                        .map((r: any) => (
                          <SelectItem key={r._id || r.id} value={r._id || r.id} className="cursor-pointer">
                            {t(r.name)}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {!isEditing && (
                <>
                  <TextInput name="password" label={t('password')} type="password" placeholder={t('enter_password')} />
                  <TextInput
                    name="confirmPassword"
                    label={t('confirm_password')}
                    type="password"
                    placeholder={t('confirm_your_password')}
                  />
                </>
              )}

              <div className="flex items-center gap-2 pt-2">
                <Switch
                  id="isActive"
                  checked={values.isActive}
                  onCheckedChange={(checked: any) => setFieldValue('isActive', checked)}
                />
                <Label htmlFor="isActive" className="cursor-pointer">{t('active')}</Label>
              </div>

              <DialogFooter className="sm:flex-row flex-col-reverse rtl:sm:flex-row-reverse items-center gap-3 w-full px-0">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  disabled={isLoading}
                  className="sm:h-12 h-10 text-base outline-none! hover:bg-destructive! hover:text-white! w-full dark:bg-white/5 bg-black/5 shadow-none rounded-full transition-all"
                >
                  {t('cancel')}
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading || !getIsDirty(values)}
                  className="sm:h-12 h-10 w-full shadow-none text-base border border-glass-border dark:border-none primary-btn text-white!  transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                  {isEditing ? t('update') : t('create')}
                </Button>
              </DialogFooter>
            </Form>
          )}
        </Formik>
      </DialogContent>
    </Dialog>
  )
}
