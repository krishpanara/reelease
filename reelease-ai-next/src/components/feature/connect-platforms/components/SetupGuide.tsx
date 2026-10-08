import React from 'react'
import { useTranslation } from 'react-i18next'
import { ExternalLink, Check, Play, Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { setupGuideSteps } from '@/data/connectPlatformsData'

const SetupGuide = () => {
  const { t } = useTranslation()

  return (
    <div className="rounded-border-radius bg-white dark:bg-white/5 border border-glass-border dark:border-white/10 p-6 shadow-xl shadow-black/5 dark:shadow-none flex flex-col justify-between">
      <div>
        <h3 className="text-lg font-bold text-title-color dark:text-white transition-colors mb-1">
          {t('setup_guide')}
        </h3>
        <p className="text-sm text-subtitle-color dark:text-subtitle-color/50 mb-6 font-medium leading-relaxed">
          {t('setup_guide_desc')}
        </p>

        <div className="relative border-l border-glass-border pl-5 ml-3.5 space-y-6">
          {setupGuideSteps.map((step) => {
            const isCompleted = step.status === 'completed'
            const isInProgress = step.status === 'in_progress'

            return (
              <div key={step.id} className="relative">
                {/* Connector Node */}
                <div
                  className={`absolute -left-[30px] top-0.5 w-6 h-6 rounded-full flex items-center justify-center border text-[10px] font-bold transition-all duration-300 ${isCompleted
                    ? 'bg-primary border-primary text-white shadow-[0_0_8px_rgba(var(--primary-rgb),0.4)]'
                    : isInProgress
                      ? 'bg-white dark:bg-neutral-800 border-primary text-primary shadow-[0_0_8px_rgba(var(--primary-rgb),0.3)] animate-pulse'
                      : 'bg-white dark:bg-white/5 border-glass-border text-subtitle-color'
                    }`}
                >
                  {isCompleted ? (
                    <Check className="w-3 h-3" />
                  ) : isInProgress ? (
                    <Play className="w-2.5 h-2.5 fill-current" />
                  ) : (
                    <span>{step.index}</span>
                  )}
                </div>

                <div className={`${!isCompleted && !isInProgress ? 'opacity-50' : ''}`}>
                  <h4 className="text-sm font-bold text-title-color dark:text-white mb-0.5">{t(step.labelKey)}</h4>
                  <p className="text-xs text-subtitle-color/75 dark:text-subtitle-color/60 leading-normal font-medium">
                    {t(step.descriptionKey)}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default SetupGuide
