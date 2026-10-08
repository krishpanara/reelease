import React from 'react'
import { useTranslation } from 'react-i18next'
import { AlertTriangle, Loader2 } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { DeactivateAccountModalProps } from '@/types'

export const DeactivateAccountModal = ({
  isOpen,
  onOpenChange,
  isDeactivating,
  onConfirm,
  onCancel
}: DeactivateAccountModalProps) => {
  const { t } = useTranslation()

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="border-glass-border glass-card bg-slate-900 dark:bg-slate-950 text-white p-6 rounded-2xl max-w-md">
        <DialogHeader className="mb-4">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 ring-8 ring-destructive/5">
            <AlertTriangle className="h-6 w-6 text-destructive animate-bounce" />
          </div>
          <DialogTitle className="text-center text-lg font-bold">
            {t('deactivate_account', { defaultValue: 'Deactivate Account' })}
          </DialogTitle>
          <DialogDescription className="text-center text-slate-400 mt-2 text-xs leading-relaxed">
            {t('deactivate_confirm_desc', {
              defaultValue: 'Are you sure you want to deactivate your account? This action will disable your profile and log you out immediately. To reactivate, your workspace administrator must re-enable your account from the Members management panel.',
            })}
          </DialogDescription>
        </DialogHeader>

        <div className="flex gap-3 justify-end pt-3">
          <Button
            type="button"
            variant="outline"
            className="h-10 rounded-xl border-glass-border hover:bg-white/10 text-white cursor-pointer w-full"
            onClick={onCancel}
          >
            {t('cancel', { defaultValue: 'Cancel' })}
          </Button>
          <Button
            type="button"
            variant="destructive"
            disabled={isDeactivating}
            className="h-10 px-5 rounded-xl text-white font-bold text-xs shadow-md cursor-pointer transition-all w-full flex items-center justify-center gap-1.5"
            onClick={onConfirm}
          >
            {isDeactivating ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                {t('deactivating', { defaultValue: 'Deactivating' })}
              </>
            ) : (
              t('confirm_deactivate', { defaultValue: 'Deactivate' })
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
