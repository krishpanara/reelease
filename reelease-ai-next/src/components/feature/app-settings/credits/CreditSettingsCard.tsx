'use client'

import TextInput from '@/components/shared/form-fields/TextInput'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Label from '@/components/ui/label'
import { creditFields } from '@/data/setting'
import { cn } from '@/lib/utils'
import { Coins, Sparkles } from 'lucide-react'
import { useTranslation } from 'react-i18next'

const CreditSettingsCard = () => {
  const { t } = useTranslation()

  return (
    <Card className="border-glass-border bg-white dark:bg-white/3 shadow-none rounded-border-radius! overflow-hidden group transition-all duration-500">
      <CardHeader className="sm:p-6 p-4 pb-0!">
        <div className='flex gap-2'>
          <div className='text-primary p-1.5 w-10 h-10 flex justify-center items-center rounded-lg bg-primary/10 shrink-0'>
            <Coins className="w-5 h-5 text-primary" />
          </div>
          <div className="space-y-1">
            <div>
              <CardTitle className="text-xl font-medium text-title-color dark:text-white">
                {t('credit_configuration')}
              </CardTitle>
            </div>
            <CardDescription className="text-sm font-medium text-subtitle-color ">
              {t('set_credits_for_various_ai_features')}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="sm:p-6 p-4 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {creditFields.map((field) => (
            <div
              key={field.name}
              className="relative group/field sm:p-5 p-4 bg-primary/2!  rounded-border-radius  hover:bg-accent/10 border border-glass-border hover:border-primary/20 "
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={cn('flex items-center justify-center', field.color)}>
                    {field.icon}
                  </div>
                  <Label className="text-base font-medium text-title-color dark:text-white">
                    {t(field.name, { defaultValue: field.label })}
                  </Label>
                </div>
              </div>
              <div className="relative">
                <TextInput
                  name={field.name}
                  type="number"
                  placeholder="0"
                  min={0}
                  onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                    if (e.key === '-' || e.key === 'e') {
                      e.preventDefault()
                    }
                  }}
                  className="h-12 w-full px-4 pr-16 bg-background/60 border-glass-border hover:border-primary/30 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all rounded-xl font-bold text-lg"
                />
                <div className="absolute right-9 top-3.5 text-xs font-medium text-subtitle-color   group-hover/field:text-primary transition-all duration-300">
                  {t('credits')}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="sm:p-6 p-4 rounded-border-radius bg-primary/5 border border-primary/10 space-y-3">
          <div className="flex items-center gap-2 text-primary">
            <Sparkles className="w-4 h-4" />
            <h4 className="text-base font-medium">{t('admin_guidance')}</h4>
          </div>
          <p className="text-sm font-medium text-subtitle-color leading-relaxed">
            {t('set_credits_for_various_ai_features_description')}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

export default CreditSettingsCard
