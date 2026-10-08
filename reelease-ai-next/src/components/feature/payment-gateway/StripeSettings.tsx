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

const StripeSettings = () => {
  const { t } = useTranslation()
  const { hasPermission } = usePermission()
  const canUpdate = hasPermission('manage.settings')

  const { data: gatewayData, isLoading } = useGetGatewayByNameQuery('stripe')
  const [updateGateway, { isLoading: isUpdating }] = useUpdateGatewayMutation()
  const [toggleStatus] = useToggleGatewayStatusMutation()
  const [testGateway, { isLoading: isTesting }] = useTestGatewayMutation()
  const [syncPlans] = useSyncPlansToGatewaysMutation()

  const config = (gatewayData?.data || {}) as Partial<PaymentGatewayConfig>

  const [settings, setSettings] = useState({
    stripe_publishable_key: "",
    stripe_secret_key: "",
    is_test_mode: true,
  })

  const [showPk, setShowPk] = useState(false)
  const [showSk, setShowSk] = useState(false)

  useEffect(() => {
    if (config) {
      setSettings({
        stripe_publishable_key: config.stripe_publishable_key || "",
        stripe_secret_key: config.stripe_secret_key || "",
        is_test_mode: config.is_test_mode !== undefined ? config.is_test_mode : true,
      })
    }
  }, [gatewayData])

  const handleToggle = async () => {
    try {
      await toggleStatus('stripe').unwrap()
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
      await updateGateway({ name: 'stripe', data: settings }).unwrap()
      toast.success(t("gateway_stripe_updated", { defaultValue: 'Stripe settings updated' }))

      // Sync plans to gateways after saving credentials
      try {
        await syncPlans().unwrap()
      } catch (syncErr) {
        console.error('Auto-sync failed:', syncErr)
      }
    } catch (error: any) {
      toast.error(error?.data?.message || t("gateway_stripe_update_error"))
    }
  }

  const handleTest = async () => {
    try {
      const result = await testGateway('stripe').unwrap()
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
    stripe_publishable_key: config.stripe_publishable_key || "",
    stripe_secret_key: config.stripe_secret_key || "",
    is_test_mode: config.is_test_mode !== undefined ? config.is_test_mode : true,
  })

  return (
    <GatewayCard title="Stripe" enabled={config.is_enabled || false} onToggle={handleToggle}>
      <div className="flex flex-col gap-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="space-y-2 flex flex-col">
            <Label className="text-sm font-semibold text-foreground">
              {t('publishable_key', { defaultValue: 'Publishable Key' })} <span className="text-destructive">*</span>
            </Label>
            <div className="relative">
              <Input
                value={settings.stripe_publishable_key}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleInputChange('stripe_publishable_key', e.target.value)
                }
                type={showPk ? 'text' : 'password'}
                placeholder={t('enter_publishable_key', { defaultValue: 'pk_test_...' })}
                className="h-11 pr-14 rtl:pr-3   font-mono text-sm bg-black/3 rounded-radius! border-glass-border "
              />
              <Button
                onClick={() => setShowPk(!showPk)}
                className="absolute right-3 rtl:right-auto rtl:left-3 p-0! top-1/2 bg-[unset]! -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                tabIndex={-1}
              >
                {showPk ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
            </div>
          </div>

          <div className="space-y-2 flex flex-col">
            <Label className="text-sm font-semibold text-foreground">
              {t('secret_key', { defaultValue: 'Secret Key' })} <span className="text-destructive">*</span>
            </Label>
            <div className="relative">
              <Input
                value={settings.stripe_secret_key}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleInputChange('stripe_secret_key', e.target.value)
                }
                type={showSk ? 'text' : 'password'}
                placeholder={t('enter_secret_key', { defaultValue: 'sk_test_...' })}
                className="h-11 pr-14  rtl:pl-3 font-mono text-sm rounded-radius! bg-black/3 border-glass-border "
              />
              <Button
                onClick={() => setShowSk(!showSk)}
                className="absolute right-3 rtl:right-auto rtl:left-3 p-0! top-1/2 bg-[unset]! -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                tabIndex={-1}
              >
                {showSk ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        </div>

        <div className="rounded-border-radius border border-primary/10 bg-primary/5 px-5 py-4 space-y-2">
          <div className="flex items-center gap-2">
            <svg viewBox="0 0 1000 1000" className="w-5 h-5 shrink-0" fill="none">
              <rect rx="3" fill="#635BFF" />
              <defs>
                <path
                  id="shape"
                  d="M125,0h750c69.0355835,0,125,55.9644012,125,125v750
         c0,69.0355835-55.9644165,125-125,125H125
         C55.9644012,1000,0,944.0355835,0,875V125
         C0,55.9644012,55.9644012,0,125,0z"
                />
              </defs>
              <clipPath id="clip">
                <use href="#shape" overflow="visible" />
              </clipPath>
              <g clipPath="url(#clip)">
                <rect width="1000" height="1000" fill="#533AFD" />
                <path
                  fill="#FFFFFF"
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M234.375 765.625L765.625 652.962V234.375L234.375 348.354V765.625Z"
                />
              </g>
            </svg>
            <p className="text-sm font-semibold text-primary">
              {t('stripe_config', { defaultValue: 'Stripe Configuration' })}
            </p>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {t('stripe_config_desc', {
              defaultValue:
                "Get your Stripe credentials from the Stripe Dashboard. You'll need both Test and Live credentials.",
            })}
          </p>
          <a
            href="https://dashboard.stripe.com/apikeys"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-primary font-medium hover:underline mt-1"
          >
            {t('get_stripe_keys', { defaultValue: 'Get Stripe API Keys' })} <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        <div className="flex items-center justify-end pt-6 ">
          <Button
            onClick={handleUpdate}
            disabled={isUpdating || !canUpdate || !hasChanges}
            className={cn(
              'h-11 px-8 primary-btn text-white! text-sm rounded-lg transition-all shadow-sm active:scale-95 gap-2',
              (!canUpdate || !hasChanges) && 'opacity-50 cursor-not-allowed',
            )}
          >
            {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {t('common_save_changes', { defaultValue: 'Save Changes' })}
          </Button>
        </div>
      </div>
    </GatewayCard>
  )
}

export default StripeSettings
