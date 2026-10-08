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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PaymentGatewayConfig } from "@/types/paymentGateway"
import Label from "@/components/ui/label"

const PayPalSettings = () => {
  const { t } = useTranslation()
  const { hasPermission } = usePermission()
  const canUpdate = hasPermission('manage.settings')

  const { data: gatewayData, isLoading } = useGetGatewayByNameQuery('paypal')
  const [updateGateway, { isLoading: isUpdating }] = useUpdateGatewayMutation()
  const [toggleStatus] = useToggleGatewayStatusMutation()
  const [testGateway, { isLoading: isTesting }] = useTestGatewayMutation()
  const [syncPlans] = useSyncPlansToGatewaysMutation()

  const config = (gatewayData?.data || {}) as Partial<PaymentGatewayConfig>

  const [settings, setSettings] = useState({
    paypal_client_id: "",
    paypal_client_secret: "",
    paypal_mode: "sandbox" as "sandbox" | "live",
  })

  const [showSk, setShowSk] = useState(false)

  useEffect(() => {
    if (config) {
      setSettings({
        paypal_client_id: config.paypal_client_id || "",
        paypal_client_secret: config.paypal_client_secret || "",
        paypal_mode: (config.paypal_mode as "sandbox" | "live") || "sandbox",
      })
    }
  }, [gatewayData])

  const handleToggle = async () => {
    try {
      await toggleStatus('paypal').unwrap()
      toast.success(t("gateway_status_updated", { defaultValue: 'Gateway status updated' }))
    } catch (error: any) {
      toast.error(error?.data?.message || t("gateway_toggle_error"))
    }
  }

  const handleInputChange = (field: string, value: any) => {
    setSettings((prev) => ({ ...prev, [field]: value }))
  }

  const handleUpdate = async () => {
    try {
      await updateGateway({ name: 'paypal', data: settings }).unwrap()
      toast.success(t("gateway_paypal_updated", { defaultValue: 'PayPal settings updated' }))

      // Sync plans to gateways after saving credentials
      try {
        await syncPlans().unwrap()
      } catch (syncErr) {
        console.error('Auto-sync failed:', syncErr)
      }
    } catch (error: any) {
      toast.error(error?.data?.message || t("gateway_paypal_update_error"))
    }
  }

  const handleTest = async () => {
    try {
      const result = await testGateway('paypal').unwrap()
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
    paypal_client_id: config.paypal_client_id || "",
    paypal_client_secret: config.paypal_client_secret || "",
    paypal_mode: (config.paypal_mode as "sandbox" | "live") || "sandbox",
  })

  return (
    <GatewayCard title="PayPal" enabled={config.is_enabled || false} onToggle={handleToggle}>
      <div className="flex flex-col gap-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="space-y-2 flex flex-col">
            <Label className="text-sm font-semibold text-foreground">
              {t('client_id', { defaultValue: 'Client ID' })} <span className="text-destructive">*</span>
            </Label>
            <Input
              value={settings.paypal_client_id}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange("paypal_client_id", e.target.value)}
              placeholder={t('enter_client_id', { defaultValue: 'Enter Client ID' })}
              className="h-11 font-mono text-sm bg-black/3 border-glass-border "
            />
          </div>

          <div className="space-y-2 flex flex-col">
            <Label className="text-sm font-semibold text-foreground">
              {t('client_secret', { defaultValue: 'Client Secret' })} <span className="text-destructive">*</span>
            </Label>
            <div className="relative">
              <Input
                value={settings.paypal_client_secret}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange("paypal_client_secret", e.target.value)}
                type={showSk ? "text" : "password"}
                placeholder={t('enter_client_secret', { defaultValue: 'Enter Client Secret' })}
                className="h-11 pr-12 rtl:pl-14 font-mono text-sm bg-black/3 border-glass-border "
              />
              <Button
                onClick={() => setShowSk(!showSk)}
                className="absolute p-0! right-3 rtl:left-3 rtl:right-auto bg-[unset]! top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                tabIndex={-1}
              >
                {showSk ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        </div>

        <div className="space-y-2 flex flex-col">
          <Label className="text-sm font-semibold text-foreground">
            {t('environment_mode', { defaultValue: 'Environment Mode' })} <span className="text-destructive">*</span>
          </Label>
          <Select value={settings.paypal_mode} onValueChange={(val) => handleInputChange("paypal_mode", val)}>
            <SelectTrigger className="h-11 bg-black/3 border-glass-border ">
              <SelectValue placeholder={t('select_environment', { defaultValue: 'Select Environment' })} />
            </SelectTrigger>
            <SelectContent className="bg-glass-bg backdrop-blur-3xl border-glass-border text-left rtl:text-right px-2 py-0.5">
              <SelectItem value="sandbox">{t('sandbox_mode', { defaultValue: 'Sandbox (Testing)' })}</SelectItem>
              <SelectItem value="live">{t('live_mode', { defaultValue: 'Live (Production)' })}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="rounded-border-radius border border-blue-500/10 bg-blue-500/5 px-5 py-4 space-y-2">
          <div className="flex items-center gap-2">
            <svg viewBox="0 0 512 512" className="w-5 h-5 shrink-0" fill="none">
              <rect rx="3" fill="#003087" />
              <path d="M428.876 132.28a175.921 175.921 0 0 0 1.32-21.497C430.196 49.6 380.597 0 319.413 0H134.271c-11.646 0-21.589 8.41-23.521 19.894L42.53 425.369c-2.448 14.55 8.768 27.809 23.521 27.809h67.711c11.646 0 21.776-8.404 23.707-19.889l.317-1.885h.001l-9.436 56.086c-2.156 12.823 7.729 24.51 20.732 24.51h59.237c10.265 0 19.029-7.413 20.731-17.535l16.829-100.02c2.901-17.242 17.828-29.867 35.311-29.867h15.562c84.53 0 153.054-68.525 153.054-153.054 0-32.709-16.168-61.622-40.931-79.244z" fill="#002987" data-original="#002987"></path>
              <path d="M428.876 132.28c-10.594 86.179-84.044 152.91-173.086 152.91h-51.665c-11.661 0-21.732 7.767-24.891 18.749l-30.882 183.549C146.195 500.312 156.08 512 169.083 512h59.237c10.265 0 19.029-7.413 20.731-17.535l16.829-100.02c2.901-17.242 17.828-29.867 35.311-29.867h15.562c84.53 0 153.054-68.525 153.054-153.054 0-32.709-16.168-61.622-40.931-79.244z" fill="#0085cc" data-original="#0085cc"></path>
              <path d="M204.125 285.19h51.665c89.043 0 162.493-66.731 173.086-152.909-15.888-11.306-35.304-17.978-56.29-17.978h-134.85c-15.353 0-28.462 11.087-31.01 26.227l-27.493 163.408c3.159-10.982 13.231-18.748 24.892-18.748z" fill="#00186a" data-original="#00186a"></path>
            </svg>
            <p className="text-sm font-semibold text-blue-500">{t('paypal_config', { defaultValue: 'PayPal Configuration' })}</p>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {t('paypal_config_desc', { defaultValue: 'Get your PayPal credentials from the PayPal Developer Dashboard. You\'ll need to create a REST API app to get these keys.' })}
          </p>
          <a href="https://developer.paypal.com/dashboard/applications" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-blue-500 font-medium hover:underline mt-1">
            {t('get_paypal_keys', { defaultValue: 'Get PayPal API Keys' })} <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        <div className="flex items-center justify-end pt-6 mt-2">
          <Button
            onClick={handleUpdate}
            disabled={isUpdating || !canUpdate || !hasChanges}
            className={cn(
              "h-11 primary-btn text-white! rounded-radius transition-all gap-2",
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

export default PayPalSettings
