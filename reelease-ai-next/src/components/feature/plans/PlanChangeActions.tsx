'use client'

import { Button } from '@/components/ui/button'
import { PlanChangeActionsProps } from '@/types'
import { ArrowDown, ArrowUp, BatteryCharging } from 'lucide-react'
import { useTranslation } from 'react-i18next'

const PlanChangeActions = ({ activeMode, onModeChange, hasTopUpPlans = true }: PlanChangeActionsProps) => {
  const { t } = useTranslation()

  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      <Button
        variant={activeMode === 'upgrade' ? 'default' : 'outline'}
        onClick={() => onModeChange(activeMode === 'upgrade' ? null : 'upgrade')}
        className="h-11 rounded-xl font-bold gap-2"
      >
        <ArrowUp className="w-4 h-4" />
        {t('upgrade_plan', { defaultValue: 'Upgrade Plan' })}
      </Button>
      <Button
        variant={activeMode === 'downgrade' ? 'default' : 'outline'}
        onClick={() => onModeChange(activeMode === 'downgrade' ? null : 'downgrade')}
        className="h-11 rounded-xl font-bold gap-2"
      >
        <ArrowDown className="w-4 h-4" />
        {t('downgrade_plan', { defaultValue: 'Downgrade Plan' })}
      </Button>
      {hasTopUpPlans && (
        <Button
          variant={activeMode === 'topup' ? 'default' : 'outline'}
          onClick={() => onModeChange(activeMode === 'topup' ? null : 'topup')}
          className="h-11 rounded-xl font-bold gap-2"
        >
          <BatteryCharging className="w-4 h-4" />
          {t('top_up_recharge', { defaultValue: 'Top-up / Recharge' })}
        </Button>
      )}
    </div>
  )
}

export default PlanChangeActions
