'use client'

import { Switch } from "@/components/ui/switch"
import { useTranslation } from "react-i18next"
import { CheckCircle2, XCircle } from "lucide-react"
import React from "react"
import { usePermission } from "@/hooks/usePermission"
import { cn } from "@/lib/utils"
import { GatewayCardProps } from "@/types/paymentGateway"



const GatewayCard = ({ title, enabled, onToggle, children }: GatewayCardProps) => {
  const { t } = useTranslation()
  const { hasPermission } = usePermission()
  const canUpdate = hasPermission('manage.settings')

  return (
    <div className="flex flex-col overflow-hidden">
      <div className="flex items-center justify-between flex-wrap gap-3 ">
        <div>
          <p className="text-sm font-bold text-muted-foreground mb-1">{title} · {t("configuration", { defaultValue: 'Configuration' })}</p>
          <div className={cn(
            "inline-flex items-center gap-1.5 text-xs font-semibold transition-colors duration-300",
            enabled ? "text-emerald-500" : "text-muted-foreground"
          )}>
            {enabled ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5" /> {t("gateway_active", { defaultValue: 'Active' })}
              </>
            ) : (
              <>
                <XCircle className="w-3.5 h-3.5" /> {t("gateway_inactive", { defaultValue: 'Inactive' })}
              </>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium capitalize">{enabled ? t('enabled', { defaultValue: 'enabled' }) : t('disabled', { defaultValue: 'disabled' })}</span>
          <Switch 
            checked={enabled} 
            onCheckedChange={onToggle} 
            disabled={!canUpdate} 
            className="data-[state=checked]:bg-emerald-500" 
          />
        </div>
      </div>

      <div className="flex-1 pt-4 transition-all duration-300">
        {children}
      </div>
    </div>
  )
}

export default GatewayCard
