'use client'

import { Button } from '@/components/ui/button'
import { serviceColors, serviceLabels } from '@/data/aiProvider'
import { cn } from '@/lib/utils'
import { ProviderCardProps, ServiceType } from '@/types'
import { Brain, CheckCircle2, Edit2, Trash2, Zap } from 'lucide-react'
import { useTranslation } from 'react-i18next'



const ProviderCard = ({ provider, onEdit, onDelete }: ProviderCardProps) => {
  const { t } = useTranslation()
  const serviceTypes: ServiceType[] = [
    'text_to_image',
    'image_to_image',
    'video_motion',
    'images_to_video',
    'text_to_video',
  ]
  const configuredServices = serviceTypes.filter((s) => provider[s]?.api_key)

  return (
    <div className="group relative overflow-hidden hover-gradient-border dark:bg-white/3 rounded-border-radius bg-white border border-glass-border">
      {/* Glow accent */}

      {/* Header */}
      <div className="sm:p-6 p-4 pb-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="sm:w-12 sm:h-12 w-9 h-9 rounded-radius bg-gradient-to-br from-primary/20 to-purple-500/20 border border-primary/20 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
              <Brain className="sm:w-6 sm:h-6 w-5 h-5 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-base font-semibold text-foreground group-hover:text-primary transition-colors duration-300 truncate">
                {provider.name}
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5 truncate">
                {configuredServices.length} {t('ai_provider_services_configured')}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1.5 shrink-0 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
            <Button
              size="icon"
              variant="glass"
              className="w-8 h-8 rounded-full bg-primary/20! text-primary  transition-all duration-200"
              onClick={() => onEdit(provider)}
              title={t('edit')}
            >
              <Edit2 className="w-3.5 h-3.5" />
            </Button>
            <Button
              size="icon"
              variant="glass"
              className="w-8 h-8 rounded-full bg-destructive/20! text-destructive transition-all duration-200"
              onClick={() => onDelete(provider.id || provider._id || '')}
              title={t('delete')}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Service Badges */}
      <div className="sm:px-6 px-4 pb-6">
        <div className="grid grid-cols-2 gap-2">
          {serviceTypes.map((service) => {
            const isConfigured = !!provider[service]?.api_key
            return (
              <div
                key={service}
                className={cn(
                  'relative group/badge flex items-center gap-2 px-3 py-2 rounded-lg border border-glass-border text-xs font-medium bg-black/3 dark:bg-white/3',
                  isConfigured
                    ? serviceColors[service]
                    : 'from-muted/30 to-muted/10 border-border/30 text-muted-foreground/50',
                )}
              >
                {isConfigured ? (
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                ) : (
                  <div className="w-4 h-4 rounded-full border border-current opacity-40 flex-shrink-0" />
                )}

                <span className="truncate block text-sm">{serviceLabels[service]}</span>
                {/* Tooltip */}
                <div className="pointer-events-none absolute left-1/2 -translate-x-1/2 bottom-full mb-2 opacity-0 group-hover/badge:opacity-100 translate-y-1 group-hover/badge:translate-y-0 transition-all duration-200 ease-out z-50 sm:hidden">
                  <div className=" relative px-3 py-1.5 text-sm font-medium text-white rounded-lg bg-gradient-to-br from-zinc-900/90 to-black/80 border border-white/10 shadow-[0_8px_24px_rgba(0,0,0,0.4)] backdrop-blur-md whitespace-nowrap">
                    {serviceLabels[service]}
                    <div className="absolute left-1/2 -translate-x-1/2 top-full w-2.5 h-2.5 bg-black/90 border-r border-b border-white/10 rotate-45 -mt-1" />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Footer */}
      {configuredServices.length > 0 && (
        <div className="px-6 py-3 border-t border-glass-border flex items-center gap-1.5">
          <Zap className="w-3 h-3 text-primary" />
          <span className="text-xs text-muted-foreground">{t('ai_provider_ready')}</span>
        </div>
      )}
    </div>
  )
}

export default ProviderCard
