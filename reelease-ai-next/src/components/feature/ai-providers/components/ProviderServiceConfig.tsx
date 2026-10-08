'use client'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { ProviderServiceConfigProps, ServiceType } from '@/types'
import { Menu, Plus, Trash2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { SelectField, ServiceField } from './FormFields'

const AUTH_TYPES = ['Bearer Token', 'Header Key', 'Custom']
const HTTP_METHODS = ['GET', 'POST', 'PUT', 'PATCH']

export function ProviderServiceConfig({
  activeTab,
  tab,
  isEnabled,
  toggleService,
  values,
  onMenuClick,
}: ProviderServiceConfigProps) {
  const { t } = useTranslation()
  const prefix = activeTab

  return (
    <div className="animate-fade-in space-y-5">
      {/* Enable toggle */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <Button
            type="button"
            variant="ghost"
            onClick={onMenuClick}
            className="xl1199:flex hidden min-h-10 px-4 rounded-radius glass-card border-none! items-center justify-center gap-2 bg-primary/10 hover:bg-primary/20 transition-all self-start shrink-0"
          >
            <Menu className="w-5 h-5 text-primary" />
            <span className="text-primary font-bold text-sm sm:hidden block">{t('service_types', { defaultValue: 'Service Types' })}</span>
          </Button>

          <div className="flex items-center gap-3">
            <div className={cn('p-3 rounded-radius border shrink-0', tab.color)}>{tab.icon}</div>
            <div>
              <h3 className="text-md font-semibold text-foreground">{tab.label}</h3>
              <p className="text-sm text-muted-foreground line-clamp-2">{t('ai_provider_service_desc')}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            onClick={() => toggleService(tab.key as ServiceType)}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold border transition-all duration-200 h-auto',
              isEnabled
                ? 'bg-destructive/10 border-destructive/30 text-destructive! hover:bg-destructive/20'
                : 'bg-muted/30 border-border text-muted-foreground! hover:bg-primary/10 hover:border-primary/30 hover:text-primary',
            )}
          >
            {isEnabled ? (
              <>
                <Trash2 className="w-3 h-3" />
                {t('ai_provider_disable_service')}
              </>
            ) : (
              <>
                <Plus className="w-3 h-3" />
                {t('ai_provider_enable_service')}
              </>
            )}
          </Button>
        </div>
      </div>

      {isEnabled ? (
        <>
          {/* Divider */}
          <div className="h-px bg-glass-border" />

          {/* Core Config */}
          <div className="space-y-4">
            <p className="text-sm font-semibold text-muted-foreground">{t('ai_provider_core_config')}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ServiceField label={t('api_key')} name={`${prefix}.api_key`} placeholder="sk-..." />
              <ServiceField
                label={t('ai_provider_base_url')}
                name={`${prefix}.base_url`}
                placeholder="https://api.example.com"
              />
            </div>
            <SelectField label={t('ai_provider_auth_type')} name={`${prefix}.auth_type`} options={AUTH_TYPES} />
          </div>

          {/* Job Creation */}
          <div className="space-y-4">
            <p className="text-sm font-semibold text-muted-foreground">{t('ai_provider_create_job')}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ServiceField
                label={t('ai_provider_endpoint')}
                name={`${prefix}.create_job_request.endpoint`}
                placeholder="/v1/generate"
              />
              <SelectField
                label={t('ai_provider_method')}
                name={`${prefix}.create_job_request.method`}
                options={HTTP_METHODS}
              />
            </div>
            <ServiceField
              label={t('ai_provider_payload_template')}
              name={`${prefix}.create_job_request.payload`}
              placeholder={'{\n  "prompt": "{{prompt}}",\n  "aspect_ratio": "{{aspect_ratio}}"\n}'}
              as="textarea"
              rows={5}
            />
            <ServiceField
              label={t('ai_provider_job_id_path')}
              name={`${prefix}.create_job_request.job_id_path`}
              placeholder="data.task_id"
            />
          </div>

          {/* Polling */}
          <div className="space-y-4">
            <p className="text-sm font-semibold text-muted-foreground">{t('ai_provider_poll_config')}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ServiceField
                label={t('ai_provider_poll_endpoint')}
                name={`${prefix}.poll_job_status.endpoint`}
                placeholder="/v1/task/{{taskId}}/status"
              />
              <SelectField
                label={t('ai_provider_method')}
                name={`${prefix}.poll_job_status.method`}
                options={HTTP_METHODS}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <ServiceField
                label={t('ai_provider_state_path')}
                name={`${prefix}.poll_job_status.state_path`}
                placeholder="data.status"
              />
              <ServiceField
                label={t('ai_provider_success_state')}
                name={`${prefix}.poll_job_status.success_state_value`}
                placeholder="completed"
              />
              <ServiceField
                label={t('ai_provider_failed_state')}
                name={`${prefix}.poll_job_status.failed_state_value`}
                placeholder="failed"
              />
            </div>
            <ServiceField
              label={t('ai_provider_result_url_path')}
              name={`${prefix}.poll_job_status.result_media_url_path`}
              placeholder="data.output.url"
            />
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
          <div className={cn('p-4 rounded-radius border', tab.color)}>
            <span className="scale-150 block">{tab.icon}</span>
          </div>
          <p className="text-md font-medium dark:text-white text-title-color">{t('ai_provider_service_disabled')}</p>
          <p className="text-sm text-muted-foreground/70 max-w-xs">{t('ai_provider_service_disabled_desc')}</p>
        </div>
      )}
    </div>
  )
}
