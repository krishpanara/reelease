'use client'

import Spinner from '@/components/reusable/Spinner'
import { Button } from '@/components/ui/button'
import { useGetAdminSettingsQuery, useUpdateAdminSettingsMutation } from '@/redux/api/adminSettingApi'
import { adminSettingSchemas } from '@/utils/validation-schemas'
import { Form, Formik } from 'formik'
import { Loader2, Save } from 'lucide-react'
import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import AppInfoCard from './general/AppInfoCard'
import DemoUserCard from './general/DemoUserCard'
import MaintenanceModeCard from './general/MaintenanceModeCard'
import ResourceLimitsCard from './general/ResourceLimitsCard'
import SystemEmailConfigCard from './general/SystemEmailConfigCard'
import SystemPagesCard from './general/SystemPagesCard'
import { ApiError } from '@/types'
import { generalSettingValue } from '@/data/aiProvider'

const GeneralSettings = () => {
  const { t } = useTranslation()
  const { data: settingsData, isLoading: isFetching } = useGetAdminSettingsQuery(undefined)
  const [updateSettings, { isLoading: isUpdating }] = useUpdateAdminSettingsMutation()

  const [files, setFiles] = useState<Record<string, File | 'null' | null>>({})

 

  const onSubmit = async (values: typeof generalSettingValue) => {
    try {
      const formData = new FormData()
      const finalIps = [...(values.maintenance_allowed_ips || [])]
      if (values.maintenance_allowed_ips_text?.trim()) {
        const extraIps = values.maintenance_allowed_ips_text.split(/[,\s]+/).map((v: string) => v.trim()).filter((v: string) => v)
        extraIps.forEach((ip: string) => {
          if (!finalIps.includes(ip)) finalIps.push(ip)
        })
      }
      const valuesToSubmit = { ...values, maintenance_allowed_ips: finalIps }

      Object.entries(valuesToSubmit).forEach(([key, value]) => {
        if (key === 'maintenance_allowed_ips_text') return
        if (value === null || value === undefined) return
        if (Array.isArray(value)) {
          formData.append(key, JSON.stringify(value))
        } else {
          formData.append(key, String(value))
        }
      })

      Object.entries(files).forEach(([key, value]) => {
        if (value === 'null') {
          formData.append(key, 'null')
        } else if (value instanceof File) {
          formData.append(key, value)
        }
      })

      const response = await updateSettings(formData).unwrap()
      toast.success(response.message || t('settings_updated_successfully'))
      setFiles({})
    } catch (error) {
      const apiError = error as ApiError
      toast.error(apiError?.data?.message || t('failed_to_update_settings'))
    }
  }

  if (isFetching) {
    return <Spinner className="h-auto py-20" size="md" />
  }

  const settings = settingsData?.settings || {}
  const currentValues = useMemo(() => {
    return {
      ...generalSettingValue,
      ...settings,
      maintenance_allowed_ips: Array.isArray(settings.maintenance_allowed_ips) ? settings.maintenance_allowed_ips : [],
      maintenance_allowed_ips_text: '',
    }
  }, [settingsData])

  return (
    <Formik
      initialValues={currentValues}
      enableReinitialize
      validationSchema={adminSettingSchemas.general(t)}
      onSubmit={onSubmit}
    >
      {({ dirty }) => (
        <Form
          onKeyDown={(e) => {
            if (e.key === 'Enter' && e.target instanceof HTMLInputElement) {
              e.preventDefault();
            }
          }}
          className="space-y-6 animate-in fade-in duration-700"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            <div className="space-y-6">
              <AppInfoCard />
              <SystemPagesCard files={files} setFiles={setFiles} settings={settings} />
            </div>
            <div className="space-y-6">
              <MaintenanceModeCard files={files} setFiles={setFiles} currentImageUrl={settings.maintenance_image_url} userIp={settings.userIp} />
              <ResourceLimitsCard />
              <DemoUserCard />
            </div>
            <div className="lg:col-span-2">
              <SystemEmailConfigCard />
            </div>
          </div>

          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={isUpdating || (!dirty && Object.keys(files).length === 0)}
              variant="premium"
              className="sm:h-12 h-10 primary-btn p-button-padding shadow-none rounded-radius font-medium text-sm group text-white! relative overflow-hidden"
            >
              {isUpdating ? (
                <>
                  <Loader2 className="w-6 h-6 " />
                  {t('updating', { defaultValue: 'Updating...' })}
                </>
              ) : (
                <>
                  <Save className="w-6 h-6" />
                  {t('save_settings', { defaultValue: 'Save Settings' })}
                </>
              )}
            </Button>
          </div>
        </Form>
      )}
    </Formik>
  )
}

export default GeneralSettings
