import React from 'react'
import { useTranslation } from 'react-i18next'
import { Camera, User, Mail, Loader2, Save } from 'lucide-react'
import { Formik, Form, Field, ErrorMessage } from 'formik'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import Input from '@/components/ui/input'
import Label from '@/components/ui/label'
import { cn, getAvatarColorClass } from '@/lib/utils'
import { profileSchemas } from '@/utils/validation-schemas'
import { EditProfileModalProps, ProfileFormValues } from '@/types/components/profile'

export const EditProfileModal = ({
  isOpen,
  onOpenChange,
  user,
  avatarSrc,
  hasAvatar,
  isUpdating,
  onFileChange,
  onSubmit,
  onCancel,
  fileInputRef
}: EditProfileModalProps) => {
  const { t } = useTranslation()

  const initialValues: ProfileFormValues = {
    name: user?.name || '',
    email: user?.email || '',
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="border-glass-border glass-card bg-slate-900 dark:bg-slate-950 text-white p-6 rounded-2xl max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-lg font-black">{t('edit_profile', { defaultValue: 'Edit Profile' })}</DialogTitle>
          <DialogDescription className="text-xs text-slate-400">
            {t('update_profile_info', { defaultValue: 'Update your personal information below.' })}
          </DialogDescription>
        </DialogHeader>

        <Formik
          initialValues={initialValues}
          enableReinitialize={true}
          validationSchema={profileSchemas.update(t)}
          onSubmit={onSubmit}
        >
          {({ errors, touched, dirty }) => (
            <Form className="space-y-5">
              {/* Embedded File Uploader in Dialog */}
              <div className="flex flex-col items-center justify-center gap-4 py-2 border-b border-glass-border pb-5">
                <div className="relative group">
                  <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-glass-border relative shadow-lg">
                    <Avatar className="w-full h-full rounded-none">
                      {hasAvatar && avatarSrc && (
                        <AvatarImage src={avatarSrc} className="object-cover" />
                      )}
                      <AvatarFallback className={cn('text-3xl font-bold', getAvatarColorClass(user?.name))}>
                        {user?.name?.charAt(0).toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div
                      className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Camera className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <Button
                    type="button"
                    size="icon"
                    className="absolute -bottom-1 -right-1 rounded-full h-8 w-8 bg-white! dark:bg-slate-800! hover:opacity-90 border border-glass-border cursor-pointer flex items-center justify-center"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Camera className="w-3.5 h-3.5 text-black! dark:text-white!" />
                  </Button>
                </div>
                <Input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  value={''}
                  onChange={onFileChange}
                />
                <p className="text-xs text-subtitle-color font-medium">
                  {t('avatar_specs', { defaultValue: 'PNG, JPG or WEBP. Max 2MB.' })}
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-1 group flex flex-col">
                  <Label htmlFor="name" className="text-xs font-semibold text-slate-300 mb-1">
                    {t('full_name')}
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/50" />
                    <Field
                      as={Input}
                      id="name"
                      name="name"
                      placeholder={t('enter_name')}
                      className={cn(
                        'pl-10 h-11 bg-slate-900/60 dark:bg-slate-950/60 border-glass-border focus-visible:ring-primary/20 rounded-xl text-white transition-all',
                        errors.name && touched.name && 'border-destructive/50 focus-visible:ring-destructive/20'
                      )}
                    />
                  </div>
                  <ErrorMessage name="name" component="div" className="text-red-400 text-xs italic ml-1 mt-1" />
                </div>

                <div className="space-y-1 group flex flex-col">
                  <Label htmlFor="email" className="text-xs font-semibold text-slate-300 mb-1">
                    {t('email_address')}
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/50" />
                    <Field
                      as={Input}
                      id="email"
                      name="email"
                      type="email"
                      placeholder={t('email_placeholder')}
                      className={cn(
                        'pl-10 h-11 bg-slate-900/60 dark:bg-slate-950/60 border-glass-border focus-visible:ring-primary/20 rounded-xl text-white transition-all',
                        errors.email && touched.email && 'border-destructive/50 focus-visible:ring-destructive/20'
                      )}
                    />
                  </div>
                  <ErrorMessage name="email" component="div" className="text-red-400 text-xs italic ml-1 mt-1" />
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-3">
                <Button
                  type="button"
                  variant="outline"
                  className="h-10 rounded-xl border-glass-border hover:bg-destructive! text-title-color cursor-pointer dark:bg-white/3"
                  onClick={onCancel}
                >
                  {t('cancel', { defaultValue: 'Cancel' })}
                </Button>
                <Button
                  type="submit"
                  disabled={isUpdating}
                  className="h-10 px-5 rounded-xl primary-btn text-white! font-bold text-xs  cursor-pointer transition-all disabled:opacity-50"
                >
                  {isUpdating ? (
                    <span className="flex items-center gap-1.5">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      {t('updating')}
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5">
                      <Save className="w-3.5 h-3.5" />
                      {t('save_changes', { defaultValue: 'Save Changes' })}
                    </span>
                  )}
                </Button>
              </div>
            </Form>
          )}
        </Formik>
      </DialogContent>
    </Dialog>
  )
}
