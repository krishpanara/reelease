'use client'

import React from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useTranslation } from 'react-i18next'
import { useRouter } from 'next/navigation'
import { Plug, Sparkles, FileText, CalendarCheck, Send, CheckCircle2, Circle, Loader2, ArrowRight, Wand2 } from 'lucide-react'
import { ROUTES } from '@/constants/routes'
import { WorkflowSectionProps } from '@/types/socialMedia'
import { iconMap, statusConfig, stepRoutes } from '@/data/socialMedia'





export const WorkflowSection = ({ workflow = [] }: WorkflowSectionProps) => {
  const { t } = useTranslation()
  const router = useRouter()

  return (
    <Card className="p-px rounded-border-radius dark:bg-white/3! border-none glass-card overflow-hidden h-full">
      <div className="p-4 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-full bg-primary/10">
              <Wand2 className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="sm:text-xl text-lg mb-0 font-extrabold text-title-color dark:text-white tracking-tight flex items-center gap-2">
                {t('publishing_workflow', { defaultValue: 'Publishing Workflow' })}
              </h3>
              <p className="text-xs text-subtitle-color">
                {t('complete_steps_to_publish', { defaultValue: 'Complete these steps to publish your content' })}
              </p>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push('/dashboard')}
            className="gap-2 rounded-xl border-primary/20 bg-primary/5 text-primary hover:bg-primary/10 text-xs font-semibold shrink-0"
          >
            <Sparkles className="w-3.5 h-3.5" />
            {t('explore_ai_studio', { defaultValue: 'Explore AI Studio' })}
          </Button>
        </div>

        <div className="flex flex-nowrap items-start gap-2 overflow-x-auto custom-scrollbar pb-2 -mx-1 px-1">
          {workflow.map((step, index) => {
            const IconComponent = iconMap[step.icon] || Circle
            const status = statusConfig[step.status]
            const StatusIcon = status.icon

            return (
              <React.Fragment key={step.id}>
                <div
                  onClick={() => {
                    const route = stepRoutes[step.id]
                    if (route) router.push(route)
                  }}
                  className={`flex-1 min-w-[170px] sm:min-w-[185px] flex flex-col items-center gap-2 sm:gap-2.5 p-2.5 sm:p-3 rounded-border-radius border cursor-pointer transition-all duration-300 group overflow-hidden ${status.border} hover:border-primary/50! dark:bg-white/3 hover:bg-primary/5!`}
                >
                  <div className={`p-2.5 rounded-xl ${status.bg} transition-transform duration-300 group-hover:scale-110 relative`}>
                    <IconComponent className={`w-5 h-5 ${status.color}`} />
                    <div className="absolute -top-1 -right-1.5">
                      <StatusIcon className={`w-4 h-4 ${status.color} ${(status as any).animate || ''}`} />
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-title-color dark:text-white text-center leading-tight">
                    {step.label}
                  </span>
                  <span className="text-[10px] text-subtitle-color text-center leading-tight">
                    {step.description}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${step.status === 'completed' ? 'bg-emerald-400/10 text-emerald-400' :
                    step.status === 'in_progress' ? 'bg-primary/10 text-primary' :
                      'bg-black/5 dark:bg-white/5 text-muted-foreground'
                    }`}>
                    {step.status === 'completed' ? t('completed', { defaultValue: 'Completed' }) :
                      step.status === 'in_progress' ? t('in_progress', { defaultValue: 'In Progress' }) :
                        t('pending', { defaultValue: 'Pending' })}
                  </span>
                </div>

                {index < workflow.length - 1 && (
                  <div className="hidden sm:flex items-center justify-center pt-8 shrink-0">
                    <ArrowRight className="w-4 h-4 text-muted-foreground/40" />
                  </div>
                )}
              </React.Fragment>
            )
          })}
        </div>
      </div>
    </Card>
  )
}
