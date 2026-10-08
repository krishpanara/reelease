'use client'

import Input from '@/components/ui/input'
import Label from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { PlanBasicFieldsProps } from '@/types'
import { useTranslation } from 'react-i18next'

const PlanBasicFields = ({ formData, onChange }: PlanBasicFieldsProps) => {
  const { t } = useTranslation()

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
      <div className="space-y-2 flex flex-col">
        <Label htmlFor="name" className="text-sm font-medium text-foreground">
          {t('plan_name')} <span className="text-destructive">*</span>
        </Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => onChange('name', e.target.value)}
          placeholder={t('enter_plan_name')}
          required
          className="h-12 rounded-radius border-glass-border focus-visible:ring-primary/20"
        />
      </div>

      <div className="space-y-2 flex flex-col">
        <Label htmlFor="slug" className="text-sm font-medium text-foreground">
          {t('slug')} <span className="text-destructive">*</span>
        </Label>
        <Input
          id="slug"
          value={formData.slug}
          onChange={(e) => onChange('slug', e.target.value)}
          placeholder={t('enter_plan_slug')}
          required
          className="h-12 rounded-radius border-glass-border focus-visible:ring-primary/20"
        />
      </div>

      <div className="sm:col-span-2 space-y-2 flex flex-col">
        <Label htmlFor="description" className="text-sm font-medium text-foreground">
          {t('description')}
        </Label>
        <Input
          id="description"
          value={formData.description || ''}
          onChange={(e) => onChange('description', e.target.value)}
          placeholder={t('enter_plan_description')}
          className="h-12 rounded-radius border-glass-border focus-visible:ring-primary/20"
        />
      </div>

      <div className="space-y-2 flex flex-col">
        <Label htmlFor="amount" className="text-sm font-medium text-foreground">
          {t('price')} <span className="text-destructive">*</span>
        </Label>
        <Input
          id="amount"
          type="number"
          step="0.01"
          value={formData.amount ?? ''}
          onChange={(e) => onChange('amount', e.target.value === '' ? '' : parseFloat(e.target.value))}
          onBlur={() => {
            if ((formData.amount as any) === '' || formData.amount === null || formData.amount === undefined) {
              onChange('amount', 0)
            }
          }}
          disabled={formData.billing_cycle === 'free_trial'}
          placeholder="0.00"
          required
          className="h-12 rounded-[8px] border-glass-border focus-visible:ring-primary/20"
        />
      </div>

      <div className="space-y-2 flex flex-col">
        <Label className="text-sm font-medium text-foreground">{t('currency')}</Label>
        <Select value={formData.currency || 'USD'} onValueChange={(val: any) => onChange('currency', val)}>
          <SelectTrigger className="h-12 rounded-radius border-glass-border">
            <SelectValue placeholder={t('select_currency')} />
          </SelectTrigger>
          <SelectContent className="bg-white! dark:bg-modal-bg-color!">
            <SelectItem value="USD">{t('usd')}</SelectItem>
            <SelectItem value="INR">{t('inr')}</SelectItem>
            <SelectItem value="EUR">{t('eur')}</SelectItem>
            <SelectItem value="GBP">{t('gbp')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2 flex flex-col">
        <Label className="text-sm font-medium text-foreground">{t('plan_type', { defaultValue: 'Plan Type' })}</Label>
        <Select
          value={formData.plan_type || 'subscription'}
          onValueChange={(val: any) => {
            const updates: any = { plan_type: val }
            if (val === 'subscription') {
              if (formData.billing_cycle !== 'monthly' && formData.billing_cycle !== 'yearly') {
                updates.billing_cycle = 'monthly'
              }
            } else if (val === 'top_up') {
              updates.billing_cycle = 'one_time'
            }
            onChange(updates)
          }}
        >
          <SelectTrigger className="h-12 rounded-border-radius border-glass-border">
            <SelectValue placeholder={t('select_plan_type', { defaultValue: 'Select Plan Type' })} />
          </SelectTrigger>
          <SelectContent className="bg-white! dark:bg-modal-bg-color!">
            <SelectItem value="subscription">{t('subscription', { defaultValue: 'Subscription' })}</SelectItem>
            <SelectItem value="prepaid">{t('prepaid', { defaultValue: 'Prepaid' })}</SelectItem>
            <SelectItem value="lifetime">{t('lifetime', { defaultValue: 'Lifetime' })}</SelectItem>
            <SelectItem value="top_up">{t('top_up', { defaultValue: 'Topup' })}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2 flex flex-col">
        <Label className="text-sm font-medium text-foreground">{t('billing_cycle')}</Label>
        <Select
          value={formData.billing_cycle}
          onValueChange={(val: any) => {
            const updates: any = { billing_cycle: val }
            if (val === 'free_trial') {
              updates.amount = 0
            }
            onChange(updates)
          }}
        >
          <SelectTrigger className="h-12 rounded-border-radius border-glass-border">
            <SelectValue placeholder={t('select_cycle')} />
          </SelectTrigger>
          <SelectContent className="bg-white! dark:bg-modal-bg-color!">
            {formData.plan_type === 'subscription' ? (
              <>
                <SelectItem value="monthly">{t('monthly')}</SelectItem>
                <SelectItem value="yearly">{t('yearly')}</SelectItem>
              </>
            ) : (
              <>
                <SelectItem value="free_trial">{t('free_trial')}</SelectItem>
                <SelectItem value="monthly">{t('monthly')}</SelectItem>
                <SelectItem value="yearly">{t('yearly')}</SelectItem>
                <SelectItem value="lifetime">{t('lifetime')}</SelectItem>
                <SelectItem value="one_time">{t('one_time')}</SelectItem>
              </>
            )}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2 flex flex-col">
        <Label htmlFor="trial_days" className="text-sm font-medium text-foreground">
          {t('trial_days')}
        </Label>
        <Input
          id="trial_days"
          type="number"
          value={formData.trial_days ?? ''}
          onChange={(e) => onChange('trial_days', e.target.value === '' ? '' : parseInt(e.target.value))}
          onBlur={() => {
            if ((formData.trial_days as any) === '' || formData.trial_days === null) {
              onChange('trial_days', 0)
            }
          }}
          placeholder="0"
          className="h-12 rounded-radius border-glass-border focus-visible:ring-primary/20"
        />
      </div>

      {formData.plan_type === 'top_up' && formData.billing_cycle === 'one_time' && (
        <div className="space-y-2 flex flex-col animate-in fade-in duration-300">
          <Label htmlFor="validity_days" className="text-sm font-medium text-foreground">
            {t('validity_days', { defaultValue: 'Validity Days' })} <span className="text-destructive">*</span>
          </Label>
          <Input
            id="validity_days"
            type="number"
            value={formData.validity_days ?? ''}
            onChange={(e) => onChange('validity_days', e.target.value === '' ? '' : parseInt(e.target.value))}
            onBlur={() => {
              if ((formData.validity_days as any) === '' || formData.validity_days === null) {
                onChange('validity_days', null)
              }
            }}
            placeholder="e.g. 30"
            required
            className="h-12 rounded-radius border-glass-border focus-visible:ring-primary/20"
          />
        </div>
      )}

      <div className="space-y-2 flex flex-col">
        <Label htmlFor="total_credits" className="text-sm font-medium text-foreground">
          {t('total_credits')}
        </Label>
        <Input
          id="total_credits"
          type="number"
          value={formData.total_credits ?? ''}
          onChange={(e) => onChange('total_credits', e.target.value === '' ? '' : parseInt(e.target.value))}
          onBlur={() => {
            if ((formData.total_credits as any) === '' || formData.total_credits === null) {
              onChange('total_credits', 0)
            }
          }}
          placeholder="0"
          className="h-12 rounded-radius border-glass-border focus-visible:ring-primary/20"
        />
      </div>

      <div className="space-y-2 flex flex-col">
        <Label htmlFor="caption_credits" className="text-sm font-medium text-foreground">
          {t('caption_credits')}
        </Label>
        <Input
          id="caption_credits"
          type="number"
          value={formData.caption_credits ?? ''}
          onChange={(e) => onChange('caption_credits', e.target.value === '' ? '' : parseInt(e.target.value))}
          onBlur={() => {
            if ((formData.caption_credits as any) === '' || formData.caption_credits === null) {
              onChange('caption_credits', 0)
            }
          }}
          placeholder="0"
          className="h-12 rounded-radius border-glass-border focus-visible:ring-primary/20"
        />
      </div>

      <div className="space-y-2 flex flex-col">
        <Label htmlFor="channel_limit" className="text-sm font-medium text-foreground">
          {t('channel_limit')}
        </Label>
        <Input
          id="channel_limit"
          type="number"
          value={formData.channel_limit ?? ''}
          onChange={(e) => onChange('channel_limit', e.target.value === '' ? '' : parseInt(e.target.value))}
          onBlur={() => {
            if ((formData.channel_limit as any) === '' || formData.channel_limit === null) {
              onChange('channel_limit', 2)
            }
          }}
          placeholder="2"
          className="h-12 rounded-radius border-glass-border focus-visible:ring-primary/20"
        />
      </div>

      <div className="flex items-center justify-between p-4 rounded-border-radius bg-muted/20 border border-glass-border glass-dark-card">
        <div className="space-y-0.5">
          <Label className="font-bold">{t('featured_plan')}</Label>
          <p className="text-xs text-muted-foreground line-clamp-1">{t('featured_plan_desc')}</p>
        </div>
        <Switch checked={formData.is_featured} onCheckedChange={(val: boolean) => onChange('is_featured', val)} />
      </div>

      <div className="flex items-center justify-between p-4 rounded-border-radius bg-muted/20 border border-glass-border glass-dark-card">
        <div className="space-y-0.5">
          <Label className="font-bold">{t('set_as_default')}</Label>
          <p className="text-xs text-muted-foreground line-clamp-1">{t('default_plan_desc')}</p>
        </div>
        <Switch checked={formData.is_default} onCheckedChange={(val: boolean) => onChange('is_default', val)} />
      </div>

      <div className="flex items-center justify-between p-4 rounded-border-radius bg-muted/20 border border-glass-border glass-dark-card">
        <div className="space-y-0.5">
          <Label className="font-bold">{t('active_status')}</Label>
          <p className="text-xs text-muted-foreground line-clamp-1">{t('plan_status_desc')}</p>
        </div>
        <Switch checked={formData.is_active} onCheckedChange={(val: boolean) => onChange('is_active', val)} />
      </div>
      <div className="flex items-center justify-between p-4 rounded-border-radius bg-muted/20 border border-glass-border glass-dark-card">
        <div className="space-y-0.5">
          <Label className="font-bold">{t('remove_watermark')}</Label>
          <p className="text-xs text-muted-foreground line-clamp-1">{t('remove_watermark_desc')}</p>
        </div>
        <Switch
          checked={formData.remove_watermark}
          onCheckedChange={(val: boolean) => onChange('remove_watermark', val)}
        />
      </div>
    </div>
  )
}

export default PlanBasicFields
