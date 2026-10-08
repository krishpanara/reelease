'use client'

import { Button } from "@/components/ui/button"
import Input from "@/components/ui/input"
import {
  useGetGatewayByNameQuery,
  useUpdateGatewayMutation,
  useToggleGatewayStatusMutation,
  useTestGatewayMutation
} from "@/redux/api/paymentGatewayApi"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { Eye, EyeOff, ExternalLink, Loader2, Save, Zap } from "lucide-react"
import { useTranslation } from "react-i18next"
import { usePermission } from "@/hooks/usePermission"
import { useSyncPlansToGatewaysMutation } from "@/redux/api/planApi"
import GatewayCard from "./GatewayCard"
import { cn } from "@/lib/utils"
import { PaymentGatewayConfig } from "@/types/paymentGateway"
import Label from "@/components/ui/label"

const RazorpaySettings = () => {
  const { t } = useTranslation()
  const { hasPermission } = usePermission()
  const canUpdate = hasPermission('manage.settings')

  const { data: gatewayData, isLoading } = useGetGatewayByNameQuery('razorpay')
  const [updateGateway, { isLoading: isUpdating }] = useUpdateGatewayMutation()
  const [toggleStatus] = useToggleGatewayStatusMutation()
  const [testGateway, { isLoading: isTesting }] = useTestGatewayMutation()
  const [syncPlans] = useSyncPlansToGatewaysMutation()

  const config = (gatewayData?.data || {}) as Partial<PaymentGatewayConfig>

  const [settings, setSettings] = useState({
    razorpay_key_id: "",
    razorpay_key_secret: "",
  })

  const [showSk, setShowSk] = useState(false)

  useEffect(() => {
    if (config) {
      setSettings({
        razorpay_key_id: config.razorpay_key_id || "",
        razorpay_key_secret: config.razorpay_key_secret || "",
      })
    }
  }, [gatewayData])

  const handleToggle = async () => {
    try {
      await toggleStatus('razorpay').unwrap()
      toast.success(t("gateway_status_updated", { defaultValue: 'Gateway status updated' }))
    } catch (error: any) {
      toast.error(error?.data?.message || t("gateway_toggle_error"))
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setSettings((prev) => ({ ...prev, [field]: value }))
  }

  const handleUpdate = async () => {
    try {
      await updateGateway({ name: 'razorpay', data: settings }).unwrap()
      toast.success(t("gateway_razorpay_updated", { defaultValue: 'Razorpay settings updated' }))

      // Sync plans to gateways after saving credentials
      try {
        await syncPlans().unwrap()
      } catch (syncErr) {
        console.error('Auto-sync failed:', syncErr)
      }
    } catch (error: any) {
      toast.error(error?.data?.message || t("gateway_razorpay_update_error"))
    }
  }

  const handleTest = async () => {
    try {
      const result = await testGateway('razorpay').unwrap()
      if (result.success) {
        toast.success(t("gateway_test_success", { defaultValue: 'Connection test successful!' }))
      } else {
        toast.error(result.message || t("gateway_test_failed"))
      }
    } catch (error: any) {
      toast.error(error?.data?.message || t("gateway_test_error"))
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="flex flex-col items-center gap-3 text-muted-foreground italic">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="text-sm">{t("settings_loading", { defaultValue: 'Loading settings...' })}</span>
        </div>
      </div>
    )
  }

  const hasChanges = JSON.stringify(settings) !== JSON.stringify({
    razorpay_key_id: config.razorpay_key_id || "",
    razorpay_key_secret: config.razorpay_key_secret || "",
  })

  return (
    <GatewayCard title="Razorpay" enabled={config.is_enabled || false} onToggle={handleToggle}>
      <div className="flex flex-col gap-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="space-y-2 flex flex-col">
            <Label className="text-sm font-semibold text-foreground">
              {t('key_id', { defaultValue: 'Key ID' })} <span className="text-destructive">*</span>
            </Label>
            <Input
              value={settings.razorpay_key_id}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange("razorpay_key_id", e.target.value)}
              placeholder={t('enter_key_id', { defaultValue: 'rzp_test_...' })}
              className="h-11 font-mono text-sm bg-black/3 border-glass-border "
            />
          </div>

          <div className="space-y-2 flex flex-col">
            <Label className="text-sm font-semibold text-foreground">
              {t('key_secret', { defaultValue: 'Key Secret' })} <span className="text-destructive">*</span>
            </Label>
            <div className="relative">
              <Input
                value={settings.razorpay_key_secret}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange("razorpay_key_secret", e.target.value)}
                type={showSk ? "text" : "password"}
                placeholder={t('enter_key_secret', { defaultValue: 'Enter Secret Key' })}
                className="h-11 pr-16 rtl:pr-3 font-mono text-sm bg-black/3 border-glass-border "
              />
              <Button
                onClick={() => setShowSk(!showSk)}
                className="absolute right-3 top-1/2 p-0! rtl:right-auto rtl:left-3 -translate-y-1/2 bg-[unset]! text-muted-foreground hover:text-foreground transition-colors"
                tabIndex={-1}
              >
                {showSk ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        </div>


        <div className="rounded-border-radius border border-indigo-500/10 bg-indigo-500/5 px-5 py-4 space-y-2">
          <div className="flex items-center gap-2">
            <svg viewBox="0 0 376 430" className="w-5 h-5 shrink-0" fill="none">
              <rect rx="3" />
              <path d="M160.748 139.765L139.966 216.253L258.914 139.33L181.12 429.581L260.128 429.647L375.051 0.933594" fill="#3395FF" />
              <path d="M32.7222 307.625L0 429.647H161.935L228.198 181.42L32.7222 307.625Z" fill="#072654" />
            </svg>
            <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">{t('razorpay_config', { defaultValue: 'Razorpay Configuration' })}</p>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {t('razorpay_config_desc', { defaultValue: 'Get your Razorpay credentials from the Razorpay Dashboard. You\'ll need Key ID and Key Secret from the \'API Keys\' section.' })}
          </p>
          <a href="https://dashboard.razorpay.com/app/keys" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-indigo-600 dark:text-indigo-400 font-medium hover:underline mt-1">
            {t('get_razorpay_keys', { defaultValue: 'Get Razorpay API Keys' })} <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        <div className="flex items-center justify-end pt-6 mt-2">
          <Button
            onClick={handleUpdate}
            disabled={isUpdating || !canUpdate || !hasChanges}
            className={cn(
              "h-11 primary-btn text-white! font-medium rounded-radius transition-all gap-2",
              (!canUpdate || !hasChanges) && "opacity-50 cursor-not-allowed"
            )}
          >
            {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {t("common_save_changes", { defaultValue: 'Save Changes' })}
          </Button>
        </div>
      </div>
    </GatewayCard>
  )
}

export default RazorpaySettings
