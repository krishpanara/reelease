'use client'

import { cn } from '@/lib/utils'
import { ProviderCreditsConfigProps } from '@/types'
import { Coins } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { BooleanSelectField, ServiceField } from './FormFields'

export function ProviderCreditsConfig({ enabledServices, serviceTabs }: ProviderCreditsConfigProps) {
  const { t } = useTranslation()

  return (
    <div className="glass-card rounded-border-radius p-3 sm:p-6 animate-fade-in">
      <div className="space-y-6">
        <div className="flex items-center gap-3 border-b border-glass-border pb-4">
          <div className="p-3 rounded-radius border text-yellow-400 border-yellow-500/40 bg-yellow-500/10">
            <Coins className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">
              {t('credits_configuration', 'Credits Configuration')}
            </h3>
            <p className="text-sm text-muted-foreground">
              {t('ai_provider_credit_desc', 'Configure credits usage per enabled module')}
            </p>
          </div>
        </div>

        {Array.from(enabledServices).length === 0 ? (
          <div className="text-center py-10 text-muted-foreground">
            {t('enable_modules_first', 'Please enable at least one service to configure credits.')}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {Array.from(enabledServices).map((k) => {
              const moduleTab = serviceTabs.find((t) => t.key === k)
              return (
                <div key={k} className="p-5 bg-white/2 border border-glass-border rounded-lg space-y-4">
                  <div className="flex items-center gap-3">
                    <span className={cn('p-2 rounded-md border', moduleTab?.color)}>{moduleTab?.icon}</span>
                    <h4 className="text-md font-semibold text-foreground">{moduleTab?.label}</h4>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <ServiceField
                      label={t('credits_cost', 'Credits Cost')}
                      name={`creditConfig.${k}.credits`}
                      as="input"
                      placeholder="0"
                    />
                    <BooleanSelectField
                      label={t('billing_type', 'Billing Type')}
                      name={`creditConfig.${k}.is_per_second`}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
