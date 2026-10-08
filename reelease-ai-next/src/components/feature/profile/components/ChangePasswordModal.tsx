import React from 'react'
import { useTranslation } from 'react-i18next'
import { Lock, Loader2, Save } from 'lucide-react'
import { Formik, Form, Field, ErrorMessage } from 'formik'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import Label from '@/components/ui/label'
import PasswordInput from '@/components/ui/PasswordInput'
import { cn } from '@/lib/utils'
import { profileSchemas } from '@/utils/validation-schemas'
import { ChangePasswordModalProps, PasswordFormValues } from '@/types'

export const ChangePasswordModal = ({
  isOpen,
  onOpenChange,
  isChanging,
  onSubmit,
  onCancel
}: ChangePasswordModalProps) => {
  const { t } = useTranslation()

  const passwordInitialValues: PasswordFormValues = {
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="border-glass-border glass-card bg-slate-900 dark:bg-slate-950 text-white p-6 rounded-2xl max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-lg font-black">{t('change_password', { defaultValue: 'Change Password' })}</DialogTitle>
          <DialogDescription className="text-xs text-slate-400">
            {t('change_password_desc', {
              defaultValue: 'Update your password to keep your account secure.',
            })}
          </DialogDescription>
        </DialogHeader>

        <Formik
          initialValues={passwordInitialValues}
          validationSchema={profileSchemas.changePassword(t)}
          onSubmit={onSubmit}
        >
          {({ errors, touched, dirty }) => (
            <Form className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-1 group flex flex-col">
                  <Label htmlFor="oldPassword" className="text-xs font-semibold text-slate-300 mb-1">
                    {t('old_password')}
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/50 z-10" />
                    <Field
                      as={PasswordInput}
                      id="oldPassword"
                      name="oldPassword"
                      placeholder={t('enter_old_password', { defaultValue: 'Enter old password' })}
                      className={cn(
                        'pl-10 rounded-xl bg-slate-900/60 dark:bg-slate-950/60 border-glass-border text-white h-11',
                        errors.oldPassword && touched.oldPassword && 'border-destructive/50'
                      )}
                    />
                  </div>
                  <ErrorMessage
                    name="oldPassword"
                    component="div"
                    className="text-red-400 text-xs italic ml-1 mt-1"
                  />
                </div>

                <div className="space-y-1 group flex flex-col">
                  <Label htmlFor="newPassword" className="text-xs font-semibold text-slate-300 mb-1">
                    {t('new_password')}
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/50 z-10" />
                    <Field
                      as={PasswordInput}
                      id="newPassword"
                      name="newPassword"
                      placeholder={t('enter_new_password', { defaultValue: 'Enter new password' })}
                      className={cn(
                        'pl-10 rounded-xl bg-slate-900/60 dark:bg-slate-950/60 border-glass-border text-white h-11',
                        errors.newPassword && touched.newPassword && 'border-destructive/50'
                      )}
                    />
                  </div>
                  <ErrorMessage
                    name="newPassword"
                    component="div"
                    className="text-red-400 text-xs italic ml-1 mt-1"
                  />
                </div>

                <div className="space-y-1 group flex flex-col">
                  <Label htmlFor="confirmPassword" className="text-xs font-semibold text-slate-300 mb-1">
                    {t('confirm_new_password', { defaultValue: 'Confirm New Password' })}
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/50 z-10" />
                    <Field
                      as={PasswordInput}
                      id="confirmPassword"
                      name="confirmPassword"
                      placeholder={t('confirm_password_placeholder')}
                      className={cn(
                        'pl-10 rounded-xl bg-slate-900/60 dark:bg-slate-950/60 border-glass-border text-white h-11',
                        errors.confirmPassword && touched.confirmPassword && 'border-destructive/50'
                      )}
                    />
                  </div>
                  <ErrorMessage
                    name="confirmPassword"
                    component="div"
                    className="text-red-400 text-xs italic ml-1 mt-1"
                  />
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-3">
                <Button
                  type="button"
                  variant="outline"
                  className="h-10 rounded-xl border-glass-border hover:bg-white/10 text-white cursor-pointer"
                  onClick={onCancel}
                >
                  {t('cancel', { defaultValue: 'Cancel' })}
                </Button>
                <Button
                  type="submit"
                  disabled={isChanging || !dirty}
                  className="h-10 px-5 rounded-xl bg-gradient-to-r from-[#3B82F6] to-[#8b5cf6] hover:opacity-90 text-white! font-bold text-xs shadow-md border-0 cursor-pointer transition-all disabled:opacity-50"
                >
                  {isChanging ? (
                    <span className="flex items-center gap-1.5">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      {t('changing')}
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5">
                      <Save className="w-3.5 h-3.5" />
                      {t('update_password', { defaultValue: 'Update Password' })}
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
