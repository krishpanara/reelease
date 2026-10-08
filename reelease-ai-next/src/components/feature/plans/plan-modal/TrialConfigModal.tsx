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
import Input from '@/components/ui/input'
import Label from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { useGetAdminSettingsQuery, useUpdateAdminSettingsMutation } from '@/redux/api/adminSettingApi'
import { TrialConfigModalProps } from '@/types'
import { Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'



const TrialConfigModal = ({ isOpen, onClose }: TrialConfigModalProps) => {
  const { t } = useTranslation()
  const { data: settingsData, isLoading: isLoadingSettings } = useGetAdminSettingsQuery(undefined, {
    skip: !isOpen
  })
  const [updateSettings, { isLoading: isUpdating }] = useUpdateAdminSettingsMutation()

  const [enableTrial, setEnableTrial] = useState(false)
  const [trialDays, setTrialDays] = useState<number | string>(14)
  const [initialData, setInitialData] = useState({ enableTrial: false, trialDays: 14 as number | string })

  useEffect(() => {
    if (settingsData?.data) {
      const et = settingsData.data.enable_trial ?? false
      const td = settingsData.data.trial_days_limit ?? 14
      setEnableTrial(et)
      setTrialDays(td)
      setInitialData({ enableTrial: et, trialDays: td })
    }
  }, [settingsData])

  const hasChanges = enableTrial !== initialData.enableTrial || trialDays !== initialData.trialDays
  const isInvalid = enableTrial && (trialDays === '' || trialDays === null)

  const handleSave = async () => {
    try {
      await updateSettings({
        enable_trial: enableTrial,
        trial_days_limit: typeof trialDays === 'string' ? (parseInt(trialDays) || 0) : trialDays
      }).unwrap()
      toast.success(t('settings_updated_successfully'))
      onClose()
    } catch (error) {
      toast.error(t('failed_to_update_settings'))
    }
  }
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg! rounded-border-radius! bg-light-body dark:bg-modal-bg-color overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">{t('free_trial_configuration')}</DialogTitle>
          <DialogDescription className="text-subtitle-color">
            {t('configure_free_trial_for_new_users')}
          </DialogDescription>
        </DialogHeader>

        {isLoadingSettings ? (
          <div className="py-10 flex justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-6 py-4">
            <div className="flex items-center justify-between gap-4 p-4 rounded-lg glass-card">
              <div className="space-y-0.5">
                <Label className="text-base font-semibold">{t('enable_free_trial')}</Label>
                <p className="text-sm text-subtitle-color">
                  {t('allow_new_users_to_start_with_trial')}
                </p>
              </div>
              <Switch
                checked={enableTrial}
                onCheckedChange={setEnableTrial}
              />
            </div>

            {enableTrial && (
              <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                <Label htmlFor="trial_days " className="text-sm font-medium flex flex-col">
                  {t('trial_days_limit')}
                </Label>
                <Input
                  id="trial_days"
                  type="number"
                  required
                  value={trialDays}
                  onChange={(e) => {
                    const value = e.target.value
                    if (value === '') {
                      setTrialDays('')
                      return
                    }
                    const parsedValue = parseInt(value)
                    if (!isNaN(parsedValue) && parsedValue >= 0) {
                      setTrialDays(parsedValue)
                    }
                  }}
                  placeholder="14"
                  className="h-12 rounded-[8px] border-glass-border focus-visible:ring-primary/20"
                />
              </div>
            )}
          </div>
        )}

        <DialogFooter className="gap-3 sm:gap-0 sm:space-x-3 mt-2">
          <Button
            variant="outline"
            onClick={onClose}
            className="h-10 sm:h-12 w-full px-6 rounded-radius border-glass-border dark:bg-white/3 bg-black/3 hover:bg-destructive! hover:text-white text-base"
          >
            {t('cancel')}
          </Button>
          <Button
            onClick={handleSave}
            disabled={isUpdating || isLoadingSettings || !hasChanges || isInvalid}
            className="h-10 sm:h-12 px-8 rounded-radius primary-btn text-white! w-full"
          >
            {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {t('save_changes')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default TrialConfigModal
