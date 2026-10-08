'use client'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { DeleteConfirmationModalProps } from '@/types'
import { Loader2, Trash2 } from 'lucide-react'
import React from 'react'
import { useTranslation } from 'react-i18next'

export const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  isLoading = false,
}) => {
  const { t } = useTranslation()

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-xl! max-w-[calc(100%-2rem)]! dark:bg-dark-base!  bg-light-body  gap-0 overflow-hidden border-none  rounded-border-radius!" dir='ltr'>
        <div >
          <DialogHeader className="mb-6 ">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10 ring-8 ring-destructive/5 animate-scale-in">
              <div className="relative">
                <Trash2 className="h-8 w-8 text-destructive" />
              </div>
            </div>

            <DialogTitle className="text-center! text-xl font-medium text-title-color dark:text-white ">{title}</DialogTitle>

            <DialogDescription className="text-center! text-subtitle-color mt-2 text-base ">
              {description}
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="grid grid-cols-2 gap-3 sm:gap-3 sm:space-x-0">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
              className="w-full h-11 rounded-radius text-base bg-card-color border-glass-border! bg-black/3 hover:bg-destructive! hover:text-white!  transition-all duration-200"
            >
              {t('cancel')}
            </Button>
            <Button
              variant="destructive"
              onClick={onConfirm}
              disabled={isLoading}
              className="w-full h-11 rounded-radius text-base transition-all duration-200"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  <span>{t('deleting')}...</span>
                </>
              ) : (
                <>{t('delete')}</>
              )}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default DeleteConfirmationModal
