'use client'

import Spinner from '@/components/reusable/Spinner'
import { Button } from '@/components/ui/button'
import { useGetAdminSettingsQuery, useUpdateAdminSettingsMutation } from '@/redux/api/adminSettingApi'
import { adminSettingSchemas } from '@/utils/validation-schemas'
import { Form, Formik } from 'formik'
import { Loader2, Save } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import CreditSettingsCard from './credits/CreditSettingsCard'
import { ApiError } from '@/types'

const CreditSettings = () => {
  const { t } = useTranslation()
  const { data: settingsData, isLoading: isFetching } = useGetAdminSettingsQuery(undefined)
  const [updateSettings, { isLoading: isUpdating }] = useUpdateAdminSettingsMutation()

  const initialValues = {
    registration_free_credits: 0,
    registration_free_caption_credits: 0,
  }

  const onSubmit = async (values: typeof initialValues) => {
    try {
      const response = await updateSettings(values).unwrap()
      toast.success(response.message || t('settings_updated_successfully'))
    } catch (error) {
      const apiError = error as ApiError
      toast.error(apiError?.data?.message || t('failed_to_update_settings'))
    }
  }

  if (isFetching) {
    return <Spinner className="h-auto py-20" size="md" />
  }

  const settings = settingsData?.settings || {}
  const currentValues = {
    ...initialValues,
    ...settings,
  }

  return (
    <Formik
      initialValues={currentValues}
      enableReinitialize
      validationSchema={adminSettingSchemas.credits(t)}
      onSubmit={onSubmit}
    >
      {({ dirty }) => (
        <Form className="space-y-6 animate-in fade-in duration-700">
          <div className="grid grid-cols-1 gap-6">
            <CreditSettingsCard />
          </div>

          <div className="flex justify-end ">
            <Button
              type="submit"
              disabled={isUpdating || !dirty}
              variant="premium"
              className="sm:h-12 h-10 primary-btn text-base shadow-none"
            >
             
              {isUpdating ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" />
                  {t('updating_credits')}
                </>
              ) : (
                <>
                  <Save className="w-6 h-6 transition-transform" />
                  {t('save_settings')}
                </>
              )}
            </Button>
          </div>
        </Form>
      )}
    </Formik>
  )
}

export default CreditSettings
