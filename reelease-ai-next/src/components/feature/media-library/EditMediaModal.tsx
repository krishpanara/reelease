import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import Input from '@/components/ui/input'
import { Loader2 } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

const EditMediaModal = ({ isOpen, onClose, media, onConfirm, isLoading }: any) => {
  const [name, setName] = useState('')
  const { t } = useTranslation()

  const initialName = media ? (media.name.split('.').slice(0, -1).join('.') || media.name) : ''
  const hasChanges = name.trim() !== initialName

  useEffect(() => {
    if (media) {
      setName(initialName)
    }
  }, [media, initialName])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (name.trim() && hasChanges) {
      onConfirm(name.trim())
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md! max-w-[calc(100%-2rem)]! rounded-border-radius! glass-card border-glass-border">
        <DialogHeader>
          <DialogTitle className="text-xl">{t('edit_media_name', 'Edit Media')}</DialogTitle>
          <DialogDescription>{t('edit_media_name_desc', 'Enter a new name for this media asset.')}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t('media_name_placeholder', 'Enter name...')}
            autoFocus
          />
          <div className="flex items-center justify-center gap-2 pt-2">
            <Button
              type="button"
              className="w-full sm:h-12 h-10 rounded-full bg-black/3 dark:bg-white/3 border border-glass-border font-semibold text-sm hover:bg-destructive hover:text-white"
              variant="ghost"
              onClick={onClose}
              disabled={isLoading}
            >
              {t('cancel')}
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !name.trim() || !hasChanges}
              className="primary-btn w-full sm:h-12 h-10 text-white!"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : t('save_changes', 'Save Changes')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default EditMediaModal
