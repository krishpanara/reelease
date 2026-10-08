'use client'

import React from 'react'
import { CreditLimitPill } from '@/components/reusable/CreditLimitPill'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { PageHeaderProps } from '@/types'
import { ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'

export const PageHeader = ({
  title,
  subtitle,
  showBackButton = true,
  onBack,
  primaryAction,
  endContent,
  icon,
}: PageHeaderProps) => {
  const router = useRouter()

  return (
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 sticky top-0 z-[40] bg-light-body dark:bg-dark-body -mx-4 min-[992px]:-mx-8 px-4 min-[992px]:px-8 pb-3">
      <div className=" gap-2">
        <div className="flex items-center gap-3 mb-1">
          {showBackButton && (
            <Button
              variant="outline"
              size="icon"
              onClick={onBack || (() => router.back())}
              className="h-10 w-10 bg-primary/10 transition-all rotate-0 shrink-0"
            >
              <ArrowLeft className="w-5 h-5 text-primary rtl:rotate-180" />
            </Button>
          )}
          {icon ? (
            <div className="w-9 h-9 flex justify-center items-center rounded-[9px] bg-primary  shrink-0">
              {React.isValidElement(icon)
                ? React.cloneElement(icon as React.ReactElement<any>, {
                  className: cn((icon as React.ReactElement<any>).props.className, 'w-5.5 h-5.5 text-white! animate-none'),
                })
                : icon}
            </div>
          ) : null}
          <h1 className="text-3xl font-bold dark:text-white">
            <span className="text-title-color dark:text-white ">{title.split(' ')[0]}</span>{' '}
            {/* Remaining Words Blue */}
            <span className="text-primary title-color">{title.split(' ').slice(1).join(' ')}</span>
          </h1>
        </div>
        <div>
          {subtitle && <p className="text-base text-subtitle-color 2xl:w-[700px] md:w-[500px] sm:w-[350px] w-[250px] line-clamp-2 tracking mt-1">{subtitle}</p>}
        </div>
      </div>

      <div className="flex flex-wrap sm:flex-nowrap items-center justify-start lg:justify-end gap-3 w-full md:w-auto">
        {endContent && endContent}

        {primaryAction && (
          <Button
            onClick={primaryAction.onClick}
            className={cn(
              'group p-button-padding! w-full sm:w-auto h-10 rounded-button-radius text-sm font-medium text-white! primary-btn leading-0 gap-1.5 transition-all duration-300',
              primaryAction.className,
            )}
          >
            <span>{primaryAction.label}</span>

            <div className="w-4 opacity-100 transition-all duration-300 ease-in-out flex items-center justify-center overflow-hidden me-0">
              {primaryAction.icon}
            </div>
          </Button>
        )}

        <CreditLimitPill />
      </div>
    </div>
  )
}
