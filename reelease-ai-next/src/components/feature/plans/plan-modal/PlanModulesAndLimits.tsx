'use client'

import { Checkbox } from '@/components/ui/checkbox'
import Input from '@/components/ui/input'
import Label from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { PlanModulesAndLimitsProps } from '@/types'
import { Box, Loader2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'

const PlanModulesAndLimits = ({ formData, onChange }: PlanModulesAndLimitsProps) => {
  const { t } = useTranslation()

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="space-y-4 flex flex-col">
        <Label className="text-lg font-medium text-light-text-color">{t('plan_limits')}</Label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-2 flex flex-col">
            <Label htmlFor="total_credits" className="text-sm font-medium text-foreground">
              {t('total_credits')}
            </Label>
            <Input
              id="total_credits"
              type="number"
              value={formData.total_credits ?? ''}
              onChange={(e: any) => onChange('total_credits', e.target.value === '' ? '' : Number(e.target.value))}
              onBlur={() => {
                if ((formData.total_credits as any) === '' || formData.total_credits === null) {
                  onChange('total_credits', 0)
                }
              }}
              placeholder="0"
              className="h-12 rounded-[8px] border-glass-border focus-visible:ring-primary/20"
            />
          </div>
          {/* Add other core fields if they are in the schema. 
              Since backend schema only has total_credits at the moment, 
              we'll keep it simple as requested: "dont add anything new in the backend" */}
        </div>
      </div>
    </div>
  )
}

export default PlanModulesAndLimits
