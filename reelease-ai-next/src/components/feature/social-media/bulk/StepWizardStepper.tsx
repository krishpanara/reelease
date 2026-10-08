'use client'

import React from 'react'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StepWizardStepperProps {
  currentStep: number
}

export const StepWizardStepper = ({ currentStep }: StepWizardStepperProps) => {
  const steps = [
    { stepNum: 1, title: 'Accounts', subtitle: 'Choose channels' },
    { stepNum: 2, title: 'CSV & Content', subtitle: 'Upload your data' },
    { stepNum: 3, title: 'Settings', subtitle: 'Rules & preferences' },
    { stepNum: 4, title: 'Review', subtitle: 'Preview & confirm' },
  ]

  return (
    <div className="flex flex-row no-scrollbar items-center justify-center md:justify-between gap-4 md:gap-0 p-5 md:p-6 rounded-2xl dark:bg-white/3 bg-white border border-glass-border overflow-x-auto">
      {steps.map((s, index, array) => {
        const isActive = currentStep === s.stepNum
        const isCompleted = currentStep > s.stepNum

        return (
          <React.Fragment key={s.stepNum}>
            <div
              className={cn(
                'items-center gap-3 shrink-0',
                isActive ? 'flex' : 'hidden md:flex',
                !isActive && !isCompleted ? 'opacity-70' : 'opacity-100'
              )}
            >
              <div
                className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300',
                  isCompleted && 'bg-primary text-white shadow-md',
                  isActive && 'bg-primary text-white ring-4 ring-primary/20 shadow-md',
                  !isActive && !isCompleted && 'bg-white dark:bg-light-body border-2 border-glass-border text-muted-foreground'
                )}
              >
                {isCompleted ? <Check className="w-5 h-5 stroke-[3]" /> : s.stepNum}
              </div>
              <div className="leading-tight text-start">
                <h4
                  className={cn(
                    'text-sm font-bold transition-colors',
                    isActive ? 'text-primary' : 'text-title-color dark:text-white'
                  )}
                >
                  {s.title}
                </h4>
                <p className="text-xs text-subtitle-color font-medium mt-0.5">{s.subtitle}</p>
              </div>
            </div>

            {/* Connecting Line */}
            {index < array.length - 1 && (
              <div className="hidden md:block flex-1 h-[2px] mx-4 lg:mx-6 rounded-full overflow-hidden bg-glass-border">
                <div
                  className={cn(
                    'h-full transition-all duration-500',
                    isCompleted ? 'bg-primary w-full' : 'w-0 bg-primary'
                  )}
                />
              </div>
            )}
          </React.Fragment>
        )
      })}
    </div>
  )
}
